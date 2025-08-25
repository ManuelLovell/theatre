import OBR, { Grid, isImage, Image, Item, Metadata, Player, Theme, Vector2 } from "@owlbear-rodeo/sdk";
import * as Utilities from '../utilities/bsUtilities';
import { THEATRE } from '../theatre';
import { Constants } from "./bsConstants";
import { LabelLogic } from './bsLabelLogic';

class BSCache
{
    // Cache Names
    static PLAYER = "PLAYER";
    static PARTY = "PARTY";
    static LOCALITEMS = "LOCALITEMS";
    static SCENEITEMS = "SCENEITEMS";
    static SCENEMETA = "SCENEMETADATA";
    static SCENEGRID = "SCENEGRID";
    static ROOMMETA = "ROOMMETADATA";

    private debouncedOnSceneItemsChange: (items: Image[]) => void;
    private debouncedOnLocalItemsChange: (items: Item[]) => void;
    private debouncedOnSceneMetadataChange: (items: Metadata) => void;

    playerId: string;
    playerConnection: string;
    playerColor: string;
    playerName: string;
    playerMetadata: {};
    playerRole: "GM" | "PLAYER";

    party: Player[];
    lastParty: Player[];

    gridDpi: number;
    gridScale: number; // IE; 5ft

    localItems: Item[];

    oldSceneItems: Image[];
    sceneItems: Image[];
    sceneSelected: string[];
    sceneMetadata: Metadata;
    sceneReady: boolean;

    roomMetadata: Metadata;

    theme: any;

    caches: string[];
    USER_REGISTERED: boolean;
    historyLog: Record<string, {}>;

    //handlers
    sceneMetadataHandler?: () => void;
    localItemsHandler?: () => void;
    sceneItemsHandler?: () => void;
    sceneGridHandler?: () => void;
    sceneReadyHandler?: () => void;
    playerHandler?: () => void;
    partyHandler?: () => void;
    themeHandler?: () => void;
    roomHandler?: () => void;

    constructor(caches: string[])
    {
        this.playerId = "";
        this.playerConnection = "";
        this.playerName = "";
        this.playerColor = "";
        this.playerMetadata = {};
        this.playerRole = "PLAYER";
        this.party = [];
        this.lastParty = [];
        this.sceneItems = [];
        this.oldSceneItems = [];
        this.sceneSelected = [];
        this.sceneMetadata = {};
        this.gridDpi = 0;
        this.gridScale = 5;
        this.sceneReady = false;
        this.theme = "DARK";
        this.roomMetadata = {};

        this.USER_REGISTERED = false;
        this.caches = caches;
        this.historyLog = {};

        // Large singular updates to sceneItems can cause the resulting onItemsChange to proc multiple times, at the same time
        this.debouncedOnSceneItemsChange = Utilities.Debounce(this.OnSceneItemsChange.bind(this) as any, 100);
        this.debouncedOnSceneMetadataChange = Utilities.Debounce(this.OnSceneMetadataChanges.bind(this) as any, 100);
        this.debouncedOnLocalItemsChange = Utilities.Debounce(this.OnLocalItemsChange.bind(this) as any, 100);
    }

    public async InitializeCache()
    {
        // Always Cache
        this.sceneReady = await OBR.scene.isReady();

        this.theme = await OBR.theme.getTheme();
        Utilities.SetThemeMode(this.theme, document);

        if (this.caches.includes(BSCache.PLAYER))
        {
            this.playerId = await OBR.player.getId();
            this.playerConnection = await OBR.player.getConnectionId();
            this.playerName = await OBR.player.getName();
            this.playerColor = await OBR.player.getColor();
            this.playerMetadata = await OBR.player.getMetadata();
            this.playerRole = await OBR.player.getRole();
        }

        if (this.caches.includes(BSCache.PARTY))
        {
            this.party = await OBR.party.getPlayers();
        }

        if (this.caches.includes(BSCache.LOCALITEMS))
        {
            if (this.sceneReady) this.localItems = await OBR.scene.local.getItems();
        }

        if (this.caches.includes(BSCache.SCENEITEMS))
        {
            if (this.sceneReady) this.sceneItems = await OBR.scene.items.getItems();
        }

        if (this.caches.includes(BSCache.SCENEMETA))
        {
            if (this.sceneReady) 
            {
                this.sceneMetadata = await OBR.scene.getMetadata();
            }
        }

        if (this.caches.includes(BSCache.SCENEGRID))
        {
            if (this.sceneReady)
            {
                this.gridDpi = await OBR.scene.grid.getDpi();
                this.gridScale = (await OBR.scene.grid.getScale()).parsed?.multiplier ?? 5;
            }
        }

        if (this.caches.includes(BSCache.ROOMMETA))
        {
            this.roomMetadata = await OBR.room.getMetadata();
        }
        await this.CheckRegistration();
    }

