import OBR, { Image, Metadata, buildText, Command, buildPath, PathCommand, BoundingBox, Item } from "@owlbear-rodeo/sdk";
import { GetGUID } from './bsUtilities';
import { Constants } from "./bsConstants";

export class LabelLogic
{
    static async UpdateLabel(image: Image, fontSize: string, opacity: string, message: string, volume: string): Promise<void>
    {
        let volumeColor;
        switch (volume)
        {
            case "whisper":
                volumeColor = "blue";
                message = message.toLowerCase();
                break;
            case "talk":
                volumeColor = "lightgrey";
                break;
            case "yell":
                volumeColor = "red";
                message = message.toUpperCase();
                break;
            default:
                break;
        }
        const previousAttachs = await OBR.scene.local.getItemAttachments([image.id]);
        for (const attach of previousAttachs)
        {
            if (attach.metadata[`${Constants.EXTENSIONID}/id`])
            {
                await OBR.scene.local.deleteItems([attach.id]);
            }
        }

        const BGCOLOR = "#242424";
        const FONTSIZE = parseInt(fontSize);

        const labelOpacity = (+opacity / 100);
        // Calculate offset based on DPI for images resizd in the manager
        const labelWidth = 400;

        const label = buildText()
            .fillColor("white")
            .plainText(message)
            .fillOpacity(1)
            .strokeWidth(1.75)
            .strokeColor("black")
            .strokeOpacity(1)
            .build();

        const bubbleId = GetGUID();
        const metadata: Metadata = {};
        metadata[`${Constants.EXTENSIONID}/id`] = bubbleId;

        label.position = { x: image.position.x, y: image.position.y };
        label.attachedTo = image.id; // Set Token Attached To
        label.visible = image.visible ? true : false; // Set Visibility
        label.locked = true; // Set Lock, Don't want people to touch
        label.disableAttachmentBehavior = ["ROTATION", "SCALE"];
        label.type = "TEXT"; // Set Item Type
        label.metadata = metadata;
        label.zIndex = 1;
        label.text.type = "PLAIN";
        label.text.width = labelWidth;
        label.text.style.fontWeight = 600;
        label.text.style.fontSize = FONTSIZE;
        label.text.style.textAlign = "CENTER";
        label.text.style.fontFamily = "Roboto";

        // Need offset for consecutive tags per token side
        await OBR.scene.local.addItems([label]);

        // Add nameplate
        const freshLabel = await OBR.scene.local.getItems(x => x.metadata[`${Constants.EXTENSIONID}/id`] === bubbleId);
        const labelBounds = await OBR.scene.local.getItemBounds(freshLabel.map(x => x.id));
        const newHeightAdjustment = labelBounds.height + 100;
        await OBR.scene.local.updateItems(x => x.id === freshLabel[0].id, (items) =>
        {
            for (const item of items)
            {
                //item.position.x -= labelBounds.width;
                item.position.y -= newHeightAdjustment;
            }
        });

        const newBounds = {
            min: { x: labelBounds.min.x, y: labelBounds.min.y - newHeightAdjustment },
            max: { x: labelBounds.max.x, y: labelBounds.max.y - newHeightAdjustment },
            center: { x: labelBounds.center.x, y: labelBounds.center.y - (labelBounds.height + 50) },
            width: labelBounds.width,
            height: labelBounds.height
        } as BoundingBox;

        const localItems: Item[] = [];
        const plateCommands = GetPlate(newBounds);

        const namePlate = buildPath()
            .commands(plateCommands)
            .strokeOpacity(1)
            .strokeColor(volumeColor)
            .fillOpacity(labelOpacity)
            .fillColor(BGCOLOR)
            .zIndex(2)
            .build();
        namePlate.attachedTo = freshLabel[0].id; // Attach to label for cleanup/movement
        namePlate.disableHit = true;
        namePlate.disableAttachmentBehavior = ["ROTATION", "SCALE"];

        const closeButton = buildPath()
            .locked(false)
            .commands(Constants.CLOSEBUTTON)
            .scale({ x: .4, y: .4 })
            .locked(true)
            .name("Close Button")
            .metadata({ [`${Constants.EXTENSIONID}/closeId`]: freshLabel[0].id })
            .position({ x: newBounds.min.x - 15, y: newBounds.min.y - 15 })
            .strokeColor("white")
            .fillColor("#AA82E6")
            .zIndex(3)
            .build();
        closeButton.attachedTo = freshLabel[0].id;

        localItems.push(namePlate);
        localItems.push(closeButton);

        await OBR.scene.local.addItems(localItems);

        setTimeout(async () =>
        {
            await OBR.scene.local.deleteItems(freshLabel.map(x => x.id));
        }, 60000);

        /// Functions
        function GetPlate(boundingBox: BoundingBox)
        {
            const minX = boundingBox.min.x - 20;
            const maxX = boundingBox.max.x + 20;
            const minY = boundingBox.min.y - 20;
            const maxY = boundingBox.max.y + 20;

            const pWidth = Math.abs(maxX - minX);
            const triangleWidth = pWidth / 4;

            const radius = 20; // Radius of rounded corners
            const nameplateCommands: PathCommand[] = [
                [Command.MOVE, minX + radius, minY], // Move to the starting point on the left-top rounded corner
                [Command.QUAD, minX, minY, minX, minY + radius], // Draw the left-top rounded corner
                [Command.LINE, minX, maxY - radius], // Draw vertical line down to start of left-bottom rounded corner
                [Command.QUAD, minX, maxY, minX + radius, maxY], // Draw the left-bottom rounded corner

                [Command.LINE, minX + (pWidth / 2 - triangleWidth), maxY], // Right vertex
                [Command.LINE, image.position.x, image.position.y],
                [Command.LINE, maxX - (pWidth / 2), maxY], // Draw horizontal line to start of right-bottom rounded corner

                [Command.LINE, maxX - radius, maxY], // Draw horizontal line to start of right-bottom rounded corner
                [Command.QUAD, maxX, maxY, maxX, maxY - radius], // Draw the right-bottom rounded corner
                [Command.LINE, maxX, minY + radius], // Draw vertical line up to start of right-top rounded corner
                [Command.QUAD, maxX, minY, maxX - radius, minY], // Draw the right-top rounded corner
                [Command.LINE, minX + radius, minY], // Draw horizontal line to close the path

                [Command.CLOSE] // Close the path
            ];
            return nameplateCommands;
        }
    }
}