/**
 * Storage layer for saving and loading theatre dialogues
 * Supports both local storage and remote storage for registered users
 */

import { Constants } from "./utilities/bsConstants";
import { DeleteData, MigrateData, RetrieveData, SaveData } from "./utilities/bsRemote";
import { GetGUID } from "./utilities/bsUtilities";
import { Logger } from "./utilities/bsLogger";


/**
 * Storage manager class that handles both local and remote storage
 */
export class DialogueStorageManager {
    public isUserRegistered: boolean;
    public dialogues: IDialogueItem[] = [];

    constructor(isUserRegistered: boolean) {
        this.isUserRegistered = isUserRegistered;
    }

    /**
     * Migrate local data to remote storage for registered users
     * Assigns new GUIDs to local format entries
     * @param dialogues - Dialogues to migrate
     * @returns Updated dialogues with new IDs
     */
    private async migrateLocalToRemote(dialogues: IDialogueItem[]): Promise<void> {
        Logger.log('[Storage] Migrating', dialogues.length, 'local dialogues to remote storage');
        // Create new versions with GUIDs
        const migratedDialogues = dialogues.map(dialogue => ({
            ...dialogue,
            theatre_id: GetGUID(),
        }));

        // Upload migrated dialogues to remote storage
        const success = await MigrateData(JSON.stringify(migratedDialogues));
        Logger.log('[Storage] Migration result:', success);
        if (success) {
            //delete local copies
            for (const dialogue of dialogues) {
                this.deleteLocalDialogue(dialogue.id);
            }
        };
    }

    /**
     * Load dialogues from localStorage
     * @returns Array of dialogue items with dates properly parsed
     */
    private loadLocalDialogues(): IDialogueItem[] {
        const saved = localStorage.getItem(Constants.STORAGEKEY);
        if (saved) {
            return JSON.parse(saved).map((d: any) => ({
                ...d,
                createdAt: new Date(d.createdAt),
                updatedAt: new Date(d.updatedAt)
            }));
        }
        return [];
    }

    /**
     * Load dialogues from remote storage (mocked)
     * @returns Array of dialogue items from remote storage
     */
    private async loadRemoteDialogues(): Promise<IDialogueItem[]> {
        Logger.log('[Storage] Loading dialogues from remote storage');
        const remoteDialogues = await RetrieveData();
        if (remoteDialogues && Array.isArray(remoteDialogues)) {
            Logger.log('[Storage] Loaded', remoteDialogues.length, 'dialogues from remote');
            return remoteDialogues.map((d: any) => ({
                ...JSON.parse(d.save_data),
                createdAt: new Date(d.createdAt),
                updatedAt: new Date(d.updatedAt)
            }));
        }
        Logger.log('[Storage] No remote dialogues found');
        return [];
    }

    /**
     * Merge local and remote dialogues, preferring newer versions
     * @param local - Local dialogues
     * @param remote - Remote dialogues
     * @returns Merged array with duplicates resolved by newest updatedAt
     */
    private mergeDialogues(local: IDialogueItem[], remote: IDialogueItem[]): IDialogueItem[] {
        const merged = new Map<string, IDialogueItem>();

        // Add all local dialogues
        local.forEach(dialogue => {
            merged.set(dialogue.id, dialogue);
        });

        // Add or update with remote dialogues if they're newer
        remote.forEach(dialogue => {
            const existing = merged.get(dialogue.id);
            if (!existing || new Date(dialogue.updatedAt) > new Date(existing.updatedAt)) {
                merged.set(dialogue.id, dialogue);
            }
        });

        return Array.from(merged.values()).sort((a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    }

    /**
     * Save dialogues to localStorage
     * @param dialogues - Array of dialogue items to save
     */
    private saveLocalDialogues(dialogues: IDialogueItem[]): void {
        localStorage.setItem(Constants.STORAGEKEY, JSON.stringify(dialogues));
    }

    /**
     * Save dialogues to remote storage (mocked)
     * @param dialogues - Array of dialogue items to save
     */
    private async saveRemoteDialogue(dialogue: IDialogueItem): Promise<void> {
        Logger.log('[Storage] Saving dialogue to remote:', dialogue.id, dialogue.title);
        dialogue.theatre_id = dialogue.id;
        await SaveData(dialogue);
        Logger.log('[Storage] Dialogue saved to remote successfully');
    }

    /**
     * Delete a dialogue from localStorage
     * @param id - ID of the dialogue to delete
     */
    private deleteLocalDialogue(id: string): void {
        const dialogues = this.loadLocalDialogues();
        const updated = dialogues.filter(d => d.id !== id);
        this.saveLocalDialogues(updated);
    }

    /**
     * Delete a dialogue from remote storage (mocked)
     * @param id - ID of the dialogue to delete
     */
    private async deleteRemoteDialogue(id: string): Promise<void> {
        Logger.log('[Storage] Deleting dialogue from remote:', id);
        await DeleteData(id);
        Logger.log('[Storage] Dialogue deleted from remote successfully');
    }

    /**
     * Load dialogues - uses remote + local merge for registered users, local only for others
     * Updates the internal dialogues property
     */
    async loadDialogues(): Promise<void> {
        if (this.isUserRegistered) {
            Logger.log('[Storage] Loading dialogues for registered user (local + remote)');
            const [localDialogues, remoteDialogues] = await Promise.all([
                Promise.resolve(this.loadLocalDialogues()),
                this.loadRemoteDialogues()
            ]);

            this.dialogues = this.mergeDialogues(localDialogues, remoteDialogues);
            Logger.log('[Storage] Merged dialogues count:', this.dialogues.length);

            // Check if there are any local format IDs that need migration
            if (localDialogues.length > 0) {
                await this.migrateLocalToRemote(localDialogues);
            }
        } else {
            Logger.log('[Storage] Loading dialogues for non-registered user (local only)');
            this.dialogues = this.loadLocalDialogues();
            Logger.log('[Storage] Loaded', this.dialogues.length, 'local dialogues');
        }
    }

    /**
     * Save dialogues - saves the internal dialogues property to both local and remote for registered users
     */
    async saveDialogues(specificDialogueId: string): Promise<void> {
        if (this.isUserRegistered) {
            const dialogue = this.dialogues.find(d => d.id === specificDialogueId);
            if (dialogue) {
                await this.saveRemoteDialogue(dialogue);
            }
        } else {
            this.saveLocalDialogues(this.dialogues);
        }
    }

    /**
     * Delete a dialogue by ID - deletes from both locations for registered users
     * Updates the internal dialogues property
     * @param id - ID of the dialogue to delete
     */
    async deleteDialogue(id: string): Promise<void> {
        const foundDialogue = this.dialogues.find(d => d.id === id);
        this.dialogues = this.dialogues.filter(d => d.id !== id);
        if (this.isUserRegistered) {
            if (foundDialogue && foundDialogue["theatre_id"]) {
                this.deleteRemoteDialogue(foundDialogue["theatre_id"])
            }
        } else {
            this.saveLocalDialogues(this.dialogues);
        }
    }
}
