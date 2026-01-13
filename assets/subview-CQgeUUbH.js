import{O as o,S as y,C as n,a as h}from"./bsSceneCache-DRtNPiK9.js";class m{static StoryForm=()=>`
        <div class="story-header">
            <img id="dialog-close" class="close-icon" src="/close.svg">
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
            <img id="dialog-close" class="close-icon" src="/close.svg">
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
        `}await o.onReady(async()=>{const l=document.getElementById("sapp"),i=await o.theme.getTheme();y(i,document),v();const a=(await o.player.getMetadata())[`${n.EXTENSIONID}/dialogueBox`];if(a.Type==="dialogue"){const s=await o.viewport.getWidth();l.innerHTML=s<600?m.CompactForm(a):m.RegularForm(a)}else a.Type==="notice"?(l.innerHTML=m.CompactForm(a),document.querySelector("#sapp").style.flexDirection="column",document.querySelector(".bottom-container").style.flex="1"):a.Type==="story"&&(l.innerHTML=m.StoryForm());const t=document.getElementById("messageBody"),g=document.getElementById("dialog-close");g.src="/close.svg",g.onclick=async()=>{await o.popover.close(n.EXTENSIONID)};const c=a.Message.split("::").map(u),p=[];for(const s of c){const e=await h(s);p.push(e)}let r=0;function v(){o.broadcast.onMessage(n.CLOSECHANNEL,async()=>{await o.popover.close(n.EXTENSIONID)})}async function d(s){if(a.Type==="story"&&s!==99999&&p[r]===!0)t.innerHTML=`<img class="story-image" src="${c[r]}" onerror="this.onerror=null;this.src='/failload.png';" width="auto" height="auto">`,setTimeout(async function(){await d(99999)},1500);else if(s<c[r].length){const e=c[r][s];e==="§"?t.innerHTML+="<br>":e==="†"?t.innerHTML+="&emsp;&emsp;":e==="‡"?t.innerHTML+="&emsp;&emsp;&emsp;&emsp;":t.innerHTML+=e,setTimeout(async function(){await d(s+1)},15)}else{const e=document.getElementById("dialog-forward");r+1===c.length?(e.hidden=!0,e.classList.remove("glow-image"),g.classList.add("glow-image")):(e.hidden=!1,e.classList.add("glow-image"),e.onclick=async()=>{t.innerHTML="",r++,e.hidden=!0,e.classList.remove("glow-image"),await d(0)})}}function u(s){return s.replace(/\\n/g,"§").replace(/\\t/g,"†").replace(/\\T/g,"‡").replace(/\\'/g,"'").replace(/\\"/g,'"').replace(/\\\\/g,"\\")}await d(0)});
