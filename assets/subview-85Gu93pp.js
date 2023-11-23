import{O as s,S as m,C as g}from"./utilities-xCp6wZLy.js";let t;await s.onReady(async()=>{t=(await s.theme.getTheme()).mode,m(t,document),s.theme.onChange(i=>{t=i.mode,m(t,document)});const e=(await s.scene.getMetadata())[`${g.EXTENSIONID}/dialogueBox`];let l=await s.viewport.getWidth()<600;e.Type==="notice"&&(l=!0);const v=`
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
    `,h=`
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
    `;document.querySelector("#sapp").innerHTML=l?h:v,e.Type==="notice"&&(document.querySelector("#sapp").style.flexDirection="column",document.querySelector(".bottom-container").style.flex="1");const n=document.getElementById("messageBody"),c=document.getElementById("dialog-close");c.src="/close.svg",c.onclick=async()=>{await s.popover.close(g.EXTENSIONID)};const d=e.Message.split("::");let o=0;function r(i){if(i<d[o].length)n.innerHTML+=d[o].charAt(i),setTimeout(function(){r(i+1)},15);else{const a=document.getElementById("dialog-forward");o+1===d.length?(a.hidden=!0,a.classList.remove("glow-image"),c.classList.add("glow-image")):(a.hidden=!1,a.classList.add("glow-image"),a.onclick=()=>{n.innerHTML="",o++,a.hidden=!0,a.classList.remove("glow-image"),r(0)})}}r(0)});
