import OBR, {Image} from "@owlbear-rodeo/sdk";
import { Constants } from "./utilities/bsConstants";
import { SetThemeMode } from "./utilities/bsUtilities";
import './styles/storage-style.css'

interface DialogueItem {
    id: string;
    title: string;
    text: string;
    overrideName?: string; // Add this new field
    tokenId?: string;
    tokenName?: string;
    tokenImage?: string;
    createdAt: Date;
    updatedAt: Date;
}

interface Token {
    id: string;
    name: string;
    image: string;
}

class DialogueExplorer {
    private dialogues: DialogueItem[] = [];
    private tokens: Token[] = [];
    private selectedDialogue: DialogueItem | null = null;
    private isMobileView: boolean = false;

    constructor() {
        this.loadDialogues();
        this.checkMobileView();
        this.render();
        // Listen for window resize to update mobile view
        window.addEventListener('resize', () => {
            this.checkMobileView();
        });
    }

    private checkMobileView(): void {
        this.isMobileView = window.innerWidth <= 600;
    }

    private loadDialogues(): void {
        const saved = localStorage.getItem('theatre-dialogues');
        if (saved) {
            this.dialogues = JSON.parse(saved).map((d: any) => ({
                ...d,
                createdAt: new Date(d.createdAt),
                updatedAt: new Date(d.updatedAt)
            }));
        }
    }

    private saveDialogues(): void {
        localStorage.setItem('theatre-dialogues', JSON.stringify(this.dialogues));
    }

    private generateId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    private render(): void {
        this.renderDialogueList();
        this.renderEditor();
        this.bindEvents();
    }

    private renderDialogueList(): void {
        const container = document.getElementById('dialogueItems')!;
        container.innerHTML = this.dialogues.map(dialogue => `
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

        // Re-bind events after updating the DOM
        this.bindListEvents();
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
            ${mobileBackButton}
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
                    <button type="submit" class="btn btn-primary">Save Dialogue</button>
                    <button type="button" class="btn btn-secondary" id="cancelEdit">Cancel</button>
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

        document.getElementById('addDialogue')?.addEventListener('click', () => {
            this.createNewDialogue();
        });

        this.bindListEvents();
    }

    private bindListEvents(): void {
        document.querySelectorAll('.dialogue-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if ((e.target as HTMLElement).classList.contains('btn')) return;
                const id = (item as HTMLElement).dataset.id!;
                this.selectDialogue(id);
            });
        });

        document.querySelectorAll('.send-dialogue').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = (btn as HTMLElement).dataset.id!;
                this.sendDialogue(id);
            });
        });

        document.querySelectorAll('.delete-dialogue').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = (btn as HTMLElement).dataset.id!;
                this.deleteDialogue(id);
            });
        });
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
        const newDialogue: DialogueItem = {
            id: this.generateId(),
            title: '',
            text: '',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        this.dialogues.unshift(newDialogue);
        this.selectedDialogue = newDialogue;
        this.renderDialogueList();
        this.renderEditor();
    }

    private selectDialogue(id: string): void {
        this.selectedDialogue = this.dialogues.find(d => d.id === id) || null;
        this.renderDialogueList();
        this.renderEditor();
    }

    private saveCurrentDialogue(): void {
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

        this.saveDialogues();
        this.renderDialogueList();
    }

    private async sendDialogue(id: string): Promise<void> {
        const dialogue = this.dialogues.find(d => d.id === id);
        if (!dialogue) return;

        try {
            await OBR.broadcast.sendMessage(Constants.STORAGECHANNEL, dialogue, {destination: "LOCAL"});
        } catch (error) {
            console.error('Failed to send dialogue:', error);
        }
    }

    private deleteDialogue(id: string): void {
        if (!confirm('Are you sure you want to delete this dialogue?')) return;
        
        this.dialogues = this.dialogues.filter(d => d.id !== id);
        if (this.selectedDialogue?.id === id) {
            this.selectedDialogue = null;
        }
        
        this.saveDialogues();
        this.renderDialogueList();
        this.renderEditor();
    }

    public setTokens(tokens: Token[]): void {
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
    const tokens: Token[] = currentTokens.map(item => ({
        id: item.id,
        name: item.name || 'Unnamed Token',
        image: item.image.url || ''
    }));

    const explorer = new DialogueExplorer();
    explorer.setTokens(tokens);
});