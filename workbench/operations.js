"use strict";

let auditContext = null;
let trashContext = null;
const auditLive = ['queued','preparing','sending','running','uncertain'];
async function copyKnowledgeAudit(mode, delivered=false) {
  const scope=activeWorkspace;
  const key='yuandu.audit-request:'+scope+':'+mode;
  let request=localStorage.getItem(key);
  if(!request){request=crypto.randomUUID();localStorage.setItem(key,request);}
  const result=await api('/knowledge-audits/register',{mode,request_id:request,delivered});
  if(scope!==activeWorkspace || result.workspace!==scope) throw new Error('条线已切换，请重新复制本线提示词');
  localStorage.removeItem(key);
  const text=delivered?result.supplement:result.text;
  let copied=false;
  try { await writeClipboard(text);copied=true; } catch { /* Registration remains visible if clipboard fails. */ }
  if(copied && !delivered) {
    try { await api(`/knowledge-audits/tasks/${result.id}/copied`,{}); }
    catch { toast('提示词已复制；复制留痕暂未确认，可同步核对。',true); }
  }
  await refresh();
  if(copied)toast(`${result.id} 已登记；${delivered?'已交付记录及回传补充说明已准备，请补给原执行窗口。':'带编号提示词已复制，请手动交付。'}`);
  else prepareText(result.filename,text,`${result.id} 已登记，剪贴板不可用。请手动复制；尚不能据此认定已交付或执行。`);
}

function auditTrackingMarkup(task, allowRecord=false) {
  const audit=task.audit_tracking;if(!audit)return '';
  const result=audit.result,received=!!audit.received_at;
  const phase=received?(audit.auto_close?'回报已收到 · 等待闭环条件':audit.manual_result?'人工登记回报 · 待验收':'审计回报 · 待验收'):audit.delivered_at?'已手动交付 · 执行进度待核实':audit.copied_at?'已登记 · 提示词已复制':'已登记 · 待手动交付';
  const count=value=>value??'未登记';
  const manualForm=allowRecord && !received && task.status!=='done'?`<details id="audit-manual-report"><summary>应急：登记已有回报原文</summary><form id="audit-report-form" data-audit-task="${esc(task.id)}"><p class="helper">报告已在维护者窗口回复但未落到固定回传文件时，可在这里原样登记。只保存回报与陈震的确认，不代写 WPS 文件，不重新执行审计。超过16000字请使用固定文件回传，不能截断报告。</p><label>审计回报全文<textarea id="audit-existing-report" name="report" rows="9" required placeholder="粘贴本线本次审计已经给出的完整报告，不要只填写已完成"></textarea></label><label>回报声明的覆盖结果<select id="audit-existing-outcome" name="outcome" required>${options({'':'请选择实际结果',...labels.auditOutcomes},'')}</select></label><div class="form-row"><label>应审文件数<input id="audit-existing-total" name="total" type="number" min="0" max="10000000" step="1"></label><label>全文核验文件数<input id="audit-existing-covered" name="covered" type="number" min="0" max="10000000" step="1"></label></div><p class="helper">选择全量完成时，须按实际报告填写非零应审数和相同的全文核验数；其他情况可留空，显示未登记，不猜测为0。结构化报告中的统计沿用原文。</p><label>结论摘要（可选）<textarea id="audit-existing-summary" name="summary" rows="2" maxlength="2000"></textarea></label><label><input id="audit-existing-confirm" name="confirmed" type="checkbox" required>我已核对这是本线本次审计的完整真实回报，所选结果和数量与报告一致</label><button class="button primary" type="submit">登记回报，进入待验收</button></form></details>`:'';
  return `<div class="task-next-action"><strong>${task.status==='done'?'本轮审计回报已闭环':phase}</strong>${received?`<p>报告声明：${esc(labels.auditOutcomes[result.outcome] || result.outcome)} · 全文覆盖 ${count(result.covered_files)}/${count(result.total_files)}<br>发现 ${count(result.findings)} · 修复 ${count(result.fixed)} · 未决 ${count(result.unresolved)}</p><p>${esc(result.summary)}</p><p class="helper">以上保留报告方声明；本轮回报闭环不等于全库全量目标已完成或未决清零。</p>`:'<p class="helper">已发起的审计在本卡留痕；维护者按带编号委托自行落盘，工作台检测后记录覆盖结果并自动闭环本轮回报。执行工具仍由陈震手动启动。</p>'}${audit.error?`<p class="work-warning">${esc(audit.error)}</p>`:''}${audit.close_error?`<p class="work-warning">已收到回报，暂未自动闭环：${esc(audit.close_error)}</p>`:''}${audit.auto_close?`<p class="helper source-path">自动回报地址：${esc(audit.return_path)}</p>`:''}<div class="work-actions"><button class="button small" data-audit-supplement="${esc(task.id)}">复制回传补充说明</button>${received?`<button class="button small" data-audit-result="${esc(task.id)}">查看完整审计回报</button><button class="button small" data-audit-history="${esc(task.id)}">查看回报版本</button>`:''}${!received && task.status!=='done'?`<button class="button small" data-audit-record="${esc(task.id)}">${audit.auto_close?'应急：登记已有回报':'登记已有审计回报'}</button>`:''}${!audit.delivered_at && !received && task.status!=='done'?`<button class="button small" data-audit-delivered="${esc(task.id)}">确认已手动交付</button>`:''}${audit.pending_digest && task.status!=='done'?`<button class="button small" data-audit-adopt="${esc(task.id)}">核对后采用当前回报</button>`:''}</div>${manualForm}</div>`;
}

