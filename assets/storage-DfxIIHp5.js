import{O as a,S as c,C as l,L as r,G as u}from"./bsSceneCache-C_5PpwJt.js";import{DialogueStorageManager as g}from"./storage-savelayer-CkLE-n90.js";class m{tokens=[];selectedDialogue=null;isMobileView=!1;storageManager;constructor(e=!1){this.storageManager=new g(e),this.init()}async init(){this.bindEvents(),a.broadcast.onMessage(l.EXTENSIONID+"/dialogue-response",e=>{const t=e.data;t.type==="DIALOGUES_DATA"&&(r.log("[Storage] Received",t.dialogues.length,"dialogues from parent"),this.storageManager.dialogues=t.dialogues,this.storageManager.isUserRegistered=t.registered,this.renderDialogueList(),this.renderEditor())}),r.log("[Storage] Requesting dialogues from parent window"),await a.broadcast.sendMessage(l.EXTENSIONID+"/dialogue-request",{type:"REQUEST_DIALOGUES"},{destination:"LOCAL"}),this.checkMobileView(),this.renderDialogueList(),this.renderEditor(),window.addEventListener("resize",()=>{this.checkMobileView()})}checkMobileView(){this.isMobileView=window.innerWidth<=600}generateId(){return this.storageManager.isUserRegistered?u():Date.now().toString(36)+Math.random().toString(36).substr(2)}renderDialogueList(){const e=document.getElementById("dialogueItems");e.innerHTML=this.storageManager.dialogues.map(t=>`
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
        `).join("")}renderEditor(){const e=document.getElementById("editorContent");if(!this.selectedDialogue){e.innerHTML='<p style="text-align: center; color: var(--OBR-offset-fore); margin-top: 50px;">Select a dialogue to edit, or create a new one.</p>';return}const t=this.tokens.map(s=>`<option value="${s.id}" ${this.selectedDialogue?.tokenId===s.id?"selected":""}>${s.name}</option>`).join(""),i=this.isMobileView?'<button type="button" class="mobile-back-button" id="mobileBack">← Back to List</button>':"";e.innerHTML=`
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
                    ${i}
                    <button type="button" class="btn btn-secondary" id="cancelEdit">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Dialogue</button>
                </div>
            </form>
        `,this.isMobileView&&this.showMobileEditor(),this.bindEditorEvents()}showMobileEditor(){if(this.isMobileView){const e=document.querySelector(".dialogue-editor");e&&e.classList.add("mobile-show")}}hideMobileEditor(){if(this.isMobileView){const e=document.querySelector(".dialogue-editor");e&&e.classList.remove("mobile-show")}}bindEvents(){document.getElementById("closeExplorer")?.addEventListener("click",()=>{a.modal.close(l.STORAGEID)}),document.getElementById("addDialogue")?.addEventListener("click",()=>{this.createNewDialogue()});const e=document.getElementById("dialogueItems");e&&!e.dataset.bound&&(e.dataset.bound="true",e.addEventListener("click",t=>{const i=t.target;if(i.classList.contains("send-dialogue")||i.closest(".send-dialogue")){t.stopPropagation();const o=i.closest(".send-dialogue")?.dataset.id;o&&this.sendDialogue(o);return}if(i.classList.contains("delete-dialogue")||i.closest(".delete-dialogue")){t.stopPropagation();const o=i.closest(".delete-dialogue")?.dataset.id;o&&this.deleteDialogue(o);return}if(!i.classList.contains("btn")&&!i.closest(".btn")){const o=i.closest(".dialogue-item")?.dataset.id;o&&this.selectDialogue(o)}}))}bindEditorEvents(){const e=document.getElementById("dialogueForm"),t=document.getElementById("dialogueText"),i=document.getElementById("charCount"),s=document.getElementById("mobileBack");t?.addEventListener("input",()=>{const o=t.value.length;i.textContent=`${o}/1000`,i.className=`character-count ${o>900?"warning":""} ${o>=1e3?"error":""}`}),e?.addEventListener("submit",o=>{o.preventDefault(),this.saveCurrentDialogue(),this.isMobileView&&this.hideMobileEditor()}),document.getElementById("cancelEdit")?.addEventListener("click",()=>{this.selectedDialogue=null,this.renderDialogueList(),this.renderEditor(),this.isMobileView&&this.hideMobileEditor()}),s?.addEventListener("click",()=>{this.isMobileView&&this.hideMobileEditor()})}createNewDialogue(){const e={id:this.generateId(),title:"",text:"",createdAt:new Date,updatedAt:new Date};this.storageManager.dialogues.unshift(e),this.selectedDialogue=e,this.renderDialogueList(),this.renderEditor()}selectDialogue(e){this.selectedDialogue=this.storageManager.dialogues.find(t=>t.id===e)||null,this.renderDialogueList(),this.renderEditor()}async saveCurrentDialogue(){if(!this.selectedDialogue)return;const e=document.getElementById("dialogueTitle"),t=document.getElementById("overrideName"),i=document.getElementById("dialogueText"),s=document.getElementById("tokenSelect");if(this.selectedDialogue.title=e.value,this.selectedDialogue.overrideName=t.value||void 0,this.selectedDialogue.text=i.value,this.selectedDialogue.updatedAt=new Date,s.value){const o=this.tokens.find(n=>n.id===s.value);o&&(this.selectedDialogue.tokenId=o.id,this.selectedDialogue.tokenName=o.name,this.selectedDialogue.tokenImage=o.image)}else this.selectedDialogue.tokenId=void 0,this.selectedDialogue.tokenName=void 0,this.selectedDialogue.tokenImage=void 0;await this.storageManager.saveDialogues(this.selectedDialogue.id),await a.broadcast.sendMessage(l.EXTENSIONID+"/dialogue-request",{type:"UPDATE_DIALOGUE",dialogue:this.selectedDialogue},{destination:"LOCAL"}),this.renderDialogueList()}async sendDialogue(e){const t=this.storageManager.dialogues.find(i=>i.id===e);if(t)try{await a.broadcast.sendMessage(l.STORAGECHANNEL,t,{destination:"LOCAL"})}catch(i){console.error("Failed to send dialogue:",i)}}async deleteDialogue(e){confirm("Are you sure you want to delete this dialogue?")&&(await this.storageManager.deleteDialogue(e),await a.broadcast.sendMessage(l.EXTENSIONID+"/dialogue-request",{type:"DELETE_DIALOGUE",id:e},{destination:"LOCAL"}),this.selectedDialogue?.id===e&&(this.selectedDialogue=null),this.renderDialogueList(),this.renderEditor())}setTokens(e){this.tokens=e,this.selectedDialogue&&this.renderEditor()}}await a.onReady(async()=>{const d=await a.theme.getTheme();c(d,document);const t=(await a.scene.items.getItems(n=>n.layer==="CHARACTER"&&n.type==="IMAGE")).map(n=>({id:n.id,name:n.name||"Unnamed Token",image:n.image.url||""})),s=new URLSearchParams(window.location.search).get("registered")==="true";new m(s).setTokens(t)});
