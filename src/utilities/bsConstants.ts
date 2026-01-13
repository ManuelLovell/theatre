import { Command, PathCommand } from "@owlbear-rodeo/sdk";

export class Constants
{
    static EXTENSIONID = "com.battle-system.theatre";
    static STORAGEID = "com.battle-system.theatre-storage";
    static SELECTEDTOKENOPTION = "SELECTED-0000";
    static BROADCASTCHANNEL = "com.battle-system.theatre-broadcast";
    static STORAGECHANNEL = "com.battle-system.theatre-storage-broadcast";
    static CLOSECHANNEL = "com.battle-system.theatre-close";
    static SELFCHANNEL = "com.battle-system.theatre-self";
    static RUMBLECHANNEL = "THEATRERUMBLE";
    static CACHECHANNEL = "com.battle-system.theatre-cache";
    static STORAGEKEY = 'theatre-dialogues';
    static CHECKREGISTRATION = 'https://vrwtdtmnbyhaehtitrlb.supabase.co/functions/v1/patreon-check';
    static REMOTESTORAGEURL = 'https://vrwtdtmnbyhaehtitrlb.supabase.co/functions/v1/theatre-storage';

    static ANONAUTH = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
    static CLOSEBUTTON: PathCommand[] = [
        [Command.MOVE, 0, -50], // Move to the top point of the circle
        [Command.QUAD, 50, -50, 50, 0], // Draw curve to top-right
        [Command.QUAD, 50, 50, 0, 50], // Draw curve to bottom-right
        [Command.QUAD, -50, 50, -50, 0], // Draw curve to bottom-left
        [Command.QUAD, -50, -50, 0, -50], // Draw curve to top-left
        [Command.MOVE, -35, -35], // Move to top-left of X
        [Command.LINE, 35, 35], // Draw line to bottom-right of X
        [Command.MOVE, -35, 35], // Move to bottom-left of X
        [Command.LINE, 35, -35], // Draw line to top-right of X
        [Command.CLOSE] // Close the path
    ];
    static MULTIPAGE = `What is Lorem Ipsum?
Lorem Ipsum is simply dummy text of the printing and typesetting industry.\n Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,\n when an unknown printer took a galley of type and scrambled it to make a type specimen book.\n It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
::
Why are you doing this?\t Who knows.\n
Because I hate writing filler text.
`;

    static LOGHTML = `<b>LOG HISTORY</b><div class="full-container">
        <ul id="dialogLog">
        </ul>
        </div>`;
    static FRESHPRINCE = `Now, this is a story all about how\n
        My life got flipped-turned upside down\n
        And I'd like to take a minute\n
        Just sit right there\n
        I'll tell you how I became the prince of a town called Bel-Air\n
        In West Philadelphia born and raised\n
        On the playground was where I spent most of my days\n
        Chillin' out, maxin', relaxin', all cool\n
        And all shootin' some b-ball outside of the school\n
        When a couple of guys who were up to no good\n
        Started making trouble in my neighborhood\n
        I got in one little fight and my mom got scared\n
        She said, "You're movin' with your auntie and uncle in Bel-Air"\n
        I begged and pleaded with her day after day\n
        But she packed my suitcase and sent me on my way\n
        She gave me a kiss and then she gave me my ticket\n
        I put my Walkman on and said, "I might as well kick it"\n
        First class, yo this is bad`;

