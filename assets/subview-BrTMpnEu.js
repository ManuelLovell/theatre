import{O as c,S as u,C as v,a as h}from"./bsSceneCache-DtbpcUSB.js";class n{static StoryForm=()=>`
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
        `}await c.onReady(async()=>{const l=document.getElementById("sapp"),i=await c.theme.getTheme();u(i,document);const a=(await c.player.getMetadata())[`${v.EXTENSIONID}/dialogueBox`];if(a.Type==="dialogue"){const s=await c.viewport.getWidth();l.innerHTML=s<600?n.CompactForm(a):n.RegularForm(a)}else a.Type==="notice"?(l.innerHTML=n.CompactForm(a),document.querySelector("#sapp").style.flexDirection="column",document.querySelector(".bottom-container").style.flex="1"):a.Type==="story"&&(l.innerHTML=n.StoryForm());const o=document.getElementById("messageBody"),m=document.getElementById("dialog-close");m.src="/close.svg",m.onclick=async()=>{await c.popover.close(v.EXTENSIONID)};const r=a.Message.split("::").map(p),g=[];for(const s of r){const e=await h(s);g.push(e)}let t=0;function d(s){if(a.Type==="story"&&s!==99999&&g[t]===!0)o.innerHTML=`<img class="story-image" src="${r[t]}" onerror="this.onerror=null;this.src='/failload.png';" width="auto" height="auto">`,setTimeout(function(){d(99999)},1500);else if(s<r[t].length){const e=r[t][s];e===`
`?o.innerHTML+="<br>":e==="	"?o.innerHTML+="&emsp;&emsp;":e==="T"?o.innerHTML+="&emsp;&emsp;&emsp;&emsp;":o.innerHTML+=e,setTimeout(function(){d(s+1)},15)}else{const e=document.getElementById("dialog-forward");t+1===r.length?(e.hidden=!0,e.classList.remove("glow-image"),m.classList.add("glow-image")):(e.hidden=!1,e.classList.add("glow-image"),e.onclick=()=>{o.innerHTML="",t++,e.hidden=!0,e.classList.remove("glow-image"),d(0)})}}function p(s){return s.replace(/\\n/g,`
`).replace(/\\t/g,"	").replace(/\\T/g,"T").replace(/\\'/g,"'").replace(/\\"/g,'"').replace(/\\\\/g,"\\")}d(0)});
