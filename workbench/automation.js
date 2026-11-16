"use strict";

let automationRecovery = null;
let automationRemoval = null;
let automationConfirmation = null;
function automationDelivery(record) {
  const receipt = record.receipt;
  const questions = {factors:'反推因素', growth:'生长点', line_vs_page:'行 vs 页', new_neurons:'新神经元个数', unpersisted:'未落盘事项'};
  const wrapup = receipt?.wrapup ? '<section class="automation-wrapup"><h4>原知识库维护者收尾五问</h4>' +
    Object.entries(questions).map(([key,label],index) => '<div><h5>' + (index + 1) + '. ' + label + '</h5><div class="automation-prose">' +
      esc(receipt.wrapup[key]).replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>') + '</div></div>').join('') + '</section>' : '';
  const summaries = receipt?.results.map(result => '<section class="automation-result"><h4>' + esc(result.task_id) +
    '</h4><div class="automation-prose">' + esc(result.conclusion) + '</div><p class="helper">下一步：' +
    esc(result.next_step) + '</p></section>').join('') || '';
  const paths = receipt?.knowledge_paths || [];
  const references = receipt?.reference_paths || [];
  const finalization = receipt?.platform_finalization ? '<p class="helper">原回执版本：' + esc(receipt.reported_knowledge_commit) + '；平台核验同批后续保存后的最终版本：' + esc(receipt.knowledge_commit) + '。原文件保留。</p>' : '';
  const blobProof=receipt?.exact_blob_proof?.length?'<p class="helper">保存字节核对：'+receipt.exact_blob_proof.length+' 个文件已与提交原文逐字节确认；未改写原回执。</p>':'';
  return finalization + blobProof + summaries + wrapup + (record.human_response ? '<details class="automation-human"><summary>历史知识库处理报告 · 含收尾五问</summary>' +
    '<div class="automation-prose">' + esc(record.human_response) + '</div></details>' : '') +
    (receipt ? '<details><summary>整批知识文件 · ' + paths.length + ' 个（去重）</summary><p class="helper">原回报记录的实际修改文件，平台未独立核实知识内容。</p><ul class="automation-file-list">' +
      paths.map(path => '<li>' + esc(path) + '</li>').join('') + '</ul>' +
      (!paths.length ? '<p class="helper">未报告知识文件修改。</p>' : '') + '</details>' : '') +
    (references.length ? '<details><summary>本批附带记录引用 · ' + references.length + ' 个</summary><p class="helper">仅保留本线回报引用；不代表新的库外写入授权或平台核验。</p><ul class="automation-file-list">' +
      references.map(path => '<li>' + esc(path) + '</li>').join('') + '</ul></details>' : '') +
    (record.response && record.response !== record.human_response ? '<details><summary>原始回执 · 排查记录</summary><pre class="automation-response">' +
      esc(record.response) + '</pre></details>' : '');
}
function automationTiming(record) {
  const fields={card_created:'最早建卡',queued:'进入队列',started:'Pi 开始',received:'回报核验',closed:'本批全部闭环'};
  const timeline=Object.entries(fields).map(([key,label])=>label+'：'+(record.timing?.[key]?esc(appearedAt(record.timing[key])):'尚无记录')).join('<br>');
  const conflicts=(record.source_conflicts || []).map(f=>'<li>'+esc(f.task_id)+' · '+esc(f.name)+'<br>移交版本 '+esc(f.expected?.slice(0,12))+' → 当前 '+esc(f.current?.slice(0,12) || '未关联')+'</li>').join('');
  return '<details><summary>流转时间与版本核对</summary><p class="helper">'+timeline+'</p><p class="helper">时间来自本机记录；采集 Agent 完成时间、云盘上游延迟未获验证，建卡时间不等于报告写成时间。</p>'+(conflicts?'<p class="automation-error">执行期间关联原件版本发生变化，保留已有成果，不自动采纳新版或重跑。</p><ul>'+conflicts+'</ul>':'')+'</details>';
}
function automationRunCard(record) {
  const tasks = record.tasks.map(task =>
    (state.trash_tasks || []).some(t=>t.id===task.task_id) ? '<span class="tag">' + esc(task.task_id) + ' · 已撤销，可在垃圾箱恢复</span>' :
    '<button class="button small" data-task="' + esc(task.task_id) + '">' + esc(task.task_id) + '</button>').join('');
  const files = record.tasks.map(task => '<p class="helper">' + esc(task.task_id) + task.files.map(file =>
    '<br>' + esc(file.name) + '<br><small>SHA-256：' + esc(file.digest) + '</small>').join('') + '</p>').join('');
  return '<article class="panel automation-run"><div class="automation-heading"><h3>' + esc(record.label) +
    '</h3><div class="automation-heading-actions">' +
    (record.status === 'review' && !record.confirmation_complete ? '<button class="button primary small" data-auto-confirm="' +
      esc(record.id) + '">确认本批次并归档</button>' : '') +
    '<span class="tag">' + esc(record.day) + '</span></div></div><p class="helper">' + esc(record.id) +
    ' · ' + esc(appearedAt(record.updated_at)) + '</p>' +
    automationTiming(record) +
    (record.status === 'review' ? '<p class="helper">本批共 ' + record.tasks.length + ' 项：已闭环 ' + record.confirmed_count +
      ' 项，已撤销 ' + (record.cancelled_count || 0) + ' 项。' + (record.confirmation_complete ? '回报、原件入口和执行历史保留；撤销项不归档，共享原件按最后关联任务闭环归档。' :
      String(record.protocol).startsWith('cli-') ? '已完成项目将自动闭环；未完成或受阻项目保留待核实。' : '看完下方历史回报后，点击“确认本批次并归档”完成本批流转。') + '</p>' : '') +
    (record.handled_by ? '<p class="helper">本记录当时未提交执行。任务后续由 ' + esc(record.handled_by.id) + ' 承接：' +
      esc(record.handled_by.label) + '。保留历史，无需重复移交。</p><details><summary>当时的失败原因</summary><p>' + esc(record.error) + '</p></details>' :
      record.error ? '<p class="automation-error">' + esc(record.error) + '</p>' : '') +
    (record.status === 'failed' && !record.attempted && !record.handled_by ? '<p class="helper">本批当时未提交执行。当前报告请从采集工作区复制交给 知识库维护 Agent；原异常记录保留。</p>' : '') +
    '<div class="automation-tasks">' + tasks + '</div>' +
    (record.session_id && !String(record.protocol).startsWith('cli-') ? '<p><a href="/workbench/#demo-record-' + encodeURIComponent(record.session_id) +
      '" target="_blank" rel="noopener noreferrer">打开原执行会话（历史） ↗</a></p>' : '') +
    (['uncertain', 'failed'].includes(record.status) && !record.handled_by ? '<button class="button small" data-auto-resolve="' +
      esc(record.id) + '">核实后转回手动</button>' : '') +
    (['failed', 'cancelled'].includes(record.status) ? '<p><button class="button small" data-auto-remove="' +
      esc(record.id) + '">删除异常卡片</button><span class="helper"> 只移出执行列表，历史可恢复。</span></p>' : '') +
    automationDelivery(record) +
    '<details><summary>本次原件版本 · ' + record.tasks.length + ' 项任务</summary>' + files + '</details></article>';
}

function collectionAutomationControl(auto) {
  const enabled=Boolean(auto.enabled),prefix=state.workspace?.prefix||'',runs=auto.runs||[];
  const running=runs.some(item=>['preparing','sending','running'].includes(item.status));
  const uncertain=runs.some(item=>item.status==='uncertain');
  const message=!enabled?(running?'已切回手动；已提交的批次继续追踪，请勿重复处理同一批卡片。':'手动流转中，由你使用下方现有卡片和批量操作。'):uncertain?'有批次执行情况待核实，暂停新的自动派发。':running?'Pi 正在处理本线采集批次，完成后校验并记录结果。':!auto.ready?'自动模式已开启，等待执行条件恢复：'+(auto.connection||'正在核对本线环境'):'自动模式已开启，12:00 起自动处理已集结卡片，并持续接收迟到卡片；两线独立执行。'+(auto.protected_count?' 已有 '+auto.protected_count+' 项改动受保护；遇文件重叠时仅暂停对应批次。':'');
  return `<section class="panel collection-auto-panel" data-auto-mode="${enabled?'on':'off'}" aria-labelledby="collection-auto-title"><div class="collection-auto-heading"><div><span class="section-kicker">${esc(prefix)} · 采集流转</span><h2 id="collection-auto-title">自动采集流转</h2><p>每天 ${esc(auto.schedule||'12:00')} 起持续接收 · Pi 本线新会话 · 汇总归档后守护式闭环</p></div><button id="collection-auto-toggle" class="automation-switch" type="button" role="switch" aria-label="自动采集流转" aria-checked="${enabled}" aria-describedby="collection-auto-status"${auto.supported===false?' disabled':''}><span class="switch-track" aria-hidden="true"><span class="switch-dot"></span></span><span class="switch-copy"><strong>${enabled?'自动模式':'手动模式'}</strong><small>${enabled?'已开启':'已关闭'}</small></span></button></div><div class="collection-auto-footer"><p id="collection-auto-status" class="helper${enabled&&(!auto.ready||uncertain)?' collection-auto-blocked':''}" role="status">${esc(message)}</p><span class="collection-auto-time">${enabled?'每日启动：12:00 · 新件稳定后自动接入':'12:00 后开启即可接收本线待办'}</span></div>${auto.worker_error?`<p class="automation-error">${esc(auto.worker_error)}</p>`:''}<div class="collection-auto-footer"><p class="helper">新件观察：${auto.intake?.observed_at?esc(appearedAt(auto.intake.observed_at)):'尚无记录'} · 等待稳定 ${auto.intake?.stabilizing||0} 份 · 已入队待执行 ${auto.intake?.queued_tasks||0} 张。已到件持续接入，不代表今天预计报告已到齐。</p>${auto.intake?.waiting_reason?`<p class="helper">${esc(auto.intake.waiting_reason)}；新件可继续登记排队，本线暂不并发写库。</p>`:''}${auto.intake?.monitor_error?`<p class="automation-error">${esc(auto.intake.monitor_error)}</p>`:''}</div><details class="collection-auto-info"><summary>查看处理规则与汇总位置</summary><p class="helper">先核验原件，再反哺知识、完成收尾五问和项目记忆落盘；平台校验合格结果后闭环，未完成或异常项目保留待核实。关闭仅停止新自动派发，不撤销已提交工作。</p><p class="helper">本线知识库：<span class="automation-path">${esc(auto.profile||'')}</span></p><p class="helper">WPS 汇总归档：<span class="automation-path">${esc(auto.summary_dir||'')}</span></p></details></section>`;
}
function animateCollectionMode(enabled) {
  if(document.hidden||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const button=$('#collection-auto-toggle');
  if(!button)return;
  const dot=$('.switch-dot',button);
  if(!dot)return;
  dot.animate([{transform:`translateX(${enabled?0:22}px)`},{transform:`translateX(${enabled?22:0}px)`}],{duration:230,easing:'cubic-bezier(.2,.8,.2,1)'});
  button.animate([{transform:'scale(.985)'},{transform:'scale(1)'}],{duration:180,easing:'ease-out'});
}

function renderAutomation() {
  const restoreModeFocus=document.activeElement?.id==='collection-auto-toggle';
  const auto = state.collection_automation || {runs: [], preview: [], skipped: []};
  const live = auto.runs.some(record => ['queued', 'preparing', 'sending', 'running', 'uncertain'].includes(record.status));
  const preview = auto.preview.map(task => '<p>' + esc(task.task_id) + ' · ' + esc(task.title) +
    '<br><span class="helper">' + task.files.map(file => esc(file.name)).join('<br>') + '</span></p>').join('');
  const skipped = auto.skipped.map(task => '<p class="helper">' + esc(task.task_id) + ' · ' + esc(task.reason) + '</p>').join('');
  setWorkspaceMarkup(collectionAutomationControl(auto) + businessDeskMarkup('automation') + '<details class="desk-tools" id="business-tools"' + (businessState('automation').tools?' open':'') + '><summary>准备采集指令</summary>' + collectionPromptMarkup() + '</details><details class="panel"' + (live ? ' open' : '') + '><summary>自动处理记录与恢复</summary><section class="automation-control">' +
    '<div class="automation-actions"><button class="button" id="collection-auto-run"' +
    (!auto.enabled || !auto.ready || live ? ' disabled' : '') + '>立即移交当前报告</button>' +
    '<span class="helper">可移交 ' + auto.preview.length + ' 项 · 每批最多 20 项</span></div>' +
    '<details><summary>移交前预览 · ' + auto.preview.length + ' 项</summary>' +
    (preview || '<p class="helper">当前没有符合范围的新采集报告。</p>') + '</details>' +
    (skipped ? '<details><summary>暂未自动移交 · ' + auto.skipped.length + ' 项</summary>' + skipped + '</details>' : '') +
    '</section><div class="toolbar"><h2>执行记录 <span>' + auto.runs.length + '</span></h2></div><div class="automation-runs">' +
    (auto.runs.map(automationRunCard).join('') || empty('尚未自动移交', '开启后按计划自动交接；执行和恢复记录保留。')) + '</div>' +
    (auto.removed_count ? '<details class="panel"><summary>已删除异常卡片 · ' + auto.removed_count + ' 条（可恢复）</summary>' +
      '<p class="helper">执行历史、原任务和原件均保留；恢复卡片不会重新执行。此处显示最近 30 条。</p>' +
      auto.removed_runs.map(record => '<p>' + esc(record.id) + ' · ' + esc(record.day) +
        ' <button class="button small" data-auto-restore="' + esc(record.id) + '">恢复卡片</button></p>').join('') + '</details>' : '') + '</details>');
  if(restoreModeFocus)$('#collection-auto-toggle')?.focus({preventScroll:true});
  bindCollectionPrompts();
  $('#collection-auto-toggle').onclick = event => {
    if(busyActions||inFlightMutations)return;
    const scope=activeWorkspace,next=!auto.enabled;
    run(async () => {
      try {await api('/collection-automation/settings', {enabled:next});}
      catch(error){try{await refresh();}catch{}throw error;}
      if(activeWorkspace!==scope)return;
      await refresh();
      if(activeWorkspace!==scope||view!=='automation')return;
      const actual=Boolean(state.collection_automation?.enabled);
      if(actual!==next)throw new Error('模式状态已变化，请核对页面显示后操作');
      $('#collection-auto-toggle')?.focus({preventScroll:true});
      try{animateCollectionMode(actual);}catch{}
      toast(actual?'已开启本线自动流转，12:00 起持续接收新增采集卡':'已切回手动；停止新自动派发，已提交工作继续追踪');
    }, event.currentTarget);
  };
  $('#collection-auto-run').onclick = event => run(async () => {
    await api('/collection-automation/run', {});
    await refresh();
    toast('本次批次已排队，等待 知识库维护 Agent 移交');
  }, event.currentTarget);
  $$('[data-auto-confirm]').forEach(button => button.onclick = event => run(async () => {
    const context = {id: button.dataset.autoConfirm, workspace: activeWorkspace, preview: null};
    automationConfirmation = context;
    $('#automation-confirmation-id').textContent = state.workspace.prefix + ' · ' + context.id;
    $('#automation-confirmation-list').textContent = '正在核对本批任务与原件…';
    $('#automation-confirmation-result').textContent = '';
    $('#automation-confirmation-submit').hidden = false;
    $('#automation-confirmation-submit').disabled = true;
    $('#automation-confirmation').showModal();
    const preview = await api('/collection-automation/confirmation?run_id=' + encodeURIComponent(context.id));
    if (automationConfirmation !== context || context.workspace !== activeWorkspace || !$('#automation-confirmation').open) return;
    context.preview = preview;
    $('#automation-confirmation-list').innerHTML = preview.tasks.map(task => '<section class="automation-result"><h4>' +
      esc(task.id) + ' · ' + esc(task.title) + '</h4><p class="helper">' +
      (task.status === 'cancelled' ? '已撤销，本次跳过' : task.status === 'done' ? '已闭环，本次跳过' : task.ready ? '可以确认闭环' : '暂不能闭环') + '</p><ul>' +
      task.files.map(name => '<li>' + esc(name) + '</li>').join('') + '</ul>' +
      task.issues.map(issue => '<p class="automation-error">' + esc(issue.reason) + '</p>').join('') + '</section>').join('');
    $('#automation-confirmation-submit').disabled = !preview.ready || !preview.remaining;
    if (!preview.ready) $('#automation-confirmation-result').textContent = '请先处理上方问题，再重新打开本批确认窗口。';
  }, event.currentTarget));
  $$('[data-auto-resolve]').forEach(button => button.onclick = () => {
    automationRecovery = {id: button.dataset.autoResolve, workspace: activeWorkspace};
    $('#automation-recovery-id').textContent = automationRecovery.id;
    $('#automation-recovery-form').reset();
    $('#automation-recovery').showModal();
  });
  $$('[data-auto-remove]').forEach(button => button.onclick = () => {
    automationRemoval = {id: button.dataset.autoRemove, workspace: activeWorkspace};
    $('#automation-removal-id').textContent = state.workspace.prefix + ' · ' + automationRemoval.id;
    $('#automation-removal').showModal();
  });
  $$('[data-auto-restore]').forEach(button => button.onclick = event => {
    const workspace = activeWorkspace, id = button.dataset.autoRestore;
    run(async () => {
      if (workspace !== activeWorkspace) throw new Error('工作空间已变化，请重新打开执行卡');
      await api('/collection-automation/remove', {run_id: id, restore: true});
      await refresh();
      toast('异常卡片已恢复，不会重新执行');
    }, event.currentTarget);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  $('#automation-confirmation-form').onsubmit = event => {
    event.preventDefault();
    run(async () => {
      const context = automationConfirmation;
      if (!context?.preview?.ready || context.workspace !== activeWorkspace) throw new Error('请在当前工作空间重新打开本批确认窗口');
      let result;
      try {
        result = await api('/collection-automation/confirm', {run_id: context.id,
          tasks: context.preview.tasks.map(task => ({id: task.id, revision: task.revision}))});
      } catch (error) {
        $('#automation-confirmation-submit').hidden = true;
        $('#automation-confirmation-result').textContent = error.message + '。请关闭窗口并刷新，再核对本批状态；已成功的任务不会重复归档。';
        throw error;
      }
      $('#automation-confirmation-submit').hidden = true;
      $('#automation-confirmation-result').innerHTML = '<p><strong>本次闭环 ' + result.count + ' 项，已闭环跳过 ' +
        result.already_done + ' 项，失败 ' + result.failed + ' 项；归档 ' + result.archived + ' 份原件。</strong></p>' +
        (result.archive_deferred ? '<p class="helper">还有 ' + result.archive_deferred + ' 份共享原件，等其余关联任务闭环后归档。</p>' : '') +
        '<ul>' + result.items.map(item => '<li>' + esc(item.id) + ' · ' +
          (item.status === 'cancelled' ? '已撤销，未归档' : item.status === 'done' ? item.already_done ? '已闭环，本次跳过' : '已确认闭环' : esc(item.error)) + '</li>').join('') + '</ul>' +
        (result.failed ? '<p class="automation-error">成功项已保留；处理失败原因后，重新打开本批窗口继续确认剩余任务。</p>' :
          '<p class="helper">本批流转已完成，可在“闭环记录”查看任务；知识库维护 Agent 回报和原件入口继续保留。</p>');
      await refresh();
      toast(result.failed ? '本批部分完成，请查看逐项结果' : '本批已确认闭环，原件已按规则归档', !!result.failed);
    }, $('#automation-confirmation-submit'));
  };
  $('#automation-removal-form').onsubmit = event => {
    event.preventDefault();
    run(async () => {
      if (!automationRemoval || automationRemoval.workspace !== activeWorkspace) throw new Error('工作空间已变化，请重新打开执行卡');
      await api('/collection-automation/remove', {run_id: automationRemoval.id, restore: false});
      $('#automation-removal').close();
      await refresh();
      toast('异常卡片已删除，执行历史保留，可在列表下方恢复');
    }, $('button[type="submit"]', event.target));
  };
  $('#automation-recovery-form').onsubmit = event => {
    event.preventDefault();
    run(async () => {
      if (!automationRecovery || automationRecovery.workspace !== activeWorkspace) throw new Error('工作空间已变化，请重新打开执行卡');
      await api('/collection-automation/resolve', {run_id: automationRecovery.id,
        note: $('#automation-recovery-note').value, confirmed_stopped: $('#automation-recovery-stopped').checked});
      $('#automation-recovery').close();
      await refresh();
      toast('记录已保留，请按实际情况手动处理原任务');
    }, $('button[type="submit"]', event.target));
  };
});