    static MARKDOWNHELP = `
<a id="theatre" name="theatre"></a>
<!-- TABLE OF CONTENTS -->
<details open>
<summary>Table of Contents</summary>
<ol>
<li><a href="#getting-started">Getting Started</a>
<li><a href="#theatre-ui">Theatre UI</a>
<ul>
<li><a href="#ui-token">Token Selector</a></li>
<li><a href="#ui-override">Override Input</a></li>
<li><a href="#ui-style">Style Selector</a></li>
<li><a href="#ui-speech">Speech Range Inputs (Whisper/Talk/Yell)</a></li>
<li><a href="#ui-message">Message Box</a></li>
<li><a href="#ui-range">Target/Range Selector</a></li>
</ul></li>
<li><a href="#dialogue-styles">Dialogue Styles</a>
<ul>
<li><a href="#style-dialogue">Dialogue</a></li>
<li><a href="#style-bubble">Speech Bubble</a></li>
<li><a href="#style-notification">Notification</a></li>
</ul>
<li><a href="#support">Support</a></li>
</ol>
</details>

<p align="right">(<a href="#theatre">back to top</a>)</p>


## <a id="getting-started" name="getting-started"></a>Getting Started
Theatre! operates on two wave-lengths.
1. Message-Box style dialogue delivery, which comes across in a 'type-writer' style of one character at a time.  You can queue up several 'pages' at once and it will be sent to all players, displayed with the image of the token that is currently selected.
2. Speech Bubble style dialogue delivery, which let's you choose a token and select 'How Loud' they are saying their message.  It will then be drawn on the map via a text bubble, and only players who have a token in range will be able to hear (see) it.
<p align="right">(<a href="#theatre">back to top</a>)</p>

## <a id="theatre-ui" name="theatre-ui">Theatre UI
<i>Note: All players have access to the Theatre UI, but only the GM can change the speech bubble ranges.</i>
![notice view](https://battle-system.com/owlbear/theatre-docs/theatre-ui.png)

#### <a id="ui-token"></a>1. Token Selector
The Token Selector compiles a list of all tokens the user has access to, using the label name - or the default token name if no label name is available.
When used with Dialogue-Style/Notification-Style, this controls which image/name is used for the dialogue window.
When used with Bubble-Style, this controls where the speech bubble will appear from and where the range is based on.
<i>Note: The input will pulse red briefly if there is a change on the map that would've resulted in a change in the list, to let you know the selection may have changed.</i>

#### <a id="ui-override"></a>2. Override Input
The Override input is to 'override' the token name that is displayed with the displayed text.
Useful if you want to obscure something's 'true name' but still use the image.

#### <a id="ui-style"></a>3. Style Selector
There are three different chat styles to choose from.  Dialogue, Speech Bubble and Notification.  While Dialogue and Notification differ mostly in orientation (dialogue is a long narrow window, while notification is more of a poster) - speech bubble is completely different.
1. Dialogue Style
![notice view](https://battle-system.com/owlbear/theatre-docs/theatre-style1.png)

2. Notification Style 
![notice view](https://battle-system.com/owlbear/theatre-docs/theatre-style3.png)
3. Speech Bubble Style
![notice view](https://battle-system.com/owlbear/theatre-docs/theatre-style2.png)
<i>Note: Only players who own a token in the range of the token speaking via Speech Bubble will be able to see it. Please make sure your players are properly owning tokens!</i>

#### <a id="ui-speech"></a>4. Speech Range Inputs
These inputs only have an effect when using Speech Bubbles, as they discern the 'hearable' range for the text.  This number represents how many units away a token can be to hear/see the message.

#### <a id="ui-message"></a>5. Message Box
This is where you will type the message that appears in the dialogue window or speech bubble. 
When using the Dialogue/Notification window, you can use '::' to separate the pages for that message. For example;
"Hello, friend!::How are you?"
<i>Note: Paging is not available with Speech Bubbles.</i>
![notice view](https://battle-system.com/owlbear/theatre-docs/theatre-pages.webp)

#### <a id="ui-range"></a>6. Target/Range Selector
When on the Dialogue or Notification styles, you can select a 'target' for your message.  It can be sent to the entire party, or just a single person.
When using Speech Bubble style, you can choose which 'volume/range' you want your message to reach. If you have whisper set to 1 square, people 2 squares away or more won't be able to see it!

<p align="right">(<a href="#theatre">back to top</a>)</p>

## <a id="dialogue-styles" name="dialogue-styles">Dialogue Styles

#### <a id="style-dialogue"></a>1. Dialogue
The Dialogue style is your typical JRPG text-box that display in type-writer fashion.  If there are pages of text, a 'Next' arrow will flash next to where the close button is.
![notice view](https://battle-system.com/owlbear/theatre-docs/theatre-style1.png)
#### <a id="style-bubble"></a>2. Speech Bubble
Speech Bubbles are more of a chat-system than a post-it message, and is likely better suited to the style of game that wants to have more RP-based chats.  If you have 'View on Send' checked, you will also see the resulting speech bubble pop up on the token it was sent from.
There are some things to note in how it's used;
1. The outline and casing of the message is based on the volume.  Whispers are lower-cased and Blue. Talking is as-is and White.  Yelling is upper-cased and Red.
![notice view](https://battle-system.com/owlbear/theatre-docs/ui-speech1.png)
![notice view](https://battle-system.com/owlbear/theatre-docs/ui-speech2.png)
![notice view](https://battle-system.com/owlbear/theatre-docs/ui-speech3.png)
2. Who can see the message is based on WHERE the token is, what RANGE the token said the message at and WHO owns which tokens. As with the example below, Greensley cannot hear the whisper until he is 1 square away. (I have Whisper range set to 1 in this example.) ![notice view](https://battle-system.com/owlbear/theatre-docs/theatre-whisper.webp)
And the following example shows a Yell, where the range is set to 20 squares.  So Greensley is able to see this despite not being close at all.
![notice view](https://battle-system.com/owlbear/theatre-docs/theatre-yell.webp)
3. For the person who sent the message, if you have 'View on Send' turned on - the speech bubble will stay attached to that character if you move the token.  THIS DOES NOT HAPPEN ON THE OTHER USERS END. To make it clear where something was said, the bubble stays where it was made.  You wouldn't want to whisper something, and then walk up to someone, and have that whisper travel with you right? No. (The correct answer is no.) The whisper stays where the whisper was made.
![notice view](https://battle-system.com/owlbear/theatre-docs/theatre-fart.webp)
<i>Note: I am aware that farts travel.</i>
4. Speech bubbles stay open until they are either closed (via the X button), the page is refreshed or until a new message is sent.  A new message will replace an old message. They are not queued up, it's similar to them talking too fast.


#### <a id="style-notification"></a>3. Notification
The notification style mimics the dialogue one, but in a 'poster' fashion. It's more suited to pre-prepped copy/pasted text as the formatting can be fickle at times. (Improvements to this will be made at a later date.)
![notice view](https://battle-system.com/owlbear/theatre-docs/theatre-notification.png)

<p align="right">(<a href="#theatre">back to top</a>)</p>

## Support

If you have questions, please join the [Owlbear Rodeo Discord](https://discord.gg/UY8AXjhzhe).

Or you can reach out to me at manuel@battle-system.com.
You can also support these projects at the [Battle-System Patreon](https://www.patreon.com/battlesystem).
<p align="right">(<a href="#flip">back to top</a>)</p>
`;
}