function bindAuditTracking(root=document) {
  for(const action of ['supplement','result','history','delivered','adopt','record']) {
    $$(`[data-audit-${action}]`,root).forEach(button=>button.onclick=()=>run(async()=>{
      const scope=activeWorkspace;
      const id=button.dataset['audit'+action[0].toUpperCase()+action.slice(1)],task=state.tasks.find(t=>t.id===id);
      if(!task)throw new Error('当前任务已变化，请同步后核对');
      if(action==='record') {
        openTask(id);$('#audit-manual-report').open=true;$('#audit-existing-report').focus();return;
      }
      if(action==='supplement' || action==='result' || action==='history') {
        const result=await api(`/knowledge-audits/tasks/${id}`);
        if(activeWorkspace!==scope || result.workspace!==scope)throw new Error('条线已切换，请回到原条线重新读取审计回报。');
        if(action==='history') {
          showText('已接受回报版本 · '+id,result.versions.map(v=>`# 接受时间 ${v.received_at}\n摘要 ${v.digest}\n\n${v.report_text}`).join('\n\n---\n\n'),id);return;
        }
        const text=action==='result'?result.report_text.replace(/^\s*<!-- knowledge-audit-result-v[12]\s*\n[\s\S]*?\n-->\s*\n/,''):result.supplement;
        if(action==='result'){showText('完整审计回报 · '+id,text,id);return;}
        try {await writeClipboard(text);toast('回传补充说明已复制，请交给原审计窗口；无需重新审计。');}
        catch {prepareText(id+'-return-supplement.md',text,'请将补充说明交给原审计窗口。');}
        return;
      }
      if(!confirm(action==='delivered'?'确认已把本次审计交给对应执行窗口？这仅记录手动交付，不代表实际执行或完成。':'确认已核对当前报告原件并采用？已接受的旧报告快照会保留，新报告仍待验收。'))return;
      await api(`/knowledge-audits/tasks/${id}/${action}`,action==='delivered'?{revision:task.revision,confirmed:true}:{revision:task.revision,digest:task.audit_tracking.pending_digest});
      await refresh();if($('#task-dialog').open)renderTask();
    },button));
  }
  const form=$('#audit-report-form',root);
  if(form)form.onsubmit=event=>{event.preventDefault();run(async()=>{
    const task=state.tasks.find(t=>t.id===form.dataset.auditTask);
    if(!task)throw new Error('任务已变化，请同步后重新核对');
    const report=form.elements.report.value;
    if(report.length>16000)throw new Error('回报超过16000字，请使用固定文件回传；不要截断原报告。');
    await api(`/knowledge-audits/tasks/${task.id}/record-report`,{revision:task.revision,report,
      outcome:form.elements.outcome.value,summary:form.elements.summary.value,
      total_files:form.elements.total.value===''?null:Number(form.elements.total.value),
      covered_files:form.elements.covered.value===''?null:Number(form.elements.covered.value),
      confirmed:form.elements.confirmed.checked});
    await refresh();renderTask();toast(state.tasks.find(t=>t.id===task.id)?.status==='done'?'本轮回报已登记并自动闭环，实际覆盖和未决项保留。':'已有回报已登记，请查看闭环条件或等待自动处理。');
  },$('button[type=submit]',form));};
}

