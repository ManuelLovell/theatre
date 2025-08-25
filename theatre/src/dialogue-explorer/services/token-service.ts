import OBR from "@owlbear-rodeo/sdk";
import { Constants } from "../../utilities/bsConstants";

export class TokenService {
    static async fetchTokens() {
        const currentTokens = OBR.scene.items.getItems(x => x.layer === "CHARACTER");
        return currentTokens.map(token => ({
            id: token.id,
            name: token.name,
            image: token.image,
        }));
    }

    static getTokenImage(token) {
        return token.image || 'default-image.png'; // Fallback image if none is provided
    }

    static getTokenName(token) {
        return token.name || 'Unnamed Token';
    }
}