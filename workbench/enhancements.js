"use strict";

const collectionHistoryCache = new Map();
const testExecutionTargets = new Map();
function testExecutionTarget() {
  if(!testExecutionTargets.has(activeWorkspace)) {
    let target='windows';
    try { const saved=localStorage.getItem('yuandu.test.execution.'+activeWorkspace);if(['windows','mac'].includes(saved))target=saved; } catch {}
    testExecutionTargets.set(activeWorkspace,target);
  }
  return testExecutionTargets.get(activeWorkspace);
}
function testExecutionControl(id) {
  return `<div class="test-export-controls"><label>测试交接执行端<select id="${id}" aria-label="测试交接执行端">${options({windows:'Windows',mac:'MAC'},testExecutionTarget())}</select></label><p class="helper" data-test-target-note>${testExecutionTarget()==='mac'?'MAC 版附完整任务书；报告在 Agent 窗口回传，再人工移交本线已测试。':'Windows 版按本线原件与报告目录交接。'}执行端只用于测试提示词。</p></div>`;
}
function bindTestExecutionControl(id) {
  const control=$('#'+id);
  if(!control)return;
  control.onchange=()=>{
    if(!['windows','mac'].includes(control.value))return;
    testExecutionTargets.set(activeWorkspace,control.value);
    try {localStorage.setItem('yuandu.test.execution.'+activeWorkspace,control.value);} catch {}
    $$('[aria-label="测试交接执行端"]').forEach(item=>item.value=control.value);
    $$('[data-test-target-note]').forEach(item=>item.textContent=control.value==='mac'?'MAC 版附完整任务书；报告在 Agent 窗口回传，再人工移交本线已测试。执行端只用于测试提示词。':'Windows 版按本线原件与报告目录交接。执行端只用于测试提示词。');
  };
}
function collectionCoverageMarkup(context) {
  const growth=(context.evidence || []).flatMap(item=>(item.rows || []).filter(row=>row.kind==='coverage').map(row=>({name:item.name,...row})));
  return `<details class="panel"><summary>近7天探索分工与知识回报依据</summary><p class="helper">已生成与已回传分别统计；不等于 Agent 已启动或完成入库。大纲外方向仍可探索，未归属报告照常进入任务流转。</p><div class="collection-coverage-grid">${(context.focus_coverage || []).map(item=>`<p><strong>${esc(item.focus)}</strong><br>生成 ${item.issued} 份 · 有可读编号回报 ${item.returned} 份</p>`).join('') || '<p>暂无可关联的近期指令。</p>'}</div><h3>维护者实际台账摘录</h3><p class="helper">以下仅为近两日固定台账的原文线索；没有摘录不代表没有生长，不按闭环数推算新增知识。渠道与证据质量请按原报告核实。</p>${growth.map(row=>`<p class="helper">${esc(row.name)} · L${row.line}<br>${esc(row.text)}</p>`).join('') || '<p class="helper">当前没有可用台账摘录，完整处理结论以本线 知识库维护 Agent 的实际回报为准。</p>'}</details>`;
}
function recordedActor(actor) {
  return {system:'系统',chen:'陈震',pi:'知识库维护者（历史）',trae:'知识库维护 Agent',codex:'Codex 平台',pm:'项目经理席 · pm',rd:'研发对接席 · rd',xuanzi:'协调席 · xuanzi'}[actor] || '记录者';
}
function delegateCloseStatusMarkup() {
  const policy=state.delegate_close;
  if(!policy)return '';
  return `<section class="panel process"><h3>Bot 代点归档 · ${policy.delegate_close_enabled?'总闸开启':'总闸关闭'}</h3><p>允许演员：${(policy.delegate_close_actors || []).map(esc).join('、')}。仅本机接口，需独立代点凭据；与采集自动移交开关分立。</p><p class="helper">${policy.policy_error?'配置异常，按关闸处理。':'人工闭环按钮不受此闸影响。'} 代点是验收后的显式确认，撤回闭环不回移原件。</p></section>`;
}
function archiveDiagnosticsMarkup() {
  const records=state.archive_health || [];
  return `<details class="panel archive-history-note"${records.length?' open':''}><summary>归档原件可追溯性 · ${records.length} 项需核对</summary><p class="helper">首次巡检最多1000份；此后每15分钟复核最久未检查的200份。保留登记摘要与卡片状态；历史缺口不重新进入待我处理，不按同名文件猜测修复。</p>${records.map(item=>`<p><strong>${esc(item.name)}</strong><br>${esc(item.state==='changed'?'正文已变化':'目前不可读')} · ${esc(item.reason)}<br><small>核对于 ${appearedAt(item.checked_at)} · 资料 ${item.artifact_id}</small>${state.links.filter(link=>link.artifact_id===item.artifact_id && state.tasks.some(task=>task.id===link.task_id)).map(link=>` <button class="button small" data-task="${esc(link.task_id)}">${esc(link.task_id)}</button>`).join('')}</p>`).join('') || '<p class="helper">已巡检的归档原件暂未发现身份或读取异常。</p>'}</details>`;
}
function listPagination(total,size=30) {
  const pages=Math.max(1,Math.ceil(total/size));historyPage=Math.min(historyPage,pages);
  return `<div class="history-pagination"><button class="button small" data-history-page="${historyPage-1}"${historyPage===1?' disabled':''}>上一页</button><span>第 ${historyPage} / ${pages} 页 · 每页 ${size} 项</span><button class="button small" data-history-page="${historyPage+1}"${historyPage===pages?' disabled':''}>下一页</button></div>`;
}
function recentBatchesMarkup() {
  const batches=state.batches || [];
  if(!batches.length)return '<p class="helper">本版开始记录实际批次；历史卡片保留原编号，不推测补建批次。</p>';
  return `<details class="panel"><summary>最近批量交接与闭环 · ${batches.length} 次</summary>${batches.slice(0,10).map(batch=>{
    const items=batch.items.map(item=>({item,task:state.tasks.find(task=>task.id===item.id)}));
    const active=items.filter(({task})=>task?.status==='active' && batchSelectable(task));
    const closed=items.filter(({item,task})=>item.status==='done' && task?.status==='done' && task.closure_reopen_eligible && task.last_closure_event===item.closure_event);
    const sameGroup=rows=>new Set(rows.map(({task})=>batchGroup(task))).size===1;
    return `<article class="batch-record"><strong>${esc(batch.id)} · ${esc({start:'批量交接',close:'批量闭环',reopen:'撤回闭环'}[batch.action])} · ${batch.items.length} 项</strong><p class="helper">${appearedAt(batch.created_at)} · 当前进行中 ${active.length} 项</p><div class="batch-actions">${active.length && sameGroup(active)?`<button class="button small" data-batch-recopy="${esc(batch.id)}">重复制本批进行中 · ${active.length} 项</button>`:''}${batch.action==='close' && closed.length && sameGroup(closed)?`<button class="button small" data-batch-reopen="${esc(batch.id)}">核对并撤回本次闭环 · ${closed.length} 项</button>`:''}</div><details><summary>查看本批卡号与逐项结果</summary>${items.map(({item,task})=>`<p>${task?`<button class="button small" data-task="${esc(task.id)}">${esc(task.id)} · ${esc(taskDisplayTitle(task))}</button>`:esc(item.id)+' · 已移出可操作列表'}<small> · 当时 ${esc(labels.statuses[item.status] || '未成功')} · 当前 ${esc(task?labels.statuses[task.status]:'保留历史')}</small></p>`).join('')}</details></article>`;
  }).join('')}<p class="helper">仅按已记录的实际成员查找；重复制不重新派发，撤回只恢复卡片，原件仍在归档位置。</p></details>`;
}
function bindRecentBatches() {
  $$('[data-batch-recopy]').forEach(button=>button.onclick=event=>run(async()=>{
    const batch=state.batches.find(item=>item.id===button.dataset.batchRecopy);
    const tasks=batch.items.map(item=>state.tasks.find(task=>task.id===item.id)).filter(task=>task?.status==='active' && batchSelectable(task));
    const targets=new Set(batch.items.filter(item=>tasks.some(task=>task.id===item.id)).map(item=>item.execution_target));
    const target=targets.size===1 && ['windows','mac'].includes([...targets][0]) ? [...targets][0] : null;
    await copyActiveBatch(tasks,target);
  },event.currentTarget));
  $$('[data-batch-reopen]').forEach(button=>button.onclick=()=>{
    const batch=state.batches.find(item=>item.id===button.dataset.batchReopen);
    const tasks=batch.items.filter(item=>item.status==='done').map(item=>({item,task:state.tasks.find(task=>task.id===item.id)}))
      .filter(({item,task})=>task?.status==='done' && task.closure_reopen_eligible && task.last_closure_event===item.closure_event).map(({task})=>task);
    openClosureReopen(tasks);
  });
}


