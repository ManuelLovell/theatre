interface IDialog
{
    Id: string;
    Name: string;
    ImageUrl: string;
    Message: string;
    Type: string;
    TargetId: string;
    Code: string;
}

interface IBubble
{
    Id: string;
    Name: string;
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
    Message: string;
    Volume: string;
}