import OBR from "@owlbear-rodeo/sdk";
import { Constants } from "./utilities/bsConstants";
import { SetThemeMode } from "./utilities/bsUtilities";
import './styles/sub-style.css'

//let currentRole: "PLAYER" | "GM";
await OBR.onReady(async () =>
{
    const currentTheme = (await OBR.theme.getTheme());
    SetThemeMode(currentTheme, document);
    const metadata = await OBR.player.getMetadata();
    const dialog = metadata[`${Constants.EXTENSIONID}/dialogueBox`] as IDialog;

    const windowWidth = await OBR.viewport.getWidth();
    let mobile = windowWidth < 600;

    if (dialog.Type === "notice") mobile = true;

    const regForm = `
    <div class="left-column">
        <img id="dialog-close"" class="close-icon" src="/close.svg">
        <img id="dialog-forward" class="forward-icon" src="/play.svg" hidden>
        <div id="imageHolder"><img src="${dialog.ImageUrl}" onerror="this.src='/error.svg';" alt="Character Image" class="character-image"></div>
    </div>
    <div class="right-column">
        <div class="upper-part">
            <div class="character-name">${dialog.Name}</div>
        </div>
        <div class="lower-part">
            <div id="messageBody"></div>
        </div>
    </div>
    `;
    const mobForm = `
    <div class="top-container">
        <img id="dialog-close"" class="close-icon" src="/close.svg">
        <img id="dialog-forward" class="mobile-forward-icon" src="/play.svg" hidden>
        <div class="left-top">
            <div id="imageHolder"><img src="${dialog.ImageUrl}" onerror="this.src='/error.svg';" alt="Character Image" class="character-image"></div>
        </div>
        <div class="right-top">
            <div class="character-name">${dialog.Name}</div>
        </div>
    </div>
    <div class="bottom-container">
        <div id="messageBody"></div>
    </div>
    `;

    document.querySelector<HTMLDivElement>('#sapp')!.innerHTML = mobile ? mobForm : regForm;
    if (dialog.Type === "notice")
    {
        document.querySelector<HTMLDivElement>('#sapp')!.style.flexDirection = "column";
        document.querySelector<HTMLDivElement>('.bottom-container')!.style.flex = "1";
    }


    const messageArea = document.getElementById("messageBody")!;
    const closeButton = document.getElementById("dialog-close")! as HTMLInputElement;
    closeButton.src = "/close.svg";
    closeButton.onclick = async () =>
    {
        await OBR.popover.close(Constants.EXTENSIONID);
    };

    const segmentedMessage = dialog.Message.split("::");
    let pageNumber = 0;

    function displayCharacter(index: number)
    {
        if (index < segmentedMessage[pageNumber].length)
        {
            messageArea.innerHTML += segmentedMessage[pageNumber].charAt(index);
            setTimeout(function ()
            {
                displayCharacter(index + 1);
            }, 15);
        }
        else
        {
            const playButton = document.getElementById('dialog-forward')!;
            if ((pageNumber + 1) === segmentedMessage.length)
            {
                playButton.hidden = true;
                playButton.classList.remove('glow-image');
                closeButton.classList.add('glow-image');
            }
            else
            {
                playButton.hidden = false;
                playButton.classList.add('glow-image');
                playButton.onclick = () =>
                {
                    messageArea.innerHTML = "";
                    pageNumber++; // Increment the page.
                    playButton.hidden = true;
                    playButton.classList.remove('glow-image');
                    displayCharacter(0);
                };
            }
        }
    }

    // Begin Displaying Message

    displayCharacter(0);
});