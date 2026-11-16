"use strict";

// Shared scripts use the existing workspace API and native dialog controls.
let caseRequest = 0;
let caseTask = null;
let casePage = null;
let operationRequest = 0;
let attentionFilter = "all";

function taskAttention(task) {
  const reasons = [];
  if(task.delivery?.report_changed && task.status!=='done')reasons.push('交付报告已更新，需核对并采用当前版本');
  // Missing registered originals on done cards are historical; new events and open questions remain actionable.
  const historicalMissingOriginal = item => task.status === 'done' && item && !item.available;
  // Linked communication progress belongs to the monitor; actual questions and new events stay actionable.
  const questions = openQuestions(task.id);
  if (questions.some(item => item.blocking)) reasons.push("有未解决的阻塞问题");
  if (questions.some(item => item.recipient_role === "chen" && item.kind === "decision")) reasons.push("有待陈震决定的问题");
  if (questions.some(item => item.kind !== "decision" || item.recipient_role !== "chen")) reasons.push("有待答复或待确认解决的问题");
  if (task.status === "waiting" && !questions.some(item => item.blocking)) reasons.push("等待状态需核对");
  if (state.source_events.some(item => item.task_id === task.id && item.state === "new")) reasons.push("收到新版本或回件，请重读");
  if (taskFiles(task).some(item => !item.available && !historicalMissingOriginal(item))) reasons.push("关联原件暂不可用");
  if (task.status!=='done' && (state.archive_health || []).some(item=>item.state==='changed' && taskFiles(task).some(file=>file.id===item.artifact_id))) reasons.push('归档原件内容已变化，请核对依据');
  const result = state.results?.find(item => item.task_id === task.id);
  const references = [...(result?.evidence || []), ...(state.references || []).filter(item => item.task_id === task.id)];
  if (references.some(ref => {
    const item = state.artifacts.find(item => item.id === ref.artifact_id);
    return !item?.available && !historicalMissingOriginal(item);
  })) reasons.push("引用证据暂不可用");
  if (references.some(ref => {
    const item = state.artifacts.find(item => item.id === ref.artifact_id);
    return item?.digest !== ref.digest && !historicalMissingOriginal(item);
  })) reasons.push("引用后证据内容有变化，请核实");
  if (pendingFolderConflict(task)) reasons.push("闭环卡的任务书仍在待测试");
  if (task.status !== "done" && task.description.includes("同名同内容文件曾被归档")) reasons.push("与历史归档同内容，请核对新回传或同步副本");
  return reasons;
}

function technicalAttention() {
  return [
    ...state.sources.filter(source => !source.available || state.sync_health?.some(item => item.source === source.id && (item.error || item.skipped)))
      .map(source => { const health = state.sync_health?.find(item => item.source === source.id); return `${source.name}：${!source.available ? "目录不可用" : health?.error || `跳过 ${health?.skipped} 项，请查看同步详情`}`; }),
    ...(state.pending_operations || []).map(item => `资料 ${item.artifact_id} · ${item.phase === "failed" ? "流转失败" : "流转待核验"} · ${item.from_name}`),
    ...(state.backup?.error ? [state.backup.error] : []),
    ...(state.monitor?.monitor_error ? [state.monitor.monitor_error] : [])
  ];
}

function attentionData() {
  const rows = new Map();
  for (const task of state.tasks) {
    const reasons = taskAttention(task);
    const questions = openQuestions(task.id);
    if (!reasons.length) continue;
    const tags = new Set();
    tags.add('review');
    if (questions.some(m => m.kind === 'decision' && m.recipient_role === 'chen')) tags.add('decision');
    rows.set(`task:${task.id}`, {task, reasons, tags, incoming: [], questions});
  }
  for (const item of state.source_events.filter(e => e.state === 'new')) {
    const task = state.tasks.find(t => t.id === item.task_id);
    if (task) {
      const key = `task:${task.id}`;
      if (!rows.has(key)) rows.set(key, {task, reasons: [], tags: new Set(), incoming: [], questions: openQuestions(task.id)});
      const row = rows.get(key);
      const previous = row.incoming.findIndex(event => event.artifact_id === item.artifact_id);
      if (previous < 0) row.incoming.push(item);
      else if (Number(item.id) > Number(row.incoming[previous].id)) row.incoming[previous] = item;
      row.tags.add('review');
      if (!row.reasons.includes('收到新版本或回件，请重读')) row.reasons.push('收到新版本或回件，请重读');
    } else {
      const key = `artifact:${item.artifact_id}`;
      const previous = rows.get(key);
      if (!previous || Number(item.id) > Number(previous.source.id)) rows.set(key, {source: item, tags: new Set([item.intent === 'triage' ? 'triage' : item.intent === 'info' ? 'review' : 'handoff'])});
    }
  }
  for (const message of openQuestions()) {
    if (rows.has(`task:${message.task_id}`)) continue;
    rows.set(`message:${message.id}`, {message, tags: new Set([message.kind === 'decision' && message.recipient_role === 'chen' ? 'decision' : 'review'])});
  }
  technicalAttention().forEach((text, index) => rows.set(`technical:${index}`, {technical: text, tags: new Set(['review'])}));
  const items = [...rows.values()];
  return {items, count: items.length};
}

