/* Prompt preparation is separate from report processing and Agent execution. */
const collectionDrafts = new Map();
function loadPendingCollection() {
  try {return JSON.parse(sessionStorage.getItem('yuandu.collection.pending.'+activeWorkspace)) || null;} catch {return null;}
}
function collectionDraft() {
  if (!collectionDrafts.has(activeWorkspace)) {
    const brief = state.collection_prompts?.brief || {};
    collectionDrafts.set(activeWorkspace, {topic:'', depth:'standard', prepared:null,
      briefText:brief.text || '', briefRevision:brief.revision || '', briefOpen:false, pendingCreate:loadPendingCollection()});
  }
  return collectionDrafts.get(activeWorkspace);
}
function collectionPromptMarkup() {
  const context = state.collection_prompts || {brief:{},evidence:[],warnings:[]};
  const draft = collectionDraft(), prefix = state.workspace?.prefix || '';
  const brief = context.brief || {}, plan = context.plan || {}, review = context.daily_review || {};
  const today = context.day || '';
  const completed = plan.daily && !plan.needs_review;
  const progress = review.day === today && review.status === 'reading' ? `累计通读 ${review.read_files || 0}/${review.total_files || 0} 篇 · ${review.read_chunks || 0}/${review.total_chunks || 0} 块 · 今日新增 ${review.read_today_chunks || 0} 块${review.errors ? ' · 受限 '+review.errors+' 份' : ''}` : completed ? `${plan.coverage_mode==='rolling_full'?'累计全库覆盖及当前变化复读完成':'通读完成'} · ${plan.full_files || 0} 份正文` : '未发布新的全库采集方向';
  return `<section class="collection-workspace">
    <header class="collection-page-heading"><div><span class="section-kicker">${esc(prefix)} · 采集发起</span><h2>选择一种采集方式</h2><p>通用采集长期复用；定向采集结合已发布参考与人工审计结论。</p></div><span class="tag">最多10条 / 每份</span></header>
    <div class="collection-mode-grid">
      <article class="panel collection-mode collection-fixed"><div class="collection-mode-heading"><span class="collection-mode-number">01</span><span class="tag">固定内容</span></div><h3>通用采集</h3><p class="collection-mode-description">不随日期、知识库或点击次数变化。只有你要求更新时才修改。</p><div class="collection-source-chips"><span>GitHub</span><span>X</span><span>Bilibili</span><span>今日头条</span></div><div class="collection-mode-buttons"><button class="button primary" data-generic-target="windows" data-generic-action="copy">复制 Windows 通用指令</button><button class="button" data-generic-target="mac" data-generic-action="copy">复制 MAC 通用指令</button></div><div class="collection-small-actions"><button class="button small subtle" data-generic-target="windows" data-generic-action="preview">查看 Windows 全文</button><button class="button small subtle" data-generic-target="mac" data-generic-action="preview">查看 MAC 全文</button></div><p class="helper">可重复复制给不同 Agent；报告编号由执行方生成。</p></article>
      <article class="panel collection-mode collection-daily"><div class="collection-mode-heading"><span class="collection-mode-number">02</span><span class="tag">人工更新方向</span></div><h3>定向采集</h3><p class="collection-mode-description">自动通读计划已暂停。按陈震提供的审计结果更新方向；使用已有参考时核对其日期与覆盖。</p><div class="collection-review-status${completed?' complete':''}"><strong>${esc(progress)}</strong><span>${esc(plan.updated_at ? '上次规划：'+date(plan.updated_at) : '等待首次每日规划')}</span></div><div class="collection-inputs"><label><span class="collection-field-title">本次重点 <small>选填</small></span><input id="collection-topic" maxlength="2000" placeholder="留空按今日方向分工" value="${esc(draft.topic)}"></label><label><span class="collection-field-title">研究深度</span><select id="collection-depth">${options({quick:'快速发现',standard:'标准研究',deep:'专题深研'},draft.depth)}</select></label></div><div class="collection-mode-buttons"><button class="button primary" id="collection-copy">新建 Windows 指令</button><button class="button" id="collection-copy-mac">新建 MAC 指令</button></div><button class="button small subtle" id="collection-preview">预览简版规则</button><p class="helper">${completed?'按今日缺口调配，并保留开放探索。':'当前仅使用已标注的旧参考或开放探索，不声称已核对今日缺口。'} 每次新建有独立编号；丢了复制请到历史重复制。</p>${draft.pendingCreate?'<p class="helper">上一份生成待确认，请用对应按钮恢复原请求。</p>':''}<p class="helper" id="collection-range">${draft.prepared?.id?'刚生成：'+esc(draft.prepared.id):'默认研究窗口：前一个月到今天；基础资料可追溯。'}</p></article>
    </div>
    <div class="collection-notes"><p><strong>交付方式</strong> Windows 写本线待处置；MAC 本地落盘，由你手动转入。</p><p>只准备提示词，不启动 Agent、不创建流转卡；报告返回后在上方任务区继续处理、核对与闭环。</p></div>
    <details class="panel collection-optional"><summary>方向与已有阅读依据 <span class="helper">按需查看</span></summary><div class="collection-detail-body"><p>${esc(context.domain || '')}</p><p class="helper">${esc(plan.status || '尚未发布每日规划')}；阅读记录不代表全库事实全部核验。</p>${(plan.gaps || []).map(g=>`<article class="collection-gap"><strong>${esc(g.question)}</strong><p>${esc(g.reason)}</p><p>${esc(g.request)}</p><small>${g.sources.map(r=>esc(r.path)+' / '+esc(r.section)).join('；')}</small></article>`).join('') || '<p class="helper">暂无已发布缺口清单；不会根据空目录或索引猜测知识缺失。</p>'}<p class="helper">${esc(plan.text || '')}</p><p class="helper">自动通读已暂停，已有阅读记录仅作历史依据；后续以陈震手动安排的审计结果判断方向，不把历史摘要当作今日全库审计。</p></div></details>
    <details class="panel collection-optional" id="collection-brief-details"${draft.briefOpen?' open':''}><summary>补充知识背景摘要 <span class="helper">选填</span></summary><div class="collection-detail-body"><p class="helper">摘要作为补充，不替代全库阅读。${brief.stale?'已超过30天，请核对。':''}</p><button class="button small" id="collection-brief-prompt">复制背景说明请求</button><label>本线摘要<textarea id="collection-brief" maxlength="12000" rows="4">${esc(draft.briefText)}</textarea></label><div class="collection-small-actions"><button class="button small" id="collection-brief-save">保存摘要</button><button class="button small" id="collection-brief-reload">载入已保存摘要</button></div></div></details>
    <details class="panel collection-optional"><summary>采集指令历史 <span class="helper">重复制保持原编号</span></summary><div class="collection-detail-body">${collectionHistoryMarkup(context.assignments || [])}</div></details>
    <details class="panel collection-optional"><summary>方向分配与返回统计 <span class="helper">返回不等于入库</span></summary><div class="collection-detail-body">${collectionCoverageMarkup(context)}</div></details>
  </section>`;
}

