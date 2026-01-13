import OBR from '@owlbear-rodeo/sdk';
import { BSCACHE } from './utilities/bsSceneCache';
import { THEATRE } from './theatre';
import { Constants } from './utilities/bsConstants';
import { Logger } from './utilities/bsLogger';
import './styles/main-style.css'

await OBR.onReady(async () =>
{
    const sceneReady = await OBR.scene.isReady();
    
    if (sceneReady === false)
    {
        const startup = OBR.scene.onReadyChange(async (ready) =>
        {
            if (ready)
            {
                startup(); // Kill startup Handler
                await BeginTheTheatre();
            }
        });
    }
    else
    {
        await BeginTheTheatre();
    }
});

async function BeginTheTheatre()
{
    await BSCACHE.InitializeCache();
    await THEATRE.StartThreatre();
    BSCACHE.SetupHandlers();
    BSCACHE.OpenBroadcast();
    
    // Load dialogue cache once on startup
    await BSCACHE.LoadDialogueCache();
    
    // Listen for broadcast messages from storage modal
    OBR.broadcast.onMessage(Constants.EXTENSIONID + '/dialogue-request', async (event) => {
        const data = event.data as any;
        if (data.type === 'REQUEST_DIALOGUES') {
            // Storage modal requesting cached dialogues
            Logger.log('[Theatre] Storage modal requesting dialogues, sending', BSCACHE.getDialogueCache().length, 'dialogues');
            await OBR.broadcast.sendMessage(Constants.EXTENSIONID + '/dialogue-response', {
                type: 'DIALOGUES_DATA',
                dialogues: BSCACHE.getDialogueCache(),
                registered: BSCACHE.USER_REGISTERED
            }, { destination: "LOCAL"});
        } else if (data.type === 'UPDATE_DIALOGUE') {
            // Storage modal updated a dialogue
            Logger.log('[Theatre] Updating dialogue in cache:', data.dialogue.id);
            BSCACHE.updateDialogueInCache(data.dialogue);
        } else if (data.type === 'DELETE_DIALOGUE') {
            // Storage modal deleted a dialogue
            Logger.log('[Theatre] Deleting dialogue from cache:', data.id);
            BSCACHE.deleteDialogueFromCache(data.id);
        }
    });
}