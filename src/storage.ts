import OBR, {Image} from "@owlbear-rodeo/sdk";
import { Constants } from "./utilities/bsConstants";
import { GetGUID, SetThemeMode } from "./utilities/bsUtilities";
import { DialogueStorageManager } from "./storage-savelayer";
import { Logger } from "./utilities/bsLogger";
import './styles/storage-style.css';
import { CreateStorageToolTips } from "./utilities/bsTooltips";

class DialogueExplorer {
    private tokens: IToken[] = [];
    private selectedDialogue: IDialogueItem | null = null;
    private isMobileView: boolean = false;
    private storageManager: DialogueStorageManager;

    constructor(registered: boolean = false) {
        this.storageManager = new DialogueStorageManager(registered);
        this.init();
    }

    private async init(): Promise<void> {
        // Set up event delegation ONCE at init
        this.bindEvents();
        
        // Set up listener for dialogues from parent window FIRST (on response channel)
        OBR.broadcast.onMessage(Constants.EXTENSIONID + '/dialogue-response', (event) => {
            const data = event.data as any;
            if (data.type === 'DIALOGUES_DATA') {
                Logger.log('[Storage] Received', data.dialogues.length, 'dialogues from parent');
                this.storageManager.dialogues = data.dialogues;
                this.storageManager.isUserRegistered = data.registered;
                // Re-render with the new data
                this.renderDialogueList();
                this.renderEditor();
            }
        });
        
        // Request dialogues from parent (response will come via broadcast on different channel)
        Logger.log('[Storage] Requesting dialogues from parent window');
        await OBR.broadcast.sendMessage(Constants.EXTENSIONID + '/dialogue-request', { 
            type: 'REQUEST_DIALOGUES' 
        }, { destination: "LOCAL" });
        
        // Render immediately (may be empty initially, will update when data arrives)
        this.checkMobileView();
        this.renderDialogueList();
        this.renderEditor();
        CreateStorageToolTips();
        
        // Listen for window resize to update mobile view
        window.addEventListener('resize', () => {
            this.checkMobileView();
        });
    }

    private checkMobileView(): void {
        this.isMobileView = window.innerWidth <= 600;
    }

