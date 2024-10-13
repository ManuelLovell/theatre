import OBR from "@owlbear-rodeo/sdk";
import { Constants } from "./utilities/bsConstants";
import { CheckIfImage, SetThemeMode } from "./utilities/bsUtilities";
import './styles/sub-style.css'
import { TheatreForms } from "./submenu_forms";

//let currentRole: "PLAYER" | "GM";
await OBR.onReady(async () =>
{
    const subwindowHtml = document.getElementById('sapp') as HTMLDivElement;
    const currentTheme = await OBR.theme.getTheme();
    SetThemeMode(currentTheme, document);

    const metadata = await OBR.player.getMetadata();
    const dialog = metadata[`${Constants.EXTENSIONID}/dialogueBox`] as IDialog;

    if (dialog.Type === "dialogue")
    {
        const windowWidth = await OBR.viewport.getWidth();
        subwindowHtml.innerHTML = windowWidth < 600 ? TheatreForms.CompactForm(dialog) : TheatreForms.RegularForm(dialog);
    }
    else if (dialog.Type === "notice")
    {
        subwindowHtml.innerHTML = TheatreForms.CompactForm(dialog);
        document.querySelector<HTMLDivElement>('#sapp')!.style.flexDirection = "column";
        document.querySelector<HTMLDivElement>('.bottom-container')!.style.flex = "1";
    }
    else if (dialog.Type === "story")
    {
        subwindowHtml.innerHTML = TheatreForms.StoryForm();
    }

    const messageArea = document.getElementById("messageBody")!;
    const closeButton = document.getElementById("dialog-close")! as HTMLInputElement;
    closeButton.src = "/close.svg";
    closeButton.onclick = async () =>
    {
        await OBR.popover.close(Constants.EXTENSIONID);
    };

    const segmentedMessages = dialog.Message.split("::").map(unescapeString)

    const isImageChecks: boolean[] = [];
    for (const message of segmentedMessages)
    {
        // Check to see which of these messages are images
        const isImage = await CheckIfImage(message);
        isImageChecks.push(isImage);
    }

    let pageNumber = 0;

    function displayCharacter(index: number)
    {
        if ((dialog.Type === "story") && (index !== 99999) && (isImageChecks[pageNumber] === true))
        {
            messageArea.innerHTML = `<img class="story-image" src="${segmentedMessages[pageNumber]}" onerror="this.onerror=null;this.src='/failload.png';" width="auto" height="auto">`;
            setTimeout(function ()
            {
                displayCharacter(99999);
            }, 1500);
        } else if (index < segmentedMessages[pageNumber].length)
        {
            const currentChar = segmentedMessages[pageNumber][index];

            if (currentChar === '§')
            {
                messageArea.innerHTML += '<br>';
            }
            else if (currentChar === '†')
            {
                messageArea.innerHTML += '&emsp;&emsp;';
            } 
            else if (currentChar === '‡')
            {
                messageArea.innerHTML += '&emsp;&emsp;&emsp;&emsp;';
            } 
            else
            {
                messageArea.innerHTML += currentChar;
            }

            setTimeout(function ()
            {
                displayCharacter(index + 1);
            }, 15);
        } else
        {
            const playButton = document.getElementById('dialog-forward')!;
            if ((pageNumber + 1) === segmentedMessages.length)
            {
                playButton.hidden = true;
                playButton.classList.remove('glow-image');
                closeButton.classList.add('glow-image');
            } else
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

    function unescapeString(str: string): string
    {
        return str.replace(/\\n/g, '§')
            .replace(/\\t/g, '†')
            .replace(/\\T/g, '‡')
            .replace(/\\'/g, "'")
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\');
    }
    // Begin Displaying Message

    displayCharacter(0);
});