function nextActionText(task, result = state.results?.find(item => item.task_id === task.id)) {
  if (auditNotice(task)) return '打开沟通卡，读取本轮结论，再决定继续沟通或记录结论后结束整场沟通';
  const incoming = pendingAuditHandoff(task);
  if (incoming) return `打开沟通卡，读来件并复制交接单给 ${executorLabel(incoming.recipient_role)}；实际交接后记录执行方`;
  if(task.status==='done')return '任务已闭环；原报告中的后续建议作为历史保留，需要新工作时由陈震指派';
  if (result?.next_step) return `${result.followup_owner ? roleName(result.followup_owner) + " · " : ""}${result.next_step}`;
  return task.status === "pending" ? `由陈震确认后交给 ${taskRoleLabel(task.owner, task)}` : task.status === "done" ? "任务已闭环；业务结论以原件和已记录依据为准" : `${taskRoleLabel(task.owner, task)} 处理；陈震核对实际回传后安排下一步`;
}

function renderAttention() {
  const data = attentionData();
  const filters = {all:'全部',triage:'待判读',handoff:'待交接',review:'待核对',decision:'待决策'};
  const counts = key => key === 'all' ? data.count : data.items.filter(row => row.tags.has(key)).length;
  const items = data.items.filter(row => attentionFilter === 'all' || row.tags.has(attentionFilter));
  const gaps = caseGroups().filter(group => group.length === 1).length;
  const markup = row => {
    if (row.source) return sourceEventRow(row.source);
    if (row.message) return questionRow(row.message);
    if (row.technical) return `<article class="attention-row"><div><strong>运行与流转异常</strong><p>${esc(row.technical)}</p></div><button class="button small" data-go-view="sync">查看异常</button></article>`;
    const {task, reasons, questions, incoming} = row;
    const decision = row.tags.has('decision');
    const communication = (state.discussions || []).some(item=>item.task_id===task.id && item.mode==='communication');
    const action = decision ? '处理决策请求' : communication ? '核对问题 / 异常' : task.status==='pending' ? '核对任务提醒' : '打开卡片处理';
    const next = communication ? '核对上方具体问题或异常；本次处理与来源回件在“沟通处理”统一查看。' : nextActionText(task);
    return `<article class="panel attention-item"><div class="attention-row"><div><div class="card-meta">${[...row.tags].map(tag=>`<span class="tag">${filters[tag]}</span>`).join('')}</div><button class="review-task-title" data-task="${task.id}">${esc(taskDisplayTitle(task))}</button><p>${esc(reasons.join('；'))}</p><small>${esc(task.id)} · ${esc(taskRoleLabel(task.owner, task))} · ${esc(labels.statuses[task.status])}</small><p class="helper">下一步：${esc(next)}</p>${questions.map(m=>`<p class="helper">${esc(labels.message[m.kind])} · ${esc(m.body)}</p>`).join('')}</div><div class="review-actions"><button class="button primary small" data-task="${task.id}">${esc(action)}</button><button class="button small" data-case="${task.id}">查看时间线</button></div></div>${incoming.map(sourceEventRow).join('')}${task.status==='pending'?discussionTypeControl(task):''}</article>`;
  };
  setWorkspaceMarkup(`<div class="toolbar"><h2>待我处理 <span class="helper">· ${data.count} 项</span></h2><div class="actions"><button class="button primary small" id="attention-scan">同步文件与卡片</button><button class="button small" data-go-view="communication">沟通处理</button><button class="button small" data-go-view="inbox">查看来件记录</button></div></div><p class="helper">已关联的沟通来件、轮次与交接记录统一在“沟通处理”查看，不重复计为待办。这里保留未关联/新版本来件、未解决问题、决策和异常；打开或复制不会标记处理完成。</p><div class="attention-filters" role="group" aria-label="筛选待处理事项">${Object.entries(filters).map(([key,label])=>`<button class="button small ${attentionFilter===key?'primary':''}" data-attention-filter="${key}" aria-pressed="${attentionFilter===key}">${label} · ${counts(key)}</button>`).join('')}</div><div class="attention-list">${items.map(markup).join('') || empty('当前没有这类待办','新来件、新回件与需核对/决策事项在这里处理；待开始任务请到任务流转。')}</div><details class="panel auxiliary-section"><summary>关联未记录 · ${gaps} 项</summary><p class="helper">独立卡片只表示关联未记录，不能据此判断工作停滞。需要补充明确的来源或后续关系时，从事项链查看。</p><button class="button small" data-go-view="cases">查看事项链</button></details>`);
}

