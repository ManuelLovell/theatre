import OBR from "@owlbear-rodeo/sdk";
import { Constants } from "../../utilities/bsConstants";

export class TokenSelector {
    private tokens: Array<{ id: string; name: string; image: string }>;
    private selectedTokenId: string | null = null;

    constructor(tokens: Array<{ id: string; name: string; image: string }>) {
        this.tokens = tokens;
    }

    public render(container: HTMLElement): void {
        const selectElement = document.createElement("select");
        selectElement.addEventListener("change", (event) => {
            this.selectedTokenId = (event.target as HTMLSelectElement).value;
        });

        this.tokens.forEach(token => {
            const option = document.createElement("option");
            option.value = token.id;
            option.textContent = token.name;
            selectElement.appendChild(option);
        });

        container.appendChild(selectElement);
    }

    public getSelectedTokenId(): string | null {
        return this.selectedTokenId;
    }
}