import OBR from "@owlbear-rodeo/sdk";
import { Constants } from "./constants";
import { SetThemeMode } from "./utilities";
import './substyle.css'

//let currentRole: "PLAYER" | "GM";
let currentTheme: "LIGHT" | "DARK";

await OBR.onReady(async () =>
{
    currentTheme = (await OBR.theme.getTheme()).mode;
    SetThemeMode(currentTheme, document);
    OBR.theme.onChange((theme) =>
    {
        currentTheme = theme.mode;
        SetThemeMode(currentTheme, document);
    });

    const metadata = await OBR.scene.getMetadata();
    const dialog = metadata[`${Constants.EXTENSIONID}/dialogueBox`] as IDialog;

    document.querySelector<HTMLDivElement>('#sapp')!.innerHTML = `
    <div class="dialog-box">
    <div id="imageHolder"><img src="${dialog.ImageUrl}" onerror="this.src='/error.svg';" alt="Character Image" class="character-image"></div>
    <button id="dialog-close" class="close-icon clickable" type="button"></button>
        <div class="dialog-content">
            <div class="character-name">${dialog.Name}</div>
            <div class="dialog-text">
                <p id="messageBody" class="dialog-text-body"></p>
            </div>
        </div>
        <img id="dragon" class="dragon" src="/dragon.svg" hidden>
    </div>
    `;

    const messageArea = document.getElementById("messageBody")!;
    const closeButton = document.getElementById("dialog-close")! as HTMLInputElement;
    closeButton.textContent = "X";
    closeButton.onclick = async () =>
    {
        await OBR.popover.close(Constants.EXTENSIONID);
    };

    function displayCharacter(index: number)
    {
        if (index < dialog.Message.length)
        {
            messageArea.innerHTML += dialog.Message.charAt(index);
            setTimeout(function ()
            {
                displayCharacter(index + 1);
            }, 25);
        }
        else
        {
            const dragon = document.getElementById('dragon')!;
            setInterval(function ()
            {
                dragon.hidden = dragon.hidden === true ? false: true;
            }, 500);
        }
    }

    // Begin Typing
    displayCharacter(0);
});