    private generateId(): string {
        if (this.storageManager.isUserRegistered) {
            return GetGUID();
        }
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    private renderDialogueList(): void {
        const container = document.getElementById('dialogueItems')!;
        container.innerHTML = this.storageManager.dialogues.map(dialogue => `
            <div class="dialogue-item ${this.selectedDialogue?.id === dialogue.id ? 'selected' : ''}" 
                 data-id="${dialogue.id}">
                <div class="dialogue-item-header">
                    ${dialogue.tokenImage ? `<img src="${dialogue.tokenImage}" alt="${dialogue.tokenName}" class="token-thumbnail">` : ''}
                    <div class="dialogue-item-title">${dialogue.title || 'Untitled'}</div>
                </div>
                <div class="dialogue-item-preview">${dialogue.text.substring(0, 50)}${dialogue.text.length > 50 ? '...' : ''}</div>
                <div class="dialogue-actions">
                    <button class="btn btn-sm btn-primary send-dialogue" data-id="${dialogue.id}">Load to Theatre</button>
                    <button class="btn btn-sm btn-danger delete-dialogue" data-id="${dialogue.id}">Delete</button>
                </div>
            </div>
        `).join('');
    }

    private renderEditor(): void {
        const container = document.getElementById('editorContent')!;
        
        if (!this.selectedDialogue) {
            container.innerHTML = '<p style="text-align: center; color: var(--OBR-offset-fore); margin-top: 50px;">Select a dialogue to edit, or create a new one.</p>';
            return;
        }

        const tokenOptions = this.tokens.map(token => 
            `<option value="${token.id}" ${this.selectedDialogue?.tokenId === token.id ? 'selected' : ''}>${token.name}</option>`
        ).join('');

        const mobileBackButton = this.isMobileView ? 
            '<button type="button" class="mobile-back-button" id="mobileBack">← Back to List</button>' : '';

        container.innerHTML = `
            <form class="dialogue-form" id="dialogueForm">
                <div class="form-row">
                    <div class="form-group form-group-half">
                        <label class="form-label" for="dialogueTitle">Title</label>
                        <input type="text" id="dialogueTitle" class="form-input" value="${this.selectedDialogue.title}" maxlength="50" placeholder="Enter dialogue title...">
                    </div>
                    <div class="form-group form-group-half">
                        <label class="form-label" for="overrideName">Override</label>
                        <input type="text" id="overrideName" class="form-input" value="${this.selectedDialogue.overrideName || ''}" maxlength="30" placeholder="Override display name...">
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="tokenSelect">Token (Optional)</label>
                    <select id="tokenSelect" class="form-select">
                        <option value="">No token selected</option>
                        ${tokenOptions}
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="dialogueText">Dialogue Text</label>
                    <textarea id="dialogueText" class="form-textarea" maxlength="1000" placeholder="Enter your dialogue text...">${this.selectedDialogue.text}</textarea>
                    <div class="character-count" id="charCount">${this.selectedDialogue.text.length}/1000</div>
                </div>
                
                <div class="form-buttons">
                    ${mobileBackButton}
                    <button type="button" class="btn btn-secondary" id="cancelEdit">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Dialogue</button>
                </div>
            </form>
        `;

        // Show mobile editor if on mobile
        if (this.isMobileView) {
            this.showMobileEditor();
        }

        this.bindEditorEvents();
    }

    private showMobileEditor(): void {
        if (this.isMobileView) {
            const editor = document.querySelector('.dialogue-editor') as HTMLElement;
            if (editor) {
                editor.classList.add('mobile-show');
            }
        }
    }

    private hideMobileEditor(): void {
        if (this.isMobileView) {
            const editor = document.querySelector('.dialogue-editor') as HTMLElement;
            if (editor) {
                editor.classList.remove('mobile-show');
            }
        }
    }

    private bindEvents(): void {
        document.getElementById('closeExplorer')?.addEventListener('click', () => {
            OBR.modal.close(Constants.STORAGEID);
        });

        // Export JSON logic
        document.getElementById('exportExplorer')?.addEventListener('click', () => {
            this.exportDialoguesToJSON();
        });

        // Import JSON logic
        document.getElementById('importExplorer')?.addEventListener('click', () => {
            this.importDialoguesFromJSON();
        });

        const addDialogueBtn = document.getElementById('addDialogue');
        addDialogueBtn!.innerText = this.isMobileView ? " + " : "+ New Dialogue";
        addDialogueBtn?.addEventListener('click', () => {
            this.createNewDialogue();
        });

        // Event delegation for list items - bind once to container
        const container = document.getElementById('dialogueItems');
        if (container && !container.dataset.bound) {
            container.dataset.bound = 'true';
            container.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                
                // Handle send button
                if (target.classList.contains('send-dialogue') || target.closest('.send-dialogue')) {
                    e.stopPropagation();
                    const btn = target.closest('.send-dialogue') as HTMLElement;
                    const id = btn?.dataset.id;
                    if (id) this.sendDialogue(id);
                    return;
                }
                
                // Handle delete button
                if (target.classList.contains('delete-dialogue') || target.closest('.delete-dialogue')) {
                    e.stopPropagation();
                    const btn = target.closest('.delete-dialogue') as HTMLElement;
                    const id = btn?.dataset.id;
                    if (id) this.deleteDialogue(id);
                    return;
                }
                
                // Handle dialogue item click (if not a button)
                if (!target.classList.contains('btn') && !target.closest('.btn')) {
                    const item = target.closest('.dialogue-item') as HTMLElement;
                    const id = item?.dataset.id;
                    if (id) this.selectDialogue(id);
                }
            });
        }
    }

    private bindEditorEvents(): void {
        const form = document.getElementById('dialogueForm') as HTMLFormElement;
        const textArea = document.getElementById('dialogueText') as HTMLTextAreaElement;
        const charCount = document.getElementById('charCount')!;
        const mobileBackButton = document.getElementById('mobileBack');

        textArea?.addEventListener('input', () => {
            const length = textArea.value.length;
            charCount.textContent = `${length}/1000`;
            charCount.className = `character-count ${length > 900 ? 'warning' : ''} ${length >= 1000 ? 'error' : ''}`;
        });

        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCurrentDialogue();
            if (this.isMobileView) {
                this.hideMobileEditor();
            }
        });

        document.getElementById('cancelEdit')?.addEventListener('click', () => {
            this.selectedDialogue = null;
            this.renderDialogueList();
            this.renderEditor();
            if (this.isMobileView) {
                this.hideMobileEditor();
            }
        });

        mobileBackButton?.addEventListener('click', () => {
            if (this.isMobileView) {
                this.hideMobileEditor();
            }
        });
    }

    private createNewDialogue(): void {
        const newDialogue: IDialogueItem = {
            id: this.generateId(),
            title: '',
            text: '',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        
        this.storageManager.dialogues.unshift(newDialogue);
        this.selectedDialogue = newDialogue;
        this.renderDialogueList();
        this.renderEditor();
    }

    private selectDialogue(id: string): void {
        this.selectedDialogue = this.storageManager.dialogues.find(d => d.id === id) || null;
        this.renderDialogueList();
        this.renderEditor();
    }

    private async saveCurrentDialogue(): Promise<void> {
        if (!this.selectedDialogue) return;

        const titleInput = document.getElementById('dialogueTitle') as HTMLInputElement;
        const overrideNameInput = document.getElementById('overrideName') as HTMLInputElement;
        const textArea = document.getElementById('dialogueText') as HTMLTextAreaElement;
        const tokenSelect = document.getElementById('tokenSelect') as HTMLSelectElement;

        this.selectedDialogue.title = titleInput.value;
        this.selectedDialogue.overrideName = overrideNameInput.value || undefined;
        this.selectedDialogue.text = textArea.value;
        this.selectedDialogue.updatedAt = new Date();

        if (tokenSelect.value) {
            const selectedToken = this.tokens.find(t => t.id === tokenSelect.value);
            if (selectedToken) {
                this.selectedDialogue.tokenId = selectedToken.id;
                this.selectedDialogue.tokenName = selectedToken.name;
                this.selectedDialogue.tokenImage = selectedToken.image;
            }
        } else {
            this.selectedDialogue.tokenId = undefined;
            this.selectedDialogue.tokenName = undefined;
            this.selectedDialogue.tokenImage = undefined;
        }

        await this.storageManager.saveDialogues(this.selectedDialogue.id);
        
        // Notify parent window to update cache via broadcast
        await OBR.broadcast.sendMessage(Constants.EXTENSIONID + '/dialogue-request', {
            type: 'UPDATE_DIALOGUE',
            dialogue: this.selectedDialogue
        }, { destination: "LOCAL" });
        
        this.renderDialogueList();
    }

    private async sendDialogue(id: string): Promise<void> {
        const dialogue = this.storageManager.dialogues.find(d => d.id === id);
        if (!dialogue) return;

        try {
            await OBR.broadcast.sendMessage(Constants.STORAGECHANNEL, dialogue, {destination: "LOCAL"});
        } catch (error) {
            console.error('Failed to send dialogue:', error);
        }
    }

    private async deleteDialogue(id: string): Promise<void> {
        if (!confirm('Are you sure you want to delete this dialogue?')) return;
        
        await this.storageManager.deleteDialogue(id);
        
        // Notify parent window to update cache via broadcast
        await OBR.broadcast.sendMessage(Constants.EXTENSIONID + '/dialogue-request', {
            type: 'DELETE_DIALOGUE',
            id: id
        }, { destination: "LOCAL" });
        
        if (this.selectedDialogue?.id === id) {
            this.selectedDialogue = null;
        }
        
        this.renderDialogueList();
        this.renderEditor();
    }

    /**
     * Export all dialogues to JSON file (uses localStorage format)
     */
    private exportDialoguesToJSON(): void {
        Logger.log('[Storage] Exporting dialogues to JSON');
        
        // Get all current dialogues
        const exportData = JSON.stringify(this.storageManager.dialogues, null, 2);
        
        // Create blob and download
        const blob = new Blob([exportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `theatre-dialogues-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        Logger.log('[Storage] Export complete');
    }

    /**
     * Import dialogues from JSON file (merges with existing data)
     */
    private importDialoguesFromJSON(): void {
        Logger.log('[Storage] Opening file picker for import');
        
        // Create file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (e: Event) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            
            try {
                const text = await file.text();
                const importedDialogues: IDialogueItem[] = JSON.parse(text);
                
                Logger.log('[Storage] Importing', importedDialogues.length, 'dialogues');
                
                // Parse dates
                const parsedDialogues = importedDialogues.map(d => ({
                    ...d,
                    createdAt: new Date(d.createdAt),
                    updatedAt: new Date(d.updatedAt)
                }));
                
                // Merge with existing dialogues using the same merge logic
                const merged = this.storageManager.mergeDialoguesPublic(
                    this.storageManager.dialogues,
                    parsedDialogues
                );
                
                // Update dialogues and save to localStorage
                this.storageManager.dialogues = merged;
                this.storageManager.saveToLocalStorage();
                
                // Notify parent to update cache
                for (const dialogue of parsedDialogues) {
                    await OBR.broadcast.sendMessage(Constants.EXTENSIONID + '/dialogue-request', {
                        type: 'UPDATE_DIALOGUE',
                        dialogue: dialogue
                    }, { destination: "LOCAL" });
                }
                
                // Re-render
                this.renderDialogueList();
                this.renderEditor();
                
                Logger.log('[Storage] Import complete, merged to', merged.length, 'total dialogues');
                alert(`Successfully imported ${importedDialogues.length} dialogue(s)!`);
                
            } catch (error) {
                Logger.error('[Storage] Import failed:', error);
                alert('Failed to import dialogues. Please check the file format.');
            }
        };
        
        input.click();
    }

    public setTokens(tokens: IToken[]): void {
        this.tokens = tokens;
        if (this.selectedDialogue) {
            this.renderEditor();
        }
    }
}

//let currentRole: "PLAYER" | "GM";
await OBR.onReady(async () =>
{
    const currentTheme = await OBR.theme.getTheme();
    SetThemeMode(currentTheme, document);

    const currentTokens = await OBR.scene.items.getItems<Image>(x => x.layer === "CHARACTER" && x.type === "IMAGE");

    // Convert OBR items to our Token interface
    const tokens: IToken[] = currentTokens.map(item => ({
        id: item.id,
        name: item.name || 'Unnamed Token',
        image: item.image.url || ''
    }));

    // Check registration from URL
    const urlParams = new URLSearchParams(window.location.search);
    const registered = urlParams.get('registered') === 'true';

    const explorer = new DialogueExplorer(registered);
    explorer.setTokens(tokens);
});