function resultSummary(result) {
  return `${result.outcome ? `<p>处置：${esc(outcomeLabels[result.outcome])}</p>` : ""}${result.conclusion ? `<p>结论：${esc(result.conclusion)}</p>` : ""}${result.decision ? `<p>陈震决策：${esc(result.decision)}</p>` : ""}${result.next_step ? `<p>下一步：${esc(result.followup_owner ? roleName(result.followup_owner) + " · " : "")}${esc(result.next_step)}</p>` : ""}`;
}

async function openCase(taskId) {
  caseTask = taskId; casePage = null;
  $("#case-detail").innerHTML = '<p class="helper">正在读取完整事项时间线…</p><button class="button" data-close>关闭</button>';
  bindClosers();
  if (!$("#case-dialog").open) $("#case-dialog").showModal();
  await loadCase(taskId);
}

async function loadCase(taskId, before = null) {
  const request = ++caseRequest, scope = activeWorkspace;
  try {
    const result = await api(`/tasks/${taskId}/case${before ? "?before=" + encodeURIComponent(before) : ""}`);
    if (request !== caseRequest || scope !== activeWorkspace || caseTask !== taskId || !$("#case-dialog").open) return;
    casePage = {...result, items: before ? [...casePage.items, ...result.items] : result.items};
    renderCaseDetail();
  } catch (error) {
    if (request !== caseRequest || scope !== activeWorkspace || caseTask !== taskId) return;
    $("#case-detail").innerHTML = `<p class="triage-reason">${esc(error.message)}</p><button class="button" id="case-reload">重新读取</button><button class="button" data-close>关闭</button>`;
    $("#case-reload").onclick = () => run(() => loadCase(taskId), $("#case-reload"));
    bindClosers();
  }
}

async function openCaseTask(taskId) {
  await refresh();
  if (!state.tasks.some(task => task.id === taskId)) { toast("任务已不可见，请重新读取事项。", true); return; }
  $("#case-dialog").close();
  openTask(taskId);
}

