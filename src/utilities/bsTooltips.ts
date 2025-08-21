import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

function SetupTooltips(idSelect: string, tooltipContent: string)
{
    const element = document.getElementById(`${idSelect}`);
    if (!element) return;
    tippy(element, {
        content: tooltipContent,
        theme: 'battlesystem',
    });
};

export function CreateTooltips()
{
    const tooltips = new Map<string, string>();

    // Tab Controls
    tooltips.set(`viewControls`, "Switch to the main controls panel");
    tooltips.set(`viewHistory`, "View message history and previous interactions");
    tooltips.set(`viewHelp`, "Access help documentation and usage instructions");
    
    // Main Controls
    tooltips.set(`CharacterSelect`, "Select which token to send messages from");
    tooltips.set(`OverrideName`, "Override the token's display name for this message");
    tooltips.set(`MessageType`, "Choose the style of message to display");
    tooltips.set(`ViewMessage`, "Automatically view the message window after sending");
    
    // Distance Controls
    tooltips.set(`whisperDistance`, "Set the range for whisper messages used with Speech Bubbles");
    tooltips.set(`talkDistance`, "Set the range for normal talk messages used with Speech Bubbles");
    tooltips.set(`yellDistance`, "Set the range for yell messages used with Speech Bubbles");
    
    // Player and Range Controls
    tooltips.set(`PlayerSelect`, "Choose which player to send the message to");
    tooltips.set(`closeAllPlayerWindows`, "Close all open theatre windows for players");
    
    tooltips.forEach((value, key) => { SetupTooltips(key, value); });
}