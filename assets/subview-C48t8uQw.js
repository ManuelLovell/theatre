import{O as s,C as n}from"./bsConstants-DqcM23cc.js";import{S as h}from"./bsSceneCache-CGFGXyI6.js";await s.onReady(async()=>{const m=await s.theme.getTheme();h(m,document);const e=(await s.player.getMetadata())[`${n.EXTENSIONID}/dialogueBox`];let r=await s.viewport.getWidth()<600;e.Type==="notice"&&(r=!0);const g=`
    <div class="left-column">
        <img id="dialog-close"" class="close-icon" src="/close.svg">
        <img id="dialog-forward" class="forward-icon" src="/play.svg" hidden>
        <div id="imageHolder"><img src="${e.ImageUrl}" onerror="this.src='/error.svg';" alt="Character Image" class="character-image"></div>
    </div>
    <div class="right-column">
        <div class="upper-part">
            <div class="character-name">${e.Name}</div>
        </div>
        <div class="lower-part">
            <div id="messageBody"></div>
        </div>
    </div>
    `,v=`
    <div class="top-container">
        <img id="dialog-close"" class="close-icon" src="/close.svg">
        <img id="dialog-forward" class="mobile-forward-icon" src="/play.svg" hidden>
        <div class="left-top">
            <div id="imageHolder"><img src="${e.ImageUrl}" onerror="this.src='/error.svg';" alt="Character Image" class="character-image"></div>
        </div>
        <div class="right-top">
            <div class="character-name">${e.Name}</div>
        </div>
    </div>
    <div class="bottom-container">
        <div id="messageBody"></div>
    </div>
    `;document.querySelector("#sapp").innerHTML=r?v:g,e.Type==="notice"&&(document.querySelector("#sapp").style.flexDirection="column",document.querySelector(".bottom-container").style.flex="1");const l=document.getElementById("messageBody"),o=document.getElementById("dialog-close");o.src="/close.svg",o.onclick=async()=>{await s.popover.close(n.EXTENSIONID)};const t=e.Message.split("::");let i=0;function c(d){if(d<t[i].length)l.innerHTML+=t[i].charAt(d),setTimeout(function(){c(d+1)},15);else{const a=document.getElementById("dialog-forward");i+1===t.length?(a.hidden=!0,a.classList.remove("glow-image"),o.classList.add("glow-image")):(a.hidden=!1,a.classList.add("glow-image"),a.onclick=()=>{l.innerHTML="",i++,a.hidden=!0,a.classList.remove("glow-image"),c(0)})}}c(0)});
