"use strict";

function deliveryLabel(task) {return task.delivery?.branch==='knowledge'?'内部反哺':task.delivery?.branch==='html'?'Codex 最终交付':'客户交付';}
function deliveryBranchMarkup(task) {
  return `<span class="delivery-label ${task.delivery?.branch==='html'?'html':'knowledge'}">${esc(deliveryLabel(task))}</span>`;
}
function deliveryExecutionMarkup() {
  const execution=state.delivery_execution || {},runs=execution.runs || [];
  return `<section class="panel"><h3>内部反哺 · Pi 半自动执行</h3><p>将蓝色卡从待开始拖到进行中并确认，即排队交给本线 Pi。核验原件、实际保存、回执与阻塞后自动闭环；紫色最终交付仍手动移交。同线维护串行，采集占用时排队；TS／KS独立。</p>${execution.worker_error?`<p class="work-warning">${esc(execution.worker_error)}</p>`:''}${execution.connection?`<p class="work-warning">${esc(execution.connection)}</p>`:''}${runs.length?`<details><summary>执行记录 · ${runs.length} 批</summary>${runs.map(run=>`<article><strong>${esc(run.label)}</strong> · ${esc(run.id)}<p>${run.tasks.map(t=>esc(t.task_id)).join('、')}${run.error?' · '+esc(run.error):''}</p>${['queued','preparing','sending','running','uncertain'].includes(run.status)?`<button class="button small" data-feedback-stop="${esc(run.id)}">${run.status==='queued'?'取消尚未发送的移交':'请求停止本批'}</button>`:''}${run.human_response?`<details><summary>查看实际反哺回报</summary><pre class="source-text">${esc(run.human_response)}</pre></details>`:''}${['uncertain','failed'].includes(run.status)?`<p class="helper">保留已有成果，不自动重发。请先核实原执行与保存；不可另开会话重跑。</p><button class="button small" data-feedback-resolve="${esc(run.id)}">核实原执行后转回手动</button>`:''}</article>`).join('')}</details>`:'<p class="helper">尚无内部反哺执行记录；已有进行中卡不会被自动补跑。</p>'}</section>`;
}
function renderDelivery() {
  const draft=businessState('delivery');
  setWorkspaceMarkup(businessDeskMarkup('delivery')+`<details class="desk-tools" id="business-tools"${draft.tools?' open':''}><summary>交付流转说明</summary><div class="testing-guide"><article><h3>1 · WB 交付一份报告</h3><p>当前交付目录中的正式报告自动建立两张待开始卡，共用原报告，不需要再接入一次。内部记录、模板及废弃子目录不生成卡片。</p></article><article><h3>2 · 分别开始处理</h3><p>可分别全选或勾选多张蓝色内部反哺、紫色最终交付卡，再批量开始并复制交接单。蓝色确认开始后由平台排队移交本线 Pi，无需手动复制；紫色仍复制给本线 Codex 交付项目，两个分支独立处理。</p></article><article><h3>3 · 核对真实结果后闭环</h3><p>蓝色由平台核验 Pi 的知识保存及回执后自动闭环；异常保留状态与原因。紫色仍由你记录 HTML 产物路径并核对闭环。另一分支不受影响，原报告保留在交付目录。</p></article></div><p class="helper">原报告有修订时，先在分支卡核对并采用当前原件；已闭环分支需要重做时使用现有撤回闭环操作。</p></details>`);
  $('#workspace').insertAdjacentHTML('afterbegin',deliveryExecutionMarkup());
  $$('#workspace [data-feedback-resolve]').forEach(button=>button.onclick=()=>run(async()=>{
    const note=prompt('请先核实原执行已停止及已有成果，填写核实说明。转回手动不会重跑或回滚知识。');
    if(!note?.trim())return;
    await api('/delivery/execution/resolve',{run_id:button.dataset.feedbackResolve,confirmed_stopped:true,note:note.trim()});
    await refresh();toast('已记录核实说明并转回手动；没有重新执行');
  },button));
  $$('#workspace [data-feedback-stop]').forEach(button=>button.onclick=()=>run(async()=>{
    if(!confirm('确认停止此批内部反哺？已有知识改动保留；已发送执行须等待结束核实，不能据此重新移交。'))return;
    const result=await api('/delivery/execution/stop',{run_id:button.dataset.feedbackStop});
    await refresh();toast(result.message);
  },button));
}
function decorateDeliveryDetail(task) {
  if(!task.delivery)return;
  const item=task.delivery,peers=(state.delivery?.branches || []).filter(b=>b.artifact_id===item.artifact_id && b.task_id!==task.id);
  $('#task-detail').classList.add('delivery-detail');$('#task-detail').dataset.deliveryBranch=item.branch;
  $('.task-actions').insertAdjacentHTML('beforebegin',`<section class="delivery-detail-context">${deliveryBranchMarkup(task)}<p>交付事项 DL-${esc(state.workspace.prefix)}-${item.artifact_id} · 两个分支共用原报告，各自闭环。</p>${peers.map(peer=>{const other=state.tasks.find(t=>t.id===peer.task_id);return other?`<button class="button small" data-delivery-peer="${esc(other.id)}">另一分支：${esc(deliveryLabel(other))} · ${esc(labels.statuses[other.status])}</button>`:'<p class="helper">另一分支已撤销或移出工作区，不能计作已完成。</p>';}).join('')}${item.report_changed?`<p class="work-warning">原报告已更新；本分支保留先前接受版本${task.status==='done'?'，需要重做请先撤回本分支闭环':'，请先查看关联报告，再核对并采用当前原件'}。</p>${task.status!=='done'?'<button class="button small" id="delivery-accept-report">核对并采用当前原件</button>':''}`:''}</section>`);
  $$('#task-detail [data-delivery-peer]').forEach(button=>button.onclick=()=>openTask(button.dataset.deliveryPeer));
  $('#delivery-accept-report')?.addEventListener('click',event=>run(async()=>{
    if(!confirm('确认已核对当前报告？仅更新这张卡接受的报告版本，另一分支保持独立。'))return;
    await api(`/delivery/tasks/${task.id}/accept-report`,{revision:task.revision,digest:item.digest});
    await refresh();renderTask();toast('本分支已采用当前报告');
  },event.currentTarget));
  const next=$('#trash-current-task')?.closest('.task-next-action')?.querySelector('p');
  if(next)next.textContent=task.status==='done'?'本分支已闭环。另一分支独立处理；需要重做可用现有撤回闭环操作。':item.branch==='knowledge'?task.auto_run?.live?'已交给本线 Pi 排队或执行，不要再手动移交；在交付模块查看执行记录和停止入口。':task.status==='pending'?'确认从待开始改为进行中，即移交本线 Pi；核验实际保存和回执后自动闭环。已有执行记录不会自动重跑。':'已有执行请核对实际回报或异常记录；不因恢复状态自动重跑。':'复制交接单到本线 Codex 交付项目；记录最终 HTML 产物真实路径，核对完成后单独闭环。';
}
