"use strict";

// Drag proposes intent; native guarded confirmation commits the actual task.
const workCardDrag = (()=>{
  const modules=['communication','automation','testing','audit','delivery'];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let drag=null,proposal=null,burst=null,landing=null,effectTimer=null,ghost=null;
  function plan(task,target){
    if(!task || !['pending','active','done','waiting'].includes(target))return {kind:'blocked',reason:'目标状态不可用'};
    if(task.auto_run?.live)return {kind:'blocked',reason:'请先核对自动执行状态'};
    if(task.status===target || target==='active' && ['active','review','waiting'].includes(task.status))return {kind:'noop'};
    if(openQuestions(task.id).some(q=>q.blocking))return {kind:'blocked',reason:'先解决阻塞问题，再流转'};
    if(task.status==='done' && target==='waiting')return {kind:'blocked',reason:'请先撤回闭环，再发起沟通'};
    if(task.status==='done')return task.closure_reopen_eligible?{kind:'reopen'}:{kind:'blocked',reason:'请打开卡片核对撤回条件'};
    return {kind:target==='waiting'?'question':'confirm'};
  }
  function selectionFor(task){
    const kind=batchSelected.size?'open':'single';
    const ids=kind==='open'?[...batchSelected]:[task.id];
    if(!ids.includes(task.id))return {error:'请拖动已勾选的卡片，或先清空选择'};
    const tasks=ids.map(id=>state.tasks.find(t=>t.id===id));
    const visible=new Set([...document.querySelectorAll('#workspace [data-motion-task]')].map(el=>el.dataset.motionTask));
    if(tasks.some(t=>!t || !visible.has(t.id)))return {error:'部分选择已不在当前页面，请重新选择'};
    return {kind,tasks};
  }
  function groupPlan(tasks,target){
    if(!tasks.length)return {kind:'blocked',reason:'未选择卡片'};
    if(tasks.length===1)return plan(tasks[0],target);
    if(tasks.length>FLOW_BATCH_LIMIT)return {kind:'blocked',reason:'一次最多流转50项'};
    if(tasks.some(t=>t.auto_run?.live || openQuestions(t.id).some(q=>q.blocking)))return {kind:'blocked',reason:'所选卡片存在执行中自动任务或阻塞问题，请先核对'};
    if(tasks.every(t=>plan(t,target).kind==='noop'))return {kind:'noop'};
    if(tasks.some(t=>batchGroup(t)!==batchGroup(tasks[0])))return {kind:'blocked',reason:'整组需为同类资料、同一执行方'};
    if(target==='active' && tasks.every(t=>t.status==='pending' && batchEligible(t)))return {kind:'confirm'};
    if(target==='done' && tasks.every(t=>(t.status==='active' || t.kind==='research' && t.status==='pending') && (t.batch_close_eligible ?? (t.kind!=='discussion' && batchEligible(t)))))return {kind:'confirm'};
    return {kind:'blocked',reason:target==='active'?'整组开始需全部为待开始；请取消其他状态的选择':target==='done'?'所选卡片未全部满足原有批量闭环条件':'该方向没有批量流转入口，请使用单卡操作'};
  }
  function frozenTasks(context){
    if(context.workspace!==activeWorkspace || context.view!==view)return null;
    const tasks=context.members.map(item=>state.tasks.find(t=>t.id===item.id));
    if(tasks.some((task,i)=>!task || task.revision!==context.members[i].revision))return null;
    const selected=context.selection==='open'?batchSelected:null;
    if(selected && (selected.size!==tasks.length || tasks.some(t=>!selected.has(t.id))))return null;
    return tasks;
  }
  function validateSubmission(taskId,target){
    if(!proposal || !proposal.members.some(t=>t.id===taskId))return true;
    const tasks=frozenTasks(proposal);
    if(proposal.target!==target || !tasks || !['confirm','reopen'].includes(groupPlan(tasks,target).kind)){
      toast('拖动目标、选择或卡片已变化，请关闭确认后重新拖动',true);return false;
    }
    return true;
  }
  function clearTargets(){
    document.querySelectorAll('.work-drop-target,.work-drop-blocked').forEach(el=>{el.classList.remove('work-drop-target','work-drop-blocked');delete el.dataset.dropHint;});
  }
  function clearDrag(){
    drag=null;draggedTask=null;ghost?.remove();ghost=null;document.querySelectorAll('.work-dragging').forEach(el=>el.classList.remove('work-dragging'));clearTargets();
  }
  function clearEffects(){
    clearTimeout(effectTimer);burst?.remove();burst=null;
    try{landing?.cancel();}catch{}landing=null;
    document.querySelectorAll('.work-landed').forEach(el=>el.classList.remove('work-landed'));
  }
  function land(taskId){
    clearEffects();
    const card=[...document.querySelectorAll('#workspace [data-motion-task]')].find(el=>el.dataset.motionTask===taskId);
    if(!card || document.hidden)return;
    const before=card.getBoundingClientRect();
    if(before.top<0 || before.bottom>innerHeight)card.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});
    card.classList.add('work-landed');
    if(!reduced.matches){
      try{landing=card.animate([{transform:'translateY(-17px) scale(1.015)'},{transform:'translateY(3px) scale(.995)',offset:.64},{transform:'translateY(0) scale(1)'}],{duration:430,easing:'cubic-bezier(.2,.8,.2,1)'});}catch{}
      const rect=card.getBoundingClientRect();burst=document.createElement('div');burst.className='work-starburst';burst.setAttribute('aria-hidden','true');
      const directions=[[-40,-26],[-13,-45],[26,-35],[44,-4],[25,29],[-35,18]];
      for(const [i,[x,y]] of directions.entries()){
        const star=document.createElement('span');star.textContent='✦';star.style.left=(rect.left+rect.width*.65)+'px';star.style.top=(rect.top+Math.min(45,rect.height/3))+'px';
        star.style.setProperty('--star-x',x+'px');star.style.setProperty('--star-y',y+'px');star.style.animationDelay=(i*13)+'ms';burst.append(star);
      }
      document.body.append(burst);
    }
    effectTimer=setTimeout(clearEffects,850);
  }
  function committed(taskId,target,items=null){
    if(!proposal || !proposal.members.some(t=>t.id===taskId))return false;
    const context=proposal;proposal=null;
    if(context.workspace!==activeWorkspace || context.view!==view || context.target!==target)return false;
    const confirmed=items?new Set(items.filter(item=>item.status===target).map(item=>item.id)):new Set([taskId]);
    const ids=context.members.filter(item=>confirmed.has(item.id) && state.tasks.find(t=>t.id===item.id)?.status===target).map(item=>item.id);
    if(!ids.length)return false;
    $('#task-dialog').close();selectedTask=null;
    if(modules.includes(view))businessState(view).stage='open';
    render();land(ids[0]);
    document.querySelectorAll('#workspace [data-motion-task]').forEach(card=>{if(ids.includes(card.dataset.motionTask))card.classList.add('work-landed');});
    return true;
  }
  function drop(event,column){
    event.preventDefault();const context=drag;clearDrag();
    if(!context || context.workspace!==activeWorkspace || context.view!==view)return;
    const tasks=frozenTasks(context),target=column.dataset.dropStatus;
    if(!tasks){toast('卡片或选择已更新，请重新选择后拖动',true);return;}
    const task=tasks.find(t=>t.id===context.id),action=groupPlan(tasks,target);
    if(action.kind==='noop')return;
    if(action.kind==='blocked'){toast(action.reason,true);return;}
    if(action.kind==='question'){
      openTask(task.id);$('#task-communication').open=true;$('#message-blocking').checked=true;
      $('#composer-title').textContent='发起阻塞沟通 · 保存后进入等待沟通';$('#message-body').focus();return;
    }
    proposal={...context,target};
    if(action.kind==='reopen'){openClosureReopen(tasks,target);return;}
    openTask(task.id);
    $('#task-status').value=target;$('#task-status').onchange();
    $('.task-actions',$('#task-detail')).insertAdjacentHTML('beforebegin',`<div class="work-drag-proposal"><strong>${tasks.length>1?`整组拖拽 · ${tasks.length} 项：`:'拖拽流转：'}${esc(labels.statuses[task.status])} → ${esc(labels.statuses[target])}</strong><p>确认后按原有规则保存状态${target==='done'?'并处理所列卡片负责的归档':''}；现在尚未变更。</p></div>`);
    if(tasks.length===1)$('#change-status').textContent=target==='done'?'确认闭环这张卡':'确认移动到'+labels.statuses[target];
    (target==='done'?$('#closure-summary'):$('#change-status')).focus();
  }
  function bind(){
    if(drag && (drag.workspace!==activeWorkspace || drag.view!==view))clearDrag();
    if(proposal && (proposal.workspace!==activeWorkspace || proposal.view!==view))proposal=null;
    if(!modules.includes(view) && !(view==='board' && monitorOperations))return;
    for(const card of document.querySelectorAll('#workspace .business-board .work-card,#workspace .work-history .work-card,#workspace .board .work-card')){
      const id=card.dataset.motionTask;if(!id)continue;
      card.draggable=true;card.title='拖到目标列后确认；也可点击卡片更新状态';
      if(!card.querySelector('.work-drag-grip')){
        const grip=document.createElement('span');grip.className='work-drag-grip';grip.textContent='⠿ 拖动';grip.setAttribute('aria-hidden','true');card.querySelector('.card-meta')?.append(grip);
      }
      card.ondragstart=event=>{
        const task=state.tasks.find(t=>t.id===id);
        if(!task || !event.dataTransfer || busyActions || inFlightMutations || workspaceLoading || document.querySelector('dialog[open]') || event.target.closest('input,textarea,select,a')){event.preventDefault();return;}
        const selected=selectionFor(task);
        if(selected.error){event.preventDefault();toast(selected.error,true);return;}
        if(selected.tasks.some(t=>t.auto_run?.live)){event.preventDefault();toast('请先核对自动执行状态',true);return;}
        if(task.auto_run?.live){event.preventDefault();toast('请先核对自动执行状态',true);return;}
        clearEffects();proposal=null;drag={id,members:selected.tasks.map(t=>({id:t.id,revision:t.revision})),selection:selected.kind,workspace:activeWorkspace,view};draggedTask=id;
        event.dataTransfer.setData('application/x-yuandu-task',id);event.dataTransfer.effectAllowed='move';
        const ids=new Set(selected.tasks.map(t=>t.id));
        document.querySelectorAll('#workspace [data-motion-task]').forEach(el=>{if(ids.has(el.dataset.motionTask))el.classList.add('work-dragging');});
        if(ids.size>1){ghost=document.createElement('div');ghost.className='work-group-ghost';ghost.textContent=`${ids.size} 张卡片 · 一起移动`;ghost.setAttribute('aria-hidden','true');document.body.append(ghost);event.dataTransfer.setDragImage(ghost,25,20);}
      };
      card.ondragend=clearDrag;
    }
    for(const column of document.querySelectorAll('#workspace [data-drop-status]')){
      column.ondragover=event=>{
        if(!drag || drag.workspace!==activeWorkspace || drag.view!==view)return;
        const tasks=frozenTasks(drag),action=tasks?groupPlan(tasks,column.dataset.dropStatus):{kind:'blocked',reason:'选择已变化，请重新拖动'};
        clearTargets();
        if(action.kind==='noop')return;
        if(action.kind==='blocked'){column.classList.add('work-drop-blocked');column.dataset.dropHint=action.reason;return;}
        event.preventDefault();event.dataTransfer.dropEffect='move';column.classList.add('work-drop-target');
        column.dataset.dropHint=(action.kind==='reopen'?'松开后确认撤回闭环 → ':'松开后确认 → ')+labels.statuses[column.dataset.dropStatus]+(drag.members.length>1?` · ${drag.members.length} 项`:'');
      };
      column.ondragleave=event=>{if(!column.contains(event.relatedTarget)){column.classList.remove('work-drop-target','work-drop-blocked');delete column.dataset.dropHint;}};
      column.ondrop=event=>drop(event,column);
    }
  }
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){clearDrag();clearEffects();proposal=null;}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){clearDrag();clearEffects();}});
  document.addEventListener('close',event=>{if(['task-dialog','closure-reopen-dialog'].includes(event.target.id) && !busyActions)proposal=null;},true);
  reduced.addEventListener('change',clearEffects);
  return {bind,plan,groupPlan,committed,validateSubmission,observeTask:id=>{if(proposal && proposal.id!==id)proposal=null;}};
})();
