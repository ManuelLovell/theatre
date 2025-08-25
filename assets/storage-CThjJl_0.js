import{O as l,S as r,C as d}from"./bsSceneCache-CpvUFMs4.js";class c{dialogues=[];tokens=[];selectedDialogue=null;isMobileView=!1;constructor(){this.loadDialogues(),this.checkMobileView(),this.render(),window.addEventListener("resize",()=>{this.checkMobileView()})}checkMobileView(){this.isMobileView=window.innerWidth<=600}loadDialogues(){const e=localStorage.getItem("theatre-dialogues");e&&(this.dialogues=JSON.parse(e).map(t=>({...t,createdAt:new Date(t.createdAt),updatedAt:new Date(t.updatedAt)})))}saveDialogues(){localStorage.setItem("theatre-dialogues",JSON.stringify(this.dialogues))}generateId(){return Date.now().toString(36)+Math.random().toString(36).substr(2)}render(){this.renderDialogueList(),this.renderEditor(),this.bindEvents()}renderDialogueList(){const e=document.getElementById("dialogueItems");e.innerHTML=this.dialogues.map(t=>`
            <div class="dialogue-item ${this.selectedDialogue?.id===t.id?"selected":""}" 
                 data-id="${t.id}">
                <div class="dialogue-item-header">
                    ${t.tokenImage?`<img src="${t.tokenImage}" alt="${t.tokenName}" class="token-thumbnail">`:""}
                    <div class="dialogue-item-title">${t.title||"Untitled"}</div>
                </div>
                <div class="dialogue-item-preview">${t.text.substring(0,50)}${t.text.length>50?"...":""}</div>
                <div class="dialogue-actions">
                    <button class="btn btn-sm btn-primary send-dialogue" data-id="${t.id}">Load to Theatre</button>
                    <button class="btn btn-sm btn-danger delete-dialogue" data-id="${t.id}">Delete</button>
                </div>
            </div>
        `).join(""),this.bindListEvents()}renderEditor(){const e=document.getElementById("editorContent");if(!this.selectedDialogue){e.innerHTML='<p style="text-align: center; color: var(--OBR-offset-fore); margin-top: 50px;">Select a dialogue to edit, or create a new one.</p>';return}const t=this.tokens.map(o=>`<option value="${o.id}" ${this.selectedDialogue?.tokenId===o.id?"selected":""}>${o.name}</option>`).join(""),i=this.isMobileView?'<button type="button" class="mobile-back-button" id="mobileBack">← Back to List</button>':"";e.innerHTML=`
            ${i}
            <form class="dialogue-form" id="dialogueForm">
                <div class="form-row">
                    <div class="form-group form-group-half">
                        <label class="form-label" for="dialogueTitle">Title</label>
                        <input type="text" id="dialogueTitle" class="form-input" value="${this.selectedDialogue.title}" maxlength="50" placeholder="Enter dialogue title...">
                    </div>
                    <div class="form-group form-group-half">
                        <label class="form-label" for="overrideName">Override</label>
                        <input type="text" id="overrideName" class="form-input" value="${this.selectedDialogue.overrideName||""}" maxlength="30" placeholder="Override display name...">
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="tokenSelect">Token (Optional)</label>
                    <select id="tokenSelect" class="form-select">
                        <option value="">No token selected</option>
                        ${t}
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="dialogueText">Dialogue Text</label>
                    <textarea id="dialogueText" class="form-textarea" maxlength="1000" placeholder="Enter your dialogue text...">${this.selectedDialogue.text}</textarea>
                    <div class="character-count" id="charCount">${this.selectedDialogue.text.length}/1000</div>
                </div>
                
                <div class="form-buttons">
                    <button type="submit" class="btn btn-primary">Save Dialogue</button>
                    <button type="button" class="btn btn-secondary" id="cancelEdit">Cancel</button>
                </div>
            </form>
        `,this.isMobileView&&this.showMobileEditor(),this.bindEditorEvents()}showMobileEditor(){if(this.isMobileView){const e=document.querySelector(".dialogue-editor");e&&e.classList.add("mobile-show")}}hideMobileEditor(){if(this.isMobileView){const e=document.querySelector(".dialogue-editor");e&&e.classList.remove("mobile-show")}}bindEvents(){document.getElementById("closeExplorer")?.addEventListener("click",()=>{l.modal.close(d.STORAGEID)}),document.getElementById("addDialogue")?.addEventListener("click",()=>{this.createNewDialogue()}),this.bindListEvents()}bindListEvents(){document.querySelectorAll(".dialogue-item").forEach(e=>{e.addEventListener("click",t=>{if(t.target.classList.contains("btn"))return;const i=e.dataset.id;this.selectDialogue(i)})}),document.querySelectorAll(".send-dialogue").forEach(e=>{e.addEventListener("click",t=>{t.stopPropagation();const i=e.dataset.id;this.sendDialogue(i)})}),document.querySelectorAll(".delete-dialogue").forEach(e=>{e.addEventListener("click",t=>{t.stopPropagation();const i=e.dataset.id;this.deleteDialogue(i)})})}bindEditorEvents(){const e=document.getElementById("dialogueForm"),t=document.getElementById("dialogueText"),i=document.getElementById("charCount"),o=document.getElementById("mobileBack");t?.addEventListener("input",()=>{const s=t.value.length;i.textContent=`${s}/1000`,i.className=`character-count ${s>900?"warning":""} ${s>=1e3?"error":""}`}),e?.addEventListener("submit",s=>{s.preventDefault(),this.saveCurrentDialogue(),this.isMobileView&&this.hideMobileEditor()}),document.getElementById("cancelEdit")?.addEventListener("click",()=>{this.selectedDialogue=null,this.renderDialogueList(),this.renderEditor(),this.isMobileView&&this.hideMobileEditor()}),o?.addEventListener("click",()=>{this.isMobileView&&this.hideMobileEditor()})}createNewDialogue(){const e={id:this.generateId(),title:"",text:"",createdAt:new Date,updatedAt:new Date};this.dialogues.unshift(e),this.selectedDialogue=e,this.renderDialogueList(),this.renderEditor()}selectDialogue(e){this.selectedDialogue=this.dialogues.find(t=>t.id===e)||null,this.renderDialogueList(),this.renderEditor()}saveCurrentDialogue(){if(!this.selectedDialogue)return;const e=document.getElementById("dialogueTitle"),t=document.getElementById("overrideName"),i=document.getElementById("dialogueText"),o=document.getElementById("tokenSelect");if(this.selectedDialogue.title=e.value,this.selectedDialogue.overrideName=t.value||void 0,this.selectedDialogue.text=i.value,this.selectedDialogue.updatedAt=new Date,o.value){const s=this.tokens.find(n=>n.id===o.value);s&&(this.selectedDialogue.tokenId=s.id,this.selectedDialogue.tokenName=s.name,this.selectedDialogue.tokenImage=s.image)}else this.selectedDialogue.tokenId=void 0,this.selectedDialogue.tokenName=void 0,this.selectedDialogue.tokenImage=void 0;this.saveDialogues(),this.renderDialogueList()}async sendDialogue(e){const t=this.dialogues.find(i=>i.id===e);if(t)try{await l.broadcast.sendMessage(d.STORAGECHANNEL,t,{destination:"LOCAL"})}catch(i){console.error("Failed to send dialogue:",i)}}deleteDialogue(e){confirm("Are you sure you want to delete this dialogue?")&&(this.dialogues=this.dialogues.filter(t=>t.id!==e),this.selectedDialogue?.id===e&&(this.selectedDialogue=null),this.saveDialogues(),this.renderDialogueList(),this.renderEditor())}setTokens(e){this.tokens=e,this.selectedDialogue&&this.renderEditor()}}await l.onReady(async()=>{const a=await l.theme.getTheme();r(a,document);const t=(await l.scene.items.getItems(o=>o.layer==="CHARACTER"&&o.type==="IMAGE")).map(o=>({id:o.id,name:o.name||"Unnamed Token",image:o.image.url||""}));new c().setTokens(t)});
