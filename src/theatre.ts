import OBR, { Image, Metadata } from '@owlbear-rodeo/sdk';
import { BSCACHE } from './utilities/bsSceneCache';
import * as Utilities from './utilities/bsUtilities';
import * as showdown from 'showdown';
import { Constants } from './utilities/bsConstants';
import { Logger } from './utilities/bsLogger';
import { CreateTooltips } from './utilities/bsTooltips';

class Theatre
{
    public mainWindow = document.getElementById('app') as HTMLDivElement;

    public controlToggle = document.getElementById("viewControls") as HTMLButtonElement;
    public controlPanel = document.getElementById("controlPanel") as HTMLDivElement;
    public historyToggle = document.getElementById("viewHistory") as HTMLButtonElement;
    public historyPanel = document.getElementById("historyPanel") as HTMLDivElement;
    public helpToggle = document.getElementById("viewHelp") as HTMLButtonElement;
    public helpPanel = document.getElementById("helpPanel") as HTMLDivElement;

    public sendButton = document.getElementById("sendMessage") as HTMLButtonElement;
    public closeAllPlayerWindows = document.getElementById("closeAllPlayerWindows") as HTMLButtonElement;
    public storageButton = document.getElementById("accessStorage") as HTMLButtonElement;

    public patreonContainer = document.getElementById("patreonContainer") as HTMLDivElement;
    public characterSelectLabel = document.getElementById('characterLabel') as HTMLSelectElement;
    public characterSelect = document.getElementById('CharacterSelect') as HTMLSelectElement;
    public playerSelect = document.getElementById('PlayerSelect') as HTMLSelectElement;
    public playerSelectHolder = document.getElementById("playerSelectHolder") as HTMLDivElement;
    public overrideNameInput = document.getElementById('OverrideName') as HTMLInputElement;
    public messageTextarea = document.getElementById('MessageTextarea') as HTMLTextAreaElement;
    public messageTypeSelect = document.getElementById('MessageType') as HTMLSelectElement;
    public viewMessageBox = document.getElementById('ViewMessage') as HTMLInputElement;

    public whisperDistance = document.getElementById('whisperDistance') as HTMLInputElement;
    public talkDistance = document.getElementById('talkDistance') as HTMLInputElement;
    public yellDistance = document.getElementById('yellDistance') as HTMLInputElement;
    public messageRange = document.getElementById('messageRange') as HTMLSelectElement;
    public messageRangeHolder = document.getElementById("rangeSelectHolder") as HTMLDivElement;

    public localStorageEnabled = false;

    public broadcaster = new BroadcastChannel(Constants.SELFCHANNEL);

    version: string;

    constructor(version: string)
    {
        this.version = `THEATRE-${version}`;
        this.localStorageEnabled = Utilities.TestEnvironment();
        if (!this.localStorageEnabled)
        {
            this.storageButton.disabled = true;
            this.storageButton.title = "Local Storage is not available";
        }
    }

    public async StartThreatre()
    {
        this.patreonContainer?.appendChild(Utilities.GetPatreonButton());
        this.SetupButtons();
        this.SetupHelp();
        this.SetupItemSelect();
        this.UpdatePlayerSelect();
        CreateTooltips();
    }

    public SetupHelp()
    {
        const converter = new showdown.Converter();
        const helpHtml = converter.makeHtml(Constants.MARKDOWNHELP);
        const helpElement = document.getElementById("helpMarkdownContainer") as HTMLDivElement;
        helpElement.innerHTML = helpHtml;
    }

