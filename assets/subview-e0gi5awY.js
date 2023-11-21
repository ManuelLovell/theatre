import{O as t,S as c,C as i}from"./utilities-UC5jPV8m.js";let o;await t.onReady(async()=>{o=(await t.theme.getTheme()).mode,c(o,document),t.theme.onChange(e=>{o=e.mode,c(o,document)});const a=(await t.scene.getMetadata())[`${i.EXTENSIONID}/dialogueBox`];document.querySelector("#sapp").innerHTML=`
    <div class="dialog-box">
    <div id="imageHolder"><img src="${a.ImageUrl}" onerror="this.src='/error.svg';" alt="Character Image" class="character-image"></div>
    <button id="dialog-close" class="close-icon clickable" type="button"></button>
        <div class="dialog-content">
            <div class="character-name">${a.Name}</div>
            <div class="dialog-text">
                <p id="messageBody" class="dialog-text-body"></p>
            </div>
        </div>
        <img id="dragon" class="dragon" src="/dragon.svg" hidden>
    </div>
    `;const r=document.getElementById("messageBody"),s=document.getElementById("dialog-close");s.textContent="X",s.onclick=async()=>{await t.popover.close(i.EXTENSIONID)};function n(e){if(e<a.Message.length)r.innerHTML+=a.Message.charAt(e),setTimeout(function(){n(e+1)},25);else{const d=document.getElementById("dragon");setInterval(function(){d.hidden=d.hidden!==!0},500)}}n(0)});