// Business workspaces project the same server-owned tasks; they never create a second queue.
const businessDrafts = new Map();
let businessIndexState = null, businessIndex = null;
let monitorOperations = false;
function businessState(module=view) {
  const key=activeWorkspace+':'+module;
  if(!businessDrafts.has(key))businessDrafts.set(key,{category:'all',stage:'open',query:'',text:'',page:1,tools:false});
  return businessDrafts.get(key);
}
function workIndex() {
  if(businessIndexState!==state) {
    const artifacts=new Map(state.artifacts.map(a=>[a.id,a])),sources=new Map(),files=new Map();
    for(const row of [...state.links,...(state.references || [])]) {
      const artifact=artifacts.get(row.artifact_id);if(!artifact)continue;
      if(!sources.has(row.task_id)){sources.set(row.task_id,new Set());files.set(row.task_id,new Map());}
      sources.get(row.task_id).add(artifact.source);files.get(row.task_id).set(artifact.id,artifact);
    }
    businessIndex={sources,files,meetings:new Map((state.discussions||[]).map(m=>[m.task_id,m]))};businessIndexState=state;
  }
  return businessIndex;
}
function workTaskCategory(task) {
  const meeting=workIndex().meetings.get(task.id);
  return task.discussion_type || meeting?.category || 'temporary';
}
function businessTasks(module) {
  return state.tasks.filter(task=>{
    const communication=task.kind==='discussion';
    if(module==='delivery')return task.kind==='delivery';
    if(module==='communication')return communication;
    if(module==='audit')return task.kind==='audit' || communication && workTaskCategory(task)==='audit';
    if(module==='testing')return task.kind==='test' || task.kind==='research' && task.batch_category==='test_return_research';
    return module==='automation' && task.kind==='research' && task.batch_category==='collection_processing';
  });
}
function workHome(task) {
  if(task.kind==='delivery')return 'delivery';
  if(task.kind==='audit' || task.kind==='discussion' && workTaskCategory(task)==='audit')return 'audit';
  if(task.kind==='discussion')return 'communication';
  if(task.kind==='test' || task.kind==='research' && task.batch_category==='test_return_research')return 'testing';
  return task.kind==='research' && task.batch_category==='collection_processing'?'automation':'board';
}
function businessCategory(task,module) {if(module==='delivery')return task.delivery?.branch || 'legacy';return module==='audit' ? task.kind==='audit'?'audit_task':'audit_discussion' : ['automation','testing'].includes(module) ? task.kind==='test'?'test':task.batch_category : workTaskCategory(task)==='delivery'?'product':workTaskCategory(task);}
function businessIncoming(module) {
  if(module==='delivery')return [];
  const sources=module==='communication'?['communication','content_communication','audit_communication']:module==='audit'?['audit_communication','audit_returns']:module==='testing'?['pending_tests','completed_tests']:['intelligence'];
  return state.source_events.filter(e=>e.state==='new' && !e.task_id && sources.includes(e.source)).sort((a,b)=>Number(b.id)-Number(a.id));
}
function renderTesting() {
  const draft=businessState('testing');
  setWorkspaceMarkup(businessDeskMarkup('testing')+`<details class="desk-tools" id="business-tools"${draft.tools?' open':''}><summary>测试交接说明与任务书模板</summary><div class="testing-guide"><article><h3>1 · 执行测试</h3><p>从待开始卡选择本次真实执行端，确认开始并复制完整交接单。Windows/MAC 只决定提示词与交付说明，不切换负责人，也不自动启动 Agent。</p></article><article><h3>2 · 报告回传</h3><p>执行方保留实际证据。Windows 按本线“已测试”目录回传；MAC 在当前窗口给出报告，由你人工转入本线 Windows 已测试，不猜造跨端路径。</p></article><article><h3>3 · 复核与闭环</h3><p>测试执行与测试回报研究分别处理。知识库维护 Agent 核对结果，实际完成后由你确认闭环；归档、共享原件及撤回闭环规则沿用现有保护。</p></article></div><p class="helper">新的测试清单仍由本线知识库维护方制定；模板复制不创建任务、不执行测试、不移动原件。</p><button class="button" id="test-template">查看并复制测试任务模板</button></details>`);
}
function workTaskCard(task,selectable=false,monitor=false) {
  const files=[...(workIndex().files.get(task.id)?.values() || [])],warnings=taskAttention(task),result=state.results?.find(r=>r.task_id===task.id);
  const category=taskKindLabel(task),home=workHome(task);
  return `<article class="work-card batch-task${task.delivery?' delivery-'+task.delivery.branch:''}${batchSelected.has(task.id)?' selected':''}" data-motion-task="${esc(task.id)}" data-motion-status="${esc(task.status)}">${selectable?`<label class="batch-task-select"><input type="checkbox" data-batch-select="${esc(task.id)}"${batchSelected.has(task.id)?' checked':''}>选入同类批量处理</label>`:''}<div class="card-meta"><span class="tag">${esc(category)}</span><span class="tag">${esc(labels.statuses[task.status])}</span>${warnings.length?`<span class="tag">需核对 ${warnings.length}</span>`:''}</div><h3><button class="review-task-title" data-task="${esc(task.id)}">${esc(taskDisplayTitle(task))}</button></h3><p>本次处理：${esc(executorLabel(task.owner,task))}</p>${auditTrackingMarkup(task)}${files.length?`<p class="work-source" title="${esc(files[0].name)}">${esc(files[0].name)}${files.length>1?' · 共 '+files.length+' 份':''}</p>`:''}${warnings.length?`<p class="work-warning">${esc(warnings[0])}</p>`:''}${task.status==='done' && !task.audit_tracking && (result?.conclusion || task.summary)?`<p>${esc((result?.conclusion || task.summary).slice(0,160))}</p>`:''}<small>${esc(task.id)} · ${esc(date(task.updated_at))}</small><div class="work-actions"><button class="button ${monitor?'':'primary'} small" data-task="${esc(task.id)}">${monitor?'查看任务':task.status==='done'?'查看结果 / 撤回闭环':task.status==='pending'?'开始 / 交接':'处理 / 闭环'}</button>${monitor && home!=='board'?`<button class="button primary small" data-work-home="${esc(task.id)}">进入${home==='delivery'?'交付':home==='audit'?'审计':home==='communication'?'沟通':home==='testing'?'测试':'采集'}工作区</button>`:`<button class="button small" data-case="${esc(task.id)}">来源与回件</button>`}</div></article>`;
}
function businessBatchToolbar(tasks) {
  const visibleBatch=tasks.filter(batchSelectable);
  const batchBar = visibleBatch.length ? `<div class="batch-bar${batchSelected.size ? ' has-selection' : ''}"><div><strong>任务批量流转</strong><span id="batch-count">已选 ${batchSelected.size} 项，当前可选 ${visibleBatch.length} 项</span></div><div class="batch-actions">${visibleBatch.some(t=>t.status==='pending') ? `<button class="button primary small" id="batch-dispatch"${selectedPendingBatch().length ? '' : ' disabled'}>${selectedPendingBatch()[0]?.delivery?.branch==='knowledge'?'批量移交 Pi 执行':'批量开始并复制交接单'} · ${selectedPendingBatch().length} 项</button>` : ''}${visibleBatch.some(t=>t.status==='active') ? `<button class="button primary small" id="batch-copy"${selectedCopyBatch().length ? '' : ' disabled'}>重新复制进行中交接单 · ${selectedCopyBatch().length} 项</button>` : ''}${visibleBatch.some(t=>t.batch_close_eligible ?? (t.status==='active' && batchEligible(t))) ? `<button class="button small" id="batch-close"${selectedClosingBatch().length ? '' : ' disabled'}>批量闭环已选任务 · ${selectedClosingBatch().length} 项</button>` : ''}<button class="button small" id="batch-clear">清空选择</button></div><p class="helper">按类别分组全选；内部反哺与最终交付分别多选、分别交接，交付结果逐卡核对后，可同类多选拖到闭环并确认。采集处理与测试报告研究也须分开。待开始可批量开始；已在外部处理完成的采集/报告研究可确认后直接批量闭环；进行中可重复制。测试保留原批量闭环规则；沟通批量闭环会列出本次处理卡号，由你确认本方已处理完成。</p></div>` : '';
  return batchBar;
}
function businessDeskMarkup(module) {
  const draft=businessState(module),all=businessTasks(module),incoming=businessIncoming(module);
  const categories=module==='delivery'?{all:'全部',knowledge:'内部反哺',html:'Codex 最终交付',legacy:'其他交付'}:module==='communication'?{all:'全部',audit:'审计沟通',content:'内容沟通',product:'产品沟通',temporary:'临时沟通'}:module==='audit'?{all:'全部',audit_discussion:'发现与整改沟通',audit_task:'审计委托与回报'}:module==='testing'?{all:'全部',test:'测试执行',test_return_research:'测试回报研究'}:{all:'全部',collection_processing:'采集报告处理'};
  const filtered=all.filter(t=>(draft.category==='all' || businessCategory(t,module)===draft.category) && `${taskDisplayTitle(t)} ${t.id} ${t.description}`.toLowerCase().includes(draft.query.toLowerCase()));
  const tasks=filtered.filter(t=>draft.stage==='done'?t.status==='done':t.status!=='done');
  const allowed=new Set(tasks.filter(batchSelectable).map(t=>t.id));for(const id of batchSelected)if(!allowed.has(id))batchSelected.delete(id);
  const [title,description,action]=module==='delivery'?['交付处理与知识反哺','报告自动生成两张待开始卡；蓝色内部反哺、紫色 HTML 交付，各自处理和闭环。','交付流转说明']:module==='communication'?['沟通来件与处理','审计、内容和产品来件都在这里处理；单方一次一张卡，完成后闭环。','发起一次沟通']:module==='audit'?['审计发现与复核','发起留痕，维护者自行落盘；工作台校验后自动闭环本轮回报，保留实际覆盖和遗留情况。','准备审计委托']:module==='testing'?['测试执行与报告复核','待测清单、执行交接、报告回传与知识维护复核，在这里按卡片处理。','测试交接说明']:['采集报告与研究','准备采集指令、核验采集报告、沉淀知识，实际完成后确认归档。','准备采集指令'];
  const stats=[module==='delivery'?['交付报告',(state.delivery?.reports || []).filter(r=>r.branch_count).length]:['待判读来件',incoming.length],['待开始',all.filter(t=>t.status==='pending').length],['处理中',all.filter(t=>['active','review','waiting'].includes(t.status)).length],['已闭环',all.filter(t=>t.status==='done').length]];
  const lanes=[['待开始','pending',['pending']],['处理中','active',['active','review','waiting']],['最近闭环','done',['done']]];
  const closed=filtered.filter(t=>t.status==='done').sort((a,b)=>String(b.updated_at).localeCompare(String(a.updated_at)));
  const pages=Math.max(1,Math.ceil(closed.length/24));draft.page=Math.max(1,Math.min(draft.page,pages));
  return `<section class="business-desk" data-business-module="${module}"><header class="desk-head"><div><span class="section-kicker">${esc(state.workspace.prefix)} · 同一任务，同步流转</span><h2>${title}</h2><p>${description}</p></div><div class="actions"><button class="button primary" data-work-tools>${action}</button><button class="button" id="work-scan">同步文件与卡片</button></div></header><div class="desk-stats">${stats.map(([label,count])=>`<div class="desk-stat"><span>${label}</span><strong>${count}</strong></div>`).join('')}</div>${incoming.length?`<details class="panel desk-incoming" open><summary>新来件 · ${incoming.length} 项</summary><p class="helper">先判读路由或仅知悉；关联后继续在下方任务中处理。</p>${incoming.map(sourceEventRow).join('')}</details>`:''}<div class="desk-toolbar"><div class="desk-filters" role="group" aria-label="工作分类">${Object.entries(categories).map(([id,label])=>`<button class="button small ${draft.category===id?'primary':''}" data-work-category="${id}" aria-pressed="${draft.category===id}">${label}</button>`).join('')}</div><form class="desk-search" id="work-search-form"><input id="work-search" aria-label="搜索本模块任务" placeholder="任务名或卡号" value="${esc(draft.text)}"><button class="button small" type="submit">搜索</button>${draft.query?'<button class="button small" type="button" data-work-clear-search>清除</button>':''}</form></div><div class="desk-stage-tabs"><button class="button small ${draft.stage==='open'?'primary':''}" data-work-stage="open">当前处理 · ${filtered.filter(t=>t.status!=='done').length}</button><button class="button small ${draft.stage==='done'?'primary':''}" data-work-stage="done">闭环记录 · ${closed.length}</button><span class="helper">勾选多张后，拖动任意选中卡片一起流转；松开后确认</span></div>${draft.stage==='open'?businessBatchToolbar(tasks):''}${tasks.some(t=>t.kind==='test') && draft.stage==='open'?testExecutionControl('batch-test-execution-target'):''}${draft.stage==='done'?`<div class="work-history-dropzones" role="group" aria-label="拖动已闭环卡片恢复处理"><div data-drop-status="pending">拖到这里 → 恢复待开始<br><small>松开后确认撤回闭环</small></div><div data-drop-status="active">拖到这里 → 恢复进行中<br><small>原件不回移，确认后生效</small></div></div><div class="work-history">${closed.slice((draft.page-1)*24,draft.page*24).map(t=>workTaskCard(t)).join('') || '<p class="desk-empty">当前筛选没有闭环记录。</p>'}</div><div class="history-pagination"><button class="button small" data-work-page="${draft.page-1}"${draft.page===1?' disabled':''}>上一页</button><span>${draft.page} / ${pages}</span><button class="button small" data-work-page="${draft.page+1}"${draft.page===pages?' disabled':''}>下一页</button></div>`:`<div class="business-board${lanes.length===1?' single-lane':''}">${lanes.map(([label,key,statuses])=>{const items=key==='done'?closed.slice(0,3):tasks.filter(t=>statuses.includes(t.status));return `<section class="column ${key}" data-drop-status="${key}"><div class="column-head"><h3>${label}</h3><span class="column-count">${key==='done'?closed.length:items.length}</span></div>${key!=='done'?columnBatchControls(items,key):''}${items.map(t=>workTaskCard(t,key!=='done' && batchSelectable(t))).join('') || '<p class="desk-empty">当前没有这类任务。<br>来件和处理状态会在同步后更新。</p>'}${key==='done' && closed.length?'<button class="button small" data-work-stage="done">查看全部闭环记录</button>':''}</section>`;}).join('')}</div>`}</section>`;
}
function monitorModulesMarkup() {
  return `<div class="monitor-modules">${[['communication','沟通工作区'],['automation','采集工作区'],['testing','测试工作区'],['audit','审计工作区'],['delivery','交付工作区']].map(([module,label])=>{const tasks=businessTasks(module);return `<article class="monitor-module"><h3>${label}</h3><p>待开始 ${tasks.filter(t=>t.status==='pending').length} · 处理中 ${tasks.filter(t=>['active','waiting','review'].includes(t.status)).length}<br>新来件 ${businessIncoming(module).length} · 已闭环 ${tasks.filter(t=>t.status==='done').length}</p><button class="button small" data-go-view="${module}">进入工作区</button></article>`;}).join('')}</div><p class="helper">审计沟通在沟通与审计工作区共享同一卡号；模块计数不相加作为任务总数。</p><details class="monitor-advanced"${monitorOperations?' open':''}><summary>兼容操作入口 · 需要时启用全局批量操作</summary><button class="button small" id="monitor-operate">${monitorOperations?'收起全局操作':'启用全局操作'}</button></details>`;
}
function bindBusinessDesk() {
  const module=$('[data-business-module]')?.dataset.businessModule;
  const tools=$('#business-tools');
  if(tools){const toolState=businessState(view);tools.ontoggle=()=>{toolState.tools=tools.open;};}
  $$('[data-work-tools]').forEach(button=>button.onclick=()=>{const details=$('#business-tools');if(details){details.open=true;details.scrollIntoView({block:'start',behavior:'smooth'});}});
  if(module) {
    const draft=businessState(module);
    for(const [attribute,key] of [['workCategory','category'],['workStage','stage'],['workPage','page']]) {
      const selector='[data-'+attribute.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())+']';
      $$(selector).forEach(button=>button.onclick=()=>{draft[key]=key==='page'?Number(button.dataset[attribute]):button.dataset[attribute];if(key!=='page')draft.page=1;batchSelected.clear();clearClosureReopenSelection();render();});
    }
    $('#work-search').oninput=e=>{draft.text=e.target.value;};
    $('#work-search-form').onsubmit=e=>{e.preventDefault();draft.query=draft.text.trim();draft.page=1;batchSelected.clear();render();};
    $('[data-work-clear-search]')?.addEventListener('click',()=>{draft.query='';draft.text='';draft.page=1;batchSelected.clear();clearClosureReopenSelection();render();});
  }
  $$('[data-work-home]').forEach(button=>button.onclick=()=>{const task=state.tasks.find(t=>t.id===button.dataset.workHome);if(!task)return;view=workHome(task);batchSelected.clear();render();openTask(task.id);});
  $('#monitor-operate')?.addEventListener('click',()=>{monitorOperations=!monitorOperations;batchSelected.clear();clearClosureReopenSelection();render();});
}


