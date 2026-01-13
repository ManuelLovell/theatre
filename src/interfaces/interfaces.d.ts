interface ITheatreMetadata
{
    Id: string;
    SenderId: string;
    Name: string;
    ImageUrl: string;
    Type: string;
    TargetId: string;
    Code: string;
}

interface IStorageItem
{
    id: string;
    tokenId: string;
    overrideName: string;
    text: string;
    title: string;
    tokenImage: string;
}

interface IDialog extends ITheatreMetadata
{
    Message: string;
}

interface IBubble extends ITheatreMetadata
{
    Message: string;
    Range: string;
}

interface IPlayer
{
    id: string;
    name: string;
}

interface IRumbleLog
{
    Author: string;
    SenderId: string;
    Message: string;
    Volume: string;
}

interface IDialgoue
{
    title: string;
    text: string;
    token: string | null;
}

interface IDialogueItem {
    id: string;
    title: string;
    text: string;
    overrideName?: string; // Add this new field
    tokenId?: string;
    tokenName?: string;
    tokenImage?: string;
    createdAt: Date;
    updatedAt: Date;
    theatre_id?: string;
}

interface IToken {
    id: string;
    name: string;
    image: string;
}