function renderCaseDetail() {
  const page = casePage;
  const tasks = orderedCaseTasks(page.tasks || page.task_ids.map(id => state.tasks.find(task => task.id === id)).filter(Boolean), page.edges);
  const usages = {owned: "关联原件 · 归属按现有规则", result: "结果证据 · 仅引用", discussion: "讨论依据 · 仅引用"};
  const categories = {1: "操作记录", 2: "原件内容观测", 3: "结论与决策快照"};
  $("#case-detail").innerHTML = `<div class="dialog-heading"><div><div class="eyebrow">CASE REVIEW · ${esc(caseTask)}</div><h2>事项时间线 · ${tasks.length} 张卡</h2></div><button class="icon-button" data-close aria-label="关闭">×</button></div>
    <p class="helper">按记录时间从新到旧排列；操作记录和内容观测不代表 Agent 已执行或业务结果已验证。读取于 ${esc(appearedAt(page.checked_at))}。</p>
    <section class="review-case-tasks">${tasks.map(task => `<article><button class="review-task-title" data-case-task="${task.id}">${esc(taskDisplayTitle(task))}</button><small>${esc(task.id)} · ${esc(taskRoleLabel(task.owner, task))} · ${esc(labels.statuses[task.status])}</small><p>${esc(nextActionText(task,page.results.find(result => result.task_id === task.id) || null))}</p>${task.summary ? `<p>已记录闭环结论：${esc(task.summary)}</p>` : ""}</article>`).join("")}</section>
    ${tasks.length > 1 ? caseEdgesMarkup(tasks,page.edges) : '<p class="helper">当前为独立事项，来源／后续关联未记录。</p>'}
    <details class="auxiliary-section"><summary>证据清单 · ${page.evidence.length} 条引用／归属记录</summary>${page.evidence.map(item => `<div class="linked-item"><button class="button small" data-preview="${item.artifact_id}">${esc(item.name)}</button><p class="helper">${esc(item.task_id)} · ${esc(usages[item.usage])} · ${item.available ? "已登记可用" : "暂不可用"}${item.changed ? " · 引用后内容已变化" : ""}${item.usage !== "owned" ? " · 选择时摘要 " + esc(item.selected_digest.slice(0, 10)) : ""}</p></div>`).join("") || '<p class="helper">暂无登记资料。</p>'}</details>
    <details class="auxiliary-section"><summary>当前已记录结论 · ${page.results.length} 项</summary>${page.results.map(result => `<article class="review-result"><strong>${esc(result.task_id)}</strong>${resultSummary(result) || '<p class="helper">暂无文字结论。</p>'}</article>`).join("") || '<p class="helper">结论可在原件中查阅；尚未补充平台结果记录。</p>'}</details>
    <section class="case-timeline"><h3>时间线 · 已读取 ${page.items.length} 条</h3>${page.items.map(item => `<article class="timeline-record"><small>${esc(appearedAt(item.created_at))} · ${esc(categories[item.category])} · ${item.recorded_by === "system" ? "系统" : item.recorded_by === "pi" ? "知识库维护者（历史）" : "陈震"}</small>${item.task_id ? `<button class="button small" data-case-task="${esc(item.task_id)}">${esc(item.task_id)}</button>` : ""}${item.category === 3 ? `<div class="review-result">${item.kind === "baseline" ? '<p class="helper">旧版当前结果基线；此前的文字修订和证据版本未记录。</p>' : ""}${resultSummary(item.result)}${(item.result.evidence || []).map(ref => `<p><button class="button small" data-preview="${ref.artifact_id}">${esc(state.artifacts.find(a => a.id === ref.artifact_id)?.name || "资料 " + ref.artifact_id)}</button><small>记录时摘要 ${esc(ref.digest.slice(0, 10))}</small></p>`).join("")}</div>` : `<p>${esc(item.category === 2 ? (item.kind === "created" ? "新原件观测：" : "正文变化观测：") : "")}${esc(item.detail)}</p>${item.artifact_id ? `<button class="button small" data-preview="${item.artifact_id}">读当前原件</button>` : ""}`}</article>`).join("") || '<p class="helper">尚无时间线记录。</p>'}</section>
    <div class="review-actions"><button class="button" id="case-reload">重新读取最新记录</button>${page.next_before ? '<button class="button primary" id="case-older">加载更早记录</button>' : '<span class="helper">已读到最早记录。</span>'}</div>`;
  bindClosers();
  $$('[data-case-task]', $("#case-detail")).forEach(button => button.onclick = () => run(() => openCaseTask(button.dataset.caseTask), button));
  $$('[data-task]', $("#case-detail")).forEach(button => button.onclick = () => run(() => openCaseTask(button.dataset.task), button));
  $$('[data-preview]', $("#case-detail")).forEach(button => button.onclick = () => run(() => preview(Number(button.dataset.preview)), button));
  $("#case-reload").onclick = event => run(() => loadCase(caseTask), event.currentTarget);
  if ($("#case-older")) $("#case-older").onclick = event => run(() => loadCase(caseTask, page.next_before), event.currentTarget);
}

