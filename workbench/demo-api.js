'use strict';

// The released workbench UI calls this browser-only adapter in the public demo.
(() => {
  const text = '仅供演示。这里没有可执行指令。';
  const template = {filename: 'xiaowho-workbench-demo.md', text};
  const storeKey = 'xiaowho.workbench.demo.v1.';
  const volatile = new Map();
  const timestamp = () => new Date().toISOString();
  const dateKey = () => new Intl.DateTimeFormat('sv-SE', {timeZone: 'Asia/Shanghai'}).format(new Date());
  const code = () => crypto.randomUUID().replaceAll('-', '').slice(0, 8).toUpperCase();

  function load(scope) {
    let stored;
    try { stored = JSON.parse(localStorage.getItem(storeKey + scope)); } catch {}
    return stored || structuredClone(volatile.get(scope) || workbenchSamples[scope]);
  }

  function save(scope, state) {
    volatile.set(scope, state);
    try { localStorage.setItem(storeKey + scope, JSON.stringify(state)); } catch {}
  }

  function taskById(state, id, revision) {
    const task = [...state.tasks, ...state.trash_tasks].find(item => item.id === id);
    if (!task) throw new Error('演示任务已移出，请刷新。');
    if (revision !== undefined && revision !== task.revision) throw new Error('演示卡片已更新，请刷新后再操作。');
    return task;
  }

  function record(state, task, detail, kind = 'status') {
    state.events.unshift({id: Date.now(), task_id: task.id, kind, detail, recorded_by: 'chen', created_at: timestamp()});
  }

  function addTask(state, data) {
    const title = String(data.title || '').trim().slice(0, 180);
    if (!title) throw new Error('请填写示例任务名称。');
    const task = {
      id: state.workspace.prefix + '-' + code(), kind: data.kind || 'platform', title,
      owner: data.owner || 'codex', participants: [...new Set([data.owner || 'codex', ...(data.participants || [])])],
      description: data.description || '演示任务。', status: 'pending', revision: 1,
      parent_id: data.parent_id || null, created_at: timestamp(), updated_at: timestamp(), summary: '',
      audit_outcome: '', batch_recipient: data.owner || 'codex'
    };
    state.tasks.unshift(task);
    for (const id of data.artifact_ids || []) state.links.push({task_id: task.id, artifact_id: id});
    for (const id of data.reference_artifact_ids || []) {
      state.references.push({task_id: task.id, artifact_id: id, selected_digest: state.artifacts.find(file => file.id === id)?.digest || ''});
    }
    record(state, task, '建立示例任务', 'created');
    return task;
  }

  function prerequisites(state, task, target) {
    const messages = state.messages.filter(item => item.task_id === task.id && ['open', 'answered'].includes(item.question_state));
    const issues = [];
    if (messages.some(item => item.blocking) || (target === 'done' && messages.length)) issues.push({reason: '请先处理未解决的示例问题。'});
    if (target === 'done' && state.tasks.some(item => item.parent_id === task.id && item.status !== 'done')) issues.push({reason: '请先闭环子任务。'});
    if (target === 'done' && task.audit_tracking && !task.audit_tracking.received_at) issues.push({reason: '请先登记演示审计回报。'});
    return issues;
  }

  function linkedFiles(state, task) {
    const ids = new Set(state.links.filter(link => link.task_id === task.id).map(link => link.artifact_id));
    return state.artifacts.filter(file => ids.has(file.id));
  }

  function changeStatus(state, task, status, data = {}) {
    const issues = prerequisites(state, task, status);
    if (issues.length) throw new Error(issues[0].reason);
    const before = task.status;
    task.status = status;
    task.updated_at = timestamp();
    task.revision++;
    if (data.summary) task.summary = data.summary;
    if (data.audit_outcome) task.audit_outcome = data.audit_outcome;
    task.batch_close_eligible = Boolean(task.batch_eligible && (status === 'active' || (status === 'pending' && task.kind === 'research')));
    task.closure_reopen_eligible = status === 'done';
    task.closure_reopen_group = task.kind + ':' + task.owner;
    record(state, task, before === status ? '更新示例结论' : before + ' → ' + status);
    let archived = 0;
    for (const file of linkedFiles(state, task)) {
      if (before === 'pending' && ['active', 'review'].includes(status) && task.kind === 'test' && file.source === 'pending_tests') {
        file.source = 'completed_tests';
      }
      if (status !== 'done' || state.links.some(link => link.artifact_id === file.id && link.task_id !== task.id &&
        state.tasks.some(other => other.id === link.task_id && other.status !== 'done'))) continue;
      if (task.kind === 'research' && ['intelligence', 'mac_intelligence'].includes(file.source)) { file.source = 'intelligence_archive'; archived++; }
      if (task.kind === 'test' && ['pending_tests', 'completed_tests'].includes(file.source)) { file.source = 'test_archive'; archived++; }
    }
    return {id: task.id, changed: true, archived, archive_deferred: 0};
  }

  function queueRun(state, tasks, feedback = false) {
    const group = feedback ? state.delivery_execution : state.collection_automation;
    const id = state.workspace.prefix + (feedback ? '-FEED-' : '-AUTO-') + code() + code().slice(0, 4);
    const run = {
      id, day: dateKey(), status: tasks.length ? 'queued' : 'empty', label: tasks.length ? '待移交 · 演示' : '本次无可移交报告',
      protocol: 'cli-v2', tasks: tasks.map(task => ({task_id: task.id, title: task.title, status: task.status, files: linkedFiles(state, task)})),
      created_at: timestamp(), updated_at: timestamp(), ready_at: Date.now() + 4500,
      confirmed_count: 0, cancelled_count: 0, confirmation_complete: false
    };
    group.runs.unshift(run);
    if (tasks.length) {
      for (const task of tasks) task.auto_run = {id, status: 'queued', label: run.label, live: true};
      setTimeout(() => {
        if (typeof refresh === 'function' && activeWorkspace === state.workspace.id && !document.querySelector('dialog[open]')) refresh().catch(() => {});
      }, 4700);
    }
    return id;
  }

  function settleRuns(state) {
    let changed = false;
    for (const run of [...state.collection_automation.runs, ...state.delivery_execution.runs]) {
      if (run.status !== 'queued' || run.ready_at > Date.now()) continue;
      run.status = 'review';
      run.label = '处理回报 · 演示';
      run.human_response = '演示回报：已核对活动样例。';
      run.updated_at = timestamp();
      run.receipt = {results: [], knowledge_paths: []};
      for (const item of run.tasks) {
        const task = state.tasks.find(card => card.id === item.task_id);
        if (!task) { run.cancelled_count++; continue; }
        task.auto_run = {id: run.id, status: 'review', label: run.label, live: false};
        const conclusion = {task_id: task.id, conclusion: run.human_response, next_step: '样例已处理。', outcome: 'processed'};
        run.receipt.results.push(conclusion);
        state.results = state.results.filter(result => result.task_id !== task.id);
        state.results.push(conclusion);
        if (!prerequisites(state, task, 'done').length) {
          changeStatus(state, task, 'done', {summary: conclusion.conclusion});
          run.confirmed_count++;
        } else {
          task.status = 'review';
          task.revision++;
          record(state, task, '演示回报已收到');
        }
        item.status = task.status;
      }
      run.confirmation_complete = run.confirmed_count + run.cancelled_count === run.tasks.length;
      changed = true;
    }
    return changed;
  }

  function runPreview(state, run) {
    if (!run) throw new Error('找不到本次演示记录。');
    const tasks = run.tasks.map(item => {
      const task = taskById(state, item.task_id);
      const issues = prerequisites(state, task, 'done');
      return {...task, files: item.files.map(file => file.name), issues, ready: !issues.length};
    });
    return {run_id: run.id, workspace: state.workspace.id, tasks, ready: tasks.every(task => task.ready),
      remaining: tasks.filter(task => task.status !== 'done').length};
  }

  function batch(state, items, action, data) {
    const tasks = items.map(item => taskById(state, item.id, item.revision));
    if (!tasks.length && action !== 'confirm') throw new Error('请先选择演示任务。');
    const status = action === 'close' || action === 'confirm' ? 'done' : action === 'reopen' ? data.status : 'active';
    if (action !== 'copy' && tasks.some(task => prerequisites(state, task, status).length)) throw new Error('请先处理所选卡片的未决事项。');
    let archived = 0;
    if (action !== 'copy') {
      for (const task of tasks) archived += changeStatus(state, task, status, data).archived;
    }
    const automatic = action === 'handoff' && tasks.every(task => task.delivery?.branch === 'knowledge');
    if (automatic) queueRun(state, tasks, true);
    return {...template, count: tasks.length, failed: 0, archived, already_done: 0, archive_deferred: 0,
      items: tasks.map(task => ({id: task.id, status: task.status, revision: task.revision})), automatic};
  }

  function taskRoute(state, task, action, data, query) {
    if (action === 'handoff') return template;
    if (action === 'preflight') {
      const issues = prerequisites(state, task, query.get('target'));
      return {ready: !issues.length, checked_at: timestamp(), files: linkedFiles(state, task).length, deferred: 0, issues};
    }
    if (action === 'events' || action === 'retained-history') {
      const events = state.events.filter(event => event.task_id === task.id);
      return {items: events, events, next_before: null};
    }
    if (action === 'case') {
      const edges = state.relations.filter(item => item.from_task === task.id || item.to_task === task.id);
      const ids = new Set([task.id, ...edges.flatMap(item => [item.from_task, item.to_task])]);
      const tasks = state.tasks.filter(item => ids.has(item.id));
      const evidence = tasks.flatMap(item => linkedFiles(state, item).map(file => ({...file, artifact_id: file.id, task_id: item.id, usage: 'owned'})));
      return {tasks, edges, evidence, results: state.results.filter(item => ids.has(item.task_id)), next_before: null,
        checked_at: timestamp(), items: state.events.filter(item => ids.has(item.task_id)).map(item => ({...item, category: 1}))};
    }
    if (action === 'trash') {
      const origin = data.restore ? state.trash_tasks : state.tasks;
      const target = data.restore ? state.tasks : state.trash_tasks;
      const index = origin.indexOf(task);
      if (index < 0) throw new Error('演示卡片已移动，请刷新。');
      origin.splice(index, 1);
      target.unshift(task);
      task.removed_at = data.restore ? '' : timestamp();
      task.removal_reason = data.restore ? '' : data.reason || '已撤销示例卡片';
    } else if (action === 'purge') {
      state.trash_tasks = state.trash_tasks.filter(item => item !== task);
    } else if (action === 'result') {
      state.results = state.results.filter(item => item.task_id !== task.id);
      state.results.push({...data, task_id: task.id});
    } else if (action === 'relations') {
      state.relations = state.relations.filter(item => item.from_task !== task.id || item.to_task !== data.to_task);
      if (!data.remove) state.relations.push({from_task: task.id, to_task: data.to_task, relation: data.relation, created_at: timestamp()});
    } else if (action === 'artifacts') {
      if (!state.links.some(item => item.task_id === task.id && item.artifact_id === data.artifact_id)) {
        state.links.push({task_id: task.id, artifact_id: data.artifact_id});
      }
    } else if (action === 'messages') {
      const message = {...data, id: code(), task_id: task.id, created_at: timestamp(), question_state: data.kind === 'notice' ? '' : 'open'};
      const question = state.messages.find(item => item.id === data.reply_to);
      if (question) { question.question_state = 'answered'; message.question_state = ''; }
      if (message.blocking && message.question_state === 'open') { task.resume_status = task.status; task.status = 'waiting'; }
      state.messages.push(message);
    } else if (action === 'resolve') {
      const message = state.messages.find(item => item.task_id === task.id && item.id === data.message_id);
      if (!message) throw new Error('找不到示例消息。');
      message.question_state = 'resolved';
      if (task.status === 'waiting' && !state.messages.some(item => item.task_id === task.id && item.blocking && item.question_state !== 'resolved')) {
        task.status = task.resume_status || 'active';
        task.resume_status = null;
      }
    } else if (action === 'discussion-type') {
      task.discussion_type = data.type || data.discussion_type;
      const discussion = state.discussions.find(item => item.task_id === task.id);
      if (discussion) discussion.category = task.discussion_type;
    } else if (!action && data.status) {
      const startFeedback = task.status === 'pending' && data.status === 'active' && task.delivery?.branch === 'knowledge';
      const result = changeStatus(state, task, data.status, data);
      if (startFeedback) result.delivery_run = queueRun(state, [task], true);
      return result;
    } else {
      throw new Error('找不到该演示操作。');
    }
    task.revision++;
    task.updated_at = timestamp();
    record(state, task, '更新示例记录', action);
    return {id: task.id, changed: true};
  }

  function auditRoute(state, path, data) {
    if (path === '/knowledge-audits/register') {
      let task = state.tasks.find(item => item.audit_request === data.request_id);
      if (!task) {
        task = addTask(state, {kind: 'audit', owner: data.mode === 'external' ? 'knowledge_auditor' : 'pi', title: '演示 · 活动资料审计'});
        task.audit_request = data.request_id;
        task.audit_tracking = {mode: data.mode, auto_close: false, received_at: '', delivered_at: data.delivered ? timestamp() : ''};
      }
      return {...template, id: task.id, workspace: state.workspace.id, supplement: text};
    }
    const match = /^\/knowledge-audits\/tasks\/([^/]+)(?:\/([^/]+))?$/.exec(path);
    if (!match) throw new Error('找不到该演示审计记录。');
    const task = taskById(state, match[1], data.revision);
    const audit = task.audit_tracking;
    if (!audit) throw new Error('找不到该演示审计记录。');
    if (match[2] === 'copied') audit.copied_at = timestamp();
    if (match[2] === 'delivered') audit.delivered_at = timestamp();
    if (match[2] === 'record-report') {
      audit.received_at = timestamp();
      audit.manual_result = true;
      audit.report_text = data.report;
      audit.result = {outcome: data.outcome, total_files: data.total_files, covered_files: data.covered_files, summary: data.summary || '已登记演示回报。'};
      changeStatus(state, task, 'review', {audit_outcome: data.outcome});
    }
    return {...audit, id: task.id, workspace: state.workspace.id, supplement: text,
      report_text: audit.report_text || '', versions: audit.received_at ? [{received_at: audit.received_at, report_text: audit.report_text, digest: 'DEMO'}] : []};
  }

  function workspaceRoute(state, path, data, query) {
    if (path === '/state') {
      state.collection_prompts.day = dateKey();
      const auto = state.collection_automation;
      auto.preview = state.tasks.filter(task => task.kind === 'research' && task.owner === 'pi' && task.status === 'pending' &&
        !task.auto_run && linkedFiles(state, task).some(file => file.source === 'intelligence'))
        .map(task => ({task_id: task.id, title: task.title, revision: task.revision, files: linkedFiles(state, task)}));
      return state;
    }
    if (path === '/tasks') return addTask(state, data);
    if (path === '/communications') {
      const category = data.category || 'product';
      const title = ({product: '产品沟通', content: '内容沟通', audit: '审计沟通', temporary: '临时沟通'})[category] || '临时沟通';
      const task = addTask(state, {kind: 'discussion', owner: data.first_speaker, participants: ['pi', 'wb'],
        title: title + ' · ' + (data.topic || '示例讨论'), description: data.topic});
      task.discussion_type = category;
      task.discussion_type_editable = true;
      task.batch_eligible = true;
      state.discussions.push({task_id: task.id, category, mode: 'communication', max_rounds: 1, first_speaker: task.owner,
        participants: task.participants, action_index: 1, turn_model: 'single_action'});
      return task;
    }
    if (path === '/tasks/reopen-closures') return batch(state, data.tasks, 'reopen', data);
    if (path === '/tasks/batch-copy') return batch(state, data.tasks, 'copy', data);
    const group = /^\/tasks\/(?:delivery|discussion|test|research|intelligence)-batch\/(copy|handoff|close)$/.exec(path);
    if (group) return batch(state, data.tasks, group[1], data);
    const task = /^\/tasks\/([A-Z]{2}-[A-F0-9]{8})(?:\/([^/]+))?$/.exec(path);
    if (task) return taskRoute(state, taskById(state, task[1], data.revision), task[2], data, query);
    const artifact = /^\/artifacts\/(\d+)$/.exec(path);
    if (artifact) {
      const file = state.artifacts.find(item => item.id === Number(artifact[1]));
      if (!file) throw new Error('找不到该示例资料。');
      return {name: file.name, text: state.demo_documents[file.id] || '示例资料。', changed: false};
    }
    const sourceEvent = /^\/source-events\/(\d+)\/(review|create-task|triage)$/.exec(path);
    if (sourceEvent) {
      const event = state.source_events.find(item => item.id === Number(sourceEvent[1]));
      if (!event) throw new Error('找不到该示例来件。');
      if (sourceEvent[2] === 'review' || data.resolution === 'informational') event.state = 'reviewed';
      else {
        const item = state.tasks.find(item => item.id === event.task_id) || addTask(state, {
          title: event.title || event.name, description: '示例来件。', kind: 'discussion',
          owner: data.recipient_role || event.recipient_role, artifact_ids: [event.artifact_id]
        });
        event.state = 'linked';
        event.task_id = item.id;
      }
      return {task_id: event.task_id};
    }
    if (path === '/reference-candidates') return {items: state.artifacts};
    if (['/scan', '/delivery/sync', '/usage'].includes(path)) return {changed: 0, created: 0, scanned: state.artifacts.length, found: 0, queued: 0};
    if (path === '/test-assignment-template' || path === '/knowledge-audits/prompt' || path === '/knowledge-maintenance/query-prompt') return template;
    if (path.startsWith('/knowledge-audits/')) return auditRoute(state, path, data);
    if (path === '/knowledge-maintenance/refresh') return {pages: 1, generated_at: timestamp(), issues: 0};
    if (path === '/knowledge-maintenance') {
      const title = state.workspace.id === 'ts' ? '手作市集 · 演示资料' : '社区读书会 · 演示资料';
      const search = query.get('q') || '';
      const pages = title.includes(search) || '活动资料.md'.includes(search) ? [{title, path: '活动资料.md', page_type: 'sample',
        declared_status: '已登记示例活动资料。', scope: '公开活动示例', source_refs: [], unresolved: ''}] : [];
      return {available: true, message: '演示知识目录', pages, total: pages.length, issues: [], labels: {sample: '示例资料'}};
    }
    if (path.startsWith('/collection-prompts/')) {
      const prompts = state.collection_prompts;
      if (path.endsWith('/history')) return {assignments: prompts.assignments.filter(item => !query.get('day') || item.day === query.get('day'))};
      if (path.endsWith('/brief')) {
        prompts.brief = {text: data.text, revision: code(), updated_at: timestamp(), stale: false};
        return {brief: prompts.brief};
      }
      if (path.endsWith('/generate')) {
        let assignment = prompts.assignments.find(item => item.request_key === data.request_key);
        if (!assignment) {
          assignment = {...template, id: code(), request_key: data.request_key, target: data.target, topic: data.topic, day: dateKey(),
            created_at: timestamp(), focus: '活动资料示例', angle: '演示准备记录', rule_version: 'DEMO'};
          prompts.assignments.unshift(assignment);
        }
        return assignment;
      }
      return prompts.assignments.find(item => path.endsWith('/' + item.id)) || template;
    }
    const auto = state.collection_automation;
    if (path === '/collection-automation/settings') {
      auto.enabled = Boolean(data.enabled);
      if (auto.enabled && !auto.runs.some(run => run.status === 'queued') && auto.preview.length) {
        queueRun(state, auto.preview.map(item => taskById(state, item.task_id)));
      }
      return {enabled: auto.enabled};
    }
    if (path === '/collection-automation/run') {
      if (!auto.enabled || auto.runs.some(run => run.status === 'queued')) throw new Error('请核对当前演示流转状态。');
      return {run_ids: [queueRun(state, auto.preview.map(item => taskById(state, item.task_id)))]};
    }
    if (path === '/collection-automation/confirmation') return runPreview(state, auto.runs.find(run => run.id === query.get('run_id')));
    if (path === '/collection-automation/confirm') {
      const run = auto.runs.find(run => run.id === data.run_id);
      const preview = runPreview(state, run);
      const result = batch(state, preview.tasks.filter(item => item.status !== 'done'), 'confirm', data);
      run.confirmed_count = run.tasks.length;
      run.confirmation_complete = true;
      return result;
    }
    if (path === '/collection-automation/remove') {
      const origin = data.restore ? auto.removed_runs : auto.runs;
      const target = data.restore ? auto.runs : auto.removed_runs;
      const index = origin.findIndex(run => run.id === data.run_id);
      if (index < 0) throw new Error('找不到本次演示记录。');
      target.unshift(origin.splice(index, 1)[0]);
      auto.removed_count = auto.removed_runs.length;
      return {removed: !data.restore};
    }
    if (path === '/collection-automation/resolve' || path === '/delivery/execution/resolve') {
      const group = path.startsWith('/delivery/') ? state.delivery_execution : auto;
      const run = group.runs.find(item => item.id === data.run_id && ['failed', 'uncertain'].includes(item.status));
      if (!run) throw new Error('当前没有待核实的演示记录。');
      run.status = 'cancelled';
      run.label = '已转回手动 · 演示';
      for (const item of run.tasks) taskById(state, item.task_id).auto_run = null;
      return {id: run.id};
    }
    const report = /^\/delivery\/tasks\/([^/]+)\/accept-report$/.exec(path);
    if (report) {
      const task = taskById(state, report[1], data.revision);
      if (!task.delivery) throw new Error('找不到该演示交付分支。');
      task.delivery.report_changed = 0;
      task.revision++;
      return {id: task.id};
    }
    if (path === '/delivery/execution/stop') {
      const run = state.delivery_execution.runs.find(item => item.id === data.run_id && item.status === 'queued');
      if (!run) throw new Error('本次演示已结束。');
      run.status = 'cancelled';
      run.label = '已取消演示移交';
      for (const item of run.tasks) taskById(state, item.task_id).auto_run = null;
      return {message: '已取消演示移交。'};
    }
    throw new Error('找不到该演示操作。');
  }

  function operationsRoute(state, path, data) {
    if (path === '/state') return state;
    if (path === '/sync') return {};
    if (path === '/cards') {
      const existing = state.cards.find(item => item.request_id === data.request_id);
      if (existing) return {card: existing};
      if (!String(data.body || '').trim()) throw new Error('请填写示例沟通内容。');
      const card = {...data, id: 'OP-' + code() + code(), status: 'draft', revision: 1, created_at: timestamp()};
      state.cards.unshift(card);
      state.total_cards = state.cards.length;
      return {card};
    }
    const [, id, action] = /^\/cards\/([^/]+)(?:\/([^/]+))?$/.exec(path) || [];
    const card = state.cards.find(item => item.id === id);
    if (!card) throw new Error('找不到该演示沟通卡。');
    if (!action) {
      const replies = state.cards.filter(item => item.reply_to === card.id);
      return {card, replies, reply: replies[0], prompt: card.status === 'closed' ? text : ''};
    }
    if (action === 'handoff' && card.completed_preparation === data.prepared_id) return {card};
    if (card.revision !== data.revision || card.status !== 'draft') throw new Error('卡片已变化，请刷新核对。');
    if (action === 'prepare') {
      if (data.receiver === card.sender || !state.projects.some(project => project.id === data.receiver && project.available)) {
        throw new Error('请选择另一个接收项目。');
      }
      card.preparation = {prepared_id: code(), receiver: data.receiver};
      return {...card.preparation, card_id: card.id, sender: card.sender, revision: card.revision, text};
    }
    if (action === 'handoff' && data.clipboard_copied === true && card.preparation?.prepared_id === data.prepared_id) {
      card.receiver = card.preparation.receiver;
      card.status = 'closed';
      card.closed_at = timestamp();
      card.completed_preparation = data.prepared_id;
      delete card.preparation;
      state.events.unshift({id: Date.now(), action: 'handed_off', card_id: card.id,
        sender: card.sender, receiver: card.receiver, created_at: card.closed_at});
    } else if (action === 'archive' && data.confirm_archive) {
      card.status = 'archived';
      card.archived_at = timestamp();
      card.archive_reason = data.reason;
    } else {
      throw new Error('请在演示卡片中重新准备交接。');
    }
    card.revision++;
    return {card};
  }

  window.workbenchDemoRequest = async (input, options = {}) => {
    try {
      const url = new URL(input, location.origin);
      const match = /^\/api\/(ts|ks|ops)(\/.*)$/.exec(url.pathname);
      if (!match || url.origin !== location.origin) throw new Error('找不到该演示操作。');
      const [, scope, path] = match;
      const mutation = Boolean(options.method && options.method !== 'GET');
      const data = mutation ? JSON.parse(options.body || '{}') : {};
      const state = load(scope);
      const settled = scope !== 'ops' && settleRuns(state);
      if (settled) save(scope, state);
      const result = scope === 'ops' ? operationsRoute(state, path, data) : workspaceRoute(state, path, data, url.searchParams);
      if (mutation && path !== '/usage') save(scope, state);
      return new Response(JSON.stringify(result), {headers: {'Content-Type': 'application/json'}});
    } catch (error) {
      return new Response(JSON.stringify({error: error.message || '演示操作未完成。'}), {status: 409, headers: {'Content-Type': 'application/json'}});
    }
  };
})();