function renderAudit() {
  const data=state.knowledge_audits || {runs:[]};
  const existing=state.tasks.filter(t=>t.kind==='audit' && !t.audit_tracking);
  const cards=[['external','外部 Codex 审计','独立核查 · 只读知识库','由 Codex 知识库审计 Agent 全库核查内容、证据、逻辑、完整性与双链，给出审计发现和修复建议。','复制外部审计提示词'],['internal','内部 知识库维护 Agent 自审','自行核查 · 按现有权限修复','由本线 知识库维护 Agent 全库自审，并按知识维护规则修复证据明确的问题，记录实际改动、依据与未决事项。','复制 知识库维护 Agent 自审提示词']];
  setWorkspaceMarkup(businessDeskMarkup('audit')+`<details class="desk-tools" id="business-tools"${businessState('audit').tools?' open':''}><summary>准备审计委托</summary><div class="audit-page"><div class="audit-prompt-grid">${cards.map(([mode,title,caption,description,button])=>`<section class="panel audit-prompt-card"><span class="section-kicker">${caption}</span><h2>${title}</h2><p>${description}</p><div class="audit-scope"><span>当前知识库</span><p>${esc(data.root || '')}</p><small>沿用当前业务线，执行全库审计；实际覆盖以审计报告为准。</small></div>${mode==='external'?`<p class="helper">审计工作区：${esc(data.role_dir || '')}</p>`:'<p class="helper">在当前业务线的 知识库维护工作窗口执行。</p>'}<button class="button primary" data-copy-audit-prompt="${mode}">登记并${button}</button><button class="button" data-register-delivered-audit="${mode}">补登记已交付审计</button></section>`).join('')}</div><p class="audit-prompt-help">发起即留痕，提示词只需交给执行窗口一次。维护者自己把完整报告保存到本线 WPS 审计回报目录，工作台校验后自动闭环本轮回报；原卡保留全文、全量/部分覆盖和修复/未决情况。旧版进行中委托再次复制会升级回传说明，不重跑审计。</p><div class="communication-grid">${communicationLaunchMarkup('audit')}</div><p class="helper"></p>
  ${data.runs.length || existing.length ? `<details class="panel audit-legacy-records"><summary>历史审计记录 · ${data.runs.length+existing.length} 条</summary><p class="helper">保留此前的审计报告与委托记录。以下保留旧版执行记录；新审计通过上方登记，使用同一任务卡跟踪回报。</p>${data.runs.map(r=>`<article class="audit-record"><div class="review-panel-heading"><h3>${esc(r.label)}</h3><span class="tag">${date(r.created_at)}</span></div><p class="helper">${esc(r.id)} · 原委托要求仅供历史查阅</p>${r.session_id?`<a href="/workbench/#demo-record-${encodeURIComponent(r.session_id)}" target="_blank" rel="noopener noreferrer">打开原执行会话（历史） ↗</a>`:''}${r.error?`<p class="automation-error">${esc(r.error)}</p>`:''}${r.report?`<button class="button small" data-audit-report="${esc(r.id)}">查看原审计报告</button>`:''}${['failed','uncertain'].includes(r.status)?`<button class="button small" data-audit-resolve="${esc(r.id)}">核实原执行情况</button>`:''}<details><summary>原委托提示词（历史）</summary><pre>${esc(r.prompt)}</pre></details></article>`).join('')}${existing.map(t=>`<button class="history-row" data-task="${esc(t.id)}"><span>${esc(t.title)}<small>${esc(t.id)} · ${esc(labels.statuses[t.status])}</small></span><span>查看原委托 →</span></button>`).join('')}</details>`:''}</div></details>`);
  bindCommunicationLaunch();
  $$('[data-copy-audit-prompt]').forEach(button=>button.onclick=event=>run(()=>copyKnowledgeAudit(button.dataset.copyAuditPrompt),event.currentTarget));
  $$('[data-register-delivered-audit]').forEach(button=>button.onclick=event=>run(()=>copyKnowledgeAudit(button.dataset.registerDeliveredAudit,true),event.currentTarget));
  $$('[data-audit-report]').forEach(button=>button.onclick=()=>{const record=data.runs.find(r=>r.id===button.dataset.auditReport);showText('历史审计报告',record.report,record.id);});
  $$('[data-audit-resolve]').forEach(button=>button.onclick=()=>{auditContext={workspace:activeWorkspace,id:button.dataset.auditResolve};$('#audit-recovery-form').reset();$('#audit-recovery-id').textContent=auditContext.id;$('#audit-recovery').showModal();});
}