// Motion reads rendered identity only. It never calls business APIs or delays their handlers.
const workbenchMotion = (()=>{
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover: hover) and (pointer: fine)');
  const active=new Set(),playing=new WeakMap(),status=new Map(),counts=new Map(),pendingDetails=new WeakMap();
  let signature='',scope='',origin=null,initialized=false,frame=0,surface=null;
  const enabled=()=>!reduced.matches && !document.hidden;
  function animate(element,frames,options={}) {
    if(!enabled() || !element?.isConnected || !element.animate)return;
    try {
      playing.get(element)?.cancel();
      const animation=element.animate(frames,{duration:230,easing:'cubic-bezier(.2,.8,.2,1)',...options});
      playing.set(element,animation);active.add(animation);
      const cleanup=()=>{active.delete(animation);if(playing.get(element)===animation)playing.delete(element);};
      animation.finished.then(cleanup,cleanup);return animation;
    } catch { /* Presentation must never block application actions. */ }
  }
  function render(root,workspace,view) {
    scope=workspace;
    for(const animation of active)if(!animation.effect?.target?.isConnected)animation.cancel();
    const category=root.querySelector('[data-work-category][aria-pressed="true"]')?.dataset.workCategory || '';
    const stage=root.querySelector('[data-work-stage].primary')?.dataset.workStage || '';
    const query=root.querySelector('#work-search,#search')?.value || '';
    const page=root.querySelector('.history-pagination span')?.textContent.split('/')[0].trim() || '';
    const next=[workspace,view,category,stage,query,page].join('|'),enter=next!==signature;signature=next;
    if(enter) {
      const elements=[...root.querySelectorAll('.desk-head,.desk-stats,.desk-toolbar,.work-card,.audit-prompt-card,.collection-mode,.monitor-module')]
        .filter(el=>{const r=el.getBoundingClientRect();return r.bottom>0 && r.top<innerHeight;}).slice(0,12);
      (elements.length?elements:[root]).forEach((el,i)=>animate(el,[{opacity:.3,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],{delay:Math.min(i*15,90),duration:240}));
    }
    for(const card of root.querySelectorAll('[data-motion-task]')) {
      const key=workspace+':'+card.dataset.motionTask,value=card.dataset.motionStatus;
      if(!enter && status.has(key) && status.get(key)!==value)animate(card,[{boxShadow:'0 0 0 3px rgba(115,160,135,.30)'},{boxShadow:'0 0 0 0 rgba(115,160,135,0)'}],{duration:550});
      status.set(key,value);
    }
    for(const stat of root.querySelectorAll('.desk-stat')) {
      const label=stat.querySelector('span')?.textContent,number=stat.querySelector('strong'),key=workspace+':'+view+':'+label;
      if(number && !enter && counts.has(key) && counts.get(key)!==number.textContent)animate(number,[{opacity:.55,transform:'translateY(3px)'},{opacity:1,transform:'translateY(0)'}]);
      if(number)counts.set(key,number.textContent);
    }
    if(status.size>1200)status.clear();
  }
  function clearSurface() {
    if(surface){for(const name of ['--light-x','--light-y','--tilt-x','--tilt-y'])surface.style.removeProperty(name);surface=null;}
    if(frame){cancelAnimationFrame(frame);frame=0;}
  }
  function init() {
    if(initialized)return;initialized=true;
    document.addEventListener('click',event=>{
      const button=event.target.closest('button,summary');if(!button || button.disabled)return;
      const task=button.dataset.task;
      if(task)origin={rect:button.getBoundingClientRect(),task,scope,time:performance.now()};
      const details=button.closest('summary')?.parentElement || (button.matches('[data-work-tools]')?document.querySelector('#business-tools'):null);
      if(details?.tagName==='DETAILS')pendingDetails.set(details,performance.now());
      if(button.matches('.button') && !button.matches('[data-close]'))animate(button,[{transform:'scale(.97)'},{transform:'scale(1.012)',offset:.6},{transform:'scale(1)'}],{duration:210});
    },true);
    document.addEventListener('toggle',event=>{
      const details=event.target;if(details.tagName!=='DETAILS' || !details.open || performance.now()-(pendingDetails.get(details) ?? -Infinity)>1200)return;
      pendingDetails.delete(details);
      [...details.children].filter(el=>el.tagName!=='SUMMARY').slice(0,6).forEach((el,i)=>animate(el,[{opacity:.3,transform:'translateY(-4px)'},{opacity:1,transform:'translateY(0)'}],{delay:i*12,duration:200}));
    },true);
    const dialogObserver=new MutationObserver(records=>{
      for(const {target} of records){if(!target.open)continue;
        const mobile=matchMedia('(max-width:640px)').matches;
        let transform=mobile?'translateY(24px) scale(.995)':'translateY(10px) scale(.975)',options={};
        const task=target.querySelector('#task-detail .eyebrow')?.textContent;
        if(!mobile && origin && origin.scope===scope && performance.now()-origin.time<1000 && task?.startsWith(origin.task)){
          const r=target.getBoundingClientRect(),x=Math.max(0,Math.min(100,100*(origin.rect.left+origin.rect.width/2-r.left)/r.width)),y=Math.max(0,Math.min(100,100*(origin.rect.top-r.top)/r.height));
          options={transformOrigin:`${x}% ${y}%`};
        }
        animate(target,[{opacity:0,transform,...options},{opacity:1,transform:'translateY(0) scale(1)',...options}],{duration:250});origin=null;
      }
    });
    document.querySelectorAll('dialog').forEach(dialog=>dialogObserver.observe(dialog,{attributes:true,attributeFilter:['open']}));
    const toast=document.querySelector('#toast');if(toast)new MutationObserver(()=>{if(!toast.hidden)animate(toast,[{opacity:0,transform:'translateY(8px) scale(.98)'},{opacity:1,transform:'translateY(0) scale(1)'}]);}).observe(toast,{attributes:true,attributeFilter:['hidden']});
    document.addEventListener('pointermove',event=>{
      if(!fine.matches || !enabled())return;
      const card=event.target.closest('.desk-stat,.monitor-module,.collection-mode,.audit-prompt-card');
      if(card!==surface)clearSurface();if(!card)return;surface=card;if(frame)cancelAnimationFrame(frame);
      const x=event.clientX,y=event.clientY;
      frame=requestAnimationFrame(()=>{frame=0;if(!card.isConnected || surface!==card || !enabled())return;const r=card.getBoundingClientRect(),px=Math.max(0,Math.min(1,(x-r.left)/r.width)),py=Math.max(0,Math.min(1,(y-r.top)/r.height));card.style.setProperty('--light-x',`${px*100}%`);card.style.setProperty('--light-y',`${py*100}%`);if(card.matches('.desk-stat')){card.style.setProperty('--tilt-x',`${(.5-py)*1.4}deg`);card.style.setProperty('--tilt-y',`${(px-.5)*1.4}deg`);}});
    },{passive:true});
    document.addEventListener('pointerout',event=>{if(surface && (!(event.relatedTarget instanceof Node) || !surface.contains(event.relatedTarget)))clearSurface();},{passive:true});
    const stop=()=>{for(const animation of active)animation.cancel();clearSurface();};
    reduced.addEventListener('change',stop);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  }
  return {render,init};
})();
