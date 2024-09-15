export class TheatreForms
{
    static StoryForm = () =>
        `
        <div class="story-header">
            <img id="dialog-close"" class="close-icon" src="/close.svg">
            <img id="dialog-forward" class="forward-icon" src="/play.svg" hidden>
        </div>
        <div class="story-body">
            <div class="story-image-container" id="messageBody"></div>
        </div>
        `;

    static RegularForm = (dialog: IDialog) =>
        `
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

    static CompactForm = (dialog: IDialog) =>
        `
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
}