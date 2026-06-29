import { supabase } from './supabaseClient';
import { Constants } from './bsConstants';

type LookupSource = 'direct_supabase' | 'fallback_legacy_function';
type CacheStatus = 'hit' | 'miss' | 'stale' | 'bypass';
type RegistrationResult = 'registered' | 'not_registered' | 'error';

type RegistrationCheckMetricEvent = {
    playerId: string;
    lookupSource: LookupSource;
    cacheStatus: CacheStatus;
    result: RegistrationResult;
    success: boolean;
    latencyMs: number;
    tier?: string;
    errorCode?: string;
    errorMessage?: string;
};

const METRICS_EVENTS_TABLE = 'bs_metrics_events';
const SESSION_ID = createId();
let metricsQueue: any[] = [];
let flushTimerId: number | null = null;
let metricsTransportInitialized = false;
let flushInProgress = false;
const actorHashCache = new Map<string, string>();

function createId(): string
{
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
    {
        return crypto.randomUUID();
    }

    return `m-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function resolveEnvironment(): 'dev' | 'staging' | 'prod'
{
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') return 'dev';
    if (host.includes('staging')) return 'staging';
    return 'prod';
}

function initializeMetricsTransport()
{
    if (metricsTransportInitialized) return;
    metricsTransportInitialized = true;

    flushTimerId = window.setInterval(() => {
        void flushMetricsQueue('interval');
    }, Constants.REGISTRATION_METRICS_FLUSH_MS);

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden')
        {
            void flushMetricsQueue('hidden');
        }
    });

    window.addEventListener('beforeunload', () => {
        void flushMetricsQueue('unload');
    });
}

function fallbackHash(input: string): string
{
    let hash = 2166136261;

    for (let i = 0; i < input.length; i++)
    {
        hash ^= input.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }

    return `fnv1a-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

async function hashActorId(playerId: string): Promise<string>
{
    const cached = actorHashCache.get(playerId);
    if (cached) return cached;

    let hashed = '';
    if (typeof crypto !== 'undefined' && crypto.subtle && typeof TextEncoder !== 'undefined')
    {
        const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(playerId));
        const digestArray = Array.from(new Uint8Array(digest));
        hashed = digestArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
    }
    else
    {
        hashed = fallbackHash(playerId);
    }

    actorHashCache.set(playerId, hashed);
    return hashed;
}

async function flushMetricsQueue(reason: 'interval' | 'hidden' | 'unload' | 'batch-size')
{
    if (flushInProgress) return;
    if (metricsQueue.length === 0) return;

    flushInProgress = true;

    try
    {
        while (metricsQueue.length > 0)
        {
            const chunk = metricsQueue.slice(0, Constants.REGISTRATION_METRICS_BATCH_SIZE);
            const { error } = await supabase
                .from(METRICS_EVENTS_TABLE)
                .insert(chunk);

            if (error)
            {
                console.error('Registration metrics batch insert failed:', error);
                break;
            }

            metricsQueue = metricsQueue.slice(chunk.length);
            if (reason === 'batch-size' && flushTimerId)
            {
                window.clearTimeout(flushTimerId);
            }
        }
    }
    finally
    {
        flushInProgress = false;
    }
}

export async function TrackRegistrationCheckEvent(event: RegistrationCheckMetricEvent): Promise<void>
{
    if (!Constants.USE_REGISTRATION_METRICS) return;

    initializeMetricsTransport();

    const eventName = event.result === 'error' ? 'registration_check_error' : 'registration_check_result';
    const eventId = createId();
    const actorIdHash = await hashActorId(event.playerId);

    const payload = {
        event_id: eventId,
        occurred_at: new Date().toISOString(),
        source_app: 'theatre',
        source_version: __APP_VERSION__,
        environment: resolveEnvironment(),
        session_id: SESSION_ID,
        event_name: eventName,
        event_category: 'registration',
        actor_id_hash: actorIdHash,
        player_id: event.playerId,
        success: event.success,
        duration_ms: event.latencyMs,
        error_code: event.errorCode ?? null,
        error_message: event.errorMessage ?? null,
        metadata: {
            result: event.result,
            lookup_source: event.lookupSource,
            cache_status: event.cacheStatus,
            migration_mode: 'legacy_light_metrics',
            tier: event.tier ?? null,
        },
    };

    metricsQueue.push(payload);

    if (metricsQueue.length >= Constants.REGISTRATION_METRICS_BATCH_SIZE)
    {
        void flushMetricsQueue('batch-size');
    }
}

export type { LookupSource, CacheStatus };
