"use strict";
const FLOW_BATCH_LIMIT = 50;
const REMOTE_WORKBENCH = location.hostname === 'aw.tokensteer.com';
let activeStateRefreshes = 0;

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const labels = {
  kinds: {research: "研究沉淀", test: "模型测试", delivery: "客户交付", discussion: "临时沟通", collection: "情报采集", platform: "平台维护", audit: "知识库审计"},
  auditOutcomes: {complete: "全量完成", partial: "部分覆盖", stopped: "中止"},
  statuses: {pending: "待开始", active: "进行中", waiting: "等待答复", review: "待验收", done: "已闭环"},
  views: {delivery:"交付模块",knowledge:"知识维护",communication:"沟通模块",audit:"审计模块", trash:"垃圾箱", attention: "待我处理", automation:"采集模块",testing:"测试模块", board: "任务流转", history: "闭环记录", inbox: "来件记录", decisions: "待我决策", library: "资料索引", cases:"事项链", sync:"同步与异常", team: "团队与流程"},
  message: {question: "提问", reply: "回复", notice: "告知", decision: "请求决策"},
  questions: {open: "待答复", answered: "待确认解决", resolved: "已解决"},
  sourceKinds: {communication: "沟通件", test_assignment: "待测清单", test_report: "测试报告", collection_report: "情报报告"},
  sourceIntents: {reply: "需收件角色处理", info: "知会 · 无需回复", triage: "路由信息待确认 · 需判读", action: "待处理"}
};
let state = {tasks: [], roles: [], messages: [], artifacts: [], links: [], events: [], sources: [], source_events: []};
let view = "attention";
let roleFilter = "all";
let query = "";
let sourceFilter = "all";
let selectedTask = null;
const createArtifactSelected = new Set();
let createCandidates = [];
let candidateRequest = 0;
const batchSelected = new Set();
let toastTimer;
let draggedTask = null;
let preserveControls = false;
let historyPage = 1;
let historyKind = "all";
let historyMonth = "";
let activeWorkspace = ['ts','ks'].includes(localStorage.getItem('yuandu.workspace')) ? localStorage.getItem('yuandu.workspace') : 'ts';
try {const saved=localStorage.getItem('yuandu.work.view.'+activeWorkspace);view=['communication','automation','testing','audit','delivery'].includes(saved)?saved:'communication';} catch {view='communication';}
let inFlightMutations = 0;
let busyActions = 0;
let preparedOutput = null;
let workspaceLoading = false;
const taskHistories = new Map();
const outcomeLabels = {"":"未记录",processed:"已处置",needs_test:"需要测试",no_further_test:"无需继续测试",informational:"已知悉",invalid:"已作废"};
const communicationNames = {content:'内容沟通',audit:'审计沟通',product:'产品沟通'};
const communicationDrafts = new Map();
let lastUsageView = '';
function usageEvent() {}
function communicationDraft(category) {
  const key = activeWorkspace + ':' + category;
  if (!communicationDrafts.has(key)) communicationDrafts.set(key, {rounds:3,speaker:category==='audit'?'knowledge_auditor':category==='product'?'wb':'pi',topic:'',created:null});
  return communicationDrafts.get(key);
}

function communicationLaunchMarkup(onlyCategory=null) {
  const cards=Object.entries(communicationNames).filter(([id])=>!onlyCategory || id===onlyCategory).map(([category,name])=>{
    const draft=communicationDraft(category);
    const actors=category==='audit'?{knowledge_auditor:'Codex 审计',pi:'知识库维护'}:{pi:'知识库维护',wb:'WB 交付'};
    return `<article class="panel communication-shortcut" data-category="${category}"><h2>${name}</h2><label>本次交给谁<select data-communication-speaker>${options(actors,draft.speaker)}</select></label><label>本次议题<input data-communication-topic maxlength="1000" value="${esc(draft.topic)}" placeholder="写明这一次需要处理什么"></label><p class="helper">本方完成后闭环；需要对方回应时，回件独立建卡。不在同一卡里反复交接。</p><button class="button primary" data-communication-create>${draft.created?'再次复制本卡提示词':'建卡并复制提示词'}</button>${draft.created?`<p>已建卡 ${esc(draft.created.id)}</p><button class="button small" data-task="${esc(draft.created.id)}">打开卡片</button><button class="button small" data-communication-new>另建一次处理</button>`:''}</article>`;
  }).join('');
  return cards;
}
function bindCommunicationLaunch() {
  $$('.communication-shortcut').forEach(card=>{
    const category=card.dataset.category,draft=communicationDraft(category);
    $('[data-communication-topic]',card).oninput=e=>{draft.topic=e.target.value;};
    $('[data-communication-speaker]',card).onchange=e=>{draft.speaker=e.target.value;};
    if(draft.created) $$('input,select',card).forEach(control=>{control.disabled=true;});
    $('[data-communication-create]',card).onclick=event=>run(async()=>{
      if(!draft.created) {
        try {draft.created=await api('/communications',{category,first_speaker:draft.speaker,topic:draft.topic});}
        catch(error){throw new Error(error.message+'；网络中断时先核对任务流转，避免重复建卡。');}
      }
      const result=await api(`/tasks/${draft.created.id}/handoff`);
      try {await writeClipboard(result.text);toast('已复制本卡提示词；请手动交给本卡负责人');}
      catch {prepareText(result.filename,result.text,'卡片已创建，请复制提示词，无需重复建卡。');}
      await refresh();
    },event.currentTarget);
    const reset=$('[data-communication-new]',card);if(reset)reset.onclick=()=>{draft.created=null;render();};
  });
}
function renderCommunication() {
  const cards=communicationLaunchMarkup();
  setWorkspaceMarkup(businessDeskMarkup('communication')+`<details class="desk-tools" id="business-tools"${businessState('communication').tools?' open':''}><summary>发起一次沟通</summary><div class="communication-grid">${cards}</div></details>`);
  bindCommunicationLaunch();
}

/** Keep filter inputs attached so Chinese IME composition survives result updates. */
function setWorkspaceMarkup(markup) {
  const root = $("#workspace");
  if (!preserveControls) { root.innerHTML = markup; try {workbenchMotion.render(root,activeWorkspace,view);} catch {} return; }
  const template = document.createElement("template");
  template.innerHTML = markup;
  const incoming = [...template.content.children];
  incoming.forEach((element, index) => {
    const current = root.children[index];
    if (element.classList.contains("toolbar") && current?.classList.contains("toolbar")) {
      const heading = $("h2", element);
      if (heading && $("h2", current)) $("h2", current).innerHTML = heading.innerHTML;
    } else if (current) current.replaceWith(element);
    else root.append(element);
  });
  while (root.children.length > incoming.length) root.lastElementChild.remove();
  try {workbenchMotion.render(root,activeWorkspace,view);} catch {}
}

function renderFiltered() {
  preserveControls = true;
  try { ({board: renderBoard, history: renderHistory, inbox: renderInbox, library: renderLibrary, cases:renderCases}[view])(); }
  finally { preserveControls = false; }
  bindWorkspace();
}

