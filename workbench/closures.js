"use strict";

const closureReopenSelection = new Set();
let closureReopenContext = null;

function selectedClosureReopens() {
  return state.tasks.filter(task => closureReopenSelection.has(task.id) && task.status === 'done' && task.closure_reopen_eligible);
}
function clearClosureReopenSelection() { closureReopenSelection.clear(); }
function closureReopenAllowed(task) {
  const first = selectedClosureReopens()[0];
  return task.closure_reopen_eligible && (!first || first.closure_reopen_group === task.closure_reopen_group);
}
function closureReopenCheckbox(task) {
  return `<label class="history-reopen-select"><input type="checkbox" data-closure-reopen-select="${esc(task.id)}" aria-label="选择撤回闭环 ${esc(taskDisplayTitle(task))}"${closureReopenSelection.has(task.id) ? ' checked' : ''}${closureReopenAllowed(task) ? '' : ' disabled'}></label>`;
}
function closureReopenControls(rows) {
  const valid = new Set(state.tasks.filter(task => task.status === 'done' && task.closure_reopen_eligible).map(task => task.id));
  for (const id of closureReopenSelection) if (!valid.has(id)) closureReopenSelection.delete(id);
  const groups = new Map();
  for (const task of rows.filter(task => task.closure_reopen_eligible)) {
    if (!groups.has(task.closure_reopen_group)) groups.set(task.closure_reopen_group, []);
    groups.get(task.closure_reopen_group).push(task);
  }
  return `<details class="panel closure-reopen-controls"${selectedClosureReopens().length?' open':''}><summary>闭环误操作纠正 · ${selectedClosureReopens().length} 项已选</summary><div class="toolbar"><strong>闭环误操作纠正</strong><span class="helper">已选 ${selectedClosureReopens().length} 项 · 每次最多20项</span><button class="button primary small" id="closure-reopen-selected"${selectedClosureReopens().length ? '' : ' disabled'}>撤回闭环 · 恢复进行中</button><button class="button small" id="closure-reopen-clear">清空选择</button></div><p class="helper">勾选同类、同执行方的卡片；采集处理和测试报告研究分开选择。只恢复卡片状态，原件保留在归档位置，已有结论与知识库内容保留。</p><div class="closure-reopen-groups">${Array.from(groups, ([group,tasks]) => `<button class="button small" data-closure-reopen-group="${esc(group)}">选择本页${esc(batchLabel(tasks))} · ${tasks.length}</button>`).join('')}</div></details>`;
}
function bindClosureReopenHistory() {
  $$('[data-closure-reopen-select]').forEach(input => input.onchange = () => {
    const task = state.tasks.find(item => item.id === input.dataset.closureReopenSelect);
    if (input.checked && (!task || !closureReopenAllowed(task))) { input.checked = false; toast('请选择同类资料、同一执行方', true); return; }
    if (input.checked && closureReopenSelection.size >= 20) { input.checked = false; toast('一次最多撤回20项', true); return; }
    if (input.checked) closureReopenSelection.add(task.id); else closureReopenSelection.delete(input.dataset.closureReopenSelect);
    render();
  });
  $$('[data-closure-reopen-group]').forEach(button => button.onclick = () => {
    closureReopenSelection.clear();
    const ids = $$('[data-closure-reopen-select]').map(input => input.dataset.closureReopenSelect);
    state.tasks.filter(task => ids.includes(task.id) && task.closure_reopen_eligible && task.closure_reopen_group === button.dataset.closureReopenGroup)
      .slice(0,20).forEach(task => closureReopenSelection.add(task.id));
    render();
  });
  if ($('#closure-reopen-clear')) $('#closure-reopen-clear').onclick = () => { clearClosureReopenSelection(); render(); };
  if ($('#closure-reopen-selected')) $('#closure-reopen-selected').onclick = () => openClosureReopen(selectedClosureReopens());
}
function openClosureReopen(tasks,status='active') {
  if (!tasks.length || tasks.some(task => task.status !== 'done')) return;
  closureReopenContext = {workspace: activeWorkspace, status, tasks: tasks.map(task => ({id:task.id, revision:task.revision,
    ...(Number.isInteger(task.last_closure_event) ? {closure_event:task.last_closure_event} : {})}))};
  $('#closure-reopen-count').textContent = `本次恢复 ${tasks.length} 项至${labels.statuses[status]} · ${state.workspace.prefix}`;
  $('#closure-reopen-dialog h2').textContent='撤回闭环 · 恢复'+labels.statuses[status];
  $('#closure-reopen-list').innerHTML = tasks.map(task => `<li><strong>${esc(task.id)}</strong> · ${esc(taskDisplayTitle(task))}<small>${esc(taskKindLabel(task))} · ${esc(executorLabel(task.batch_recipient || task.owner, task))}</small></li>`).join('');
  $('#closure-reopen-reason').value = '闭环误操作，恢复处理状态继续核对';
  $('#closure-reopen-submit').textContent = `确认撤回闭环 ${tasks.length} 项`;
  $('#closure-reopen-dialog').showModal();
}
document.getElementById('closure-reopen-form').addEventListener('submit', event => {
  event.preventDefault();
  const context = closureReopenContext;
  if (!context || context.workspace !== activeWorkspace) { toast('工作空间已变化，请重新选择', true); return; }
  run(async () => {
    const result = await api('/tasks/reopen-closures', {tasks:context.tasks, status:context.status, confirmed:true, reason:$('#closure-reopen-reason').value.trim()});
    await refresh();
    clearClosureReopenSelection();
    $('#closure-reopen-dialog').close();
    if ($('#task-dialog').open) $('#task-dialog').close();
    selectedTask = null;
    if(context.tasks.length!==1 || !workCardDrag.committed(context.tasks[0].id,context.status)){view = 'board';render();}
    toast(`已恢复 ${result.count} 项至${labels.statuses[context.status]}；原件及历史记录保留`);
  }, $('#closure-reopen-submit'));
});
document.getElementById('closure-reopen-dialog').addEventListener('close', () => { closureReopenContext = null; });
