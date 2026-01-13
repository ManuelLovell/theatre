import OBR from "@owlbear-rodeo/sdk";
import { Constants } from "./bsConstants";

export enum RequestType {
    CREATE = "CREATE",
    READ = "READ",
    DELETE = "DELETE",
    UPDATE = "UPDATE"
}

export async function RequestData(requestUrl: string, requestPackage: any): Promise<BSData> {
    try {
        const debug = window.location.origin.includes("localhost") ? "eternaldream" : "";

        const requestOptions = {
            method: "POST",
            headers: new Headers({
                "Content-Type": "application/json",
                "Authorization": Constants.ANONAUTH,
                "x-manuel": debug
            }),
            body: JSON.stringify(requestPackage),
        };
        const response = await fetch(requestUrl, requestOptions);

        const data = await response.json();
        if (!response.ok) {
            // Handle error data
            await OBR.notification.show("There was an error retrieving your data, please refresh the page. If this issue persists, wait a few minutes as the server could be experiencing difficulties.");
            console.error("Error:", data);
        }
        else {
            return data;
        }
    }
    catch (error) {
        // Handle errors
        await OBR.notification.show("There was an error retrieving your data, please refresh the page. If this issue persists, wait a few minutes as the server could be experiencing difficulties.");
        console.error("Error:", error);
        return null;
    }
}

export async function RetrieveData() {
    const identity = {
        owlbearid: OBR.player.id,
        requesttype: RequestType.READ
    };
    const savedata = await RequestData(Constants.REMOTESTORAGEURL, identity);
    if (savedata.Error !== true && savedata.Data !== "" && savedata.Data !== null && savedata.Data !== undefined) {
        const rData = JSON.parse(savedata.Data!);
        return rData;
    }
    else {
        return [];
    }
}

export async function MigrateData(data: string) {
    const identity = {
        owlbearid: OBR.player.id,
        requesttype: RequestType.CREATE,
        data: data
    };
    const savedata = await RequestData(Constants.REMOTESTORAGEURL, identity);
    if (savedata.Error !== true && savedata.Data !== "" && savedata.Data !== null && savedata.Data !== undefined) {
        return true;
    }
}

export async function SaveData(dialogue: IDialogueItem) {
    const identity = {
        owlbearid: OBR.player.id,
        requesttype: RequestType.UPDATE,
        data: JSON.stringify(dialogue)
    };
    const savedata = await RequestData(Constants.REMOTESTORAGEURL, identity);
    if (savedata.Error !== true && savedata.Data !== "" && savedata.Data !== null && savedata.Data !== undefined) {
        return true;
    }
}

export async function DeleteData(dialogueId: string) {
    const identity = {
        owlbearid: OBR.player.id,
        requesttype: RequestType.DELETE,
        data: dialogueId
    };
    const savedata = await RequestData(Constants.REMOTESTORAGEURL, identity);
    if (savedata.Data !== "" && savedata.Data !== null && savedata.Data !== undefined) {
        return true;
    }
}