function resultEditor(task, result) {
  const selected = new Set(result.evidence_artifact_ids || (result.evidence_artifact_id ? [result.evidence_artifact_id] : []));
  return `<details class="auxiliary-section" id="task-result"><summary>结论、人工决策与证据（选填）${result.outcome ? " · " + esc(outcomeLabels[result.outcome]) : ""}</summary><p class="helper">原件已有结论时无需重复填写。每次实际修改保留快照；保存不会关闭任务或创建跟进任务。</p><form id="result-form"><div class="form-row"><label>处置类别<select id="result-outcome">${options(outcomeLabels, result.outcome || "")}</select></label><label>后续负责人（选填）<select id="result-owner"><option value="">尚未指派</option>${roleOptions(result.followup_owner || "")}</select></label></div><label>结论<textarea id="result-conclusion" maxlength="4000" rows="3" placeholder="可选填关键结论；完整分析保留在原报告">${esc(result.conclusion || "")}</textarea></label><label>陈震决策<textarea id="result-decision" maxlength="4000" rows="3" placeholder="经你确认的决定及理由；没有决定时留空">${esc(result.decision || "")}</textarea></label><label>下一步<textarea id="result-next" maxlength="4000" rows="3" placeholder="后续做什么、在哪里；实际派发仍由你启动">${esc(result.next_step || "")}</textarea></label><fieldset><legend>结果证据 · 最多 50 份 · 仅引用</legend><label>搜索证据<input id="result-search" type="search" placeholder="文件名或资料编号"></label><p id="result-count" class="helper" aria-live="polite"></p><div class="reference-list result-evidence-list">${state.artifacts.map(item => { const previous = result.evidence?.find(ref => ref.artifact_id === item.id); return `<label class="reference-item" data-result-row><input id="result-evidence-${item.id}" type="checkbox" data-result-evidence="${item.id}"${selected.has(item.id) ? " checked" : ""}><span>${esc(item.name)}<small>资料 ${item.id} · ${esc(fileState(item))}${previous && previous.digest !== item.digest ? " · 引用后内容已变化" : ""}</small></span><button class="button small" type="button" data-result-preview="${item.id}">预览</button></label>`; }).join("")}</div><p class="helper">显式保存时按当前已登记摘要记录所选证据。内容已变化的证据请先读原件核实；预览读取当前文件。</p></fieldset><button class="button small" type="submit">保存结果与决策记录</button></form></details>`;
}

function bindResultEditor(task) {
  const update = () => {
    const rows = $$('[data-result-row]', $("#result-form"));
    const text = $("#result-search").value.trim().toLowerCase();
    rows.forEach(row => row.hidden = !row.textContent.toLowerCase().includes(text));
    const selected = $$('[data-result-evidence]:checked', $("#result-form"));
    $("#result-count").textContent = `已选 ${selected.length} 份 · ${selected.filter(input => input.closest('[data-result-row]').hidden).length} 份在筛选外；保存时保留全部已选。`;
  };
  $("#result-search").oninput = update;
  $$('[data-result-evidence]', $("#result-form")).forEach(input => input.onchange = () => {
    if ($$('[data-result-evidence]:checked', $("#result-form")).length > 50) { input.checked = false; toast("结果证据最多选择 50 份", true); }
    update();
  });
  $$('[data-result-preview]', $("#result-form")).forEach(button => button.onclick = () => run(() => preview(Number(button.dataset.resultPreview)), button));
  $("#result-form").onsubmit = event => { event.preventDefault(); run(async () => {
    const response = await api(`/tasks/${task.id}/result`, {revision: task.revision, outcome: $("#result-outcome").value,
      conclusion: $("#result-conclusion").value, decision: $("#result-decision").value,
      followup_owner: $("#result-owner").value, next_step: $("#result-next").value,
      evidence_artifact_ids: $$('[data-result-evidence]:checked', $("#result-form")).map(input => Number(input.dataset.resultEvidence))});
    await refresh(); rerenderTaskPreservingDrafts();
    toast(response.changed === false ? "记录没有变化，无需新增快照。" : "结果、决策和证据快照已保存。");
  }, $('button[type=submit]', event.target)); };
  update();
}

function bindPreflight(task) {
  const generation = ++operationRequest;
  $("#check-operation").onclick = event => run(async () => {
    const target = $("#task-status").value;
    if (!["active", "done"].includes(target)) { toast("请先选择“进行中”或“已闭环”再检查。", true); return; }
    const scope = activeWorkspace;
    const audit = task.kind === "audit" ? $("#audit-outcome")?.value : "";
    const result = await api(`/tasks/${task.id}/preflight?target=${target}&revision=${task.revision}${audit ? "&audit_outcome=" + encodeURIComponent(audit) : ""}`);
    if (generation !== operationRequest || activeWorkspace !== scope || selectedTask !== task.id
        || state.tasks.find(item => item.id === task.id)?.revision !== task.revision
        || !$("#task-dialog").open || $("#task-status").value !== target) return;
    $("#operation-check").hidden = false;
    $("#operation-check").textContent = `${appearedAt(result.checked_at)} · ${labels.statuses[target]}预检：${result.ready ? `当前条件通过；预计流转／接管 ${result.files} 份，共享延后 ${result.deferred} 份。` : result.issues.map(issue => issue.reason).join("；")} 预检不改变卡片或文件；确认执行时重新核验。`;
  }, event.currentTarget);
  $("#task-status").addEventListener("change", () => $("#operation-check").hidden = true);
}