    private async HandleMessage(metadata: Metadata)
    {
        //Boxes contain base metadata
        const dialogueCode = metadata[`${Constants.EXTENSIONID}/dialogueCode`];
        const dialogue = metadata[`${Constants.EXTENSIONID}/dialogueBox`] as IDialog;
        const bubble = metadata[`${Constants.EXTENSIONID}/bubbleBox`] as IBubble;

        const isDialogue = dialogue?.Type == "dialogue" ? true : false;
        if (bubble)
        {
            const actor = this.sceneItems.find(x => x.id === bubble.Id);
            const actorPosition = { x: actor.position.x / this.gridDpi, y: actor.position.y / this.gridDpi } as Vector2;

            let volume;
            switch (bubble.Range)
            {
                case "whisper":
                    volume = this.sceneMetadata[`${Constants.EXTENSIONID}/whisper`] ?? 1;
                    break;
                case "talk":
                    volume = this.sceneMetadata[`${Constants.EXTENSIONID}/talk`] ?? 5;
                    break;
                case "yell":
                    volume = this.sceneMetadata[`${Constants.EXTENSIONID}/yell`] ?? 10;
                    break;
                default:
                    break;
            }

            if (actor.createdUserId === this.playerId || this.playerRole === "GM")
            {
                await LabelLogic.UpdateLabel(actor, "36", "80", bubble.Message, bubble.Range);
                await this.UpdateHistoryLog(metadata, true);
            }
            else
            {
                let heardMessage = false;
                // Handle logic to see if you can hear it
                const myTokens = this.sceneItems.filter(x => x.createdUserId === this.playerId);
                for (const token of myTokens)
                {
                    const tokenPosition = { x: token.position.x / this.gridDpi, y: token.position.y / this.gridDpi } as Vector2;

                    const inRange = Utilities.withinDistance(actorPosition, tokenPosition, volume);
                    if (inRange) heardMessage = true;
                }
                if (heardMessage)
                {
                    await LabelLogic.UpdateLabel(actor, "36", "90", bubble.Message, bubble.Range);
                    await this.UpdateHistoryLog(metadata, true);
                }
            }
        }
        else if (dialogue)
        {
            // If this message isn't for you, leave.
            if (dialogue.TargetId !== "0000" && dialogue.TargetId !== this.playerId) return;

            await OBR.popover.close(Constants.EXTENSIONID);

            const windowWidth = await OBR.viewport.getWidth();
            const windowHeight = await OBR.viewport.getHeight();
            await OBR.player.setMetadata(metadata);
            if (isDialogue)
            {
                await OBR.popover.open({
                    id: Constants.EXTENSIONID,
                    url: `/submenu/subindex.html?code=${dialogueCode}`,
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
                    url: `/submenu/subindex.html?code=${dialogueCode}`,
                    height: windowHeight / 2,
                    width: windowWidth / 2,
                    hidePaper: true,
                    disableClickAway: true,
                    anchorPosition: { top: windowHeight / 4, left: windowWidth / 4 },
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
            await this.UpdateHistoryLog(metadata, false);
        }
    }

    private async UpdateRumbleLog(dialogBox: IDialog)
    {
        setTimeout(async function ()
        {
            const rumbleMessage: IRumbleLog = {
                Author: dialogBox.Name,
                SenderId: dialogBox.SenderId,
                Message: dialogBox.Message,
                Volume: "said..."
            };
            await OBR.broadcast.sendMessage(Constants.RUMBLECHANNEL, rumbleMessage, { destination: "LOCAL" });
        }, 1000);
    }

    private async UpdateRumbleLogForBubble(bubbleBox: IBubble)
    {
        // Ignoring Discord Logging via Rumble for Bubble because of the 'hidden' aspects of messages and proximity
        let volume = "said...";
        if (bubbleBox.Range === "yell") volume = "yells...";
        if (bubbleBox.Range === "whisper") volume = "whispers...";

        const rumbleMessage: IRumbleLog = {
            Author: bubbleBox.Name,
            SenderId: bubbleBox.SenderId,
            Message: bubbleBox.Message,
            Volume: volume
        };
        await OBR.broadcast.sendMessage(Constants.RUMBLECHANNEL, rumbleMessage, { destination: "LOCAL" });
    }

    public async UpdateHistoryLog(metadata: Metadata, bubble: boolean)
    {
        const chatLog = document.querySelector<HTMLDivElement>('#dialogLog')!;
        if (bubble)
        {
            if (metadata[`${Constants.EXTENSIONID}/bubbleBox`] !== undefined)
            {
                const dialogContainer = metadata[`${Constants.EXTENSIONID}/bubbleBox`] as IBubble;

                const listMessage = document.createElement('li');
                listMessage.innerHTML = `<div class="author">${dialogContainer.Name}:</div>➤ ${dialogContainer.Message.trim()}`;
                chatLog.append(listMessage);

                const bubble = metadata[`${Constants.EXTENSIONID}/bubbleBox`] as IBubble;
                await this.UpdateRumbleLogForBubble(bubble);
            }
        }
        else
        {
            if (metadata[`${Constants.EXTENSIONID}/dialogueBox`] !== undefined)
            {
                const dialog = metadata[`${Constants.EXTENSIONID}/dialogueBox`] as IDialog;
                const segmentedMessages = dialog.Message.split("::").map(unescapeString);

                function unescapeString(str: string): string
                {
                    return str.replace(/\\n/g, '<br>')
                        .replace(/\\t/g, '&emsp;&emsp;')
                        .replace(/\\T/g, '&emsp;&emsp;&emsp;&emsp;')
                        .replace(/\\'/g, "'")
                        .replace(/\\"/g, '"')
                        .replace(/\\\\/g, '\\');
                }

                for (let segment of segmentedMessages)
                {
                    if (dialog.Type === "story")
                    {
                        const isImage = await Utilities.CheckIfImage(segment);
                        if (isImage)
                        {
                            segment = `<img class="story-image" src="${segment}" onerror="this.onerror=null;this.src='/failload.png';" width="auto" height="auto">`;
                        }
                    }
                    const listMessage = document.createElement('li');
                    listMessage.innerHTML = `<div class="author">${dialog.Name}:</div><div class="log-message">➤ ${segment}<div>`;
                    chatLog.append(listMessage);
                    await this.UpdateRumbleLog(dialog);
                }
            }
        }
    }

    public OpenBroadcast()
    {
        const cachecaster = new BroadcastChannel(Constants.SELFCHANNEL);
        cachecaster.onmessage = async (data) =>
        {
            await this.HandleMessage(data.data);
        };

        OBR.broadcast.onMessage(Constants.BROADCASTCHANNEL, async (data) =>
        {
            await this.HandleMessage(data.data as any);
        });

        OBR.broadcast.onMessage(Constants.STORAGECHANNEL, async (data) =>
        {
            const messageInfo = data.data as IStorageItem;
            if (messageInfo.text) THEATRE.messageTextarea.value = messageInfo.text;
            if (messageInfo.overrideName) THEATRE.overrideNameInput.value = messageInfo.overrideName;
            if (messageInfo.tokenId)
            {
                const foundToken = BSCACHE.sceneItems.find(x => x.id === messageInfo.tokenId);
                if (foundToken)
                {
                    THEATRE.characterSelect.value = foundToken.id;
                }
            }
        });
    }

    public KillHandlers()
    {
        if (this.caches.includes(BSCache.SCENEMETA) && this.sceneMetadataHandler !== undefined) this.sceneMetadataHandler!();
        if (this.caches.includes(BSCache.SCENEITEMS) && this.sceneItemsHandler !== undefined) this.sceneItemsHandler!();
        if (this.caches.includes(BSCache.SCENEITEMS) && this.localItemsHandler !== undefined) this.localItemsHandler!();
        if (this.caches.includes(BSCache.SCENEGRID) && this.sceneGridHandler !== undefined) this.sceneGridHandler!();
        if (this.caches.includes(BSCache.PLAYER) && this.playerHandler !== undefined) this.playerHandler!();
        if (this.caches.includes(BSCache.PARTY) && this.partyHandler !== undefined) this.partyHandler!();
        if (this.caches.includes(BSCache.ROOMMETA) && this.roomHandler !== undefined) this.roomHandler!();

        if (this.themeHandler !== undefined) this.themeHandler!();
    }

    public SetupHandlers()
    {
        if (this.sceneMetadataHandler === undefined || this.sceneMetadataHandler.length === 0)
        {
            if (this.caches.includes(BSCache.SCENEMETA))
            {
                this.sceneMetadataHandler = OBR.scene.onMetadataChange(async (metadata) =>
                {
                    this.sceneMetadata = metadata;
                    this.debouncedOnSceneMetadataChange(metadata);
                });
            }
        }

        if (this.localItemsHandler === undefined || this.sceneItemsHandler.length === 0)
        {
            if (this.caches.includes(BSCache.LOCALITEMS))
            {
                this.localItemsHandler = OBR.scene.local.onChange(async (items) =>
                {
                    this.localItems = items;
                    this.debouncedOnLocalItemsChange(items);
                });
            }
        }

        if (this.sceneItemsHandler === undefined || this.sceneItemsHandler.length === 0)
        {
            if (this.caches.includes(BSCache.SCENEITEMS))
            {
                this.sceneItemsHandler = OBR.scene.items.onChange(async (items) =>
                {
                    const onlyImages = items.filter(x => isImage(x)) as Image[];
                    this.sceneItems = onlyImages;
                    this.debouncedOnSceneItemsChange(onlyImages);
                });
            }
        }

        if (this.sceneGridHandler === undefined || this.sceneGridHandler.length === 0)
        {
            if (this.caches.includes(BSCache.SCENEGRID))
            {
                this.sceneGridHandler = OBR.scene.grid.onChange(async (grid) =>
                {
                    this.gridDpi = grid.dpi;
                    this.gridScale = parseInt(grid.scale);
                    await this.OnSceneGridChange(grid);
                });
            }
        }

        if (this.playerHandler === undefined || this.playerHandler.length === 0)
        {
            if (this.caches.includes(BSCache.PLAYER))
            {
                this.playerHandler = OBR.player.onChange(async (player) =>
                {
                    this.playerName = player.name;
                    this.playerColor = player.color;
                    this.playerId = player.id;
                    this.playerConnection = player.connectionId;
                    this.playerRole = player.role;
                    this.playerMetadata = player.metadata;
                    await this.OnPlayerChange(player);
                });
            }
        }

        if (this.partyHandler === undefined || this.partyHandler.length === 0)
        {
            if (this.caches.includes(BSCache.PARTY))
            {
                this.partyHandler = OBR.party.onChange(async (party) =>
                {
                    this.party = party.filter(x => x.id !== "");
                    await this.OnPartyChange(party);
                });
            }
        }

        if (this.roomHandler === undefined || this.roomHandler.length === 0)
        {
            if (this.caches.includes(BSCache.ROOMMETA))
            {
                this.roomHandler = OBR.room.onMetadataChange(async (metadata) =>
                {
                    this.roomMetadata = metadata;
                    await this.OnRoomMetadataChange(metadata);
                });
            }
        }


        if (this.themeHandler === undefined)
        {
            this.themeHandler = OBR.theme.onChange(async (theme) =>
            {
                this.theme = theme.mode;
                await this.OnThemeChange(theme);
            });
        }

        // Only setup if we don't have one, never kill
        if (this.sceneReadyHandler === undefined)
        {
            this.sceneReadyHandler = OBR.scene.onReadyChange(async (ready) =>
            {
                this.sceneReady = ready;

                if (ready)
                {
                    this.sceneItems = await OBR.scene.items.getItems(isImage);
                    this.sceneMetadata = await OBR.scene.getMetadata();
                    this.gridDpi = await OBR.scene.grid.getDpi();
                    this.gridScale = (await OBR.scene.grid.getScale()).parsed?.multiplier ?? 5;
                }
                await this.OnSceneReadyChange(ready);
            });
        }
    }

    public async OnSceneMetadataChanges(_metadata: Metadata)
    {
        if (this.playerRole !== "GM")
        {
            const talk = this.sceneMetadata[`${Constants.EXTENSIONID}/talk`];
            const whisper = this.sceneMetadata[`${Constants.EXTENSIONID}/whisper`];
            const yell = this.sceneMetadata[`${Constants.EXTENSIONID}/yell`];
            if (talk) THEATRE.talkDistance.value = talk as string;
            if (whisper) THEATRE.whisperDistance.value = whisper as string;
            if (yell) THEATRE.yellDistance.value = yell as string;
        }
    }

    public async OnLocalItemsChange(_items: Item[])
    {

    }

    public async OnSceneItemsChange(_items: Image[])
    {
        if (this.sceneReady)
        {
            const itemIds = this.sceneItems.map(item => item.id);
            const oldItemIds = this.oldSceneItems.map(item => item.id);
            const itemNames = this.sceneItems.map(item => item.text.plainText ? item.text.plainText : item.name);
            const olditemNames = this.oldSceneItems.map(item => item.text.plainText ? item.text.plainText : item.name);

            if (Utilities.arraysAreEqual(itemIds, oldItemIds) && Utilities.arraysAreEqual(itemNames, olditemNames)) return;

            THEATRE.SetupItemSelect();
            this.oldSceneItems = this.sceneItems;

            THEATRE.characterSelectLabel.classList.add("glowing-text");
            THEATRE.characterSelect.classList.add("glowing-text");

            setTimeout(function ()
            {
                THEATRE.characterSelectLabel.classList.remove("glowing-text");
                THEATRE.characterSelect.classList.remove("glowing-text");
            }, 5000);
        }
    }

    public async OnSceneGridChange(_grid: Grid)
    {

    }

    public async OnSceneReadyChange(ready: boolean)
    {
        if (ready)
        {
        }
    }

    public async OnPlayerChange(player: Player)
    {
        if (player.selection?.length === 1)
        {
            const selectedItemId = player.selection[0];
            const localItem = this.localItems.find(x => x.id === selectedItemId && x.metadata[`${Constants.EXTENSIONID}/closeId`]);
            if (localItem)
            {
                await OBR.scene.local.deleteItems([localItem.attachedTo]);
            }
        }
    }

    public async OnPartyChange(_party: Player[])
    {
        THEATRE.UpdatePlayerSelect();
    }

    public async OnRoomMetadataChange(_metadata: Metadata)
    {
    }

    public async OnThemeChange(theme: Theme)
    {
        Utilities.SetThemeMode(theme, document);
    }

    public async CheckRegistration()
    {
        try
        {
            const debug = window.location.origin.includes("localhost") ? "eternaldream" : "";
            const userid = {
                owlbearid: BSCACHE.playerId
            };

            const requestOptions = {
                method: "POST",
                headers: new Headers({
                    "Content-Type": "application/json",
                    "Authorization": Constants.ANONAUTH,
                    "x-manuel": debug
                }),
                body: JSON.stringify(userid),
            };
            const response = await fetch(Constants.CHECKREGISTRATION, requestOptions);

            if (!response.ok)
            {
                const errorData = await response.json();
                // Handle error data
                console.error("Error:", errorData);
                return;
            }
            const data = await response.json();
            if (data.Data === "OK")
            {
                this.USER_REGISTERED = true;
                console.log("Connected");
            }
            else console.log("Not Registered");
        }
        catch (error)
        {
            // Handle errors
            console.error("Error:", error);
        }
    }
};

// Set the handlers needed for this Extension
export const BSCACHE = new BSCache([BSCache.PLAYER, BSCache.PARTY, BSCache.SCENEITEMS, BSCache.SCENEMETA, BSCache.LOCALITEMS, BSCache.SCENEGRID]);
