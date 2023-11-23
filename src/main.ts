import OBR, { Image, Metadata, isImage } from '@owlbear-rodeo/sdk';
import './style.css'
import { Constants } from './constants';
import { GetGUID, SetThemeMode } from './utilities';

let currentRole: "PLAYER" | "GM";
let currentTheme: "LIGHT" | "DARK";
let oldsceneItemIds: string[] = [];
let sceneItems: Image[] = [];
let lastCode = "";
let messageCounter: { [key: string]: string } = {};

await OBR.onReady(async () =>
{
    const isReady = await OBR.scene.isReady();

    if (isReady)
    {
        await StartThreatre();
    }

    OBR.scene.onReadyChange(async (ready) => 
    {
        if (ready) await StartThreatre();
        else document.querySelector<HTMLDivElement>('#app')!.innerHTML = ``;
    });

    async function StartThreatre()
    {
        currentRole = await OBR.player.getRole();
        currentTheme = (await OBR.theme.getTheme()).mode;
        SetThemeMode(currentTheme, document);

        SetupOnChangeHandlers();

        if (currentRole !== "GM")
        {
            document.getElementById("app")!.innerHTML =
                `<b>LOG HISTORY</b><div class="full-container">
                    <ul id="dialogLog">
                    </ul>
                </div>`;
            return;
        }

        document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
        <div id="bannerText"></div>
        <label for="CharacterSelect">Character:</label>
        <select id="CharacterSelect"></select>
        
        <label for="OverrideName">Override Name:</label>
        <input type="text" id="OverrideName" placeholder="Enter text to use a custom name">

        <label for="MessageType">Message Type:</label>
        <select id="MessageType">
          <option value="dialogue">Dialogue</option>
          <option value="notice">Notice</option>
        </select>

        <label for="ViewMessage">View Message on Send</label>
        <input type="checkbox" id="ViewMessage" name="ViewMessage">
        </br>

        <label for="MessageTextarea">Message:</label>
        <textarea id="MessageTextarea" rows="4" cols="50" placeholder="Enter text here to send a message.\n\rUsing :: will seperate the message into several pages players will need to click through. \n\r Dialogue type displays text in normal 'RPG Dialog Style' while Notice displays it in a taller window, good for shops or alerts."></textarea>
        
        <button id="sendMessage">SUBMIT</button>`;

        ///Scrolling News
        const textArray = [
            "Type 'test' to send test data",
            "Welcome to the Theatre! v1.1",
            "Use :: to seperate pages of text"
        ];

        let currentIndex = 0;
        const textContainer = document.getElementById("bannerText")!;
        const viewMessageBox = document.getElementById('ViewMessage') as HTMLInputElement;
        viewMessageBox.checked = true;

        function fadeOut()
        {
            textContainer.style.opacity = "0";
            setTimeout(() =>
            {
                fadeIn();
            }, 2000); // Fade-out time is 2 seconds
        }

        function fadeIn()
        {
            currentIndex = (currentIndex + 1) % textArray.length;
            textContainer.textContent = textArray[currentIndex];
            textContainer.style.opacity = "1";
            setTimeout(() =>
            {
                fadeOut();
            }, 10000); // Fade-in time is 2 seconds
        }
        ///Scrolling News

        textContainer.textContent = textArray[currentIndex];
        fadeIn();
        // Populate the select element
        const buttonSend = document.getElementById('sendMessage') as HTMLButtonElement;
        buttonSend.onclick = async () => await SendMessage();

        //const userId = await OBR.player.getId();

        sceneItems = await OBR.scene.items.getItems(x => x.layer === "CHARACTER" && isImage(x));
        SetupItemSelect();

        OBR.scene.items.onChange(async (items) =>
        {
            sceneItems = items.filter(item => isImage(item)) as Image[];
            const itemIds = sceneItems.map(item => item.id);

            if (itemIds.every(item => oldsceneItemIds.includes(item))) return;

            SetupItemSelect();

            oldsceneItemIds = itemIds;
        });

        // Example function to handle the message (replace with your logic)
        async function SendMessage()
        {
            const characterSelect = document.getElementById('CharacterSelect') as HTMLSelectElement;
            const messageTextarea = document.getElementById('MessageTextarea') as HTMLTextAreaElement;
            const overrideNameInput = document.getElementById('OverrideName') as HTMLInputElement;
            const messageTypeSelect = document.getElementById('MessageType') as HTMLSelectElement;

            if (!messageTextarea.value.trim()) return console.log("NO MESSAGE");

            const target = sceneItems.find(item => item.id === characterSelect.value);

            if (!target || !target.image?.url) return console.log("NO IMAGE");

            const tokenName = target.text?.plainText ? target.text.plainText : target.name;
            const code = GetGUID();

            let sendMessage = messageTextarea.value;
            switch (messageTextarea.value)
            {
                case "fresh":
                    sendMessage = Constants.FRESHPRINCE;
                    break;
                case "test":
                    sendMessage = Constants.MULTIPAGE;
                    break;
                default:
                    break;
            }
            const dialogueBox = {
                Id: characterSelect.value,
                Name: overrideNameInput.value ? overrideNameInput.value : tokenName,
                ImageUrl: target.image.url,
                Message: sendMessage,
                Type: messageTypeSelect.value,
                Code: code,
                Created: new Date().toLocaleTimeString()
            } as IDialog;

            const metadata: Metadata =
            {
                [`${Constants.EXTENSIONID}/dialogueBox`]: dialogueBox,
                [`${Constants.EXTENSIONID}/dialogueCode`]: code
            };
            await OBR.scene.setMetadata(metadata);
            await OBR.scene.setMetadata({ [`${Constants.EXTENSIONID}/dialogueCode`]: undefined });
            if (!viewMessageBox.checked) await OBR.notification.show("Message sent", "SUCCESS");
        }

        /// FUNCTIONS
        /// FUNCTIONS
        /// FUNCTIONS
        function IsThisOld(timeStamp: string, processId: string, category = "DIALOG"): boolean
        {
            const processCategory = `${processId}_${category}}`;
            const logKey = messageCounter[processCategory];
            if (logKey)
            {
                if (logKey !== timeStamp)
                {
                    messageCounter[processCategory] = timeStamp;
                    return false;
                }
                else
                    return true;
            }
            else
            {
                messageCounter[processCategory] = timeStamp;
                return false;
            }
        }

        async function HandleMessage(metadata: Metadata)
        {
            const chatLog = document.querySelector<HTMLDivElement>('#dialogLog')!;

            // Checks for own logs passing through
            if (metadata[`${Constants.EXTENSIONID}/dialogueBox`] != undefined)
            {
                const dialogContainer = metadata[`${Constants.EXTENSIONID}/dialogueBox`] as IDialog;

                if (!IsThisOld(dialogContainer.Created, "DIALOG", "DIALOG"))
                {
                    // Flag to see if you're the sender
                    const listMessage = document.createElement('li');
                    //listMessage.style.color = dialogContainer.color;
                    listMessage.innerHTML = `<div class="author">${dialogContainer.Name}:</div>➤ ${dialogContainer.Message.trim()}`;
                    chatLog.append(listMessage);
                }
            }
        }
        function SetupOnChangeHandlers()
        {
            OBR.theme.onChange((theme) =>
            {
                currentTheme = theme.mode;
                SetThemeMode(theme.mode, document);
            });

            OBR.scene.onMetadataChange(async (metadata) =>
            {
                const newCode = metadata[`${Constants.EXTENSIONID}/dialogueCode`];
                const dialogue = metadata[`${Constants.EXTENSIONID}/dialogueBox`] as IDialog;
                const isDialogue = dialogue.Type == "dialogue" ? true : false;

                if (currentRole === "GM" && !viewMessageBox.checked) return;

                if (newCode !== undefined)
                {
                    if (newCode !== lastCode)
                    {
                        await OBR.popover.close(Constants.EXTENSIONID);
                    }

                    lastCode = metadata[`${Constants.EXTENSIONID}/dialogueCode`] as string;
                    const windowWidth = await OBR.viewport.getWidth();
                    const windowHeight = await OBR.viewport.getHeight();
                    if (isDialogue)
                    {
                        await OBR.popover.open({
                            id: Constants.EXTENSIONID,
                            url: `/submenu/subindex.html?code=${lastCode}`,
                            height: 200,
                            width: windowWidth - 100,
                            hidePaper: true,
                            disableClickAway: true,
                            anchorPosition: { top: windowHeight - 250, left: 50 },
                            anchorReference: "POSITION",
                            anchorOrigin: {
                                vertical: "CENTER",
                                horizontal: "LEFT",
                            },
                            transformOrigin: {
                                vertical: "CENTER",
                                horizontal: "LEFT",
                            },
                        });
                    }
                    else
                    {
                        await OBR.popover.open({
                            id: Constants.EXTENSIONID,
                            url: `/submenu/subindex.html?code=${lastCode}`,
                            height: windowHeight / 2,
                            width: windowWidth / 2,
                            hidePaper: true,
                            disableClickAway: true,
                            anchorPosition: { top: windowHeight / 4, left: windowWidth / 4},
                            transformOrigin: {
                                vertical: "TOP",
                                horizontal: "LEFT",
                            },
                            anchorReference: "POSITION",
                            anchorOrigin: {
                                vertical: "TOP",
                                horizontal: "LEFT",
                            },
                        });
                    }

                    if (currentRole === "PLAYER") await HandleMessage(metadata);
                }
            });
        }
        function SetupItemSelect()
        {
            const characterSelect = document.getElementById('CharacterSelect') as HTMLSelectElement;
            characterSelect.innerHTML = '';
            sceneItems.forEach(item =>
            {
                const option = document.createElement('option');
                option.value = item.id;
                option.text = item.text?.plainText ? item.text.plainText : item.name;
                characterSelect.add(option);
            });
        }
    }
});
