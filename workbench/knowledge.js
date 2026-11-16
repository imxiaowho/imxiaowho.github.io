"use strict";

let knowledgePage=1, knowledgeQuery='', knowledgeType='all', knowledgeRequest=0;

async function renderKnowledge() {
  const workspace=activeWorkspace, request=++knowledgeRequest;
  $('#workspace').innerHTML='<div class="panel"><h2>知识维护</h2><p class="helper">正在读取本线知识目录…</p></div>';
  const params=new URLSearchParams({q:knowledgeQuery,page:String(knowledgePage),category:knowledgeType});
  try {
    const result=await api('/knowledge-maintenance?'+params);
    if(workspace!==activeWorkspace || view!=='knowledge' || request!==knowledgeRequest)return;
    const categories={all:'全部页面',...(result.labels || {})};
    $('#workspace').innerHTML=`<section class="panel knowledge-controls"><div class="toolbar"><h2>本线知识目录</h2><button class="button small" id="knowledge-refresh">更新目录与结构检查</button></div><p class="helper">${esc(result.message)} · ${esc(result.generated_at || '尚未生成')}</p><div class="form-row"><label>搜索页面<input id="knowledge-search" type="search" maxlength="200" value="${esc(knowledgeQuery)}" placeholder="标题或相对路径"></label><label>页面类型<select id="knowledge-type">${options(categories,knowledgeType)}</select></label></div><p class="helper">正式知识、原件、历史和台账分别登记；页面类型不代表事实有效性。</p></section>
    <section class="panel"><h2>只读知识库查询</h2><p class="helper">复制给你正在使用的 Agent；本页不会启动工具或修改知识库。</p><label>本次问题<textarea id="knowledge-question" maxlength="2000" rows="3" placeholder="例如：根据本线知识库，说明某项结论的依据、适用条件与未决问题"></textarea></label><div class="source-event-actions"><button class="button primary small" id="knowledge-query-copy">复制查询提示词</button><button class="button small" id="knowledge-query-preview">预览提示词</button></div></section>
    <section class="panel"><h2>目录结果 · ${result.total || 0} 项</h2>${(result.pages || []).map(p=>`<article class="knowledge-page"><strong>${esc(p.title)}</strong><span class="tag">${esc(categories[p.page_type])}</span><p class="helper">${esc(p.path)}</p><p>${esc(p.declared_status)}</p><details><summary>依据线索与适用范围</summary><p>${esc(p.scope)} · 正文记录日期：${esc(p.declared_date || '未提取')} · 核验日期：${esc(p.verified_at || '本轮未核验')}</p><p>${esc(p.unresolved)}</p>${p.source_refs.map(ref=>`<p class="helper">${esc(ref)}</p>`).join('')}</details></article>`).join('') || '<p class="helper">没有匹配页面；不代表知识缺失。</p>'}<div class="history-pagination"><button class="button small" id="knowledge-prev"${knowledgePage<=1?' disabled':''}>上一页</button><span>第 ${knowledgePage} 页 · 每页30项</span><button class="button small" id="knowledge-next"${knowledgePage*30 >= (result.total || 0)?' disabled':''}>下一页</button></div></section>
    <section class="panel"><h2>最近知识处理卡</h2><p class="helper">保留实际卡号、结论和资料入口；卡片状态不代表知识已写入。完整变化按维护者实际回报核对。</p>${state.tasks.filter(t=>t.kind==='research' && t.owner==='pi').slice(0,10).map(t=>`<p><button class="button small" data-knowledge-task="${esc(t.id)}">${esc(t.id)} · ${esc(t.title)}</button><br>${esc(labels.statuses[t.status])} · ${esc(t.summary || '尚未记录闭环结论，打开卡片核对原件与实际回报。')}</p>`).join('') || '<p class="helper">当前没有可显示的知识处理卡。</p>'}</section>
    <section class="panel"><h2>已记录的机械检查</h2><p class="helper">${esc(result.checks?.scope || '尚未记录')} · ${esc(result.checks?.observed_at || '')}。结果为该时点记录，目录更新不会重新运行完整检查器。</p>${(result.checks?.checks || []).map(c=>`<p><strong>${esc(c.check)}</strong> · ${c.passed?'该项通过':'该项需处理'}<br>${esc((c.detail || []).join('；') || c.error_type || '')}</p>`).join('')}</section>
    <section class="panel"><h2>结构待核事项 · ${result.issue_total || 0} 项</h2><p class="helper">此处是目录扫描线索，未运行完整检查器或事实审计。优先复用原检查与豁免；不自动删页、合并或补造出处。最多展示100条。</p>${(result.issues || []).map(i=>`<p><strong>${esc(i.path)}</strong><br>${esc(i.message)} · ${esc(i.severity==='error'?'读取异常':'需复核')}</p>`).join('') || '<p class="helper">本次结构扫描未提取到待核线索；这不是知识库事实全通过。</p>'}</section>`;
    $$('[data-knowledge-task]').forEach(button=>button.onclick=()=>openTask(button.dataset.knowledgeTask));
    $('#knowledge-search').onchange=()=>{knowledgeQuery=$('#knowledge-search').value;knowledgePage=1;renderKnowledge();};
    $('#knowledge-type').onchange=()=>{knowledgeType=$('#knowledge-type').value;knowledgePage=1;renderKnowledge();};
    $('#knowledge-prev').onclick=()=>{knowledgePage--;renderKnowledge();};
    $('#knowledge-next').onclick=()=>{knowledgePage++;renderKnowledge();};
    $('#knowledge-refresh').onclick=event=>run(async()=>{await api('/knowledge-maintenance/refresh',{});await renderKnowledge();toast('本线目录已更新，事实核验仍以原件和既有检查为准');},event.currentTarget);
    const prepare=async()=>api('/knowledge-maintenance/query-prompt?'+new URLSearchParams({question:$('#knowledge-question').value}));
    $('#knowledge-query-copy').onclick=event=>run(async()=>{const out=await prepare();try{await writeClipboard(out.text);toast('只读查询提示词已复制');}catch{prepareText(out.filename,out.text,'剪贴板不可用，可预览后手动复制。');}},event.currentTarget);
    $('#knowledge-query-preview').onclick=event=>run(async()=>{const out=await prepare();showText(out.filename,out.text,'只准备查询说明，不启动 Agent。');},event.currentTarget);
  } catch(error) {
    if(workspace===activeWorkspace && view==='knowledge' && request===knowledgeRequest)$('#workspace').innerHTML=`<div class="panel"><h2>知识目录暂不可读</h2><p>${esc(error.message)}</p><p class="helper">请保留原件与现行规则，不依据目录异常改变卡片状态。</p></div>`;
  }
}
