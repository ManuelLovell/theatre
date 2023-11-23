import{O as n,S as M,G as $,C as i}from"./utilities-xCp6wZLy.js";function N(E){return E.type==="IMAGE"}let g,I,v=[],c=[],m="",T={};await n.onReady(async()=>{await n.scene.isReady()&&await y(),n.scene.onReadyChange(async l=>{l?await y():document.querySelector("#app").innerHTML=""});async function y(){if(g=await n.player.getRole(),I=(await n.theme.getTheme()).mode,M(I,document),L(),g!=="GM"){document.getElementById("app").innerHTML=`<b>LOG HISTORY</b><div class="full-container">
                    <ul id="dialogLog">
                    </ul>
                </div>`;return}document.querySelector("#app").innerHTML=`
        <div id="bannerText"></div>
        <label for="CharacterSelect">Character:</label>
        <select id="CharacterSelect"></select>
        
        <label for="OverrideName">Override Name:</label>
        <input type="text" id="OverrideName" placeholder="Enter text to use a custom name">

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
        
        <button id="sendMessage">SUBMIT</button>`;const l=["Type 'test' to send test data","Welcome to the Theatre! v1.1","Use :: to seperate pages of text"];let d=0;const u=document.getElementById("bannerText"),h=document.getElementById("ViewMessage");h.checked=!0;function O(){u.style.opacity="0",setTimeout(()=>{f()},2e3)}function f(){d=(d+1)%l.length,u.textContent=l[d],u.style.opacity="1",setTimeout(()=>{O()},1e4)}u.textContent=l[d],f();const C=document.getElementById("sendMessage");C.onclick=async()=>await x(),c=await n.scene.items.getItems(e=>e.layer==="CHARACTER"&&N(e)),w(),n.scene.items.onChange(async e=>{c=e.filter(t=>N(t));const a=c.map(t=>t.id);a.every(t=>v.includes(t))||(w(),v=a)});async function x(){const e=document.getElementById("CharacterSelect"),a=document.getElementById("MessageTextarea"),t=document.getElementById("OverrideName"),s=document.getElementById("MessageType");if(!a.value.trim())return console.log("NO MESSAGE");const o=c.find(G=>G.id===e.value);if(!o||!o.image?.url)return console.log("NO IMAGE");const r=o.text?.plainText?o.text.plainText:o.name,S=$();let p=a.value;switch(a.value){case"fresh":p=i.FRESHPRINCE;break;case"test":p=i.MULTIPAGE;break}const R={Id:e.value,Name:t.value?t.value:r,ImageUrl:o.image.url,Message:p,Type:s.value,Code:S,Created:new Date().toLocaleTimeString()},B={[`${i.EXTENSIONID}/dialogueBox`]:R,[`${i.EXTENSIONID}/dialogueCode`]:S};await n.scene.setMetadata(B),await n.scene.setMetadata({[`${i.EXTENSIONID}/dialogueCode`]:void 0}),h.checked||await n.notification.show("Message sent","SUCCESS")}function b(e,a,t="DIALOG"){const s=`${a}_${t}}`,o=T[s];return o?o!==e?(T[s]=e,!1):!0:(T[s]=e,!1)}async function D(e){const a=document.querySelector("#dialogLog");if(e[`${i.EXTENSIONID}/dialogueBox`]!=null){const t=e[`${i.EXTENSIONID}/dialogueBox`];if(!b(t.Created,"DIALOG","DIALOG")){const s=document.createElement("li");s.innerHTML=`<div class="author">${t.Name}:</div>➤ ${t.Message.trim()}`,a.append(s)}}}function L(){n.theme.onChange(e=>{I=e.mode,M(e.mode,document)}),n.scene.onMetadataChange(async e=>{const a=e[`${i.EXTENSIONID}/dialogueCode`],s=e[`${i.EXTENSIONID}/dialogueBox`].Type=="dialogue";if(!(g==="GM"&&!h.checked)&&a!==void 0){a!==m&&await n.popover.close(i.EXTENSIONID),m=e[`${i.EXTENSIONID}/dialogueCode`];const o=await n.viewport.getWidth(),r=await n.viewport.getHeight();s?await n.popover.open({id:i.EXTENSIONID,url:`/submenu/subindex.html?code=${m}`,height:200,width:o-100,hidePaper:!0,disableClickAway:!0,anchorPosition:{top:r-250,left:50},anchorReference:"POSITION",anchorOrigin:{vertical:"CENTER",horizontal:"LEFT"},transformOrigin:{vertical:"CENTER",horizontal:"LEFT"}}):await n.popover.open({id:i.EXTENSIONID,url:`/submenu/subindex.html?code=${m}`,height:r/2,width:o/2,hidePaper:!0,disableClickAway:!0,anchorPosition:{top:r/4,left:o/4},transformOrigin:{vertical:"TOP",horizontal:"LEFT"},anchorReference:"POSITION",anchorOrigin:{vertical:"TOP",horizontal:"LEFT"}}),g==="PLAYER"&&await D(e)}})}function w(){const e=document.getElementById("CharacterSelect");e.innerHTML="",c.forEach(a=>{const t=document.createElement("option");t.value=a.id,t.text=a.text?.plainText?a.text.plainText:a.name,e.add(t)})}}});