function bindCollectionPrompts() {
  const draft = collectionDraft();
  $('#collection-history-day').onchange = event => run(async()=>{
    const day=event.target.value;draft.historyDay=day;
    const result=await api('/collection-prompts/history?day='+encodeURIComponent(day));
    if(draft.historyDay!==day)return;
    collectionHistoryCache.set(activeWorkspace,result.assignments);render();
  });
  $('#collection-history-reset').onclick=()=>{draft.historyDay='';collectionHistoryCache.delete(activeWorkspace);render();};
  $('#collection-topic').oninput = event => {draft.topic=event.target.value;draft.prepared=null;};
  $('#collection-depth').onchange = event => {draft.depth=event.target.value;draft.prepared=null;};
  $('#collection-brief').oninput = event => {draft.briefText=event.target.value;};
  $('#collection-brief-details').ontoggle = event => {draft.briefOpen=event.target.open;};
  const copy = async result => {
    try {await writeClipboard(result.text);toast(result.id ? `已复制 ${result.id} · ${result.focus}` : '已复制知识背景提示词');}
    catch {prepareText(result.id ? '采集指令 · '+result.id : '知识背景提示词',result.text,'复制未完成；已生成指令保留在当天记录，请从记录重复制。');}
  };
  const download = result => {
    const url=URL.createObjectURL(new Blob([result.text],{type:'text/markdown;charset=utf-8'}));
    const link=document.createElement('a');link.href=url;link.download=result.filename;link.click();
    usageEvent('download','unconfirmed');
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  const generate = (target,event) => run(async()=>{
    const scope=activeWorkspace;
    if (draft.pendingCreate && (draft.pendingCreate.target || 'windows')!==target) throw new Error('上一份生成尚未确认，请先点击对应平台按钮恢复原请求');
    if (!draft.pendingCreate) {
      const requestKey = crypto.randomUUID ? crypto.randomUUID() : Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('');
      draft.pendingCreate={topic:draft.topic,depth:draft.depth,target,request_key:requestKey};
      sessionStorage.setItem('yuandu.collection.pending.'+scope,JSON.stringify(draft.pendingCreate));
    }
    let result;
    try {result=await api('/collection-prompts/generate',draft.pendingCreate);}
    catch(error) {throw new Error(error.message+'；再次点击可重试原请求，也可刷新后查看当天记录。');}
    draft.pendingCreate=null;sessionStorage.removeItem('yuandu.collection.pending.'+scope);
    draft.prepared=result;
    draft.historyDay='';collectionHistoryCache.delete(scope);
    await copy(result);
    await refresh();
  },event.currentTarget);
  $('#collection-copy').onclick = event => generate('windows',event);
  $('#collection-copy-mac').onclick = event => generate('mac',event);
  $$('[data-generic-target]').forEach(button=>button.onclick=event=>run(async()=>{
    const result=await api('/collection-prompts/generic?target='+button.dataset.genericTarget);
    if(button.dataset.genericAction==='preview') showText('固定通用采集 · '+button.dataset.genericTarget,result.text,'每次复制正文相同；仅按你的明确要求更新。');
    else await copy(result);
  },event.currentTarget));
  $('#collection-preview').onclick = event => run(async()=>{
    const result=await api('/collection-prompts/prepare',{topic:draft.topic,depth:draft.depth});
    showText('公共规则与方向预览 · 不生成指令编号',result.text);
  },event.currentTarget);
  document.querySelectorAll('[data-collection-record]').forEach(button=>button.onclick=event=>run(async()=>{
    const result=await api('/collection-prompts/assignments/'+button.dataset.collectionRecord);
    if (button.dataset.action==='copy') await copy(result);
    else if (button.dataset.action==='download') download(result);
    else showText('原指令 · '+result.id+' · '+result.focus,result.text);
  },event.currentTarget));
  $$('[data-collection-upgrade]').forEach(button=>button.onclick=event=>{
    const records=draft.historyDay ? collectionHistoryCache.get(activeWorkspace) || [] : state.collection_prompts.assignments;
    const record=records.find(item=>item.id===button.dataset.collectionUpgrade);
    if(!record)return;
    draft.topic=record.topic;draft.depth=record.depth;generate(record.target || 'windows',event);
  });
  $('#collection-brief-prompt').onclick = event => run(async()=>{
    await copy(await api('/collection-prompts/prepare',{mode:'brief'}));
  },event.currentTarget);
  $('#collection-brief-save').onclick = event => run(async()=>{
    const result=await api('/collection-prompts/brief',{text:draft.briefText,revision:draft.briefRevision});
    draft.briefRevision=result.brief.revision;draft.prepared=null;
    await refresh();toast('已保存本线摘要；下次准备指令使用新方向');
  },event.currentTarget);
  $('#collection-brief-reload').onclick = event => run(async()=>{
    await refresh();
    const brief=state.collection_prompts.brief;draft.briefText=brief.text;draft.briefRevision=brief.revision;
    $('#collection-brief').value=draft.briefText;toast('已载入本线保存的摘要');
  },event.currentTarget);
}

function collectionHistoryMarkup(records) {
  const draft=collectionDraft();
  if(draft.historyDay)records=collectionHistoryCache.get(activeWorkspace) || [];
  return `<section class="panel collection-history"><div class="toolbar"><h2>采集指令与返回 <span class="helper">· ${records.length} 份</span></h2><label>按生成日期查找<input id="collection-history-day" type="date" value="${esc(draft.historyDay || '')}"></label><button class="button small" id="collection-history-reset">最近60份</button></div><p class="helper">重复制保留原编号与正文，不重新调配方向。生成不等于执行；报告返回不等于知识入库。旧指令标注历史版本，按当前规则生成会分配新编号，原记录保留。</p><div class="collection-history-list">${records.map(record=>`<article><div><strong>${esc(record.id)} · ${record.target==='mac'?'MAC':'Windows'} · ${esc(record.focus)}</strong><p class="helper">${appearedAt(record.created_at)} · ${esc(record.angle)}</p><span class="collection-version${record.legacy?' legacy':''}">${record.legacy?'历史规则 · 可能含旧维护者称谓':'当前规则 '+esc(record.rule_version)}</span>${record.topic?`<p class="helper">专题：${esc(record.topic)}</p>`:''}<p class="helper">${record.returns?.length?'已有明确编号的报告回传':'尚无可归属回报，未据此判断 Agent 是否执行'}${record.returns?.map(item=>item.task_id?` <button class="button small" data-task="${esc(item.task_id)}">${esc(item.task_id)} · ${esc(labels.statuses[item.status])}${!item.available?' · 原件暂不可读':''}</button>`:' · 已登记原件').join('') || ''}</p></div><div class="collection-record-actions">${[['copy',record.legacy?'复制历史原文':'重新复制'],['preview','查看'],['download','下载']].map(([action,label])=>`<button class="button small" data-collection-record="${esc(record.id)}" data-action="${action}" aria-label="${label}指令 ${esc(record.id)}">${label}</button>`).join('')}${record.legacy?`<button class="button small" data-collection-upgrade="${esc(record.id)}">按当前规则生成</button>`:''}</div></article>`).join('') || '<p class="helper">当前日期没有生成记录，可查看最近指令；每天生成次数不限。</p>'}</div></section>`;
}