    public SetupButtons()
    {
        this.messageRange.value = "talk";
        this.messageRangeHolder.style.display = "none";
        this.playerSelectHolder.style.display = "flex";
        this.messageTypeSelect.onchange = () =>
        {
            if (this.messageTypeSelect.value === "bubble")
            {
                this.messageRangeHolder.style.display = "flex";
                this.playerSelectHolder.style.display = "none";
            }
            else
            {
                this.messageRangeHolder.style.display = "none";
                this.playerSelectHolder.style.display = "flex";
            }
        };
        this.controlToggle.onclick = (e) =>
        {
            e.preventDefault();
            this.controlPanel.style.display = "block";
            this.controlToggle.classList.add("selected");

            this.historyPanel.style.display = "none";
            this.historyToggle.classList.remove("selected");

            this.helpPanel.style.display = "none";
            this.helpToggle.classList.remove("selected");
        };

        this.historyToggle.onclick = (e) =>
        {
            e.preventDefault();
            this.controlPanel.style.display = "none";
            this.controlToggle.classList.remove("selected");

            this.historyPanel.style.display = "block";
            this.historyToggle.classList.add("selected");

            this.helpPanel.style.display = "none";
            this.helpToggle.classList.remove("selected");
        };

        this.helpToggle.onclick = (e) =>
        {
            e.preventDefault();
            this.controlPanel.style.display = "none";
            this.controlToggle.classList.remove("selected");

            this.historyPanel.style.display = "none";
            this.historyToggle.classList.remove("selected");

            this.helpPanel.style.display = "block";
            this.helpToggle.classList.add("selected");
        };

        this.sendButton.onclick = async (e) =>
        {
            e.preventDefault();
            await this.SendMessage();
        };
        this.storageButton.onclick = async (e) =>
        {
            e.preventDefault();
            if (this.localStorageEnabled)
            {
                // Ensure dialogue cache is loaded before opening modal
                if (!BSCACHE.dialogueCacheLoaded) {
                    await BSCACHE.LoadDialogueCache();
                }
                
                await OBR.modal.open({
                    id: Constants.STORAGEID,
                    url: `/submenu/storage.html?registered=${BSCACHE.USER_REGISTERED ? "true" : "false"}`,
                    width: 720,
                    height: 520,
                    fullScreen: false,
                    hideBackdrop: true,
                    hidePaper: true,
                });
            }
        }

        if (BSCACHE.playerRole === "GM")
        {
            this.talkDistance.onblur = async () =>
            {
                await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/talk`]: this.talkDistance.value });
            };
            this.whisperDistance.onblur = async () =>
            {
                await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/whisper`]: this.whisperDistance.value });
            };
            this.yellDistance.onblur = async () =>
            {
                await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/yell`]: this.yellDistance.value });
            };
            this.closeAllPlayerWindows.onclick = async () =>
            {
                await this.CloseAllPlayerWindows();
            }
        }
        else
        {
            this.talkDistance.disabled = true;
            this.whisperDistance.disabled = true;
            this.yellDistance.disabled = true;
            this.closeAllPlayerWindows.style.display = "none";
        }

        this.talkDistance.value = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/talk`] as string ?? "5";
        this.whisperDistance.value = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/whisper`] as string ?? "1";
        this.yellDistance.value = BSCACHE.sceneMetadata[`${Constants.EXTENSIONID}/yell`] as string ?? "10";
    }

    public async CloseAllPlayerWindows()
    {
        if (BSCACHE.playerRole !== "GM")
        {
            await OBR.notification.show("Only the GM can close all player windows.", "ERROR");
            return;
        }

        await OBR.broadcast.sendMessage(Constants.CLOSECHANNEL, true);
        await OBR.notification.show("All player windows closed.", "SUCCESS");
    }

    public async SendMessage()
    {
        const useSelectedToken = this.characterSelect.value === Constants.SELECTEDTOKENOPTION;
        const playerSelection = await OBR.player.getSelection() ?? [];
        const tokenId = useSelectedToken ? playerSelection[0] : this.characterSelect.value;
        if (!tokenId)
        {
            return;
        }

        const target = BSCACHE.sceneItems.find(item => item.id === tokenId);

        if (!target || !target.image?.url)
        {
            return;
        }
        if (target.createdUserId !== BSCACHE.playerId && BSCACHE.playerRole !== "GM")
        {
            await OBR.notification.show("Cannot send messages for tokens you do not own.", "ERROR");
            return;
        }

        let message = this.messageTextarea.value.trim();
        const messageType = this.messageTypeSelect.value;

        if (!message)
        {
            if (messageType === "story")
            {
                message = target.image.url;
            }
            else
            {
                Logger.log("No message has been entered to send.");
                return;
            }
        }

        const code = Utilities.GetGUID();
        const tokenName = target.text?.plainText || target.name;
        const name = this.overrideNameInput.value || tokenName;

        const baseMetadata: ITheatreMetadata = {
            Id: target.id,
            SenderId: BSCACHE.playerId,
            Name: name,
            ImageUrl: target.image.url,
            TargetId: this.playerSelect.value,
            Type: messageType,
            Code: code
        };

        let metadata: Metadata;

        if (messageType === "bubble")
        {
            const bubbleBox: IBubble = {
                ...baseMetadata,
                Message: message,
                Range: this.messageRange.value
            };
            metadata = {
                [`${Constants.EXTENSIONID}/bubbleBox`]: bubbleBox
            };
        }
        else
        {
            const dialogueBox: IDialog = {
                ...baseMetadata,
                Message: this.getFormattedMessage(message)
            };

            metadata = {
                [`${Constants.EXTENSIONID}/dialogueBox`]: dialogueBox,
                [`${Constants.EXTENSIONID}/dialogueCode`]: code
            };
        }

        await OBR.broadcast.sendMessage(Constants.BROADCASTCHANNEL, metadata);

        if (this.viewMessageBox.checked)
        {
            this.broadcaster.postMessage(metadata);
            // If you view the message, it should log along the regular pipelines
        }
        else
        {
            await OBR.notification.show("Message sent", "SUCCESS");
            await BSCACHE.UpdateHistoryLog(metadata, messageType === "bubble");
            // Need to log the 'converted' message for the GM to Rumble if NOT bubble
            // The logger for everyoen else is done in the submenu file
            // Fix images in history
        }
    }

    private getFormattedMessage(message: string): string
    {
        switch (message)
        {
            case "fresh": return Constants.FRESHPRINCE;
            case "test": return Constants.MULTIPAGE;
            default: return message;
        }
    }

    public SetupItemSelect()
    {
        const characterSelect = document.getElementById('CharacterSelect') as HTMLSelectElement;
        characterSelect.innerHTML = '';

        const option = document.createElement('option');
        option.value = Constants.SELECTEDTOKENOPTION;
        option.text = "Use Selected";
        characterSelect.add(option);

        BSCACHE.sceneItems.forEach(item =>
        {
            if (item.layer === "CHARACTER"
                && (item.createdUserId === BSCACHE.playerId || BSCACHE.playerRole === "GM"))
            {
                const token = item as Image;
                const option = document.createElement('option');
                option.value = item.id;
                option.text = token.text?.plainText ? token.text.plainText : item.name;
                characterSelect.add(option);
            }
        });
    }

    public UpdatePlayerSelect()
    {
        const playerSelect = <HTMLSelectElement>document.getElementById("PlayerSelect");
        let lastTarget = playerSelect.value;

        const everyoneOption = document.createElement("option");
        everyoneOption.setAttribute('value', "0000");
        const everyoneText = document.createTextNode("Everyone");
        everyoneOption.appendChild(everyoneText);

        //Clear and add Everyone option
        playerSelect.innerHTML = "";
        playerSelect.appendChild(everyoneOption);

        BSCACHE.party.forEach(player =>
        {
            let option = document.createElement("option");
            option.setAttribute('value', player.id);

            let optionText = document.createTextNode(player.name);
            option.appendChild(optionText);

            playerSelect.appendChild(option);
        });

        const lastTargetConnected = BSCACHE.party.find(player => player.id === lastTarget);
        if (!lastTargetConnected && lastTarget && lastTarget !== "0000")
        {
            let option = document.createElement("option");
            option.setAttribute('value', lastTarget);

            let optionText = document.createTextNode("(Disconnected)");
            option.appendChild(optionText);

            playerSelect.appendChild(option);
            playerSelect.value = lastTarget;

            playerSelect.classList.add("glowing-text");
            playerSelect.classList.add("glowing-text");

            setTimeout(function ()
            {
                playerSelect.classList.remove("glowing-text");
                playerSelect.classList.remove("glowing-text");
            }, 5000);
        }
        else if (lastTarget)
        {
            playerSelect.value = lastTarget;
        }
    }
}

export const THEATRE = new Theatre('2.21');