"use strict";
(() => {
  const $ = selector => document.querySelector(selector);
  const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const date = value => value ? new Date(value).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',hour12:false}) : '';
  const uuid = () => [...crypto.getRandomValues(new Uint8Array(16))].map(value=>value.toString(16).padStart(2,'0')).join('');
  let state={projects:[],cards:[],events:[],warnings:[]},selected='chen',busy=false,dragged=null,prepared=null,handoffCard=null,detail=null,navMarkup='',toastTimer;
  let pending=null;
  const drafts=new Map();
  function present(action,...args){try{window.opsMotion?.[action]?.(...args);}catch{}}
  try{selected=localStorage.getItem('yuandu.ops.project')||selected;pending=JSON.parse(sessionStorage.getItem('yuandu.ops.pending')||'null');}catch{}
  function toast(text,error=false){clearTimeout(toastTimer);const node=$('#toast');($('dialog[open]')||document.body).append(node);node.textContent=text;node.className='toast'+(error?' error':'');node.hidden=false;toastTimer=setTimeout(()=>node.hidden=true,error?10000:5000);}
  function project(id){return state.projects.find(item=>item.id===id);}
  function name(id){return project(id)?.name||id||'尚未交接';}
  function currentDraft(){if(!drafts.has(selected))drafts.set(selected,{body:'',reply_to:null,request_id:null});return drafts.get(selected);}
  function remember(){if(selected!=='chen')return;const draft=currentDraft();draft.body=$('#ops-body').value;}
  function originLabel(card){return card.sender==='chen'&&!card.source_name?'发起人：陈震':card.source_name?'回件来源：'+name(card.sender):'历史项目归属：'+name(card.sender);}
  function setPending(value){pending=value;try{value?sessionStorage.setItem('yuandu.ops.pending',JSON.stringify(value)):sessionStorage.removeItem('yuandu.ops.pending');}catch{}$('#ops-pending').hidden=!pending;}
  async function api(path,data){
    const response=await workbenchDemoRequest('/api/ops'+path,data===undefined?{}:{method:'POST',headers:{'Content-Type':'application/json','X-TS-Workspace':'ops','X-TS-CSRF':state.csrf||''},body:JSON.stringify(data)});
    const result=await response.json();
    if(!response.ok){const error=new Error(result.error||'运营请求未完成');error.code=result.code;throw error;}
    return result;
  }
  function setBusy(value){busy=value;$('#workspace-switch').disabled=value;$('#ops-save').disabled=value||selected!=='chen'||!project(selected)?.available;$('#ops-body').disabled=value||selected!=='chen'||!project(selected)?.available;$('#ops-copy-handoff').disabled=value;$('#ops-target').disabled=value||Boolean(prepared);document.querySelectorAll('[data-project]').forEach(node=>node.disabled=value);document.querySelectorAll('[data-native-scope]').forEach(node=>node.classList.toggle('ops-link-disabled',value));}
  async function run(action){if(busy)return;const control=document.activeElement?.closest('.button,#refresh')||(document.activeElement?.closest('#ops-form')?$('#ops-save'):null);control?.setAttribute('aria-busy','true');setBusy(true);try{await action();}catch(error){toast(error.message,true);if(error.code==='csrf')load().catch(()=>{});}finally{control?.removeAttribute('aria-busy');setBusy(false);}}
  function renderShell(){
    const markup=state.projects.map(item=>{
      const unsent=state.cards.filter(card=>card.sender===item.id&&card.status==='draft').length;
      return `<button class="nav-item nav-quick ops-project-row${item.id===selected?' active':''}" type="button" data-project="${esc(item.id)}" aria-current="${item.id===selected?'page':'false'}"><span class="ops-project-avatar" aria-hidden="true">${item.id==='chen'?'我':item.id==='website'?'网':item.id==='wechat'?'公':'红'}</span><span class="nav-text"><strong>${esc(item.name)}</strong><small>${item.kind==='human'?'写沟通 · 我的收件':item.available?'收到的沟通 · 回件':'待配置 / 暂不可用'}</small></span>${unsent?`<span class="nav-count" aria-label="${unsent}张待交接卡片">${unsent}</span>`:''}</button>`;
    }).join('');
    if(navMarkup!==markup){$('#ops-projects').innerHTML=markup;navMarkup=markup;}
    const item=project(selected),human=item?.kind==='human';$('#page-title').textContent=name(selected);$('#breadcrumb-current').textContent=name(selected);$('#page-subtitle').textContent=human?'你的需求从这里发起，项目意见通过回件进入协同。':item?.root||'尚未指定真实项目目录';
    $('#release').textContent='DEMO / V'+(state.version||'3.1.32');
    $('#ops-compose').hidden=!human||!item?.available;$('#ops-unsent-section').hidden=!item?.available;$('#ops-unavailable').hidden=Boolean(item?.available);
    $('#ops-unsent-title').textContent=human?'待交接':'回件待转交';$('#ops-unsent-note').textContent=human?'拖到左边的接收项目，或使用卡片上的交接按钮。':'项目回件由你决定交回本人，或转给其他项目。';
    $('#ops-unavailable-note').textContent=item?.root?'该项目目录当前不可用，请恢复原目录后刷新；已保存的卡片仍然保留。':'公众号项目目录和交接范围尚未确定，暂不创建卡片或交接。';
    $('#ops-folders').hidden=human;$('#ops-reply-dir').textContent=item?.reply_dir||'待配置';$('#ops-sync').disabled=human||!item?.available;
    $('#ops-pending').hidden=!pending;$('#ops-limit-note').hidden=state.total_cards<=state.cards.length;
    const reply=human?currentDraft().reply_to:null;$('#ops-reply-context').hidden=!reply;$('#ops-reply-label').textContent=reply?'补充 '+reply+' · 保存后生成一张新的沟通卡':'';
  }
  function cardMarkup(card){
    const draft=card.status==='draft',archived=card.status==='archived',replies=state.cards.filter(item=>item.reply_to===card.id),linked=replies[0];
    const title=card.body.trim().split(/\r?\n/)[0].slice(0,72);
    return `<article class="work-card ops-card" data-card="${esc(card.id)}" data-motion-task="${esc(card.id)}" data-motion-status="${esc(card.status)}"${draft?' draggable="true"':''}><div class="ops-sender-stamp"><span class="tag">${draft?'已保存 · 待交接':archived?'仅归档 · 不再转交':'已闭环'}</span><span class="tag">${esc(originLabel(card))}</span></div><h3><button class="review-task-title" type="button" data-detail="${esc(card.id)}">${esc(title)}</button></h3>${card.body.trim()!==title?`<p class="ops-card-body">${esc(card.body)}</p>`:''}${card.reply_to?`<p class="work-source">回复 ${esc(card.reply_to)}</p>`:''}${card.source_name?`<p class="work-source">文件 ${esc(card.source_name.split(/[\\/]/).pop())}</p>`:''}${linked?`<p class="work-source">已有 ${replies.length} 份回件</p>`:''}<small>${esc(card.id)} · ${esc(date(archived?card.archived_at:draft?card.created_at:card.closed_at))}</small><div class="work-actions"><button class="button primary small" type="button" ${draft?'data-handoff':'data-detail'}="${esc(card.id)}">${draft?'复制并交接':'查看沟通'}</button>${draft&&card.source_name?`<button class="button small" type="button" data-archive="${esc(card.id)}">仅归档，不再转交</button>`:''}${!draft&&!archived&&!linked&&selected==='chen'&&card.receiver==='chen'?`<button class="button small" type="button" data-reply="${esc(card.id)}">补充沟通</button>`:''}</div></article>`;
  }
  function renderCards(){
    const unsent=state.cards.filter(card=>card.status==='draft'&&card.sender===selected);
    const received=state.cards.filter(card=>card.status==='closed'&&card.receiver===selected);
    const query=$('#ops-search').value.trim().toLowerCase();
    $('#ops-unsent-count').textContent=String(unsent.length);$('#ops-received-count').textContent=String(received.length);
    $('#ops-unsent').innerHTML=unsent.map(cardMarkup).join('')||`<p class="ops-empty">${selected==='chen'?'保存上方的沟通内容后，卡片会出现在这里。':'项目按交接提示词保存回件后，新的待转交卡片会出现在这里。'}</p>`;
    $('#ops-received').innerHTML=received.filter(card=>(card.body+' '+card.id+' '+name(card.sender)).toLowerCase().includes(query)).map(cardMarkup).join('')||'<p class="ops-empty">当前没有收到的闭环卡片。</p>';
    const archived=state.cards.filter(card=>card.status==='archived'&&card.sender===selected);
    $('#ops-archived-label').textContent='仅归档 · '+archived.length;
    $('#ops-archived-list').innerHTML=archived.map(cardMarkup).join('')||'<p class="helper">暂无仅归档回件。仅结束沟通转交，不代表业务事项完成。</p>';
    const outgoing=state.events.filter(item=>item.action==='handed_off'&&item.sender===selected);
    $('#ops-outgoing-label').textContent='已流出记录 · '+outgoing.length;
    $('#ops-outgoing-list').innerHTML=outgoing.map(item=>`<div class="ops-trace-row"><div>${esc(item.card_id)} → ${esc(name(item.receiver))}<small>${esc(date(item.created_at))}</small></div><button class="button small" type="button" data-detail="${esc(item.card_id)}">查看记录</button></div>`).join('')||'<p class="helper">尚无流出记录。</p>';
    $('#ops-warnings').hidden=!state.warnings.length;$('#ops-warnings').innerHTML=state.warnings.map(item=>`<p>${esc(item.card_id)}：${esc(item.message)}</p>`).join('');
    present('render',$('.content'),selected);
  }
  async function load(){
    const result=await api('/state');
    if(result.workspace?.id!=='ops')throw new Error('工作空间响应不一致');
    state=result;if(!project(selected))selected='chen';
    if(pending){const card=state.cards.find(item=>item.id===pending.card_id);if(card?.status==='closed'&&card.receiver===pending.receiver)setPending(null);}
    renderShell();renderCards();$('#connection').textContent='● 演示模式';$('#connection').className='connection';
  }
  function selectProject(id,internal=false){
    if((busy&&!internal)||!project(id))return;const changed=id!==selected;remember();selected=id;localStorage.setItem('yuandu.ops.project',id);$('#ops-body').value=currentDraft().body;$('#ops-search').value='';$('#ops-outgoing').open=false;renderShell();renderCards();setBusy(busy);if(changed)present('projectChanged');
  }
  async function saveCard(){
    if(selected!=='chen')throw new Error('手写沟通请到“我 · 陈震”发起');
    const draft=currentDraft();draft.body=$('#ops-body').value;
    if(!draft.body.trim())throw new Error('请先填写沟通内容');
    const fingerprint=JSON.stringify([selected,draft.body,draft.reply_to]);
    if(draft.fingerprint!==fingerprint){draft.request_id=uuid();draft.fingerprint=fingerprint;}
    const saved=await api('/cards',{sender:selected,body:draft.body,reply_to:draft.reply_to,request_id:draft.request_id});
    drafts.set(selected,{body:'',reply_to:null,request_id:null});$('#ops-body').value='';await load();present('reveal',saved.card.id);toast('已保存。拖到左边的接收项目即可交接。');
  }
  function clipboard(text){
    if(document.hidden||!document.hasFocus())return Promise.reject(new Error('页面不在前台，提示词已保留，请在当前页复制'));
    if(!navigator.clipboard?.writeText){
      const input=document.createElement('textarea');input.value=text;input.readOnly=true;input.className='ops-clipboard-fallback';document.body.append(input);const previous=document.activeElement;input.select();let ok=false;try{ok=document.execCommand('copy');}catch{}input.remove();previous?.focus?.({preventScroll:true});return ok?Promise.resolve():Promise.reject(new Error('浏览器未确认复制，卡片仍留在原项目'));
    }
    return new Promise((resolve,reject)=>{
      let finished=false;const finish=error=>{if(finished)return;finished=true;clearTimeout(timer);window.removeEventListener('blur',leave);document.removeEventListener('visibilitychange',leave);error?reject(error):resolve();};
      const leave=()=>{if(document.hidden||!document.hasFocus())finish(new Error('页面已离开前台，未完成交接'));};
      const timer=setTimeout(()=>finish(new Error('复制未及时确认，卡片仍留在原项目')),4000);window.addEventListener('blur',leave);document.addEventListener('visibilitychange',leave);
      try{Promise.resolve(navigator.clipboard.writeText(text)).then(()=>finish(),error=>finish(error));}catch(error){finish(error);}
    });
  }
  function pendingFrom(value){return {card_id:value.card_id,prepared_id:value.prepared_id,receiver:value.receiver,sender:value.sender,revision:value.revision};}
  async function commit(value){
    await api('/cards/'+value.card_id+'/handoff',{prepared_id:value.prepared_id,revision:value.revision,clipboard_copied:true});
    setPending(null);const target=value.receiver;$('#ops-handoff').close();await load();selectProject(target,true);if(state.cards.some(card=>card.id===value.card_id&&card.status==='closed'&&card.receiver===target))present('landed',value.card_id);toast('已复制并交接；卡片已在'+name(target)+'的闭环列表。');
  }
  function showPrepared(){
    $('#ops-target').value=prepared.receiver;$('#ops-target').disabled=true;$('#ops-prepared-text').value=prepared.text;$('#ops-prepared-text').hidden=false;$('#ops-copy-note').textContent='复制尚未确认，卡片没有流转。请在这里重新点击“复制并完成交接”。';if(!$('#ops-handoff').open)$('#ops-handoff').showModal();
  }
  function setHandoffCard(card){
    handoffCard=card;prepared=null;
    $('#ops-handoff-card').textContent=card.id+' · '+originLabel(card);
    const targets=state.projects.filter(item=>item.id!==card.sender&&item.available);
    $('#ops-target').innerHTML=targets.map(item=>`<option value="${esc(item.id)}">${esc(item.name)}</option>`).join('');
    $('#ops-target').disabled=false;$('#ops-prepared-text').hidden=true;$('#ops-prepared-text').value='';$('#ops-copy-note').textContent='复制成功后，卡片从发起方移出，在接收方闭环。';
  }
  async function copyAndHandoff(card,receiver){
    if(pending)throw new Error('请先核对上一次已复制的流转结果');
    if(card.sender!==selected||card.status!=='draft')throw new Error('只能交接当前发起项目的待交接卡片');
    if(!project(receiver)?.available||receiver===card.sender)throw new Error('请选择另一个已配置的接收项目');
    if(!prepared||prepared.card_id!==card.id||prepared.receiver!==receiver){setHandoffCard(card);prepared=await api('/cards/'+card.id+'/prepare',{sender:selected,receiver,revision:card.revision});$('#ops-target').value=receiver;}
    try{await clipboard(prepared.text);}catch{showPrepared();toast('未确认复制，卡片没有流转；可在弹窗中再次复制。',true);return;}
    const frozen=pendingFrom(prepared);setPending(frozen);
    try{await commit(frozen);}catch(error){$('#ops-handoff').close();toast('提示词已复制，流转结果待核对：'+error.message,true);}
  }
  async function openDetail(id){
    detail=await api('/cards/'+encodeURIComponent(id));const card=detail.card;
    $('#ops-detail-title').textContent=card.id;
    $('#ops-detail-meta').textContent=originLabel(card)+' · '+(card.status==='archived'?'仅归档 · 不再转交':card.status==='closed'?'接收方：'+name(card.receiver)+' · 已闭环':'已保存 · 待交接')+' · '+date(card.created_at);
    $('#ops-detail-body').textContent=card.body;
    $('#ops-detail-related').textContent=(card.reply_to?'回复原卡：'+card.reply_to+'\n':'')+(card.source_name?'回件文件：'+card.source_name+'\n':'')+(card.archive_reason?'归档原因：'+card.archive_reason+'\n':'')+(detail.replies||[detail.reply].filter(Boolean)).map(reply=>'关联回复卡：'+reply.id+'（'+(reply.status==='draft'?'待交接':reply.status==='archived'?'仅归档':'已闭环')+'）').join('\n');
    $('#ops-detail-reply').hidden=selected!=='chen'||card.receiver!=='chen'||card.status!=='closed'||Boolean(detail.reply);
    $('#ops-detail-prompt').hidden=!detail.prompt;
    if(!$('#ops-detail').open)$('#ops-detail').showModal();
  }
  function startReply(card){
    if(selected!=='chen'||card.receiver!=='chen'){toast('项目意见通过回件进入；手写沟通请到“我 · 陈震”。',true);return;}
    if(currentDraft().body.trim()&&!confirm('填写区已有未保存内容。替换为本次回复的空白输入框？'))return;
    const existing=state.cards.find(item=>item.reply_to===card.id);if(existing){toast('已有回复卡 '+existing.id+'，请使用该回复卡。',true);return;}
    drafts.set(selected,{body:'',reply_to:card.id,request_id:null});$('#ops-body').value='';$('#ops-detail').close();renderShell();$('#ops-body').focus();$('#ops-compose').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  }
  $('#ops-form').addEventListener('submit',event=>{event.preventDefault();run(saveCard);});
  $('#ops-body').addEventListener('input',remember);
  $('#ops-cancel-reply').onclick=()=>{currentDraft().reply_to=null;renderShell();};
  $('#ops-search').oninput=renderCards;
  $('#ops-projects').onclick=event=>{const button=event.target.closest('[data-project]');if(button)selectProject(button.dataset.project);};
  document.addEventListener('click',event=>{
    const close=event.target.closest('[data-close]');if(close){close.closest('dialog').close();return;}
    const cardButton=event.target.closest('[data-detail],[data-reply],[data-handoff],[data-archive]');if(!cardButton)return;
    if(cardButton.dataset.archive){
      const card=state.cards.find(item=>item.id===cardButton.dataset.archive);if(!card||busy)return;
      if(pending){toast('请先核对上一次已复制的流转结果',true);return;}
      if(!confirm('仅归档，不再转交？\n'+card.id+'\n'+card.body.trim().split(/\r?\n/)[0]+'\n原文与记录保留，不复制、不发送，也不表示业务完成。'))return;
      run(async()=>{await api('/cards/'+card.id+'/archive',{sender:card.sender,revision:card.revision,confirm_archive:true,reason:'陈震确认仅归档，无需继续转交或回复'});await load();toast('已仅归档；不再进入待转交，原文记录保留。');});
    }else if(cardButton.dataset.detail)run(()=>openDetail(cardButton.dataset.detail));
    else if(cardButton.dataset.reply){const card=state.cards.find(item=>item.id===cardButton.dataset.reply);if(card)startReply(card);}
    else{const card=state.cards.find(item=>item.id===cardButton.dataset.handoff);if(!card||busy)return;if(pending){toast('请先核对上一次已复制的流转结果',true);return;}setHandoffCard(card);if(!$('#ops-target').options.length){toast('暂无可交接的接收项目',true);return;}$('#ops-handoff').showModal();}
  });
  $('#ops-copy-handoff').onclick=()=>run(()=>copyAndHandoff(handoffCard,$('#ops-target').value));
  $('#ops-handoff').addEventListener('close',()=>{prepared=null;handoffCard=null;});
  $('#ops-detail-reply').onclick=()=>detail&&startReply(detail.card);
  $('#ops-detail-prompt').onclick=()=>run(async()=>{if(detail?.prompt){await clipboard(detail.prompt);toast('已复制原交接单；卡片状态和记录未改变。');}});
  $('#ops-reconcile').onclick=()=>run(async()=>{
    if(!pending)return;const frozen={...pending};await load();
    const current=await api('/cards/'+frozen.card_id);
    if(current.card.status==='closed'){if(current.card.receiver!==frozen.receiver)throw new Error('卡片接收方与本次准备不同，请核对原卡');setPending(null);selectProject(frozen.receiver,true);present('landed',frozen.card_id);toast('已核对，原交接已完成。');return;}
    setPending(frozen);await commit(frozen);
  });
  $('#ops-forget').onclick=()=>{if(!busy&&confirm('这里只清除页面的待确认标记，不撤销服务器记录。请先核对卡片，再决定是否重新交接。')){setPending(null);load().catch(error=>toast(error.message,true));}};
  $('#refresh').onclick=()=>run(load);
  $('#ops-sync').onclick=()=>run(async()=>{await api('/sync',{});await load();toast('已刷新回件与卡片。');});
  $('#workspace-switch').onclick=()=>{const opening=$('#workspace-menu').hidden;$('#workspace-menu').hidden=!opening;$('#workspace-switch').setAttribute('aria-expanded',String(opening));};
  $('#ops-current-scope').onclick=()=>{$('#workspace-menu').hidden=true;$('#workspace-switch').setAttribute('aria-expanded','false');};
  document.querySelectorAll('[data-native-scope]').forEach(link=>link.addEventListener('click',event=>{if(busy){event.preventDefault();return;}localStorage.setItem('yuandu.workspace',link.dataset.nativeScope);}));
  document.addEventListener('click',event=>{if(!event.target.closest('.workspace-brand')){$('#workspace-menu').hidden=true;$('#workspace-switch').setAttribute('aria-expanded','false');}});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){$('#workspace-menu').hidden=true;$('#workspace-switch').setAttribute('aria-expanded','false');}});
  document.addEventListener('dragstart',event=>{
    const cardNode=event.target.closest('.ops-card[draggable="true"]');if(!cardNode)return;
    const card=state.cards.find(item=>item.id===cardNode.dataset.card);if(busy||pending||card?.sender!==selected){event.preventDefault();return;}
    dragged={id:card.id,sender:card.sender,revision:card.revision};event.dataTransfer.setData('application/x-operations-card',JSON.stringify(dragged));event.dataTransfer.effectAllowed='move';cardNode.classList.add('ops-dragging');
  });
  function clearDrag(){dragged=null;document.querySelectorAll('.ops-dragging,.ops-drop-target').forEach(node=>node.classList.remove('ops-dragging','ops-drop-target'));}
  document.addEventListener('dragend',clearDrag);
  $('#ops-projects').addEventListener('dragover',event=>{const target=event.target.closest('[data-project]');if(dragged&&target&&target.dataset.project!==dragged.sender&&project(target.dataset.project)?.available){event.preventDefault();event.dataTransfer.dropEffect='move';target.classList.add('ops-drop-target');}});
  $('#ops-projects').addEventListener('dragleave',event=>{const target=event.target.closest('[data-project]');if(target&&!target.contains(event.relatedTarget))target.classList.remove('ops-drop-target');});
  $('#ops-projects').addEventListener('drop',event=>{
    const target=event.target.closest('[data-project]');if(!target||!dragged)return;event.preventDefault();
    const frozen={...dragged};clearDrag();const card=state.cards.find(item=>item.id===frozen.id);
    if(!card||card.revision!==frozen.revision||card.sender!==selected){toast('卡片已变化，请刷新核对',true);return;}
    run(()=>copyAndHandoff(card,target.dataset.project));
  });
  window.addEventListener('beforeunload',event=>{remember();if(pending||[...drafts.values()].some(item=>item.body.trim())){event.preventDefault();event.returnValue='';}});
  async function initial(){try{await load();$('#ops-body').value=currentDraft().body;setBusy(false);}catch(error){$('#connection').textContent='服务连接中断';$('#connection').className='connection error';toast(error.message,true);}}
  initial();
  setInterval(()=>{if(busy||dragged||document.hidden||$('dialog[open]')||['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;load().catch(()=>{$('#connection').textContent='服务连接中断';$('#connection').className='connection error';});},15000);
})();
