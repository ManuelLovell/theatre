import{O as r,S as h,C as v,a as u}from"./bsSceneCache-Doh1n7bn.js";class l{static StoryForm=()=>`
        <div class="story-header">
            <img id="dialog-close"" class="close-icon" src="/close.svg">
            <img id="dialog-forward" class="forward-icon" src="/play.svg" hidden>
        </div>
        <div class="story-body">
            <div class="story-image-container" id="messageBody"></div>
        </div>
        `;static RegularForm=i=>`
        <div class="left-column">
            <img id="dialog-close"" class="close-icon" src="/close.svg">
            <img id="dialog-forward" class="forward-icon" src="/play.svg" hidden>
            <div id="imageHolder"><img src="${i.ImageUrl}" onerror="this.src='/error.svg';" alt="Character Image" class="character-image"></div>
        </div>
        <div class="right-column">
            <div class="upper-part">
                <div class="character-name">${i.Name}</div>
            </div>
            <div class="lower-part">
                <div id="messageBody"></div>
            </div>
        </div>
        `;static CompactForm=i=>`
        <div class="top-container">
            <img id="dialog-close"" class="close-icon" src="/close.svg">
            <img id="dialog-forward" class="mobile-forward-icon" src="/play.svg" hidden>
            <div class="left-top">
                <div id="imageHolder"><img src="${i.ImageUrl}" onerror="this.src='/error.svg';" alt="Character Image" class="character-image"></div>
            </div>
            <div class="right-top">
                <div class="character-name">${i.Name}</div>
            </div>
        </div>
        <div class="bottom-container">
            <div id="messageBody"></div>
        </div>
        `}await r.onReady(async()=>{const c=document.getElementById("sapp"),i=await r.theme.getTheme();h(i,document);const s=(await r.player.getMetadata())[`${v.EXTENSIONID}/dialogueBox`];if(s.Type==="dialogue"){const a=await r.viewport.getWidth();c.innerHTML=a<600?l.CompactForm(s):l.RegularForm(s)}else s.Type==="notice"?(c.innerHTML=l.CompactForm(s),document.querySelector("#sapp").style.flexDirection="column",document.querySelector(".bottom-container").style.flex="1"):s.Type==="story"&&(c.innerHTML=l.StoryForm());const n=document.getElementById("messageBody"),m=document.getElementById("dialog-close");m.src="/close.svg",m.onclick=async()=>{await r.popover.close(v.EXTENSIONID)};const t=s.Message.split("::"),g=[];for(const a of t){const e=await u(a);g.push(e)}let o=0;function d(a){if(s.Type==="story"&&a!==99999&&g[o]===!0)n.innerHTML=`<img class="story-image" src="${t[o]}" onerror="this.onerror=null;this.src='/failload.png';" width="auto" height="auto">`,setTimeout(function(){d(99999)},1500);else if(a<t[o].length)n.innerHTML+=t[o].charAt(a),setTimeout(function(){d(a+1)},15);else{const e=document.getElementById("dialog-forward");o+1===t.length?(e.hidden=!0,e.classList.remove("glow-image"),m.classList.add("glow-image")):(e.hidden=!1,e.classList.add("glow-image"),e.onclick=()=>{n.innerHTML="",o++,e.hidden=!0,e.classList.remove("glow-image"),d(0)})}}d(0)});
