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