function renderTrash() {
  const tasks=state.trash_tasks || [];
  setWorkspaceMarkup(`<section class="panel"><h2>已撤销的任务 · ${tasks.length}</h2><p>误建或不再执行的工作放在这里。恢复后回到原状态，原件保持当前位置，操作历史继续保留。永久删除后卡片不可恢复，原件不受影响；后台保留必要防重复与追溯记录。</p></section>${tasks.map(t=>`<article class="panel trash-record"><div class="review-panel-heading"><h3>${esc(t.title)}</h3><div class="batch-actions"><button class="button" data-restore-task="${esc(t.id)}">恢复任务</button><button class="button" data-purge-task="${esc(t.id)}">永久删除</button></div></div><p class="helper">${esc(t.id)} · ${esc(labels.kinds[t.kind])} · 原状态：${esc(labels.statuses[t.status])}<br>撤销于 ${appearedAt(t.removed_at)}</p><p>${esc(t.removal_reason)}</p>${t.summary ? `<p>原结论：${esc(t.summary)}</p>` : ''}<button class="button small" data-trash-history="${esc(t.id)}">查看保留的操作记录</button></article>`).join('') || empty('垃圾箱是空的','任务详情中的“撤销任务”会将卡片移到这里。')}`);
  $$('[data-restore-task]').forEach(b=>b.onclick=()=>run(async()=>{
    const task=tasks.find(t=>t.id===b.dataset.restoreTask);
    await api(`/tasks/${task.id}/trash`,{revision:task.revision,restore:true});await refresh();toast(task.kind==='audit'?'已恢复到知识库审计模块':'已恢复任务至原状态');
  },b));
  $$('[data-purge-task]').forEach(b=>b.onclick=()=>run(async()=>{
    const task=tasks.find(t=>t.id===b.dataset.purgeTask),scope=activeWorkspace;
    if(!confirm(`永久删除卡片“${task.title}”（${task.id}）？\n删除后无法恢复；不会删除或移动 WPS 原件。后台保留必要防重复与追溯记录。`))return;
    if(scope!==activeWorkspace)throw new Error('条线已切换，请重新操作');
    await api(`/tasks/${task.id}/purge`,{revision:task.revision,confirm:true});
    batchSelected.delete(task.id);await refresh();toast('卡片已永久删除，原件未改变');
  },b));
  $$('[data-trash-history]').forEach(b=>b.onclick=()=>run(async()=>{
    const result=await api(`/tasks/${b.dataset.trashHistory}/retained-history`);
    showText('已撤销任务 · 操作记录',result.events.map(e=>`${appearedAt(e.created_at)} · ${e.detail}`).join('\n'),b.dataset.trashHistory);
  },b));
}

function openTrash(task) {
  trashContext={id:task.id,revision:task.revision,workspace:activeWorkspace};
  $('#task-trash-form').reset();$('#task-trash-title').textContent=task.title;
  $('#task-trash-files').textContent=`${task.id} · 当前${labels.statuses[task.status]}。关联 ${taskFiles(task).length} 份原件；移入垃圾箱不移动或删除原件。`;
  $('#task-trash').showModal();
}

document.addEventListener('DOMContentLoaded',()=>{
  $('#audit-recovery-form').onsubmit=e=>{e.preventDefault();run(async()=>{
    if(auditContext?.workspace!==activeWorkspace)throw new Error('请在当前条线重新打开核实窗口');
    await api('/knowledge-audits/resolve',{id:auditContext.id,note:$('#audit-recovery-note').value,stopped:$('#audit-recovery-stopped').checked});
    $('#audit-recovery').close();await refresh();toast('已保留核实记录，原批次不会重新提交');
  },$('#audit-recovery-submit'));};
  $('#task-trash-form').onsubmit=e=>{e.preventDefault();run(async()=>{
    if(trashContext?.workspace!==activeWorkspace)throw new Error('请在当前条线重新打开任务');
    await api(`/tasks/${trashContext.id}/trash`,{revision:trashContext.revision,restore:false,reason:$('#task-trash-reason').value});
    $('#task-trash').close();$('#task-dialog').close();await refresh();toast('已撤销并移入垃圾箱，可以恢复');
  },$('#task-trash-submit'));};
});

