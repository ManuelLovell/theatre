import{O as o,S as b,G as V,C as l}from"./utilities-1mv2DUmb.js";function L(v){return v.type==="IMAGE"}let u,f,D="",h=[],R=[],A=[],c=[],T="",E={};await o.onReady(async()=>{await o.scene.isReady()&&await w(),o.scene.onReadyChange(async d=>{d?await w():document.querySelector("#app").innerHTML=""});async function w(){if(u=await o.player.getRole(),D=await o.player.getId(),f=(await o.theme.getTheme()).mode,b(f,document),U(),u!=="GM"){document.getElementById("app").innerHTML=`<b>LOG HISTORY</b><div class="full-container">
                    <ul id="dialogLog">
                    </ul>
                </div>`;return}document.querySelector("#app").innerHTML=`
        <div id="bannerText"></div>

        <div class="controlContainer">
            <label id="characterLabel" for="CharacterSelect">Character Token:</label>
            <select id="CharacterSelect"></select>
        </div>
        <div class="controlContainer">
            <label for="OverrideName">Override Name:</label>
            <input type="text" id="OverrideName" placeholder="Set a custom name here">
        </div>

        <div class="controlContainer">
            <label for="MessageType">Message Style:</label>
            <select id="MessageType">
            <option value="dialogue">Dialogue</option>
            <option value="notice">Notice</option>
            </select>
        </div>

        <label for="ViewMessage">View Message on Send</label>
        <input type="checkbox" id="ViewMessage" name="ViewMessage">
        </br>

        <textarea id="MessageTextarea" rows="4" cols="50" placeholder="Enter text here to send a message.
\rUsing :: will seperate the message into several pages players will need to click through. 
\r Dialogue type displays text in normal 'RPG Dialog Style' while Notice displays it in a taller window, good for shops or alerts."></textarea>
        
        <div class="controlContainer">
            <label id="playerLabel" for="PlayerSelect">Send To:</label>
            <select id="PlayerSelect"></select>
        </div>

        <button id="sendMessage">SUBMIT</button>`;const d=["Type 'test' to send test data","Welcome to the Theatre! v1.11","Added Player Select","Use :: to seperate pages of text"];let g=0;const m=document.getElementById("bannerText"),y=document.getElementById("ViewMessage"),S=document.getElementById("characterLabel"),p=document.getElementById("CharacterSelect"),I=document.getElementById("MessageTextarea"),C=document.getElementById("OverrideName"),B=document.getElementById("MessageType"),P=document.getElementById("PlayerSelect");y.checked=!0;function G(){m.style.opacity="0",setTimeout(()=>{x()},2e3)}function x(){g=(g+1)%d.length,m.textContent=d[g],m.style.opacity="1",setTimeout(()=>{G()},1e4)}m.textContent=d[g],x();const H=document.getElementById("sendMessage");H.onclick=async()=>await $(),c=await o.scene.items.getItems(e=>e.layer==="CHARACTER"&&L(e)),h=(await o.party.getPlayers()).map(e=>({id:e.id,name:e.name})),N(),O(),o.party.onChange(e=>{h=e.map(t=>({id:t.id,name:t.name})),O()}),o.scene.items.onChange(async e=>{c=e.filter(n=>L(n)&&n.layer=="CHARACTER"||n.layer=="MOUNT");const t=c.map(n=>n.id),a=c.map(n=>n.text.plainText?n.text.plainText:n.name);M(t,R)&&M(a,A)||(N(),R=t,A=a,S.classList.add("glowing-text"),p.classList.add("glowing-text"),setTimeout(function(){S.classList.remove("glowing-text"),p.classList.remove("glowing-text")},5e3))});async function $(){if(!I.value.trim())return console.log("NO MESSAGE");const e=c.find(r=>r.id===p.value);if(!e||!e.image?.url)return console.log("NO IMAGE");const t=e.text?.plainText?e.text.plainText:e.name,a=V();let n=I.value;switch(I.value){case"fresh":n=l.FRESHPRINCE;break;case"test":n=l.MULTIPAGE;break}const s={Id:p.value,Name:C.value?C.value:t,ImageUrl:e.image.url,Message:n,TargetId:P.value,Type:B.value,Code:a,Created:new Date().toLocaleTimeString()},i={[`${l.EXTENSIONID}/dialogueBox`]:s,[`${l.EXTENSIONID}/dialogueCode`]:a};await o.scene.setMetadata(i),await o.scene.setMetadata({[`${l.EXTENSIONID}/dialogueCode`]:void 0}),y.checked||await o.notification.show("Message sent","SUCCESS")}function k(e,t,a="DIALOG"){const n=`${t}_${a}}`,s=E[n];return s?s!==e?(E[n]=e,!1):!0:(E[n]=e,!1)}async function X(e){const t=document.querySelector("#dialogLog");if(e[`${l.EXTENSIONID}/dialogueBox`]!=null){const a=e[`${l.EXTENSIONID}/dialogueBox`];if(!k(a.Created,"DIALOG","DIALOG")){const n=document.createElement("li");n.innerHTML=`<div class="author">${a.Name}:</div>➤ ${a.Message.trim()}`,t.append(n)}}}function U(){o.theme.onChange(e=>{f=e.mode,b(e.mode,document)}),o.scene.onMetadataChange(async e=>{const t=e[`${l.EXTENSIONID}/dialogueCode`],a=e[`${l.EXTENSIONID}/dialogueBox`],n=a.Type=="dialogue";if(!(u==="GM"&&!y.checked)&&!(u!=="GM"&&a.TargetId!=="0000"&&a.TargetId!==D)&&t!==void 0){t!==T&&await o.popover.close(l.EXTENSIONID),T=e[`${l.EXTENSIONID}/dialogueCode`];const s=await o.viewport.getWidth(),i=await o.viewport.getHeight();n?await o.popover.open({id:l.EXTENSIONID,url:`/submenu/subindex.html?code=${T}`,height:200,width:s-100,hidePaper:!0,disableClickAway:!0,anchorPosition:{top:i-250,left:50},anchorReference:"POSITION",anchorOrigin:{vertical:"CENTER",horizontal:"LEFT"},transformOrigin:{vertical:"CENTER",horizontal:"LEFT"}}):await o.popover.open({id:l.EXTENSIONID,url:`/submenu/subindex.html?code=${T}`,height:i/2,width:s/2,hidePaper:!0,disableClickAway:!0,anchorPosition:{top:i/4,left:s/4},transformOrigin:{vertical:"TOP",horizontal:"LEFT"},anchorReference:"POSITION",anchorOrigin:{vertical:"TOP",horizontal:"LEFT"}}),u==="PLAYER"&&await X(e)}})}function N(){const e=document.getElementById("CharacterSelect");e.innerHTML="",c.forEach(t=>{const a=document.createElement("option");a.value=t.id,a.text=t.text?.plainText?t.text.plainText:t.name,e.add(a)})}function M(e,t){if(e.length!==t.length)return!1;for(let a=0;a<e.length;a++)if(e[a]!==t[a])return!1;return!0}function O(){const e=document.getElementById("PlayerSelect");let t=e.value;const a=document.createElement("option");a.setAttribute("value","0000");const n=document.createTextNode("Everyone");if(a.appendChild(n),e.innerHTML="",e.appendChild(a),h.forEach(i=>{let r=document.createElement("option");r.setAttribute("value",i.id);let F=document.createTextNode(i.name);r.appendChild(F),e.appendChild(r)}),!h.find(i=>i.id===t)&&t&&t!=="0000"){let i=document.createElement("option");i.setAttribute("value",t);let r=document.createTextNode("(Disconnected)");i.appendChild(r),e.appendChild(i),e.value=t,e.classList.add("glowing-text"),e.classList.add("glowing-text"),setTimeout(function(){e.classList.remove("glowing-text"),e.classList.remove("glowing-text")},5e3)}else t&&(e.value=t)}}});
