import { Dialogue } from "../components/dialogue-item";

const DIALOGUE_STORAGE_KEY = "dialogues";

export function saveDialogue(dialogue: Dialogue): void {
    const dialogues = getDialogues();
    dialogues.push(dialogue);
    localStorage.setItem(DIALOGUE_STORAGE_KEY, JSON.stringify(dialogues));
}

export function getDialogues(): Dialogue[] {
    const dialoguesJson = localStorage.getItem(DIALOGUE_STORAGE_KEY);
    return dialoguesJson ? JSON.parse(dialoguesJson) : [];
}

export function deleteDialogue(title: string): void {
    const dialogues = getDialogues();
    const updatedDialogues = dialogues.filter(dialogue => dialogue.title !== title);
    localStorage.setItem(DIALOGUE_STORAGE_KEY, JSON.stringify(updatedDialogues));
}

export function updateDialogue(updatedDialogue: Dialogue): void {
    const dialogues = getDialogues();
    const index = dialogues.findIndex(dialogue => dialogue.title === updatedDialogue.title);
    if (index !== -1) {
        dialogues[index] = updatedDialogue;
        localStorage.setItem(DIALOGUE_STORAGE_KEY, JSON.stringify(dialogues));
    }
}