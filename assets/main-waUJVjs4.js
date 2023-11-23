import{O as o,S as M,G as P,C as s}from"./utilities-xCp6wZLy.js";function O(E){return E.type==="IMAGE"}let m,T,C=[],b=[],l=[],h="",f={};await o.onReady(async()=>{await o.scene.isReady()&&await y(),o.scene.onReadyChange(async r=>{r?await y():document.querySelector("#app").innerHTML=""});async function y(){if(m=await o.player.getRole(),T=(await o.theme.getTheme()).mode,M(T,document),$(),m!=="GM"){document.getElementById("app").innerHTML=`<b>LOG HISTORY</b><div class="full-container">
                    <ul id="dialogLog">
                    </ul>
                </div>`;return}document.querySelector("#app").innerHTML=`
        <div id="bannerText"></div>
        <label id="characterLabel" for="CharacterSelect">Character:</label>
        <select id="CharacterSelect"></select>
        
        <label for="OverrideName">Override Name:</label>
        <input type="text" id="OverrideName" placeholder="Set a custom name here">

        <label for="MessageType">Message Type:</label>
        <select id="MessageType">
          <option value="dialogue">Dialogue</option>
          <option value="notice">Notice</option>
        </select>

        <label for="ViewMessage">View Message on Send</label>
        <input type="checkbox" id="ViewMessage" name="ViewMessage">
        </br>

        <label for="MessageTextarea">Message:</label>
        <textarea id="MessageTextarea" rows="4" cols="50" placeholder="Enter text here to send a message.
\rUsing :: will seperate the message into several pages players will need to click through. 
\r Dialogue type displays text in normal 'RPG Dialog Style' while Notice displays it in a taller window, good for shops or alerts."></textarea>
        
        <button id="sendMessage">SUBMIT</button>`;const r=["Type 'test' to send test data","Welcome to the Theatre! v1.1","Use :: to seperate pages of text"];let d=0;const u=document.getElementById("bannerText"),p=document.getElementById("ViewMessage"),w=document.getElementById("characterLabel"),g=document.getElementById("CharacterSelect"),I=document.getElementById("MessageTextarea"),x=document.getElementById("OverrideName"),L=document.getElementById("MessageType");p.checked=!0;function D(){u.style.opacity="0",setTimeout(()=>{S()},2e3)}function S(){d=(d+1)%r.length,u.textContent=r[d],u.style.opacity="1",setTimeout(()=>{D()},1e4)}u.textContent=r[d],S();const R=document.getElementById("sendMessage");R.onclick=async()=>await B(),l=await o.scene.items.getItems(e=>e.layer==="CHARACTER"&&O(e)),N(),o.scene.items.onChange(async e=>{l=e.filter(a=>O(a));const n=l.map(a=>a.id),t=l.map(a=>a.text.plainText?a.text.plainText:a.name);v(n,C)&&v(t,b)||(N(),C=n,b=t,w.classList.add("glowing-text"),g.classList.add("glowing-text"),setTimeout(function(){w.classList.remove("glowing-text"),g.classList.remove("glowing-text")},5e3))});async function B(){if(!I.value.trim())return console.log("NO MESSAGE");const e=l.find(H=>H.id===g.value);if(!e||!e.image?.url)return console.log("NO IMAGE");const n=e.text?.plainText?e.text.plainText:e.name,t=P();let a=I.value;switch(I.value){case"fresh":a=s.FRESHPRINCE;break;case"test":a=s.MULTIPAGE;break}const i={Id:g.value,Name:x.value?x.value:n,ImageUrl:e.image.url,Message:a,Type:L.value,Code:t,Created:new Date().toLocaleTimeString()},c={[`${s.EXTENSIONID}/dialogueBox`]:i,[`${s.EXTENSIONID}/dialogueCode`]:t};await o.scene.setMetadata(c),await o.scene.setMetadata({[`${s.EXTENSIONID}/dialogueCode`]:void 0}),p.checked||await o.notification.show("Message sent","SUCCESS")}function A(e,n,t="DIALOG"){const a=`${n}_${t}}`,i=f[a];return i?i!==e?(f[a]=e,!1):!0:(f[a]=e,!1)}async function G(e){const n=document.querySelector("#dialogLog");if(e[`${s.EXTENSIONID}/dialogueBox`]!=null){const t=e[`${s.EXTENSIONID}/dialogueBox`];if(!A(t.Created,"DIALOG","DIALOG")){const a=document.createElement("li");a.innerHTML=`<div class="author">${t.Name}:</div>➤ ${t.Message.trim()}`,n.append(a)}}}function $(){o.theme.onChange(e=>{T=e.mode,M(e.mode,document)}),o.scene.onMetadataChange(async e=>{const n=e[`${s.EXTENSIONID}/dialogueCode`],a=e[`${s.EXTENSIONID}/dialogueBox`].Type=="dialogue";if(!(m==="GM"&&!p.checked)&&n!==void 0){n!==h&&await o.popover.close(s.EXTENSIONID),h=e[`${s.EXTENSIONID}/dialogueCode`];const i=await o.viewport.getWidth(),c=await o.viewport.getHeight();a?await o.popover.open({id:s.EXTENSIONID,url:`/submenu/subindex.html?code=${h}`,height:200,width:i-100,hidePaper:!0,disableClickAway:!0,anchorPosition:{top:c-250,left:50},anchorReference:"POSITION",anchorOrigin:{vertical:"CENTER",horizontal:"LEFT"},transformOrigin:{vertical:"CENTER",horizontal:"LEFT"}}):await o.popover.open({id:s.EXTENSIONID,url:`/submenu/subindex.html?code=${h}`,height:c/2,width:i/2,hidePaper:!0,disableClickAway:!0,anchorPosition:{top:c/4,left:i/4},transformOrigin:{vertical:"TOP",horizontal:"LEFT"},anchorReference:"POSITION",anchorOrigin:{vertical:"TOP",horizontal:"LEFT"}}),m==="PLAYER"&&await G(e)}})}function N(){const e=document.getElementById("CharacterSelect");e.innerHTML="",l.forEach(n=>{const t=document.createElement("option");t.value=n.id,t.text=n.text?.plainText?n.text.plainText:n.name,e.add(t)})}function v(e,n){if(e.length!==n.length)return!1;for(let t=0;t<e.length;t++)if(e[t]!==n[t])return!1;return!0}}});
