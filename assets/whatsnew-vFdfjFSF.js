import{O as o,C as i}from"./bsConstants-Cmf1ZMgY.js";const d=document.querySelector("#bs-whatsnew"),c=document.querySelector("#bs-whatsnew-notes");d.innerHTML=`
  <div id="newsContainer">
    <h1>Theatre! 4/4</h1>
    Alright, big Theatre update today.  I've had a lot of requests to allow players to also be able to use this, so I decided to go a step further with changes.
    </br> 1. The speech interface is now open to everyone. Mind you, this doesn't mean I added extra handling for everyone spamming at once. You'll just be talking over each other.
    </br> 2. The history log is now open to the GM also. Hooray for you.
    </br> 3. Chat Bubbles are in, along with volume-based range.  You can set your desired distance on the GM's controls (everyone else can see it, but it's disabled). These values are saved TO THE SCENE.  In case your maps have different grid setups.
    </br> - At default, Whisper can be seen/heard by people within two squares. It'll be lower-case with a blue border to hint that it's a whisper.
    </br> - Talk can be seen/heard within 6 squares. It's regular cased with a light-grey border.
    </br> - Yell can be seen/heard within 10 squares. It's upper-cased with a red border.
    </br>
    </br> If there are any hiccups, let me know. I'm letting this one fly early as Theatre could use some love, and I think people will enjoy it.
    </br>
    </div>
`;o.onReady(async()=>{const s=window.location.search,t=new URLSearchParams(s).get("subscriber")==="true";c.innerHTML=`
    <div id="footButtonContainer">
        <button id="discordButton" type="button" title="Join the Owlbear-Rodeo Discord"><embed class="svg discord" src="/w-discord.svg" /></button>
        <button id="patreonButton" type="button" ${t?'title="Thank you for subscribing!"':'title="Check out the Battle-System Patreon"'}>
        ${t?'<embed id="patreonLogo" class="svg thankyou" src="/thankyou.svg" />':'<embed id="patreonLogo" class="svg patreon" src="/w-patreon.png" />'}</button>
    </div>
    <button id="closeButton" type="button" title="Close this window"><embed class="svg close" src="/w-close.svg" /></button>
    `;const n=document.getElementById("closeButton");n.onclick=async()=>{await o.modal.close(i.EXTENSIONWHATSNEW)};const r=document.getElementById("discordButton");r.onclick=async e=>{e.preventDefault(),window.open("https://discord.gg/ANZKDmWzr6","_blank")};const a=document.getElementById("patreonButton");a.onclick=async e=>{e.preventDefault(),window.open("https://www.patreon.com/battlesystem","_blank")}});
