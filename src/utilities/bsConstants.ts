import { Command, PathCommand } from "@owlbear-rodeo/sdk";

export class Constants
{
    static EXTENSIONID = "com.battle-system.theatre";
    static EXTENSIONWHATSNEW = "com.battle-system.theatre-whatsnew";

    static BROADCASTCHANNEL = "com.battle-system.theatre-broadcast";
    static SELFCHANNEL = "com.battle-system.threatre-self";
    
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
        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
        ::
        Why are you doing this?
        Because I hate writing filler text.
        `;

    static LOGHTML = `<b>LOG HISTORY</b><div class="full-container">
        <ul id="dialogLog">
        </ul>
        </div>`;
    static FRESHPRINCE = `Now, this is a story all about how
        My life got flipped-turned upside down
        And I'd like to take a minute
        Just sit right there
        I'll tell you how I became the prince of a town called Bel-Air
        In West Philadelphia born and raised
        On the playground was where I spent most of my days
        Chillin' out, maxin', relaxin', all cool
        And all shootin' some b-ball outside of the school
        When a couple of guys who were up to no good
        Started making trouble in my neighborhood
        I got in one little fight and my mom got scared
        She said, "You're movin' with your auntie and uncle in Bel-Air"
        I begged and pleaded with her day after day
        But she packed my suitcase and sent me on my way
        She gave me a kiss and then she gave me my ticket
        I put my Walkman on and said, "I might as well kick it"
        First class, yo this is bad`;
}