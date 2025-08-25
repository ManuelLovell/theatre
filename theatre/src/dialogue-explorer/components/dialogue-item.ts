import OBR from "@owlbear-rodeo/sdk";

export class DialogueItem {
    title: string;
    text: string;
    tokenId: string | null;
    tokenImage: string | null;

    constructor(title: string, text: string, tokenId: string | null, tokenImage: string | null) {
        this.title = title;
        this.text = text;
        this.tokenId = tokenId;
        this.tokenImage = tokenImage;
    }

    render(): HTMLElement {
        const itemContainer = document.createElement('div');
        itemContainer.classList.add('dialogue-item');

        const titleElement = document.createElement('h3');
        titleElement.textContent = this.title;
        itemContainer.appendChild(titleElement);

        const textElement = document.createElement('p');
        textElement.textContent = this.text;
        itemContainer.appendChild(textElement);

        if (this.tokenImage) {
            const tokenImageElement = document.createElement('img');
            tokenImageElement.src = this.tokenImage;
            tokenImageElement.alt = this.tokenId || 'Token';
            tokenImageElement.classList.add('token-thumbnail');
            itemContainer.appendChild(tokenImageElement);
        }

        return itemContainer;
    }
}