import { Token } from '../services/token-service';
import { saveDialogue } from '../services/dialogue-storage';

export class DialogueForm {
    private titleInput: HTMLInputElement;
    private textInput: HTMLTextAreaElement;
    private tokenSelector: HTMLSelectElement;
    private submitButton: HTMLButtonElement;

    constructor(formElement: HTMLFormElement) {
        this.titleInput = formElement.querySelector('#dialogue-title') as HTMLInputElement;
        this.textInput = formElement.querySelector('#dialogue-text') as HTMLTextAreaElement;
        this.tokenSelector = formElement.querySelector('#token-selector') as HTMLSelectElement;
        this.submitButton = formElement.querySelector('#submit-dialogue') as HTMLButtonElement;

        this.submitButton.addEventListener('click', (event) => {
            event.preventDefault();
            this.handleSubmit();
        });
    }

    private handleSubmit() {
        const title = this.titleInput.value;
        const text = this.textInput.value;
        const selectedToken = this.tokenSelector.value;

        if (text.length > 1000) {
            alert('Dialogue text cannot exceed 1000 characters.');
            return;
        }

        const dialogueData = {
            title,
            text,
            token: selectedToken || null,
        };

        saveDialogue(dialogueData);
        this.clearForm();
    }

    private clearForm() {
        this.titleInput.value = '';
        this.textInput.value = '';
        this.tokenSelector.selectedIndex = 0;
    }
}