/** Escape untrusted titles before constructing markup; Markdown bodies use textContent. */
function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[char]));
}
function roleName(id) { return state.roles.find(item => item.id === id)?.name || "参与者"; }
function taskRoleLabel(role, task) { if(task?.delivery && role==='codex')return 'Codex · 最终交付'; return task?.kind === "test" && role === "wb" ? "WorkBuddy · 测试执行" : roleName(role); }
function avatar(id) { return `<span class="avatar">${esc(state.roles.find(item => item.id === id)?.short || "·")}</span>`; }
function date(value) { return new Date(value).toLocaleString("zh-CN", {month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit"}); }
function appearedAt(value) {
  const timestamp = new Date(value);
  return Number.isNaN(timestamp.getTime()) ? "时间未记录" : timestamp.toLocaleString("zh-CN", {timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23"}).replaceAll("/", "-");
}
function openQuestions(taskId) { return state.messages.filter(m => (!taskId || m.task_id === taskId) && ["question", "decision"].includes(m.kind) && m.question_state !== "resolved"); }
function toast(message, error = false) {
  clearTimeout(toastTimer);
  ($$("dialog[open]").at(-1) || document.body).append($("#toast"));
  $("#toast").textContent = message;
  $("#toast").className = `toast${error ? " error" : ""}`;
  $("#toast").hidden = false;
  toastTimer = setTimeout(() => { $("#toast").hidden = true; }, error ? 9000 : 5000);
}
async function api(path, data, method = "POST", timeoutMs = 0) {
  const scope=activeWorkspace,mutation=data!==undefined;
  if(mutation && (workspaceLoading || state.workspace?.id!==scope)) throw new Error('工作空间正在加载，请稍后重试');
  const options=mutation?{method,headers:{'Content-Type':'application/json','X-TS-CSRF':state.csrf,'X-TS-Workspace':scope},body:JSON.stringify(data)}:{};
  const controller = timeoutMs ? new AbortController() : null;
  const requestTimer = controller ? setTimeout(()=>controller.abort(),timeoutMs) : null;
  if (controller) options.signal = controller.signal;
  if(mutation){inFlightMutations++;$('#workspace-switch').disabled=true;}
  try {
    let response=await workbenchDemoRequest(`/api/${scope}${path}`,options),result=await response.json();
    if(mutation && response.status===403 && result.code==='csrf') {
      const renewed=await workbenchDemoRequest(`/api/${scope}/state`,controller ? {signal:controller.signal} : {}),current=await renewed.json();
      if(!renewed.ok || current.workspace?.id!==scope || activeWorkspace!==scope) throw new Error('工作空间凭据无法恢复，请刷新');
      state.csrf=current.csrf;options.headers['X-TS-CSRF']=current.csrf;
      response=await workbenchDemoRequest(`/api/${scope}${path}`,options);result=await response.json();
    }
    if(!response.ok) throw new Error(result.error || '请求失败');
    if(activeWorkspace!==scope) throw new Error('工作空间已切换，已忽略旧请求');
    return result;
  } catch (error) {
    if (controller?.signal.aborted) throw new Error('交接单生成超时；本次仅重新复制，任务状态未改变，可稍后重试');
    throw error;
  } finally {
    if (requestTimer !== null) clearTimeout(requestTimer);
    if(mutation){inFlightMutations--;$('#workspace-switch').disabled=inFlightMutations>0 || busyActions>0;}
  }
}
async function refresh() {
  activeStateRefreshes++;
  const requested=activeWorkspace;
  try {
    const current=await api('/state');
    if(activeWorkspace!==requested || current.workspace?.id!==requested) return;
    state = current;
    $("#connection").textContent = REMOTE_WORKBENCH ? "● 演示模式" : "● 演示模式";
    $("#connection").className = "connection";
    render();
  } catch (error) {
    if(activeWorkspace!==requested) return;
    $("#connection").textContent = "服务连接中断";
    $("#connection").className = "connection error";
    throw error;
  } finally {
    activeStateRefreshes--;
  }
}
async function run(action, button) {
  if (button?.disabled) return;
  if (button) { button.disabled = true; button.setAttribute("aria-busy", "true"); }
  const locksWorkspace=button?.id!=='workspace-switch';
  if(locksWorkspace){busyActions++;$('#workspace-switch').disabled=true;}
  try { await action(); } catch (error) { toast(error.message, true); }
  finally { if (button) { button.disabled = false; button.removeAttribute("aria-busy"); if(button.id==='batch-copy' && button.isConnected) updateBatchSelectionUi(); } if(locksWorkspace){busyActions--;$('#workspace-switch').disabled=busyActions>0 || inFlightMutations>0;} }
}
function options(items, current) { return Object.entries(items).map(([id, label]) => `<option value="${esc(id)}"${id === current ? " selected" : ""}>${esc(label)}</option>`).join(""); }
function roleOptions(current, all = false) { return (all ? `<option value="all">全部角色</option>` : "") + state.roles.map(role => `<option value="${role.id}"${role.id === current ? " selected" : ""}>${esc(role.name)}</option>`).join(""); }
function batchEligible(task) {
  if (typeof task.batch_eligible === 'boolean') return task.batch_eligible;
  return task.owner === "pi" && task.kind === "research" && ["pending", "active"].includes(task.status) && state.links.some(link => link.task_id === task.id && state.artifacts.some(artifact => artifact.id === link.artifact_id && (["intelligence", "intelligence_archive", "completed_tests"].includes(artifact.source) || artifact.source === "test_archive" && artifact.source_kind === "test_report") && artifact.available));
}
function batchSelectable(task) { return batchEligible(task) || task.batch_close_eligible === true; }
function taskOrigins(task) {
  const names = {intelligence: "采集", mac_intelligence: "MAC采集", intelligence_archive: "采集", communication: "沟通", audit_communication: "审计沟通", pending_tests: "测试·待测", test_archive: "测试·已归档", completed_tests: "测试·报告"};
  const origins = [...new Set(state.links.filter(link => link.task_id === task.id).map(link => {
    const artifact = state.artifacts.find(item => item.id === link.artifact_id);
    if (artifact?.source === "test_archive") return artifact.source_kind === "test_report" ? "测试·已归档报告" : artifact.source_kind==='test_assignment' ? "测试·已归档任务书" : '测试·已归档资料';
    if (artifact?.source === 'completed_tests' && artifact.source_kind === 'test_assignment') return '测试·已派发任务书';
    return names[artifact?.source];
  }).filter(Boolean))];
  return origins.length ? origins : ["手动创建"];
}
function taskKindLabel(task) {
  if(task.delivery)return deliveryLabel(task);
  if(task.kind==='test' && task.status!=='done' && task.batch_category==='test_archive_review')return '测试档案复核';
  if(task.kind==='research' && task.batch_category) return task.batch_category==='collection_processing'?'采集处理':'测试报告研究';
  if (task.kind !== 'discussion') return labels.kinds[task.kind];
  return ({product:'产品沟通',temporary:'临时沟通',content:'内容沟通',audit:'审计沟通',delivery:'交付沟通'})[task.discussion_type] || '临时沟通';
}
function discussionTypeControl(task) {
  if (!task.discussion_type_editable) return '';
  return `<label class="helper">沟通类型 <select data-discussion-type="${task.id}" aria-label="${task.id} 沟通类型">${options({product:'产品沟通',temporary:'临时沟通'},task.discussion_type)}</select></label>`;
}
function taskDisplayTitle(task) {
  const title = task.title.replace(/^#+\s*/, "");
  const dates = state.links.filter(link => link.task_id === task.id).map(link => state.artifacts.find(item => item.id === link.artifact_id))
    .filter(artifact => artifact && ["intelligence", "mac_intelligence", "intelligence_archive"].includes(artifact.source))
    .map(artifact => artifact.name.match(/(?:^|\D)(20\d{2})-?(\d{2})-?(\d{2})(?!\d)/))
    .filter(Boolean).map(match => `${match[1]}-${match[2]}-${match[3]}`);
  const missingDates = [...new Set(dates)].filter(value => !title.includes(value) && !title.includes(value.replaceAll("-", "")));
  return missingDates.length ? `${missingDates.join(" / ")} · ${title}` : title;
}
function pendingFolderConflict(task) {
  return task.status === "done" && state.links.some(link => link.task_id === task.id && state.artifacts.some(artifact => artifact.id === link.artifact_id && artifact.source === "pending_tests" && artifact.available));
}
function taskDescription(task) {
  let description = task.description;
  const pendingRoot = state.sources.find(source => source.id === "pending_tests")?.path;
  const archivedRoot = state.sources.find(source => source.id === "test_archive")?.path;
  if (pendingRoot && archivedRoot) {
    for (const link of state.links.filter(item => item.task_id === task.id)) {
      const artifact = state.artifacts.find(item => item.id === link.artifact_id);
      if (artifact?.source === "test_archive") {
        const originalRoot = state.sources.find(source => source.id === (artifact.source_kind === "test_report" ? "completed_tests" : "pending_tests"))?.path;
        if (originalRoot) description = description.replace(`${originalRoot}\\${artifact.name}`, `${archivedRoot}\\${artifact.name}`);
      }
    }
  }
  return description;
}
function auditBadge(task) {
  return task.kind === "audit" ? `<span class="tag audit-outcome">${task.audit_tracking ? "回报声明" : task.status === "done" ? "审计结果" : "上次审计结果"}：${esc(labels.auditOutcomes[task.audit_outcome] || "未记录")}</span>` : "";
}
function isOpenTaskSourceUpdate(item) {
  return item.state === "new" && item.change_kind === "modified" && item.task_id && item.task_status && item.task_status !== "done" && ["pending_tests", "completed_tests", "intelligence", "mac_intelligence"].includes(item.source);
}
function taskExecutor(task) {
  const meeting = (state.discussions || []).find(item => item.task_id === task.id);
  return task.kind==='discussion' ? task.owner : meeting?.current_executor || meeting?.first_speaker || task.owner;
}
function pendingAuditHandoff(task) {
  return (state.discussions || []).find(item => item.task_id === task.id)?.pending_handoff;
}
function auditNotice(task) {
  return (state.discussions || []).find(item => item.task_id === task.id)?.audit_notice;
}
function communicationStage(task, meeting) {
  return {recipient:task.owner,label:'本次处理方',instruction:'本方一次处理完成即可闭环；对方实质回件独立建卡'};
}
function executorLabel(role, task = null) {
  if(task?.delivery && role==='codex')return 'Codex · 最终交付';
  if (task?.kind === 'test' && role === 'wb') return 'WorkBuddy · 测试执行';
  return {pi:'知识库维护',wb:'WB 交付',knowledge_auditor:'Codex 审计',codex:'Codex 平台',chen:'陈震',collector:'采集 Agent',tester:'测试 Agent'}[role] || roleName(role);
}
function taskButton(task, selectable = false) {
  const questions = openQuestions(task.id);
  const communication=(state.discussions||[]).find(m=>m.task_id===task.id && m.mode==='communication');
  const updated = state.source_events.some(item => item.task_id === task.id && isOpenTaskSourceUpdate(item));
  const waitingFor = [...new Set(questions.filter(m => m.blocking).map(m => roleName(m.question_state === "answered" ? m.author_role : m.recipient_role)))];
  const executor = taskExecutor(task);
  const stage = communication ? communicationStage(task, communication) : null;
  const executorBlock = ['pending','active'].includes(task.status) ? `<div class="card-executor"><span class="executor-caption">${stage ? `当前沟通阶段 · ${stage.label}` : '当前执行方'}</span><strong>${esc(stage?.headline || executorLabel(stage ? stage.recipient : executor, task))}</strong><span class="executor-status">${stage ? esc(stage.instruction) : labels.statuses[task.status]}</span>${stage ? '<span class="executor-caption">本卡闭环只表示这一次处理完成</span>' : ''}</div>` : '';
  const card = `<button class="task-card" data-task="${task.id}"><div class="card-meta"><span class="tag ${task.kind}">${communication ? (communicationNames[communication.category] || '产品沟通') : taskKindLabel(task)}</span>${communication?'<span class="tag">单次处理</span>':""}${auditBadge(task)}${taskOrigins(task).map(name => `<span class="tag origin-tag">来自${esc(name)}</span>`).join("")}${pendingFolderConflict(task) ? `<span class="tag update-tag">文件仍在待测试</span>` : ""}${updated ? `<span class="tag update-tag">原件更新 · 请重读</span>` : ""}${task.description.includes("同名同内容文件曾被归档") ? `<span class="tag update-tag">与历史归档同内容</span>` : ""}<span class="task-id">${task.id}</span></div><h3>${esc(taskDisplayTitle(task))}</h3><div class="card-created"><time datetime="${esc(task.created_at)}">出现于 ${esc(appearedAt(task.created_at))}</time></div>${executorBlock}<p>${esc(taskDescription(task) || (task.kind === "audit" ? "默认执行当前工作空间知识库全库全量审计；复制交接单即可启动。" : "打开任务，补充沟通并安排下一步。"))}</p>${waitingFor.length ? `<div class="waiting-note">◷ 等待 ${esc(waitingFor.join("、"))} · ${questions.filter(m => m.blocking).length} 个阻塞问题</div>` : ""}<div class="card-bottom"><span class="owner">${avatar(task.owner)}负责：${esc(taskRoleLabel(task.owner, task))}</span><span>${labels.statuses[task.status]}${questions.length ? ` · ${questions.length} 问题` : ""}</span></div></button>`;
  const files = taskFiles(task);
  const result = state.results?.find(item=>item.task_id===task.id);
  let enriched = card.replace('<div class="card-bottom">',`${files.map(a=>`<div class="card-source">${esc(fileState(a))} · ${esc(a.name)}</div>`).join('')}${result?.outcome ? `<div class="card-source">处置：${esc(outcomeLabels[result.outcome])}</div>`:''}<div class="card-bottom">`);
  if (communication) enriched = enriched.replace('负责：', '发起方：').replace(`<span>${labels.statuses[task.status]}`, `<span>${task.status === 'active' ? '沟通进行中' : labels.statuses[task.status]}`);
  if (task.auto_run) enriched = enriched.replace('<div class="card-bottom">', '<div class="card-source">历史采集自动移交：' + esc(task.auto_run.label) + '</div><div class="card-bottom">');
  return selectable ? `<div class="batch-task${batchSelected.has(task.id) ? " selected" : ""}"><label class="batch-task-select"><input type="checkbox" data-batch-select="${task.id}"${batchSelected.has(task.id) ? " checked" : ""}>选入批量交接</label>${enriched}</div>` : enriched;
}
function empty(title, description, action = "") { return `<div class="empty-state"><img class="empty-xiaowho" src="${xiaowhoTheme.portrait(activeWorkspace)}" alt=""><h3>${title}</h3><p>${description}</p>${action}</div>`; }
function filters(includeRole = true, sync = false) {
  return `<div class="toolbar-tools"><input id="search" class="search" type="search" aria-label="搜索" placeholder="搜索任务或资料…" value="${esc(query)}">${includeRole ? `<select id="role-filter" aria-label="按角色筛选">${roleOptions(roleFilter, true)}</select>` : ""}${sync ? `<button class="button small" id="board-scan">↻ 同步文件与卡片</button>` : ""}</div>`;
}
function render() {
  if(['communication','automation','testing','audit','delivery'].includes(view)){try {const key='yuandu.work.view.'+activeWorkspace;if(localStorage.getItem(key)!==view)localStorage.setItem(key,view);} catch {}}
  if (view === "decisions") { view = "attention"; attentionFilter = "decision"; }
  const usageKey=activeWorkspace+':'+view;
  if (state.csrf && !workspaceLoading && lastUsageView!==usageKey) { lastUsageView=usageKey;usageEvent('view'); }
  document.documentElement.dataset.workspace=activeWorkspace;
  $('#workspace-switch-label').textContent=activeWorkspace==='ks'?'KS · KeelSteer':'TS · TrimSteer';
  $$('[data-workspace-option]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.workspaceOption===activeWorkspace)));
  xiaowhoTheme.sync(activeWorkspace);
  $('#workspace-name').textContent=state.workspace?.name || 'TrimSteer';
  document.title=`xiaowho 的工作台 · ${state.workspace?.name || 'TrimSteer'}`;
  $('.page-heading .eyebrow').textContent=`${state.workspace?.prefix || 'TS'} WORKSPACE`;
  $('footer > span').textContent=`${(state.workspace?.name || 'TrimSteer').toUpperCase()} · 少一些传话，多一些推进`;
  const ordinary=state.tasks;
  if($('#delivery-count'))$('#delivery-count').textContent=businessTasks('delivery').filter(t=>t.status!=='done').length;
  const active = ordinary.filter(t => t.status !== "done");
  $("#task-count").textContent = active.length;
  $("#trash-count").textContent=(state.trash_tasks || []).length;
  if($('#communication-count'))$('#communication-count').textContent=businessTasks('communication').filter(t=>t.status!=='done').length+businessIncoming('communication').length;
  $('#audit-count').textContent=businessTasks('audit').filter(t=>t.status!=='done').length+businessIncoming('audit').length;
  $("#attention-count").textContent = attentionData().count;
  if($('#testing-count'))$('#testing-count').textContent=businessTasks('testing').filter(t=>t.status!=='done').length+businessIncoming('testing').length;
  $('#automation-count').textContent=businessTasks('automation').filter(t=>t.status!=='done').length+businessIncoming('automation').length;
  $("#history-count").textContent = state.tasks.filter(t=>t.status==='done').length;
  $("#new-task").hidden = view !== "board";
  $('#release').textContent = `DEMO / ${state.release || 'V2'}`;
  $('#sync-count').textContent = state.sources.filter(s=>!s.available || (state.sync_health || []).some(h=>h.source===s.id && h.error)).length + (state.pending_operations || []).length + Number(Boolean(state.backup?.error)) + Number(Boolean(state.monitor?.monitor_error));
  $("#breadcrumb-current").textContent = labels.views[view];
  $$(".nav-item").forEach(button => {
    const selected = button.dataset.view === view;
    button.classList.toggle("active", selected);
    if (selected) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  $$(".nav-count").forEach(count => { count.hidden = count.textContent === "0"; });
  if ($('#sidebar-more [data-view="' + view + '"]')) $('#sidebar-more').open = true;
  const headings = {
    delivery:["交付工作区","一份报告，分别交接内部反哺和 Codex HTML；状态同步到任务流转。"],
    knowledge:['知识维护','查询本线知识目录、复制只读提示词，核对结构线索与实际维护结果。'],
    communication:["沟通工作区", "在这里判读来件、开始交接、处理回件与闭环；状态同步到全局监控。"],
    audit:["审计工作区", "准备审计委托，跟进发现、整改回应和复核；不重复启动审计。"],
    trash:["垃圾箱", "恢复误撤销的任务，或确认永久删除卡片；原件保持不变。"],
    attention: ["待我处理", "判读新来件、核对新回件与处理异常/决策；已建卡的待开始任务在任务流转中操作。"],
    board: ["全局工作流监控", "汇总当前条线的全部任务与状态；进入业务工作区处理，操作同步在此显示。"],
    automation:["采集工作区","在这里准备采集、处理采集报告与闭环归档；测试事项进入独立测试工作区。"],
    testing:["测试工作区","待测清单、执行交接与回报复核集中处理；与任务流转共用原卡片和状态。"],
    history: ["做过的事，都有记录。", "集中查阅已闭环任务、结论和原件；需要继续处理时，可打开任务恢复进行中。"],
    inbox: ["来件记录", "查询已索引来件及站内消息；待办统一在“待我处理”中操作。"],
    decisions: ["需要你拍板的事，都在这里。", "记录决定与依据，让团队带着明确结论继续推进。"],
    library: ["让原有资料，进入协作视野。", "只读索引指定目录；新资料自动进入队列，历史文件不会回填。"],
    cases:["把一件事的来龙去脉串起来。","明确关联原件、测试、处置与后续通知；按显式任务关系连接。"],
    sync:["知道文件在哪里，也知道哪一步没完成。","目录观测与正文校验分别记录；任务状态不会因目录变化而自动关闭。"],
    team: ["明确分工，也允许随时沟通。", "固定职责与临时协作并行，任务与结论都有归属。"]
  };
  $("#page-title").textContent = headings[view][0];
  $("#page-subtitle").textContent = headings[view][1];
  const metrics = [["未完成任务", active.length, "每项任务都有负责角色", "↗"], ["待你决策", attentionData().items.filter(row => row.tags.has("decision")).length, "明确请求你拍板的事项", "◇"], ["已闭环任务", ordinary.filter(t => t.status === "done").length, "保留任务与资料结论", "✓"]];
  const waiting = active.filter(t => t.status === "waiting").length;
  if (waiting) metrics.splice(1, 0, ["等待澄清", waiting, "阻塞解除后恢复流转", "◷"]);
  $("#metrics").style.setProperty("--metric-columns", metrics.length);
  $("#metrics").innerHTML = metrics.map(([label, number, caption, icon]) => `<div class="metric"><div class="metric-label">${label}<span>${icon}</span></div><div class="metric-number">${number.toString().padStart(2, "0")}</div><div class="metric-caption">${caption}</div></div>`).join("");
  $("#metrics").hidden = !["board", "decisions"].includes(view);
  ({delivery:renderDelivery,knowledge:renderKnowledge,communication:renderCommunication,audit:renderAudit,trash:renderTrash,attention: renderAttention, automation:renderAutomation, testing:renderTesting, board: renderBoard, history: renderHistory, inbox: renderInbox, decisions: renderDecisions, library: renderLibrary,cases:renderCases,sync:renderSync,team: renderTeam}[view])();
  bindWorkspace();
}
function matchingTasks() { return state.tasks.filter(t => (view==='audit' || view==='board' || t.kind!=='audit') && (roleFilter === "all" || t.participants.includes(roleFilter)) && `${taskDisplayTitle(t)} ${t.description} ${t.id}`.toLowerCase().includes(query.toLowerCase())); }
function selectedClosingBatch() {
  return state.tasks.filter(task => batchSelected.has(task.id) &&
    (task.status === 'active' || task.kind === 'research' && task.status === 'pending') &&
    (task.batch_close_eligible ?? (task.kind !== 'discussion' && batchEligible(task))));
}
function selectedPendingBatch() {
  return state.tasks.filter(task => batchSelected.has(task.id) && task.status === "pending" && batchEligible(task));
}
function selectedCopyBatch() {
  return state.tasks.filter(task => batchSelected.has(task.id) && task.status === 'active' && batchEligible(task));
}
async function copyActiveBatch(tasks,executionTarget=null) {
  if (!tasks.length) return;
  const result = await api(tasks[0]?.kind==='delivery'?'/tasks/delivery-batch/copy':'/tasks/batch-copy', {tasks:tasks.map(task=>({id:task.id,revision:task.revision})),
    ...(tasks.every(task=>task.kind==='test')?{execution_target:executionTarget || testExecutionTarget()}:{})}, 'POST', 20000);
  try { await writeClipboard(result.text); toast(`已重新复制 ${result.count} 项进行中任务的交接单；状态和轮次未改变`); }
  catch { prepareText(result.filename,result.text,'自动复制未确认；交接单已准备，任务状态和轮次未改变。'); }
}
/** Button and selected-card activation share the same guarded batch handoff. */
function batchGroup(task) { return `${task.kind}:${task.kind==='delivery' ? task.delivery?.branch || 'unsupported' : ['research','test'].includes(task.kind) ? task.batch_category || 'unsupported' : task.discussion_type || ''}:${task.batch_recipient || task.owner}`; }
function batchEndpoint(tasks, action) { return `/tasks/${tasks[0].kind === 'discussion' ? 'discussion' : tasks[0].kind === 'test' ? 'test' : tasks[0].kind === 'delivery' ? 'delivery' : 'research'}-batch/${action}`; }
function batchLabel(tasks) { if(tasks[0]?.kind==='delivery')return tasks[0].delivery?.branch==='knowledge'?'内部反哺':'Codex 最终交付'; return tasks[0]?.kind === 'discussion' ? taskKindLabel(tasks[0]) : tasks[0]?.kind === 'test' ? (tasks[0]?.batch_category==='test_archive_review'?'测试档案复核':'测试任务') : tasks[0]?.batch_category==='collection_processing' ? '采集处理' : tasks[0]?.batch_category==='test_return_research' ? '测试报告研究' : '知识库维护 Agent 研究任务'; }
async function dispatchBatch(tasks) {
  if (!tasks.length) return;
  const result = await api(batchEndpoint(tasks, "handoff"), {tasks: tasks.map(task => ({id: task.id, revision: task.revision})),
    ...(tasks.every(task=>task.kind==='test')?{execution_target:testExecutionTarget()}:{})});
  if (result.automatic) toast(`已将 ${result.count} 项内部反哺排队交给本线 Pi；无需复制，核验后自动闭环`);
  else if (result.count) {
    try { await writeClipboard(result.text); toast(`已开始 ${result.count} 项任务，合并交接单已复制给 ${executorLabel(tasks[0].batch_recipient || tasks[0].owner, tasks[0])}`); }
    catch { prepareText(result.filename, result.text, `已开始 ${result.count} 项任务。剪贴板不可用，请选中并复制交接单。`); }
  }
  const succeeded = result.items ? result.items.filter(item => item.status === 'active').map(item => item.id) : tasks.map(task => task.id);
  succeeded.forEach(id => batchSelected.delete(id));
  await refresh();
  workCardDrag.committed(tasks[0].id,'active',result.items || succeeded.map(id=>({id,status:'active'})));
  if (result.failed) showText('批量开始结果及交接单', result.items.map(item => `${item.id} · ${item.status === 'active' ? '已开始' : item.error}`).join('\n')+'\n\n'+(result.text || ''), '成功项已保存；下方保留成功项交接全文，失败项另行核对。');
}
/** Use last-update month explicitly: legacy tasks have no stored closure timestamp. */
function updateMonth(task) {
  const value = new Date(task.updated_at);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;
}
function renderHistory() {
  const tasks = state.tasks.filter(task => task.status === "done"
    && (roleFilter === "all" || task.participants.includes(roleFilter))
    && (historyKind === "all" || task.kind === historyKind)
    && (!historyMonth || updateMonth(task) === historyMonth)
    && `${taskDisplayTitle(task)} ${task.description} ${task.summary} ${task.id}`.toLowerCase().includes(query.toLowerCase()));
  const pages = Math.max(1, Math.ceil(tasks.length / 20));
  historyPage = Math.min(historyPage, pages);
  const rows = tasks.slice((historyPage - 1) * 20, historyPage * 20);
  setWorkspaceMarkup(`<div class="toolbar"><h2>闭环记录 <span class="helper">/ ${tasks.length} 项</span></h2>${filters()}</div><div class="toolbar history-filters"><label>任务类型<select id="history-kind">${options({all: "全部类型", ...labels.kinds}, historyKind)}</select></label><label>最后更新月份<input id="history-month" type="month" value="${esc(historyMonth)}"></label><button class="button small" id="history-reset">清空筛选</button><span class="helper">角色筛选包含参与者；搜索包含闭环结论。</span></div>${recentBatchesMarkup()}${closureReopenControls(rows)}${rows.length ? `<div class="panel history-list">${rows.map(task => `<div class="history-selection-row">${closureReopenCheckbox(task)}<button class="history-row" data-task="${task.id}"><div class="history-main"><div class="card-meta"><span class="tag ${task.kind}">${taskKindLabel(task)}</span>${auditBadge(task)}${taskOrigins(task).map(name => `<span class="tag origin-tag">来自${esc(name)}</span>`).join("")}${pendingFolderConflict(task) ? `<span class="tag update-tag">文件仍在待测试</span>` : ""}<span class="task-id">${task.id}</span></div><h3>${esc(taskDisplayTitle(task))}</h3><p>${esc(task.summary || "未填写闭环结论；打开可查看沟通和关联资料。")}</p></div><div class="history-meta"><span>${esc(taskRoleLabel(task.owner, task))}</span><small>出现于 ${esc(appearedAt(task.created_at))}<br>最后更新 ${date(task.updated_at)}</small><span>查看记录 ↗</span></div></button></div>`).join("")}</div>` : empty("没有匹配的闭环记录", "任务闭环后会自动汇总到这里。可清空筛选查看全部。")}<div class="history-pagination"><button class="button small" data-history-page="${historyPage - 1}"${historyPage === 1 ? " disabled" : ""}>上一页</button><span>第 ${historyPage} / ${pages} 页 · 每页 20 项</span><button class="button small" data-history-page="${historyPage + 1}"${historyPage === pages ? " disabled" : ""}>下一页</button></div>`);
}
function openBatchClose() {
  const task = selectedClosingBatch()[0];
  if (!task) return;
  openTask(task.id);
  $("#task-status").value = "done";
  $("#task-status").onchange();
  $("#change-status").focus();
}
function taskFiles(task) {
  return state.links.filter(l=>l.task_id===task.id).map(l=>state.artifacts.find(a=>a.id===l.artifact_id)).filter(Boolean);
}
function fileState(a) {
  const type = a.source_kind==='test_assignment'?'任务书':a.source_kind==='test_report'?'实测报告':a.source_kind==='communication'?'沟通件':['intelligence','mac_intelligence','intelligence_archive'].includes(a.source)?'采集报告':'资料';
  return `${type} · ${!a.available?'原件暂不可用':['test_archive','intelligence_archive'].includes(a.source)?'已归档':a.source==='completed_tests' && type==='任务书'?'已派发，等待执行/处置':state.sources.find(s=>s.id===a.source)?.name || '已登记'}`;
}
function caseEdges() {
  return [...(state.relations || []), ...state.tasks.filter(t=>t.parent_id).map(t=>({from_task:t.parent_id,to_task:t.id,relation:'child'}))];
}
/** Order explicit dependencies; creation time only breaks ties between branches. */
function orderedCaseTasks(group, recordedEdges = caseEdges()) {
  const remaining = new Map(group.map(task=>[task.id,task]));
  const edges = recordedEdges.filter(edge=>remaining.has(edge.from_task) && remaining.has(edge.to_task));
  const ordered = [];
  while (remaining.size) {
    const ready = [...remaining.values()].filter(task=>!edges.some(edge=>edge.to_task===task.id && remaining.has(edge.from_task)));
    // Preserve visibility if legacy data ever contains an invalid cycle.
    const next = (ready.length ? ready : [...remaining.values()]).sort((a,b)=>a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id))[0];
    ordered.push(next); remaining.delete(next.id);
  }
  return ordered;
}
/** Result references are visible evidence, never additional movement ownership. */
function caseEvidence(task) {
  const owned = taskFiles(task);
  const result = state.results?.find(item=>item.task_id===task.id);
  const resultIds = new Set(result?.evidence_artifact_ids || (result?.evidence_artifact_id ? [result?.evidence_artifact_id] : []));
  const files = [...owned, ...state.artifacts.filter(item=>resultIds.has(item.id) && !owned.some(file=>file.id===item.id))];
  const discussionIds = new Set((state.references || []).filter(item=>item.task_id===task.id).map(item=>item.artifact_id));
  state.artifacts.filter(item=>discussionIds.has(item.id) && !files.some(file=>file.id===item.id)).forEach(item=>files.push(item));
  return files.map(artifact=>({artifact,label:discussionIds.has(artifact.id) ? '讨论依据 · 仅引用' : resultIds.has(artifact.id) ? (owned.some(item=>item.id===artifact.id) ? '关联原件 · 结果证据' : '结果证据 · 仅引用') : '关联原件'}));
}
function caseEdgesMarkup(group, recordedEdges = caseEdges()) {
  const ids=new Set(group.map(t=>t.id));
  const names={followup:'后续处理',test_report:'测试回传',knowledge_notice:'知识通知',child:'子任务'};
  return recordedEdges.filter(e=>ids.has(e.from_task) && ids.has(e.to_task)).map(e=>`<div class="case-edge"><button class="button small" data-task="${esc(e.from_task)}">${esc(taskRoleLabel(group.find(t=>t.id===e.from_task)?.owner, group.find(t=>t.id===e.from_task)))} · ${esc(e.from_task)}</button><span>→ ${esc(names[e.relation] || '后续')} →</span><button class="button small" data-task="${esc(e.to_task)}">${esc(taskRoleLabel(group.find(t=>t.id===e.to_task)?.owner, group.find(t=>t.id===e.to_task)))} · ${esc(e.to_task)}</button></div>`).join('');
}
function caseGroups() {
  const edges=caseEdges();
  const visited=new Set(),groups=[];
  for(const task of state.tasks) {
    if(visited.has(task.id)) continue;
    const queue=[task.id],group=[];
    while(queue.length) {
      const id=queue.shift(); if(visited.has(id)) continue; visited.add(id);
      const current=state.tasks.find(t=>t.id===id); if(!current) continue; group.push(current);
      edges.filter(e=>e.from_task===id || e.to_task===id).forEach(e=>queue.push(e.from_task===id?e.to_task:e.from_task));
    }
    groups.push(group);
  }
  return groups;
}
function renderCases() {
  const matches=new Set(matchingTasks().map(t=>t.id));
  const groups=caseGroups().filter(g=>g.some(t=>matches.has(t.id))),pages=Math.max(1,Math.ceil(groups.length/20));
  historyPage=Math.min(historyPage,pages);
  setWorkspaceMarkup(`<div class="toolbar"><h2>事项链 · ${groups.length} 项</h2>${filters()}</div><p class="helper">按明确的来源与后续关系查看移交、回传和处置。卡片按流转依赖排列，分支方向见箭头；闭环表示任务结束，不代表业务结论已验证。</p>${groups.slice((historyPage-1)*20,historyPage*20).map(group=>`<section class="panel case-panel"><div class="review-panel-heading"><h3>${group.length>1?'关联事项':'独立事项 · 关联未记录'} · ${group.length} 张卡 · ${group.filter(t=>t.status!=='done').length} 未完成</h3><button class="button small" data-case="${group[0].id}">完整时间线</button></div>${group.length>1 ? caseEdgesMarkup(group) : '<p class="helper">尚未记录来源或后续关系，不表示任务被阻塞。需要补充时，在任务详情中关联明确的卡片。</p>'}${orderedCaseTasks(group).map((task,index)=>{
    const evidence=caseEvidence(task),result=state.results?.find(r=>r.task_id===task.id);
    return `<article class="case-step"><button class="case-task" data-task="${esc(task.id)}"><span>${index+1} · ${esc(taskKindLabel(task))} · ${esc(taskRoleLabel(task.owner, task))} · ${esc(labels.statuses[task.status])}</span><strong>${esc(taskDisplayTitle(task))}</strong><small>${esc(task.id)} · 出现于 ${esc(appearedAt(task.created_at))}</small></button>${result?.outcome ? `<p class="case-result">记录结论：${esc(outcomeLabels[result.outcome])}${result.next_step ? ` · ${task.status==='done'?'历史建议':'下一步'}：${esc(result.next_step)}` : ''}</p>` : ''}<div class="case-files">${evidence.map(({artifact,label})=>`<button class="case-file" data-preview="${artifact.id}"><span>${esc(label)} · ${esc(fileState(artifact))}</span><strong>${esc(artifact.name)}</strong></button>`).join('') || '<p class="helper">暂无登记原件；打开任务查看交接说明。</p>'}</div></article>`;
  }).join('')}</section>`).join('') || empty('没有匹配事项','清空筛选查看全部事项。')}<div class="history-pagination"><button class="button small" data-history-page="${historyPage-1}"${historyPage===1?' disabled':''}>上一页</button><span>第 ${historyPage} / ${pages} 页</span><button class="button small" data-history-page="${historyPage+1}"${historyPage===pages?' disabled':''}>下一页</button></div>`);
}
function renderSync() {
  const health=state.sync_health || [],pending=state.pending_operations || [];
  const missing=state.artifacts.filter(a=>!a.available && state.links.some(l=>l.artifact_id===a.id && state.tasks.some(t=>t.id===l.task_id && t.status!=='done')));
  const historicalMissing=state.artifacts.filter(a=>!a.available && state.links.some(l=>l.artifact_id===a.id && state.tasks.some(t=>t.id===l.task_id && t.status==='done')));
  setWorkspaceMarkup(`${delegateCloseStatusMarkup()}<div class="toolbar"><h2>同步与异常</h2><button class="button primary" id="scan">同步文件与卡片</button></div><div class="panel process"><h3>服务 ${esc(state.release || 'V2')} · 本地手动交接</h3>${state.monitor?.monitor_error ? `<p class="triage-reason">${esc(state.monitor.monitor_error)}</p>` : ''}${state.backup?.error ? `<p class="triage-reason">${esc(state.backup.error)}</p>` : ''}<p>最近备份：${esc(state.backup?.latest || '尚无备份')} ${state.backup?.latest_at?'· '+esc(appearedAt(state.backup.latest_at)):''}；共 ${state.backup?.count || 0} 份。服务运行时每天保留一份数据库备份，旧备份不自动删除。</p><p>每 30 秒观察目录，每 15 分钟复核正文摘要；目录可用不等于所有文件已读，归档只跟踪登记原件。</p></div><div class="sync-grid">${state.sources.map(s=>{const archive=['test_archive','intelligence_archive'].includes(s.id),h=health.find(h=>h.source===s.id) || (archive ? {observed_at:state.monitor?.monitor_observed_at,indexed:state.artifacts.filter(a=>a.source===s.id && a.available).length,skipped:state.artifacts.filter(a=>a.source===s.id && !a.available).length}:null),c=state.source_candidates?.find(c=>c.source===s.id)?.count || 0;return `<article class="panel ${!s.available || h?.error?'sync-warning':''}"><h3>${esc(s.name)}</h3><p>${!s.available?'目录不可用':h?.error?esc(h.error):'目录可用'} · 待稳定 ${c} 项</p><p class="helper">观测：${h?.observed_at?esc(appearedAt(h.observed_at)):'尚无记录'}<br>正文校验：${h?.content_checked_at?esc(appearedAt(h.content_checked_at)):'尚未进行 / 归档仅登记追踪'}<br>${archive?'已登记可用':'检查'} ${h?.indexed || 0} 项，${archive?'不可用':'跳过'} ${h?.skipped || 0} 项</p><p class="source-path">${esc(s.path)}</p></article>`;}).join('')}</div>${archiveDiagnosticsMarkup()}<section class="panel"><h3>中断/失败流转 · ${pending.length}</h3>${pending.map(i=>`<p class="source-path">${esc(i.from_name)} → ${esc(i.to_name)} · ${i.phase==='failed'?'移动失败，需核对':'等待内容核验与链接恢复'} · 资料 ${i.artifact_id}</p>`).join('') || '<p class="helper">没有待恢复流转。恢复链接不会自动闭环任务。</p>'}</section><section class="panel"><h3>当前未闭环原件不可用 · ${missing.length}</h3>${missing.slice(0,100).map(a=>`<p>${esc(a.name)} · 资料 ${a.id}</p>`).join('') || '<p class="helper">已关联资料当前均可用。</p>'}</section><section class="panel"><h3>已闭环历史原件不可用 · ${historicalMissing.length}</h3><p class="helper">仅保留历史诊断，不因此重新进入待我处理；新回件和未解决问题仍会提醒。</p>${historicalMissing.slice(0,100).map(a=>`<p>${esc(a.name)} · 资料 ${a.id}</p>`).join('') || '<p class="helper">没有已登记的历史原件缺失。</p>'}</section>`);
}
function columnBatchControls(items, status) {
  if (!['pending','active'].includes(status)) return '';
  const groups=new Map();
  for(const task of items.filter(batchSelectable)) {
    const key=batchGroup(task);
    if(!groups.has(key)) groups.set(key,[]);
    groups.get(key).push(task);
  }
  return `<div class="column-batch-groups">${Array.from(groups,([key,tasks])=>`<button class="column-select-all" type="button" data-select-column="${status}" data-batch-group="${esc(key)}" aria-label="全选${batchLabel(tasks)} ${tasks.length}项">全选${batchLabel(tasks)} · ${tasks.length}</button>`).join('')}</div>`;
}
function renderBoard() {
  const tasks = matchingTasks();
  const eligibleIds = new Set(state.tasks.filter(batchSelectable).map(task => task.id));
  for (const id of batchSelected) if (!eligibleIds.has(id)) batchSelected.delete(id);
  const visibleBatch = monitorOperations ? tasks.filter(batchSelectable) : [];
  const columns = [["待开始", "pending", ["pending"], "新任务会在这里等待交接。"], ["进行中", "active", ["active", "review"], "正在处理的任务会移到这里。"], ["已闭环任务", "done", ["done"], "最近闭环会显示在这里，全部记录可从左侧查阅。"]];
  if (state.tasks.some(task=>task.status==='waiting')) columns.splice(2,0,["等待沟通", "waiting", ["waiting"], "当前筛选没有匹配的阻塞任务。"]);
  const batchBar = monitorOperations ? businessBatchToolbar(tasks) : '';

  const folderConflicts = state.tasks.filter(pendingFolderConflict);
  const syncNotice = folderConflicts.length ? `<div class="panel process"><h3>文件与卡片状态不一致 · ${folderConflicts.length} 项</h3><p>任务书仍在“待测试”，但对应卡片已离开“待开始”。工作台不会按文件夹位置自动重开或改动任务状态；请核对这张卡的状态与目录归属。 ${folderConflicts.map(task => `<button class="button small" data-task="${task.id}">查看 ${esc(task.id)}</button>`).join(" ")}</p></div>` : "";
  setWorkspaceMarkup(`${monitorModulesMarkup()}<div class="toolbar"><h2>全局任务监控 <span class="helper">/ ${tasks.filter(task => task.status !== "done").length} 项未完成</span></h2>${filters(true, true)}</div>${batchBar}${visibleBatch.some(task=>task.kind==='test')?testExecutionControl('batch-test-execution-target'):''}${monitorOperations && state.batches?.length?recentBatchesMarkup():''}${syncNotice}<div class="board" style="--board-columns:${columns.length}">${columns.map(([title, cls, statuses, hint]) => { const items = tasks.filter(t => statuses.includes(t.status)); return `<section class="column ${cls}" ${monitorOperations?`data-drop-status="${cls}"`:""}><div class="column-head"><h3>${title}</h3><div class="column-head-actions"><span class="column-count">${items.length}</span></div></div>${monitorOperations?columnBatchControls(items,cls):""}${items.length ? (cls === "done" ? items.slice(0, 3) : items).map(task => workTaskCard(task, monitorOperations && batchSelectable(task), true)).join("") : `<div class="empty-column"><span class="empty-symbol">${cls === "done" ? "✓" : "＋"}</span>${hint}</div>`}${cls === "done" ? `<button class="button small history-link" id="view-history">查看全部闭环记录 / 批量撤回 →</button><p class="helper">本列最多展示最近 3 项</p>` : ""}</section>`; }).join("")}</div><div class="workflow-strip"><strong>一条清晰的研究闭环</strong><p><span>情报 / 客户问题</span> → 知识库维护 Agent 沉淀与返推 → 必要时测试 → 知识库维护 Agent 复核落库 → <span>陈震指派产品沟通</span><br>复制交接单后，在原工具中启动 Agent；回传原件与后续关系可从“事项链”追溯。</p><span class="flow-arrow">↗</span></div>`);
}
function updateBatchSelectionUi() {
  $(".batch-bar")?.classList.toggle("has-selection", batchSelected.size > 0);
  if ($("#batch-count")) $("#batch-count").textContent = `已选 ${batchSelected.size} 项，当前可选 ${$$('[data-batch-select]', $("#workspace")).length} 项`;
  if ($("#batch-dispatch")) {
    $("#batch-dispatch").disabled = selectedPendingBatch().length === 0;
    $("#batch-dispatch").textContent = `${selectedPendingBatch()[0]?.delivery?.branch==='knowledge'?'批量移交 Pi 执行':'批量开始并复制交接单'} · ${selectedPendingBatch().length} 项`;
  }
  if ($('#batch-copy')) {
    const count=selectedCopyBatch().length;
    $('#batch-copy').disabled=count===0;
    $('#batch-copy').textContent=`重新复制进行中交接单 · ${count} 项`;
  }
  if ($("#batch-close")) {
    const count = selectedClosingBatch().length;
    $("#batch-close").disabled = count === 0;
    $("#batch-close").textContent = `批量闭环已选任务 · ${count} 项`;
  }
  $$('[data-batch-select]', $("#workspace")).forEach(input => {
    input.checked = batchSelected.has(input.dataset.batchSelect);
    input.closest(".batch-task").classList.toggle("selected", input.checked);
  });
}
function questionRow(message) {
  const task = state.tasks.find(t => t.id === message.task_id);
  return `<button class="queue-item" data-task="${message.task_id}">${avatar(message.recipient_role)}<div class="queue-main"><h3>${esc(task?.title)}</h3><p>${esc(message.body)}</p><small>${esc(roleName(message.author_role))} → ${esc(roleName(message.recipient_role))} · ${message.blocking ? "阻塞任务" : "非阻塞问题"}</small></div><span class="status-label">${labels.questions[message.question_state]} ↗</span></button>`;
}
function sourceEventRow(item) {
  const sourceName = state.sources.find(source => source.id === (item.artifact_source || item.source))?.name || item.source;
  const sender = item.sender_role ? roleName(item.sender_role) : "未识别发件方";
  const auditMessage = item.source === "audit_communication" && item.kind !== 'audit_report';
  const triage = item.intent === "triage" && !item.task_id;
  const updatedClosedTask = item.change_kind === "modified" && item.task_status === "done";
  const typeControl = !item.task_id && item.kind === 'communication' && !auditMessage && !triage ? `<label class="helper">沟通类型 <select data-event-discussion-type="${item.id}" aria-label="来件 ${item.id} 沟通类型">${options({product:'产品沟通',temporary:'临时沟通'},item.source === 'communication' ? 'product' : 'temporary')}</select></label>` : '';
  const createAction = !item.task_id && auditMessage
    ? `<button class="button primary small" data-event-audit-route="${item.id}">流转审计沟通</button>`
    : !item.task_id
    ? `<button class="button ${item.kind==='communication'?'primary ':''}small" data-event-task="${item.id}">${item.intent === "info" ? "建立收悉任务" : "建立跟进任务"}</button>` : "";
  const actions = item.kind==='audit_report'
    ? `${item.task_id?`<button class="button small" data-task="${item.task_id}">打开原审计卡</button>`:''}<button class="button small subtle" data-event-review="${item.id}">标记已看</button>`
    : triage
    ? `<button class="button ${item.kind==='communication'?'primary ':''}small" data-event-triage="${item.id}">判读并处理</button>`
    : `${item.task_id ? `<button class="button small" data-task="${item.task_id}">${updatedClosedTask ? "查看已闭环原任务" : "打开关联任务"}</button>` : createAction}<button class="button small subtle" data-event-review="${item.id}">标记已看</button>`;
  if (item.kind === 'communication') {
    const originalTitle=String(item.title || '沟通来件');
    const prefix=originalTitle.match(/^(r\d+)\s*[·•]\s*[^·•]+给[^·•]+\s*[·•]\s*/i);
    const title=prefix ? originalTitle.slice(prefix[0].length).replace(/\s*[（(](待确认|已确认|已执行|已作废)[）)]\s*$/,'') : originalTitle;
    const intentLabel=auditMessage ? '审计来件 · 沿用现有审计交接规则' : labels.sourceIntents[item.intent] || '待判读';
    const typeLabel=auditMessage ? '审计沟通' : typeControl ? (item.source==='communication'?'产品沟通':'临时沟通') : '沟通件';
    const warning=updatedClosedTask ? '原任务已闭环；这是原件修订提醒，不是新派发任务。请核对变化，再决定是否重开或另建工作。' : item.triage_reason || '';
    return `<article class="source-event incoming-soft"><div class="incoming-soft-header"><span class="tag discussion" data-event-category-label="${item.id}">${esc(typeLabel)}</span><span class="incoming-file-state">${item.change_kind==='modified'?'原件发生变化':'新到文件'}</span>${prefix?`<span class="incoming-sequence">${esc(state.workspace.prefix)} · ${esc(prefix[1])}</span>`:''}</div><div class="incoming-soft-content"><h3 title="${esc(originalTitle)}" aria-label="${esc(originalTitle)}">${esc(title)}</h3><div class="incoming-route"><div>${avatar(item.sender_role)}<span><small>发件方</small><strong>${esc(sender)}</strong></span></div><span class="incoming-route-arrow" aria-hidden="true">→</span><div>${avatar(item.recipient_role)}<span><small>接收方</small><strong>${esc(item.recipient_role?roleName(item.recipient_role):'未识别接收方')}</strong></span></div></div><p class="incoming-intent">${esc(sourceName)} · ${esc(intentLabel)}</p>${warning?`<p class="triage-reason">${esc(warning)}</p>`:''}</div><div class="source-event-actions incoming-soft-footer">${typeControl || '<span class="helper">按现有判读规则处理</span>'}<div class="incoming-action-buttons"><button class="button small incoming-read" data-preview="${item.artifact_id}">只读查看原件 ↗</button>${actions}</div></div></article>`;
  }
  return `<article class="source-event"><div class="card-meta"><span class="tag ${item.intent === "info" ? "platform" : item.intent === "triage" ? "delivery" : item.kind === "test_assignment" ? "test" : "discussion"}">${labels.sourceKinds[item.kind] || "新文件"}</span><span class="task-id">${item.change_kind === "modified" ? "原件发生变化" : "新到文件"}</span></div><h3>${esc(item.title)}</h3><p>${esc(sender)} → ${esc(roleName(item.recipient_role))} · ${esc(sourceName)} · ${auditMessage ? "审计来件 · 可手动流转沟通" : labels.sourceIntents[item.intent] || "待判读"}</p>${updatedClosedTask ? `<p class="triage-reason">原任务已闭环；这是原件修订提醒，不是新派发任务。请核对变化，再决定是否重开或另建工作。</p>` : item.triage_reason ? `<p class="triage-reason">${esc(item.triage_reason)}</p>` : ""}<div class="source-event-actions"><button class="button small" data-preview="${item.artifact_id}">只读查看原件</button>${typeControl}${actions}</div></article>`;
}
function openTriage(id) {
  const item = state.source_events.find(entry => entry.id === id);
  if (!item) return;
  $("#triage-event").value = id;
  $("#triage-title").textContent = item.title;
  $("#triage-reason").textContent = item.triage_reason;
  const audit = item.source === 'audit_communication';
  const auditRoles = audit ? {pi:roleName('pi'), knowledge_auditor:roleName('knowledge_auditor')} : {pi:roleName('pi'),wb:roleName('wb'),codex:roleName('codex')};
  $('#triage-audit-sender-field').hidden = Boolean(item.sender_role);
  $('#triage-audit-sender').innerHTML = options({'':'请选择发件角色',...auditRoles},'');
  $('#triage-audit-sender').required = false;
  $('#triage-audit-rounds-field').hidden = true;
  $('#triage-audit-rounds').value = 3;
  $('#triage-audit-rounds').required = false;
  $("#triage-recipient").innerHTML = item.kind==='communication'
    ? options({'':'请选择收件角色',...Object.fromEntries(Object.entries(auditRoles).filter(([id])=>id!==item.sender_role))}, auditRoles[item.recipient_role] && item.recipient_role!==item.sender_role ? item.recipient_role : '')
    : `<option value="">请选择收件角色</option>${roleOptions("")}`;
  $("#triage-resolution").innerHTML = options({'':'请选择处理方式',info:'仅知悉，标记已处理',task:audit?'建立单次审计处理卡':'建立跟进任务，交给所选角色'},'');
  $('#triage-resolution').onchange = () => {
    const flow = $('#triage-resolution').value === 'task';
    $('#triage-audit-sender').required = flow && !item.sender_role;
    $('#triage-audit-rounds').required = false;
  };
  $("#triage-note").textContent = audit
    ? '确认后为收件方建立独立的单次处理卡，并关联来源；来源卡闭环不影响回件，不重跑审计。'
    : '对方无具体待办时选“仅知悉”；需要跟进时建立任务，交接单采用你确认的收件角色。';
  $('#triage-discussion-field').hidden = true;
  $('#triage-discussion-type').value = item.source === 'communication' ? 'product' : 'temporary';
  $("#triage-dialog").showModal();
}
function renderInbox() {
  const match = (text, role) => (roleFilter === 'all' || role === roleFilter) && text.toLowerCase().includes(query.toLowerCase());
  const incoming = state.source_events.filter(item => match(`${item.title || ''} ${item.name || ''} ${item.task_id || ''}`, item.recipient_role)).slice().sort((a,b)=>Number(b.id)-Number(a.id));
  const eventStates = {new:'待处理',linked:'已关联任务',reviewed:'已看',withdrawn:'原件已撤回',superseded:'已被后续版本替代'};
  const messages = state.messages.filter(m => match(m.body || '', m.recipient_role)).slice().reverse();
  const pagination=listPagination(incoming.length);
  const rows=incoming.slice((historyPage-1)*30,historyPage*30);
  setWorkspaceMarkup(`<div class="toolbar"><h2>来件记录 <span class="helper">· ${incoming.length} 条</span></h2>${filters()}<button class="button small" data-go-view="attention">打开待我处理</button></div><p class="helper">这里只查阅，不重复派发或确认。展示当前索引返回的记录；完整事项历史可从关联任务的时间线查阅。</p>${rows.map(item=>`<article class="source-event"><div class="card-meta"><span class="tag">${esc(labels.sourceKinds[item.kind] || '来件')}</span><span class="tag">${esc(eventStates[item.state] || item.state)}</span></div><h3>${esc(item.title || item.name)}</h3><p>${esc(roleName(item.sender_role))} → ${esc(roleName(item.recipient_role))} · ${esc(state.sources.find(source=>source.id===item.source)?.name || item.source)} · ${esc(appearedAt(item.created_at))}</p><small>${esc(item.name)}</small><div class="source-event-actions"><button class="button small" data-preview="${item.artifact_id}">只读查看原件</button>${state.tasks.some(task=>task.id===item.task_id)?`<button class="button small" data-task="${item.task_id}">查看关联任务</button><button class="button small" data-case="${item.task_id}">查看时间线</button>`:''}${item.state==='new'?'<button class="button small" data-go-view="attention">去待我处理</button>':''}</div></article>`).join('') || empty('没有匹配的来件记录','可调整搜索词或收件角色。')}${pagination}<div class="section-label">站内消息记录 · ${messages.length}</div>${messages.map(m=>`<article class="source-event"><div class="card-meta"><span class="tag">${esc(labels.message[m.kind] || m.kind)}</span></div><p>${esc(m.body)}</p><small>${esc(roleName(m.author_role))} → ${esc(roleName(m.recipient_role))} · ${esc(date(m.created_at))}</small>${state.tasks.some(task=>task.id===m.task_id)?`<div class="source-event-actions"><button class="button small" data-task="${m.task_id}">查看关联任务</button></div>`:''}</article>`).join('') || '<p class="helper">没有匹配的站内消息。</p>'}`);
}
function renderDecisions() { view = 'attention'; attentionFilter = 'decision'; renderAttention(); }

function renderLibrary() {
  const files = state.artifacts.filter(a => (sourceFilter === "all" || a.source === sourceFilter) && `${a.name} ${a.id} ${state.links.filter(link=>link.artifact_id===a.id).map(link=>link.task_id).join(' ')}`.toLowerCase().includes(query.toLowerCase()));
  const pagination=listPagination(files.length);
  const rows=files.slice((historyPage-1)*30,historyPage*30);
  setWorkspaceMarkup(`<details><summary>来源目录与可用性 · ${state.sources.length} 个</summary><div class="sources">${state.sources.map(s => `<div class="source-card"><strong>${esc(s.name)}</strong><span>${s.available ? "目录可用 · 只读" : "目录暂不可用"}</span><p>${esc(s.path)}</p></div>`).join("")}</div></details><div class="toolbar"><h2>Markdown 资料 <span class="helper">/ ${files.length} 份</span></h2><button class="button primary" id="scan">↻ 扫描源目录</button></div><div class="toolbar">${filters(false)}<select id="source-filter" aria-label="按资料来源筛选">${options({all: "全部来源", ...Object.fromEntries(state.sources.map(s => [s.id, s.name]))}, sourceFilter)}</select></div>${files.length ? `<div class="panel">${rows.map(a => `<div class="artifact-row"><div><div class="file-name">▤ ${esc(a.name)}</div><small>${esc(state.sources.find(s => s.id === a.source)?.name)} · ${(a.size / 1024).toFixed(1)} KB · ${a.available ? "可读取" : "源文件暂不可用"}</small></div><div class="artifact-actions"><button class="button small" data-preview="${a.id}">只读预览</button>${state.links.some(link=>link.artifact_id===a.id && state.tasks.some(task=>task.id===link.task_id))?`<button class="button small" data-task="${esc(state.links.find(link=>link.artifact_id===a.id && state.tasks.some(task=>task.id===link.task_id)).task_id)}">查看关联任务</button>`:`<button class="button small" data-artifact-task="${a.id}">建立任务</button>`}</div></div>`).join("")}</div>` : state.artifacts.length ? empty("没有匹配的资料", "调整搜索词或来源筛选后重试。服务运行时每约 30 秒检查新资料。") : empty("资料仍在熟悉的位置", "扫描固定的本线待办目录，建立只读索引。新资料在工作台运行时自动进入队列。", `<button class="button" id="empty-scan">扫描源目录</button>`)}${pagination}<p class="list-end">按本线固定来源只读登记 · 来件按明确路由判读或关联 · 测试闭环归档至“已归档” · 采集闭环归档至“已处置”</p>`);
}
function renderTeam() {
  setWorkspaceMarkup(`<div class="panel process"><h3>测试交接：完整步骤与复现依据</h3><p>测试交接单会附上待测原件全文。知识库维护 Agent 制定新测试时使用统一模板；缺少步骤、源码或样本时，测试 Agent 先向 知识库维护 Agent 澄清。</p><button class="button small" id="test-template">查看并复制测试任务模板</button></div><div class="role-grid">${state.roles.map(r => `<article class="role-card">${avatar(r.id)}<div><h3>${esc(r.name)}</h3><p><strong>代号：${esc(r.codename || r.short)}</strong> · ${esc(r.responsibility)}</p><small>${r.id === "chen" ? "当前操作人 · 统一代录" : "○ 需人工启动 · 在原工具执行"}</small></div></article>`).join("")}</div><div class="panel process"><h3>研究与测试：由 知识库维护 Agent 发起，也由 知识库维护 Agent 收口</h3><p>采集报告 / wb 提出客户问题 → 知识库维护 Agent 沉淀、返推 → 必要时生成待测试清单 → 指定执行者测试 → 报告进入“已测试” → 知识库维护 Agent 处理并回报，陈震确认闭环后由工作台归档。文件流转只跟卡片状态走两步：卡片改为“进行中”时，工作台把任务书从“待测试”移到“已测试”；卡片闭环时，工作台把这张卡的任务书和报告一起从“已测试”移到“已归档”。</p></div><div class="panel process"><h3>知识库审计：独立检查，知识库维护 Agent 单一维护</h3><p>从审计模块复制本线提示词 → 外部审计官只读核查，知识库维护 Agent 在现有权限内自审与修复 → 在原窗口回报实际覆盖、依据与未决项。复制提示词不建审计卡或启动 Agent；需要讨论时由陈震另行发起审计沟通。</p></div><div class="panel process"><h3>产品沟通：由陈震明确发起</h3><p>知识变化和审计发现先记录依据与议题，陈震指定范围、参与方、先发言方和最多轮数后再开展 知识库维护 Agent / WB 产品沟通。普通研究、知识变更和旧来件不会自动授权新的对话。审计往来使用 WPS“${state.workspace?.prefix || "TS"}-审计沟通”，业务交付沟通仍使用原目录。</p></div><details class="panel process auxiliary-section"><summary>辅助方式：站内澄清与临时沟通</summary><h3>真实阻塞时再使用</h3><p>任务内提问 → 接收角色答复 → 确认问题解决。阻塞问题解决前暂停流转。跨任务讨论可新建“临时讨论”，形成结论后关闭；新增实质工作创建子任务。</p></details>`);
}
function bindWorkspace() {
  bindBusinessDesk();
  bindAuditTracking($('#workspace'));
  bindTestExecutionControl('batch-test-execution-target');
  bindRecentBatches();
  bindClosureReopenHistory();
  $$('[data-attention-filter]', $("#workspace")).forEach(button=>button.onclick=()=>{attentionFilter=button.dataset.attentionFilter;render();});
  $$('[data-discussion-type]', $('#workspace')).forEach(select => select.onchange = () => run(async () => {
    const task = state.tasks.find(item => item.id === select.dataset.discussionType);
    try { await api(`/tasks/${task.id}/discussion-type`,{revision:task.revision,discussion_type:select.value}); }
    catch (error) { await refresh(); throw error; }
    batchSelected.clear(); await refresh(); toast('沟通类型已保存，原件目录和接收方不变');
  }, select));
  $$('[data-case]', $('#workspace')).forEach(button=>button.onclick=()=>run(()=>openCase(button.dataset.case),button));
  $$('[data-go-view]', $('#workspace')).forEach(button=>button.onclick=()=>{view=button.dataset.goView;if(view==='attention')attentionFilter='all';query='';roleFilter='all';historyPage=1;batchSelected.clear();render();window.scrollTo(0,0);});
  bindBoardDrag();
  if ($("#view-history")) $("#view-history").onclick = () => { view = "history"; historyPage = 1; historyKind = "all"; historyMonth = ""; batchSelected.clear(); render(); };
  if ($("#history-kind")) $("#history-kind").onchange = event => { historyKind = event.target.value; historyPage = 1; clearClosureReopenSelection(); renderFiltered(); };
  if ($("#history-month")) $("#history-month").onchange = event => { historyMonth = event.target.value; historyPage = 1; clearClosureReopenSelection(); renderFiltered(); };
  if ($("#history-reset")) $("#history-reset").onclick = () => { query = ""; roleFilter = "all"; historyKind = "all"; historyMonth = ""; historyPage = 1; clearClosureReopenSelection(); render(); };
  $$('[data-history-page]').forEach(button => button.onclick = () => { historyPage = Number(button.dataset.historyPage); render(); });
  if ($("#test-template")) $("#test-template").onclick = event => run(async () => {
    const result = await api("/test-assignment-template");
    showText(result.filename, result.text, "知识库维护 Agent 负责填写；相关研究交接单已自动包含此模板。原有待测文件不会被改写。");
    try { await writeClipboard(result.text); toast("测试任务模板已复制"); }
    catch { toast("请从预览中手动复制模板"); }
  }, event.currentTarget);
  $$("[data-task]", $("#workspace")).forEach(button => button.onclick = () => openTask(button.dataset.task));
  $$('[data-batch-select]', $("#workspace")).forEach(input => input.onchange = () => {
    if (input.checked && batchSelected.size >= FLOW_BATCH_LIMIT) { input.checked = false; toast("一次最多交接 50 项", true); return; }
    const candidate = state.tasks.find(task => task.id === input.dataset.batchSelect);
    const first = state.tasks.find(task => batchSelected.has(task.id));
    if (input.checked && first && batchGroup(first) !== batchGroup(candidate)) { input.checked = false; toast('一批请选择同一类别、同一执行方；内部反哺和最终交付需分开', true); return; }
    if (input.checked) batchSelected.add(input.dataset.batchSelect);
    else batchSelected.delete(input.dataset.batchSelect);
    updateBatchSelectionUi();
  });
  $$('[data-select-column]', $("#workspace")).forEach(button => button.onclick = () => {
    const column = button.closest(".column");
    const candidates = $$('[data-batch-select]', column)
      .map(input => input.dataset.batchSelect)
      .filter(id => !batchSelected.has(id) && batchGroup(state.tasks.find(task=>task.id===id))===button.dataset.batchGroup);
    const first = state.tasks.find(task => batchSelected.has(task.id)) || state.tasks.find(task => task.id === candidates[0]);
    if(first && batchGroup(first)!==button.dataset.batchGroup){toast('不同类别需分别操作，请先清空当前选择',true);return;}
    const available = candidates.filter(id => batchGroup(state.tasks.find(task => task.id === id)) === batchGroup(first));
    if (available.length < candidates.length) toast('已选择同类、同执行方任务；其他任务请另选一批');
    const room = Math.max(0, FLOW_BATCH_LIMIT - batchSelected.size);
    available.slice(0, room).forEach(id => batchSelected.add(id));
    updateBatchSelectionUi();
    if (available.length > room) toast("一次最多交接 50 项，请分批处理");
  });
  if ($('#batch-copy')) $('#batch-copy').onclick = event => run(() => copyActiveBatch(selectedCopyBatch()), event.currentTarget);
  if ($("#batch-clear")) $("#batch-clear").onclick = () => { batchSelected.clear(); updateBatchSelectionUi(); };
  if ($("#batch-close")) $("#batch-close").onclick = openBatchClose;
  if ($("#batch-dispatch")) $("#batch-dispatch").onclick = event => run(() => dispatchBatch(selectedPendingBatch()), event.currentTarget);
  $$("[data-preview]", $("#workspace")).forEach(button => button.onclick = () => run(() => preview(Number(button.dataset.preview)), button));
  $$("[data-artifact-task]").forEach(button => button.onclick = () => openCreate(null, Number(button.dataset.artifactTask)));
  $$("[data-event-triage]").forEach(button => button.onclick = () => openTriage(Number(button.dataset.eventTriage)));
  $$("[data-event-audit-route]").forEach(button => button.onclick = () => openTriage(Number(button.dataset.eventAuditRoute)));
  $$("[data-event-task]").forEach(button => button.onclick = () => run(async () => {
    const type = $(`[data-event-discussion-type="${button.dataset.eventTask}"]`)?.value;
    const result = await api(`/source-events/${button.dataset.eventTask}/create-task`, type ? {discussion_type:type} : {});
    await refresh(); openTask(result.task_id);
  }, button));
  $$("[data-event-review]").forEach(button => button.onclick = () => run(async () => {
    await api(`/source-events/${button.dataset.eventReview}/review`, {}); await refresh(); toast("已在工作台标记；WPS 原件没有修改。");
  }, button));
  const search = $("#search");
  if (search) search.oninput = () => { query = search.value; historyPage = 1; batchSelected.clear(); clearClosureReopenSelection(); renderFiltered(); };
  if ($("#role-filter")) $("#role-filter").onchange = event => { roleFilter = event.target.value; historyPage = 1; batchSelected.clear(); clearClosureReopenSelection(); renderFiltered(); };
  if ($("#source-filter")) $("#source-filter").onchange = event => { sourceFilter = event.target.value; historyPage=1; renderFiltered(); };
  [$("#scan"), $("#empty-scan"), $("#board-scan"), $("#attention-scan"), $("#work-scan")].filter(Boolean).forEach(button => button.onclick = () => run(async () => {
    const result = await api(view==='delivery'?'/delivery/sync':'/scan', {}); await refresh();
    toast(`${result.skipped ? "同步部分完成，未读原件将继续重试" : "同步完成"}：检查 ${result.indexed} 份资料，恢复 ${result.recovered_test_archives || 0} 份归档链接，新增 ${result.queued} 项待办/通知，跳过 ${result.skipped} 份。${result.warnings.slice(0, 3).join("；")}`, result.warnings.length > 0);
  }, button));
}
/** Dropping proposes a transition; only saving the existing dialog mutates state. */
function bindBoardDrag() { workCardDrag.bind(); }
/** Calendar presets are calculated from Beijing dates, independent of browser timezone. */
function setReferencePeriod(preset) {
  const parts = new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Shanghai', year:'numeric', month:'2-digit', day:'2-digit'}).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  const end = new Date(`${values.year}-${values.month}-${values.day}T00:00:00Z`);
  let start = new Date(end);
  if (preset === 'week') {
    end.setUTCDate(end.getUTCDate() - ((end.getUTCDay() + 6) % 7) - 1);
    start = new Date(end); start.setUTCDate(start.getUTCDate() - 6);
  } else if (preset === 'month') {
    end.setUTCDate(0); start = new Date(end); start.setUTCDate(1);
  } else if (preset !== 'custom') {
    start.setUTCDate(start.getUTCDate() - Number(preset) + 1);
  }
  if ($('#reference-basis').value === 'all') $('#reference-basis').value = $('#create-kind').value === 'discussion' ? 'completed' : 'report';
  if (preset !== 'custom' || !$('#reference-start').value) {
    $('#reference-start').value = start.toISOString().slice(0,10);
    $('#reference-end').value = end.toISOString().slice(0,10);
  }
  return loadReferenceCandidates();
}
function visibleReferenceCandidates() {
  const query = $('#reference-search').value.toLowerCase(), source = $('#reference-source').value;
  return createCandidates.filter(item => (source === 'all' || item.source === source) && `${item.name} ${item.task_ids.join(' ')}`.toLowerCase().includes(query));
}
function renderReferenceCandidates() {
  const visible = visibleReferenceCandidates(), shown = new Set(visible.map(item => item.id));
  const hidden = [...createArtifactSelected].filter(id => !shown.has(id)).length;
  $('#reference-count').textContent = `当前结果 ${visible.length} 份 · 已选 ${createArtifactSelected.size} / 50 份${hidden ? `（其中 ${hidden} 份不在当前筛选中）` : ''}`;
  $('#reference-list').innerHTML = visible.map(item => `<label class="reference-item"><input type="checkbox" data-reference="${item.id}"${createArtifactSelected.has(item.id)?' checked':''}><span>${esc(item.name)}<small>${esc(item.selected_date || '日期未知')} · ${esc(state.sources.find(source=>source.id===item.source)?.name || item.source)}${item.task_ids.length ? ` · ${esc(item.task_ids.join('、'))}` : ''}${!item.available ? ' · 暂不可读' : ''}${item.results?.length ? `<br>${esc(item.results.map(result=>`${outcomeLabels[result.outcome] || '未记录处置类别'}${result.next_step ? ' · '+result.next_step : ''}`).join('；'))}` : ''}</small></span></label>`).join('') || '<p class="helper">没有匹配资料。可调整日期依据或让 知识库维护 Agent 从现有工作记录补充议题。</p>';
  $$('[data-reference]').forEach(input => input.onchange = () => {
    const id = Number(input.dataset.reference);
    if (input.checked && createArtifactSelected.size >= 50) { input.checked=false; toast('最多选择 50 份，请缩小范围或分批讨论', true); return; }
    if (input.checked) createArtifactSelected.add(id); else createArtifactSelected.delete(id);
    renderReferenceCandidates();
  });
  $('#reference-selected-list').innerHTML = [...createArtifactSelected].map(id => `<div class="reference-selected-item"><span>${esc(state.artifacts.find(item=>item.id===id)?.name || `资料 ${id}`)}</span><button class="button small" type="button" data-remove-reference="${id}">移除</button></div>`).join('') || '<p class="helper">尚未选择资料。</p>';
  $$('[data-remove-reference]').forEach(button => button.onclick = () => { createArtifactSelected.delete(Number(button.dataset.removeReference)); renderReferenceCandidates(); });
}
async function loadReferenceCandidates() {
  const sequence = ++candidateRequest, scope = activeWorkspace;
  const basis = $('#reference-basis').value, start = $('#reference-start').value, end = $('#reference-end').value;
  const meeting=$('#create-kind').value==='discussion' && $('#create-meeting').checked;
  $('#reference-dates').hidden = basis === 'all' && !meeting;
  $('#reference-period-note').textContent = basis === 'all' ? (meeting ? `复盘周期 ${start || '未选开始'} 至 ${end || '未选结束'}；当前显示全部已登记资料，可补充日期未知的工作记录或背景依据。` : '只列出已登记资料；日期未知不会被猜测为入库日期。') : `${start || '未选开始'} 至 ${end || '未选结束'} · 北京时间，含首尾日期。研究闭环不等于已入库，知识库维护 Agent 需核实。`;
  createCandidates=[]; renderReferenceCandidates();
  $('#reference-list').textContent='正在读取候选资料…';
  try {
    const result = await api(`/reference-candidates?${new URLSearchParams({basis,start,end})}`);
    if (sequence !== candidateRequest || scope !== activeWorkspace || !$('#create-dialog').open) return;
    createCandidates=result.items; renderReferenceCandidates();
  } catch (error) {
    if (sequence === candidateRequest && scope === activeWorkspace && $('#create-dialog').open) $('#reference-list').textContent=error.message;
  }
}
function updateMeetingFields() {
  $('#create-meeting').checked=false;
  const discussion = $('#create-kind').value === 'discussion', meeting = false;
  $('#meeting-toggle-field').hidden=true; $('#meeting-fields').hidden=true;
  $('#meeting-fields').disabled=!meeting;
  $('#create-reference-label').textContent=discussion ? '讨论引用 · 最多 50 份 · 不影响原件归档' : '关联资料 · 最多 50 份';
  if (meeting) {
    $('#create-owner').value=$('#meeting-speaker').value;
    $$('[name=participant]').filter(input=>['pi','wb'].includes(input.value)).forEach(input=>input.checked=true);
    if ($('#reference-basis').value==='all' && !$('#reference-start').value) setReferencePeriod('week');
  }
}
function openCreate(parent = null, artifactId = null) {
  if(workspaceLoading) {toast('工作空间正在加载，请稍后重试');return;}
  $("#create-form").reset();
  $$('#create-form details').forEach(detail=>detail.open=false);
  $('#reference-basis option[value=all]').disabled=false;
  $('#reference-basis').value='all';
  createArtifactSelected.clear(); if (artifactId !== null) createArtifactSelected.add(artifactId);
  createCandidates=[]; candidateRequest++;
  $("#audit-create-hint").hidden = true;
  $("#create-kind").innerHTML = options(Object.fromEntries(Object.entries(labels.kinds).filter(([id])=>id!=='audit')), "research");
  $("#create-owner").innerHTML = options(Object.fromEntries(state.roles.filter(r=>r.id!=="knowledge_auditor").map(r=>[r.id,r.name])),"pi");
  $("#create-owner").dataset.autoSelected = "";
  $("#create-kind").onchange = () => {
    $('#create-meeting').checked=false;
    updateMeetingFields();
    const owner = $("#create-owner");
    if ($("#create-kind").value === "audit") {
      owner.value = "knowledge_auditor";
      owner.dataset.autoSelected = "true";
      $("#audit-create-hint").hidden = false;
    } else if (owner.dataset.autoSelected === "true") {
      owner.value = "pi";
      owner.dataset.autoSelected = "";
      $("#audit-create-hint").hidden = true;
    } else {
      $("#audit-create-hint").hidden = true;
    }
  };
  $("#create-owner").onchange = () => {
    if ($('#create-kind').value==='discussion' && $('#create-meeting').checked) {
      if (['pi','wb'].includes($('#create-owner').value)) $('#meeting-speaker').value=$('#create-owner').value;
      else $('#create-owner').value=$('#meeting-speaker').value;
    }
    if ($("#create-kind").value === "audit" && $("#create-owner").value !== "knowledge_auditor") {
      $("#create-owner").value = "knowledge_auditor";
      toast("知识库审计卡必须交给独立审计官", true);
      return;
    }
    $("#create-owner").dataset.autoSelected = "";
  };
  $("#participants").innerHTML = state.roles.map(r => `<label><input type="checkbox" name="participant" value="${r.id}">${esc(r.name)}</label>`).join("");
  $("#create-parent").innerHTML = `<option value="">独立任务</option>` + state.tasks.filter(t => t.status !== "done").map(t => `<option value="${t.id}"${t.id === parent ? " selected" : ""}>${esc(t.title)}</option>`).join("");
  $('#reference-source').innerHTML='<option value="all">全部来源</option>'+[...new Set(state.artifacts.map(item=>item.source))].map(id=>`<option value="${esc(id)}">${esc(state.sources.find(item=>item.id===id)?.name || id)}</option>`).join('');
  $('#reference-search').oninput=renderReferenceCandidates; $('#reference-source').onchange=renderReferenceCandidates;
  ['reference-basis','reference-start','reference-end'].forEach(id=>$('#'+id).onchange=loadReferenceCandidates);
  $$('[data-period]').forEach(button=>button.onclick=()=>setReferencePeriod(button.dataset.period));
  $('#reference-select-all').onclick=()=>{const visible=visibleReferenceCandidates(); const ids=new Set([...createArtifactSelected,...visible.map(item=>item.id)]); if(ids.size>50){toast('当前结果超过 50 份，请筛选后再全选或分批讨论',true);return;} ids.forEach(id=>createArtifactSelected.add(id));renderReferenceCandidates();};
  $('#reference-clear-visible').onclick=()=>{visibleReferenceCandidates().forEach(item=>createArtifactSelected.delete(item.id));renderReferenceCandidates();};
  $('#reference-clear').onclick=()=>{createArtifactSelected.clear();renderReferenceCandidates();};
  $('#create-meeting').onchange=updateMeetingFields; $('#meeting-speaker').onchange=updateMeetingFields;
  $("#create-dialog").showModal();
  $('#create-dialog').scrollTop=0;
  updateMeetingFields(); loadReferenceCandidates();
}
function openTask(id) { selectedTask = id; renderTask(); if (!$("#task-dialog").open) $("#task-dialog").showModal(); }
function renderTask() {
  const task = state.tasks.find(t => t.id === selectedTask);
  if(task)workCardDrag.observeTask(task.id);
  if (!task) { $('#task-dialog').close(); selectedTask=null; return; }
  $('#task-detail').classList.remove('delivery-detail');delete $('#task-detail').dataset.deliveryBranch;
  const messages = state.messages.filter(m => m.task_id === task.id);
  const closed = task.status === "done";
  const files = state.links.filter(l => l.task_id === task.id).map(l => state.artifacts.find(a => a.id === l.artifact_id)).filter(Boolean);
  const children = state.tasks.filter(t => t.parent_id === task.id);
  const references = (state.references || []).filter(item=>item.task_id===task.id);
  const referenceFiles = references.map(item=>state.artifacts.find(file=>file.id===item.artifact_id)).filter(Boolean);
  const meeting = (state.discussions || []).find(item=>item.task_id===task.id);
  const unlinked = state.artifacts.filter(a => !task.delivery && !files.some(f => f.id === a.id) && !referenceFiles.some(f=>f.id===a.id));
  const closingBatch = batchSelected.has(task.id) ? selectedClosingBatch() : [];
  const startingBatch = batchSelected.has(task.id) && task.status === "pending" ? selectedPendingBatch() : [];
  $("#task-detail").innerHTML = `<div class="dialog-heading"><div><div class="eyebrow">${task.id} / ${taskKindLabel(task)}</div><h2>${esc(taskDisplayTitle(task))}</h2></div><button class="icon-button" data-close aria-label="关闭">×</button></div><div class="task-summary"><span class="tag">${labels.statuses[task.status]}</span>${auditBadge(task)}<span>负责：${esc(taskRoleLabel(task.owner, task))}</span><span>参与：${task.participants.map(role => taskRoleLabel(role, task)).map(esc).join("、")}</span><span>出现于 ${esc(appearedAt(task.created_at))}</span><span>更新于 ${date(task.updated_at)}</span></div>${pendingFolderConflict(task) ? `<p class="triage-reason">这张卡已闭环，但关联任务书仍在“待测试”目录。工作台保留当前卡片状态；请核对目录归档是否完成。</p>` : ""}${task.parent_id ? `<p class="helper">父任务：<button class="button small" data-child="${task.parent_id}">${esc(state.tasks.find(t => t.id === task.parent_id)?.title)}</button></p>` : ""}<p class="task-description">${esc(taskDescription(task) || (task.kind === "audit" ? "默认执行当前工作空间知识库全库全量审计。交接单已包含审计范围和要求。" : "暂无任务说明。"))}</p><div class="task-actions"><select id="task-status" aria-label="任务状态">${options(labels.statuses, task.status)}</select><button class="button" id="change-status">更新状态</button><button class="button" id="check-operation">检查操作条件</button><button class="button" id="task-case-timeline">完整事项时间线</button><button class="button" id="copy-handoff">复制交接单</button><button class="button" id="download-handoff">下载 .md</button>${closed ? "" : `<button class="button" id="create-child">＋ 子任务</button>`}</div><div id="batch-closure-note" class="batch-closure-note" hidden>${closingBatch.length > 0 ? `<strong>本次将闭环 ${closingBatch.length} 项已选${batchLabel(closingBatch)}</strong><p>待开始研究任务须确认已在外部处理完成；不会代为开始或执行。${task.kind==='discussion' ? '确认下列每张卡的本方本次处理已完成；保留原件与记录，回件独立建卡，不表示双方达成一致。' : task.kind==='delivery'?'确认所列每张交付卡实际处理完毕；只闭环本分支，不移动原报告、不影响另一分支、不代表已发送客户。':'任务书与已测试报告归档到“已归档”，采集原件归档到“已处置”。'}下方结论如填写，将用于这 ${closingBatch.length} 项。</p><ul>${closingBatch.map(item => `<li>${esc(taskDisplayTitle(item))} · ${item.id}</li>`).join("")}</ul>` : ""}</div>${task.kind === "audit" ? `<label id="audit-outcome-field" hidden>审计覆盖结果<select id="audit-outcome">${options({"": "请选择（尚未记录）", ...labels.auditOutcomes}, task.audit_outcome || "")}</select><span class="helper">全量完成表示覆盖了委托范围，不代表没有发现问题。重新开始后保留上次记录，可在下次闭环时更新。</span></label>` : ""}<label id="closure-field" hidden>闭环结论（选填）<textarea id="closure-summary" maxlength="12000" rows="3" placeholder="已完成什么、结论是什么、后续由谁跟进"></textarea><span class="helper">${files.some(a => a.source === "pending_tests") ? "确认闭环后，关联任务书与“已测试”中的报告一并移入“已归档”。" : files.some(a => a.source === "completed_tests") ? "确认闭环后，这张卡在“已测试”里的任务书与报告一并移入“已归档”；若还有未闭环任务共用同一份报告，则等最后一项闭环再归档。" : files.some(a => ["intelligence","mac_intelligence"].includes(a.source)) ? "确认闭环后，关联采集原件会从待处置移到已处置；若还有其他未闭环任务使用同一原件，则等最后一项闭环再归档。" : "确认后保留任务与资料入口；结论可选填。"}</span></label>${task.summary ? `<div class="summary-box">${esc(task.summary)}</div>` : ""}${children.length ? `<div class="detail-section"><h3>子任务</h3>${children.map(t => `<button class="button small" data-child="${t.id}">${esc(t.title)} · ${labels.statuses[t.status]}</button>`).join(" ")}</div>` : ""}<div class="detail-section"><h3>关联资料 · ${files.length}</h3>${files.map(a => `<div class="linked-item"><button class="button small" data-preview="${a.id}">▤ ${esc(a.name)}</button>${a.source === "intelligence_archive" ? `<span class="tag">已归档</span>` : a.source === "test_archive" ? `<span class="tag">已归档</span>` : ""}</div>`).join("") || `<p class="helper">${task.kind === "audit" ? "全库审计无需关联资料；交接单已提供 当前工作空间知识库路径。" : "暂无关联资料。先在“资料索引”扫描，再关联本次任务所需文件。"}</p>`}${!closed && unlinked.length ? `<form id="link-form" class="link-form"><select id="link-file" aria-label="选择关联资料">${unlinked.map(a => `<option value="${a.id}">${esc(a.name)}</option>`).join("")}</select><button class="button small" type="submit">关联资料</button></form>` : ""}</div><details class="auxiliary-section" id="task-communication"${openQuestions(task.id).length ? " open" : ""}><summary>站内沟通（辅助） · ${messages.length} 条${openQuestions(task.id).length ? " · 有未解决问题" : ""}</summary><div class="detail-section"><h3>任务沟通 · ${messages.length}</h3>${messages.length ? messages.map(messageMarkup).join("") : `<p class="helper">可以提出问题、请求决策，或记录无需回复的告知。</p>`}</div>${closed ? `<p class="helper">任务已闭环。需要继续沟通时，将状态改为“进行中”。</p>` : `<form id="message-form" class="composer"><h3 id="composer-title">记录一条沟通</h3><p class="helper">由陈震代录角色的真实消息；平台不会自动发送给外部 Agent。</p><div class="form-row"><label>沟通类型<select id="message-kind">${options({question: "提问 / 澄清", notice: "告知 · 无需回复", decision: "请求陈震决策"}, "question")}</select></label><label>代哪个角色记录<select id="message-author">${roleOptions(task.owner)}</select></label></div><label id="recipient-label">接收角色<select id="message-recipient">${roleOptions(task.owner === "pi" ? "tester" : "pi")}</select></label><div id="reply-context" class="question-reference" hidden></div><input id="reply-to" type="hidden"><label>沟通内容<textarea id="message-body" required maxlength="16000" placeholder="把问题说清楚：缺少什么信息，希望对方明确什么？"></textarea></label><label class="blocking-label" id="blocking-label"><input id="message-blocking" type="checkbox">此问题未解决前，暂停任务流转</label><div class="form-actions"><button type="button" class="button" id="cancel-reply" hidden>取消回复</button><button class="button primary" type="submit">保存沟通</button></div></form>`}</details><details class="legacy-history"><summary>操作记录 · 当前操作人：陈震</summary>${state.events.filter(e => e.task_id === task.id).map(e => `<p>${date(e.created_at)} · ${esc(e.detail)} · ${esc(recordedActor(e.recorded_by))}</p>`).join("")}</details>`;
  $("#task-status option[value=waiting]").disabled = true;
  if (task.kind==='discussion') $('.task-actions', $('#task-detail')).insertAdjacentHTML('afterend', `<div class="detail-section"><h3>讨论引用 · ${referenceFiles.length} 份 · 不影响原件归档</h3>${referenceFiles.map(item=>`<div class="linked-item"><button class="button small" data-preview="${item.id}">${esc(item.name)}</button><span class="helper">${!item.available?'暂不可读 · ':''}${references.find(ref=>ref.artifact_id===item.id)?.digest!==item.digest?'选择后内容已变化':''}</span></div>`).join('') || '<p class="helper">未引用文件，请按议题依据从现有工作记录核实。</p>'}</div>`);
  if(task.audit_tracking) {
    $('.task-actions', $('#task-detail')).insertAdjacentHTML('afterend',auditTrackingMarkup(task,true));
    bindAuditTracking($('#task-detail'));
  }
  if (task.auto_run) {
    $('.task-actions', $('#task-detail')).insertAdjacentHTML('beforebegin', '<p class="triage-reason">历史采集自动移交：' + esc(task.auto_run.label) + ' · ' + esc(task.auto_run.id) + '。请在“采集自动移交”查看原执行会话与历史回报。</p>');
    if (task.auto_run.live) ['copy-handoff','download-handoff'].forEach(id => {$('#'+id).disabled=true;});
  }
  $('.task-actions', $('#task-detail')).insertAdjacentHTML('afterend', `<div class="task-next-action"><strong>下一步</strong><p>${task.status==='done' ? '此项已完成。需要继续处理时可重新打开；不再保留在列表时可移入垃圾箱。' : task.auto_run?.live ? '本项正在自动处理，请到对应模块查看执行情况；不要重复手动移交。' : task.status==='review' ? '核对负责人回报后，选择“已闭环”并确认。' : task.status==='pending' ? '确认要执行后，改为“进行中”，复制交接单到负责人使用的工具。' : '负责人处理完成后核对回报，再确认闭环。不再需要执行时，可以撤销。'}</p><button class="button small" id="trash-current-task"${task.auto_run?.live ? ' disabled' : ''}>撤销任务 · 移入垃圾箱</button></div>`);
  $('#trash-current-task').onclick=()=>openTrash(task);
  if(task.audit_tracking?.auto_close) {
    $('.task-description', $('#task-detail')).textContent='发起和复制均留痕；维护者自行落盘，工作台校验后自动闭环本轮回报，实际覆盖和未决项保留。';
    $('.task-next-action p', $('#task-detail')).textContent=task.status==='done'
      ?'本轮审计回报已接收并闭环；实际覆盖与遗留见下方报告，不等于全库全量目标已完成。'
      :'维护者向固定地址落盘后，工作台自动接收并闭环本轮回报；无需手动重复闭环。有阻塞时会保留报告并显示具体原因。';
  }
  if (task.kind==='discussion' && task.status!=='done') {
    $('.task-next-action p', $('#task-detail')).textContent='本卡只处理当前负责人这一次沟通。核对实际回报后选择“已闭环”；对方实质回件另建卡，不必等待整场沟通结束，也不需要填写轮次。';
  }
  if(task.kind==='test') {
    $('.task-actions', $('#task-detail')).insertAdjacentHTML('beforebegin',testExecutionControl('test-execution-target'));
    bindTestExecutionControl('test-execution-target');
  }
  const handoffPath = () => {
    const params=new URLSearchParams();
    if(task.kind==='test')params.set('execution_target',testExecutionTarget());
    return `/tasks/${task.id}/handoff${params.size?'?'+params:''}`;
  };
  if (task.kind==='discussion') {
    const heading=$$('.detail-section h3', $('#task-detail')).find(item=>item.textContent.startsWith('关联资料'));
    if (heading && files.length===0) {
      heading.textContent='补充讨论引用';
      const helper=$('.helper',heading.parentElement); if(helper) helper.textContent='从已登记资料补充引用，不改变原任务或原件归档责任。';
      const button=$('#link-form button'); if(button) button.textContent='添加引用';
    }
  }
  if (task.status === 'done') {
    $('.task-actions', $('#task-detail')).insertAdjacentHTML('afterend', `<div class="task-next-action"><strong>闭环误操作纠正</strong><p>需要继续处理时可撤回闭环；原结论与归档资料保留，不搬回原目录。</p><button class="button small" id="reopen-current-task"${task.auto_run?.live ? ' disabled' : ''}>撤回闭环 · 恢复进行中</button></div>`);
    $('#reopen-current-task').onclick = () => openClosureReopen([task]);
  }
  $(".task-actions", $("#task-detail")).insertAdjacentHTML("afterend", `<div id="batch-start-note" class="batch-closure-note" hidden>${startingBatch.length > 1 ? `<strong>本次将开始 ${startingBatch.length} 项已选的待开始${batchLabel(startingBatch)}</strong><p>${task.delivery?.branch==='knowledge'?'确认后将所列内部反哺卡分别排队交给本线 Pi，无需手动复制；核验实际保存后自动闭环。':'只处理待开始列的已选任务，确认后生成并复制合并交接单；进行中列的选择保留。'}</p><ul>${startingBatch.map(item => `<li>${esc(taskDisplayTitle(item))} · ${esc(item.id)}</li>`).join("")}</ul>` : ""}</div>`);
  const pendingClosures = closingBatch.filter(item=>item.status==='pending');
  if (pendingClosures.length) $('#batch-closure-note').insertAdjacentHTML('beforeend', `<label class="batch-confirmation"><input type="checkbox" id="batch-pending-confirm">我已核对所列 ${pendingClosures.length} 项待开始研究任务在外部已处理完成，确认闭环归档。</label>`);
  const auditOutcomeField=$('#audit-outcome-field');
  if(auditOutcomeField) {
    $('.task-actions', $('#task-detail')).insertAdjacentElement('afterend',auditOutcomeField);
    auditOutcomeField.insertAdjacentHTML('afterend','<div id="audit-close-guidance" hidden><p id="audit-close-reason" class="triage-reason" role="status"></p><button class="button small" id="audit-close-record" hidden>登记已有审计回报</button></div>');
    $('#audit-close-record').onclick=()=>{if(task.audit_tracking?.auto_close){$('[data-audit-supplement]', $('#task-detail')).click();return;}$('#audit-manual-report').open=true;$('#audit-existing-report').focus();};
    if(task.audit_tracking) {
      $('#audit-outcome').disabled=true;
      $('.helper',auditOutcomeField).textContent='覆盖结果沿用已登记的审计回报；全量完成不等于全部问题已解决。';
    }
  }
  const updateTaskAction = () => {
    const status = $("#task-status").value;
    const done = status === "done";
    if(task.audit_tracking && $('#audit-outcome'))$('#audit-outcome').value=task.audit_outcome || '';
    const outcome = $("#audit-outcome")?.value || task.audit_outcome || "";
    const summary = done ? $("#closure-summary").value.trim() || task.summary : task.summary;
    const changed = status !== task.status || summary !== task.summary || (done && outcome !== (task.audit_outcome || ""));
    $("#closure-field").hidden = !done;
    if ($("#audit-outcome-field")) $("#audit-outcome-field").hidden = !done;
    const missingAuditReport=done && task.audit_tracking && !task.audit_tracking.received_at;
    const changedAuditReport=done && task.audit_tracking?.pending_digest;
    const auditReason=missingAuditReport && task.audit_tracking.auto_close?'正在等待维护者自行落盘审计回报；工作台检测后会自动闭环本轮回报。无需粘贴全文，也不必在这里提前选择已闭环。':missingAuditReport?'尚未收到有效审计回报，不能直接闭环。请先同步文件，或点击下方“登记已有审计回报”粘贴维护者已回复的报告，无需重跑。':changedAuditReport?'审计回报原件有未核对的版本，请先查看原件并采用正确版本。':done && task.kind==='audit' && !outcome?'请选择上方“审计覆盖结果”，再确认闭环。':'';
    if($('#audit-close-reason')) {
      $('#audit-close-guidance').hidden=!auditReason;$('#audit-close-reason').textContent=auditReason;
      $('#audit-close-record').hidden=!missingAuditReport;$('#audit-close-record').textContent=task.audit_tracking?.auto_close?'复制自动回传说明':'登记已有审计回报';
    }
    $("#batch-closure-note").hidden = !done || closingBatch.length < 1;
    const starting = status === "active" && startingBatch.length > 1;
    $("#batch-start-note").hidden = !starting;
    $("#change-status").textContent = task.delivery?.branch==='knowledge' && task.status==='pending' && status==='active' ? `确认移交 Pi · ${starting ? startingBatch.length : 1} 项内部反哺` : starting ? `批量开始并复制交接单 · ${startingBatch.length} 项` : done && closingBatch.length > 0 ? `确认批量闭环 ${closingBatch.length} 项` : status === task.status ? "保存结果" : "更新状态";
    $("#change-status").disabled = !changed || (done && pendingClosures.length>0 && !$("#batch-pending-confirm")?.checked) || !!missingAuditReport || !!changedAuditReport || (done && task.status !== "done" && task.kind === "audit" && !outcome);
  };
  if ($("#batch-pending-confirm")) $("#batch-pending-confirm").onchange = updateTaskAction;
  $("#task-status").onchange = updateTaskAction;
  $("#closure-summary").oninput = updateTaskAction;
  if ($("#audit-outcome")) {
    $("#audit-outcome").onchange = updateTaskAction;
    if (task.audit_outcome) $("#audit-outcome option[value='']").disabled = true;
  }
  updateTaskAction();
  $("#change-status").onclick = event => run(async () => {
    const status = $("#task-status").value;
    if(!workCardDrag.validateSubmission(task.id,status))return;
    if (task.status === "done" && status !== "done") { openClosureReopen([task],status); return; }
    if (status === "active" && startingBatch.length > 1) {
      await dispatchBatch(startingBatch);
      renderTask();
      return;
    }
    const summary = status === "done" ? $("#closure-summary").value : "";
    const auditOutcome = status === "done" ? $("#audit-outcome")?.value : "";
    const batch = status === "done" && closingBatch.length > 0;
    const result = batch
      ? await api(batchEndpoint(closingBatch, "close"), {tasks: closingBatch.map(item => ({id: item.id, revision: item.revision})), summary, ...(pendingClosures.length ? {confirm_processed:$("#batch-pending-confirm").checked} : {})})
      : await api(`/tasks/${task.id}`, {revision: task.revision, status, summary, ...(auditOutcome ? {audit_outcome: auditOutcome} : {})}, "PATCH");
    if (batch) result.items.filter(item=>item.status==='done').forEach(item=>batchSelected.delete(item.id));
    await refresh(); renderTask();
    workCardDrag.committed(task.id,status,batch?result.items:null);
    if(result.delivery_run){toast('内部反哺已排队交给本线 Pi，无需手动复制；核验实际成果后自动闭环');return;}
    if (batch && result.failed) {
      showText('批量处理结果',result.items.map(item=>`${item.id} · ${item.status==='done'?'已闭环':item.error || '失败，待核对'}`).join('\n'),'成功项已独立保存，失败项保持未闭环；同步可恢复中断的资料链接。');
      toast(`已闭环 ${result.count} 项，${result.failed} 项失败，请查看分项结果。`,true);
      return;
    }
    toast(batch && task.kind==='discussion' ? `已结束 ${result.count} 场完整沟通；原件保留，轮次记录未增加` : batch ? `已闭环 ${result.count} 项任务；归档 ${result.archived} 份原件${result.archive_deferred ? "，共享报告待其他任务闭环" : ""}` : result.archive_deferred ? "任务已闭环；共享报告等其他关联任务闭环后归档" : result.archived ? `任务已闭环，${result.archived} 份原件已移入已归档（任务书/报告→已归档、采集→已处置）` : result.changed === false ? "内容没有变化，无需保存" : "任务记录已更新");
  }, event.currentTarget);
  $("#copy-handoff").onclick = event => run(async () => { const result = await api(handoffPath()); try { await writeClipboard(result.text); toast("交接单已复制，请粘贴到对应 Agent 的工作窗口"); } catch { prepareText(result.filename, result.text, "剪贴板不可用，可以选中并复制下方交接单，或关闭后下载 .md。"); } }, event.currentTarget);
  $("#download-handoff").onclick = event => run(async () => { const result = await api(handoffPath()); const url = URL.createObjectURL(new Blob([result.text], {type: "text/markdown;charset=utf-8"})); const a = document.createElement("a"); a.href = url; a.download = result.filename; a.click(); usageEvent('download','unconfirmed'); setTimeout(() => URL.revokeObjectURL(url), 1000); }, event.currentTarget);
  if ($("#create-child")) $("#create-child").onclick = () => openCreate(task.id);
  $$("[data-child]", $("#task-detail")).forEach(button => button.onclick = () => openTask(button.dataset.child));
  $$("[data-preview]", $("#task-detail")).forEach(button => button.onclick = () => run(() => preview(Number(button.dataset.preview)), button));
  if ($("#link-form")) $("#link-form").onsubmit = event => { event.preventDefault(); run(async () => { await api(`/tasks/${task.id}/artifacts`, {revision: task.revision, artifact_id: Number($("#link-file").value)}); await refresh(); renderTask(); }, $("button", event.target)); };
  $$("[data-reply]", $("#task-detail")).forEach(button => button.onclick = () => {
    const message = messages.find(m => m.id === button.dataset.reply);
    $("#message-kind").innerHTML = `<option value="reply">回复指定问题</option>`;
    $("#message-author").value = message.recipient_role; $("#message-author").disabled = true;
    $("#message-recipient").value = message.author_role; $("#message-recipient").disabled = true;
    $("#reply-to").value = message.id; $("#reply-context").hidden = false; $("#reply-context").textContent = `回复：${message.body}`;
    $("#blocking-label").hidden = true; $("#message-blocking").checked = false; $("#cancel-reply").hidden = false;
    $("#message-body").focus();
  });
  $$("[data-resolve]", $("#task-detail")).forEach(button => button.onclick = () => run(async () => { await api(`/tasks/${task.id}/resolve`, {revision: task.revision, message_id: button.dataset.resolve}); await refresh(); renderTask(); toast("问题已解决；全部阻塞解除后任务自动恢复"); }, button));
  if ($("#cancel-reply")) $("#cancel-reply").onclick = renderTask;
  if ($("#message-kind")) $("#message-kind").onchange = () => {
    const kind = $("#message-kind").value;
    $("#blocking-label").hidden = kind === "notice";
    $("#message-recipient").disabled = kind === "decision";
    if (kind === "decision") $("#message-recipient").value = "chen";
  };
  if ($("#message-form")) $("#message-form").onsubmit = event => { event.preventDefault(); run(async () => {
    await api(`/tasks/${task.id}/messages`, {revision: task.revision, kind: $("#message-kind").value, author_role: $("#message-author").value, recipient_role: $("#message-recipient").value, body: $("#message-body").value, blocking: $("#message-blocking").checked, reply_to: $("#reply-to").value || null});
    await refresh(); renderTask(); toast("沟通已记录。需要对方处理时，请复制交接单交给对应 Agent。");
  }, $("button[type=submit]", event.target)); };
  $(".task-actions", $("#task-detail")).insertAdjacentHTML("afterend", '<p id="operation-check" class="batch-closure-note" hidden></p>');
  bindPreflight(task);
  $("#task-case-timeline").onclick=event=>run(()=>openCase(task.id),event.currentTarget);
  renderTaskExtras(task);
  decorateDeliveryDetail(task);
  bindClosers();
}
function renderTaskExtras(task) {
  $('#task-detail > .legacy-history')?.remove();
  const result=state.results?.find(r=>r.task_id===task.id) || {};
  const relations=(state.relations || []).filter(r=>r.from_task===task.id || r.to_task===task.id);
  const related=caseGroups().find(g=>g.some(t=>t.id===task.id)) || [task];
  const ids=new Set(taskFiles(task).map(a=>a.id));
  const versions=state.source_events.filter(e=>ids.has(e.artifact_id));
  $('#task-detail').insertAdjacentHTML('beforeend',`<details class="full-history"><summary>原件版本 · ${versions.length} 次内容观测</summary>${versions.map(e=>`<p>${esc(e.name)} · ${esc(appearedAt(e.created_at))} · ${e.change_kind==='created'?'新原件':'正文变化'} · 摘要 ${esc(e.digest.slice(0,10))}</p>`).join('') || '<p class="helper">关联历史原件尚无内容观测记录。</p>'}<p class="helper">这里只记录内容摘要和时间，不保存或推测正文差异。</p></details>`);
  $('#task-communication').insertAdjacentHTML('beforebegin',`<section class="detail-section"><h3>事项链 · ${related.length} 张卡</h3><p class="helper">明确连接来源与后续任务，不会改变父子任务的闭环限制。</p>${relations.map(r=>{const outgoing=r.from_task===task.id,id=outgoing?r.to_task:r.from_task;return `<p><button class="button small" data-related="${id}">${outgoing?'后续':'来源'} · ${esc(id)} · ${esc(state.tasks.find(t=>t.id===id)?.title || '')}</button>${outgoing?` <button class="button small" data-unlink-task="${id}">取消关联</button>`:''}</p>`;}).join('')}<details class="auxiliary-section" id="task-relations"><summary>补充或调整事项关联</summary><form id="relation-form" class="link-form"><label>后续卡片<select id="related-task">${state.tasks.filter(t=>t.id!==task.id).map(t=>`<option value="${t.id}">${esc(t.id)} · ${esc(taskDisplayTitle(t))}</option>`).join('')}</select></label><label>关系<select id="relation-type">${options({followup:'后续处理',test_report:'测试回传',knowledge_notice:'知识变更通知'},'followup')}</select></label><button class="button small"${state.tasks.length<2?' disabled':''}>关联事项</button></form></details></section>${resultEditor(task,result)}<details class="full-history"><summary>完整操作记录 · 当前操作人：陈震</summary><div id="task-history"><p class="helper">正在读取记录…</p></div></details>`);
  $$('[data-related]', $('#task-detail')).forEach(button=>button.onclick=()=>openTask(button.dataset.related));
  $$('[data-unlink-task]', $('#task-detail')).forEach(button=>button.onclick=()=>run(async()=>{
    await api(`/tasks/${task.id}/relations`,{revision:task.revision,to_task:button.dataset.unlinkTask,remove:true});
    await refresh(); rerenderTaskPreservingDrafts();
  },button));
  $('#relation-form').onsubmit=event=>{event.preventDefault();run(async()=>{
    await api(`/tasks/${task.id}/relations`,{revision:task.revision,to_task:$('#related-task').value,relation:$('#relation-type').value});
    await refresh(); rerenderTaskPreservingDrafts(); toast('事项已关联。');
  },$('button',event.target));};
  bindResultEditor(task);
  loadTaskHistory(task.id).catch(error=>{if(selectedTask===task.id && $('#task-history')) $('#task-history').textContent=error.message;});
}
function rerenderTaskPreservingDrafts() {
  const draft=$$('input[id],textarea[id],select[id]',$('#task-detail')).map(el=>({id:el.id,value:el.value,checked:el.checked}));
  const disclosures=$$('details[id]',$('#task-detail')).map(el=>({id:el.id,open:el.open}));
  renderTask();
  draft.forEach(item=>{const el=document.getElementById(item.id);if(el){el.value=item.value;if(el.type==='checkbox')el.checked=item.checked;}});
  disclosures.forEach(item=>{const el=document.getElementById(item.id);if(el)el.open=item.open;});
  $('#task-status')?.dispatchEvent(new Event('change'));
  $('#result-search')?.dispatchEvent(new Event('input'));
}
async function loadTaskHistory(taskId,before=null) {
  const scope=activeWorkspace;
  const result=await api(`/tasks/${taskId}/events${before?`?before=${before}`:''}`);
  if(scope!==activeWorkspace || selectedTask!==taskId || !$("#task-dialog").open) return;
  const previous=taskHistories.get(taskId);
  taskHistories.set(taskId,{items:before?[...(previous?.items || []),...result.items]:result.items,next_before:result.next_before});
  if(selectedTask!==taskId || !$('#task-history')) return;
  const history=taskHistories.get(taskId);
  $('#task-history').innerHTML=history.items.map(e=>`<p>${esc(appearedAt(e.created_at))} · ${esc(e.detail)} · ${e.recorded_by==='system'?'系统':'陈震'}</p>`).join('') + (history.next_before?'<button type="button" class="button small" id="older-events">加载更早记录</button>':'<p class="helper">已显示全部记录。</p>');
  if($('#older-events')) $('#older-events').onclick=event=>run(()=>loadTaskHistory(taskId,history.next_before),event.currentTarget);
}
function messageMarkup(m) {
  const reference = state.messages.find(item => item.id === m.reply_to);
  return `<article class="message ${m.kind} ${m.question_state === "resolved" ? "resolved" : ""}"><div class="message-heading"><strong>${esc(roleName(m.author_role))} → ${esc(roleName(m.recipient_role))}</strong><span>${labels.message[m.kind]}${m.blocking ? " · 阻塞" : ""}</span>${m.question_state ? `<span class="tag">${labels.questions[m.question_state]}</span>` : ""}</div>${reference ? `<div class="question-reference">回复：${esc(reference.body.slice(0, 200))}</div>` : ""}<p>${esc(m.body)}</p><div class="meta">${date(m.created_at)} · 陈震代录</div>${["open", "answered"].includes(m.question_state) ? `<div class="message-tools"><button class="button small" data-reply="${m.id}">记录 ${esc(roleName(m.recipient_role))} 的答复</button>${m.question_state === "answered" ? `<button class="button small" data-resolve="${m.id}">确认问题已解决</button>` : ""}</div>` : ""}</article>`;
}
function prepareText(title, text, note) {
  preparedOutput = {scope: activeWorkspace, title, text, note};
  $('#prepared-output-title').textContent = title;
  $('#prepared-output-note').textContent = note + ' 内容已准备，请在本页点击“复制已准备内容”或“查看全文”；平台不会切换标签页。';
  $('#prepared-output').hidden = false;
}
async function writeClipboard(text) {
  const started=performance.now();
  try { await writeClipboardRaw(text);usageEvent('clipboard','ok',performance.now()-started); }
  catch(error) { usageEvent('clipboard','unconfirmed',performance.now()-started);throw error; }
}
function writeClipboardRaw(text) {
  if (document.hidden || !document.hasFocus()) return Promise.reject(new Error('页面已切换，内容保留待手动复制'));
  // Private-LAN HTTP is not a secure context; use a bounded local copy fallback.
  if (!navigator.clipboard?.writeText) {
    const field=document.createElement('textarea');
    field.value=text;field.setAttribute('readonly','');field.style.position='fixed';field.style.top='0';field.style.left='-9999px';
    const previous=document.activeElement;
    document.body.appendChild(field);field.select();
    let copied=false;
    try {copied=document.execCommand('copy');} catch {}
    field.remove();if(previous?.focus) previous.focus({preventScroll:true});
    return copied ? Promise.resolve() : Promise.reject(new Error('浏览器未确认复制，请在预览中手动复制'));
  }
  return new Promise((resolve, reject) => {
    let finished = false;
    const finish = error => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      window.removeEventListener('blur', leave);
      document.removeEventListener('visibilitychange', leave);
      error ? reject(error) : resolve();
    };
    const leave = () => { if(document.hidden || !document.hasFocus()) finish(new Error('页面已切换，内容保留待手动复制')); };
    const timer = setTimeout(()=>finish(new Error('剪贴板未及时确认，内容保留待手动复制')),4000);
    window.addEventListener('blur', leave);
    document.addEventListener('visibilitychange', leave);
    try { Promise.resolve(navigator.clipboard.writeText(text)).then(()=>finish(),error=>finish(error)); }
    catch (error) { finish(error); }
  });
}
function showText(title, text, note) {
  if (document.hidden || !document.hasFocus()) { prepareText(title,text,note); return; }
  $("#preview-title").textContent = title; $("#preview-body").textContent = text; $("#preview-note").textContent = note; if (!$("#preview-dialog").open) $("#preview-dialog").showModal(); }
async function preview(id) { const result = await api(`/artifacts/${id}`); showText(result.name, result.text, result.changed ? "源文件已变化，以下为当前内容；请重新扫描更新索引。只读展示。" : "只读展示源文件；不执行其中的链接、代码或指令。"); }
function bindClosers() { $$('[data-close]').forEach(button => button.onclick = () => button.closest("dialog").close()); }

$("#navigation").onclick = event => { const button = event.target.closest("[data-view]"); if (!button) return; view = button.dataset.view; if(view === "attention") attentionFilter = "all"; query = ""; historyPage = 1; batchSelected.clear(); clearClosureReopenSelection(); render(); window.scrollTo(0,0); };
$("#new-task").onclick = () => openCreate();
$("#refresh").onclick = event => run(async () => { await refresh(); toast("已刷新。打开的任务保留输入，再次操作如有冲突会提示。"); }, event.currentTarget);
$("#create-form").onsubmit = event => { event.preventDefault(); run(async () => {
  const data = new FormData(event.target);
  const discussion=data.get('kind')==='discussion', meeting=discussion && $('#create-meeting').checked;
    if (meeting && !$('#meeting-authorized').checked) throw new Error('请确认本次会议范围内的沟通授权');
  const result = await api("/tasks", {title: data.get("title"), description: data.get("description"), kind: data.get("kind"), owner: data.get("owner"), participants: data.getAll("participant"), parent_id: data.get("parent_id") || null, artifact_ids: discussion ? [] : [...createArtifactSelected], reference_artifact_ids: discussion ? [...createArtifactSelected] : [], ...(meeting ? {discussion:{start:$('#reference-start').value,end:$('#reference-end').value,basis:$('#reference-basis').value,first_speaker:$('#meeting-speaker').value,max_rounds:Number($('#meeting-rounds').value),expected_outputs:$('#meeting-outputs').value,agenda_source:$('#meeting-agenda').value}} : {})});
  $("#create-dialog").close(); await refresh(); openTask(result.id); toast("任务已创建，请复制交接单启动工作");
}, $("button[type=submit]", event.target)); };
$("#triage-form").onsubmit = event => {
  event.preventDefault();
  run(async () => {
    const result = await api(`/source-events/${$("#triage-event").value}/triage`, {
      recipient_role: $("#triage-recipient").value, resolution: $("#triage-resolution").value, ...(!$('#triage-audit-sender-field').hidden ? {sender_role:$('#triage-audit-sender').value} : {}), ...(!$("#triage-discussion-field").hidden ? {discussion_type:$("#triage-discussion-type").value} : {})
    });
    $("#triage-dialog").close();
    await refresh();
    if (result.task_id) openTask(result.task_id);
    toast(result.task_id ? (result.reused ? "已关联该原件的处理卡，请核对最新内容。" : "已建立独立沟通处理卡，可在本工作区继续交接。") : "已记录收件角色并标记仅知悉。");
  }, $("button[type=submit]", event.target));
};

function confirmWorkspaceSwitch() {
  return new Promise(resolve=>{
    const dialog=$('#workspace-dialog');let finished=false;
    const finish=value=>{if(finished)return;finished=true;dialog.close();resolve(value);};
    $('#cancel-workspace').onclick=()=>finish(false);$('#confirm-workspace').onclick=()=>finish(true);
    dialog.oncancel=event=>{event.preventDefault();finish(false);};dialog.showModal();
  });
}

function switchWorkspace(next) { return run(async()=>{
  if(next===activeWorkspace)return;
  if(inFlightMutations){toast('请等待当前操作完成。',true);return;}
  if(($('dialog[open]') || batchSelected.size || closureReopenSelection.size) && !await confirmWorkspaceSwitch()){return;}
  $$('dialog[open]').forEach(dialog=>dialog.close());
  $('#task-detail').textContent='';$('#create-form').reset();$('#preview-body').textContent='';
  caseRequest++;caseTask=null;casePage=null;
  selectedTask=null;preparedOutput=null;$('#prepared-output').hidden=true;attentionFilter='all';batchSelected.clear();clearClosureReopenSelection();taskHistories.clear();query='';roleFilter='all';sourceFilter='all';historyPage=1;
  const catalog=state.workspaces;
  activeWorkspace=next;localStorage.setItem('yuandu.workspace',next);workspaceLoading=true;$('#new-task').disabled=true;
  state={tasks:[],roles:[],messages:[],artifacts:[],links:[],events:[],sources:[],source_events:[],workspace:catalog.find(w=>w.id===next),workspaces:catalog};
  render();$('#workspace').textContent='正在加载工作空间…';
  try {await refresh();window.scrollTo(0,0);toast(`已切换到 ${state.workspace.prefix} · ${state.workspace.name}`);}
  finally {workspaceLoading=false;$('#new-task').disabled=!state.csrf;}
},$('#workspace-switch')); }

function closeWorkspaceMenu(returnFocus=false) {
  $('#workspace-menu').hidden=true;$('#workspace-switch').setAttribute('aria-expanded','false');
  if(returnFocus) $('#workspace-switch').focus();
}
$('#workspace-switch').onclick=()=>{
  const opening=$('#workspace-menu').hidden;$('#workspace-menu').hidden=!opening;
  $('#workspace-switch').setAttribute('aria-expanded',String(opening));
};
$$('[data-workspace-option]').forEach(button=>button.onclick=()=>{
  closeWorkspaceMenu(true);switchWorkspace(button.dataset.workspaceOption);
});
document.addEventListener('click',event=>{if(!event.target.closest('.workspace-brand')) closeWorkspaceMenu();});
document.addEventListener('keydown',event=>{if(event.key==='Escape' && !$('#workspace-menu').hidden){event.preventDefault();closeWorkspaceMenu(true);}});

$('#prepared-copy').onclick = event => run(async()=>{
  if (!preparedOutput || preparedOutput.scope !== activeWorkspace) return;
  try { await writeClipboard(preparedOutput.text); toast('已准备内容已复制，请按原任务进度手动交接'); }
  catch { toast('剪贴板未确认写入，请点击“查看全文”手动复制',true); }
},event.currentTarget);
$('#prepared-preview').onclick = ()=>{if(preparedOutput?.scope===activeWorkspace) showText(preparedOutput.title,preparedOutput.text,preparedOutput.note);};
$('#prepared-dismiss').onclick = ()=>{preparedOutput=null;$('#prepared-output').hidden=true;};
bindClosers();
try {workbenchMotion.init();} catch {}
run(refresh);
setInterval(() => {
  if (activeStateRefreshes || busyActions || closureReopenSelection.size || draggedTask || document.hidden || $("dialog[open]") || ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) return;
  if (view==='automation' && document.activeElement?.closest('.collection-launch')) return;
  if(view==='knowledge' && document.activeElement?.closest('#workspace'))return;
  refresh().catch(() => {});
}, REMOTE_WORKBENCH ? 45000 : 15000);
