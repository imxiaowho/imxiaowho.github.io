'use strict';
(() => {
  history.scrollRestoration='manual';
  const $=id=>document.getElementById(id),data=window.VBC_DATA;
  if(!data){$('results').textContent='本地索引未加载，请重建索引后刷新。';window.VBCUI?.ready();return;}
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const records=new Map(data.records.map(r=>[r.id,r])),terms=data.records.filter(r=>r.kind==='term'),elements=data.records.filter(r=>r.kind==='element'),recipes=data.records.filter(r=>r.kind==='recipe'),sources=data.records.filter(r=>r.kind==='source');
  const subjects=new Map(data.subjects.map(s=>[s.id,s.label])),covers=window.VBC_COVERS||{};
  const siteTerms = terms.filter(r => r.homepage_effect);
  const modes={elements:{label:'示例',items:elements},terms:{label:'词条',items:terms},recipes:{label:'组合',items:recipes},sources:{label:'信源',items:sources}};
  const disposition={'new-study':'新增实践 · 待审阅','existing-concept':'关联已有词条','related-concept':'相关机制','reference-pending':'待实践','scope-excluded':'超出网页范围'};
  const bookmark='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h12v17l-6-4-6 4z"/></svg>';
  const summaries={'motion-0007':'鼠标附近的点阵轻轻散开，再逐渐回弹。','motion-0001':'一组元素依次错开出现。','visual-0008':'比较文字与背景的亮度差异。','visual-0005':'比较同一图像的不同宽高比例。'};
  const order=['motion-0007','motion-0001','visual-0008','visual-0005','component-0004','layout-0001','component-0003','motion-0004'];
  elements.sort((a,b)=>(order.includes(a.id)?order.indexOf(a.id):99)-(order.includes(b.id)?order.indexOf(b.id):99));
  modes.elements.items = [...elements, ...siteTerms];
  const linked=r=>r.kind==='element'?[r]:(r.element_ids||[]).map(id=>records.get(id)).filter(Boolean);
  const headword=e=>{const related=terms.filter(t=>t.element_ids.includes(e.id)),preferred={'motion-0001':'term-0018','visual-0008':'term-0026'};return (query().length?related.find(t=>query().every(word=>searchable(t).includes(word))):null)||related.find(t=>t.id===preferred[e.id])||related[0];};
  const accepted=e=>e.status==='verified'&&e.review?.author_status==='accepted';
  const list=items=>'<ul>'+(items||[]).map(item=>'<li>'+esc(item)+'</li>').join('')+'</ul>';
  let detailReflow = null, example = null, returnFocus = null;
  const practices = document.querySelector('.site-practices');
  const approved = $('approved');
  const random = $('random');
  let mode='elements',domain='',page=0,favorites=false,detailId='',homeScroll=0,sourcePage=0,statusTimer,resizeTimer;
  let saved=new Set(),storage=true;
  try{const value=JSON.parse(localStorage.getItem('vbc.sample-saves.v1')||'[]');if(Array.isArray(value))saved=new Set(value.filter(id=>records.get(id)?.kind==='element'));}catch{storage=false;}
  const query=()=>$('search').value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const inventoryFor=id=>(data.source_inventories||[]).find(i=>i.source_id===id);
  const searchable=r=>{const related=r.kind==='element'?terms.filter(t=>t.element_ids.includes(r.id)):[];const inventory=r.kind==='source'?inventoryFor(r.id)?.entries||[]:[];return [r.id,r.title.zh,r.title.en,r.plain_explanation,r.intent,...r.tags||[],...r.aliases||[],...related.flatMap(t=>[t.title.zh,t.title.en,...t.aliases]),...inventory.flatMap(i=>[i.slug,i.title.zh,i.title.en])].join(' ').toLocaleLowerCase();};
  function matches(r,ignoreDomain=false){return (ignoreDomain||!domain||r.domain===domain||r.kind==='recipe'&&linked(r).some(e=>e.domain===domain)||r.kind==='source')&&(!$('approved').checked||r.kind==='source'||linked(r).some(accepted))&&(!favorites||r.kind==='source'||linked(r).some(e=>saved.has(e.id)))&&query().every(word=>searchable(r).includes(word));}
  function pageSize(kind=mode){const w=innerWidth,h=innerHeight;if(kind==='elements')return w<=360&&h<720?3:4;return Math.max(2,Math.min(10,Math.floor((2*h-(w<=600?510:390))/(w<=600?92:85))));}
  function notify(text){clearTimeout(statusTimer);$('app-status').textContent=text;statusTimer=setTimeout(()=>$('app-status').textContent='',4000);}
  function updateSaved(){ $('saved-count').textContent=saved.size;$('favorites-toggle').setAttribute('aria-pressed',String(favorites));document.querySelectorAll('[data-save]').forEach(b=>{const active=saved.has(b.dataset.save);b.setAttribute('aria-pressed',String(active));b.setAttribute('aria-label',(active?'取消收藏':'收藏')+'「'+records.get(b.dataset.save).title.zh+'」');}); }
  function save(id){saved.has(id)?saved.delete(id):saved.add(id);try{localStorage.setItem('vbc.sample-saves.v1',JSON.stringify([...saved]));storage=true;}catch{storage=false;}updateSaved();notify(saved.has(id)?storage?'已收藏到当前浏览器。':'已临时收藏，浏览器未允许持久保存。':'已取消收藏。');if(!detailId&&favorites)renderHome();}
  function tabs(container,values,active,onChange){container.innerHTML=values.map(v=>'<button type="button" role="tab" id="'+container.id+'-'+v.id+'" aria-controls="'+(container.id==='content-tabs'?'results':'panel-'+v.id)+'" aria-selected="'+(v.id===active)+'" tabindex="'+(v.id===active?0:-1)+'" data-tab="'+v.id+'">'+esc(v.label)+(v.count!==undefined?'<span>'+v.count+'</span>':'')+'</button>').join('');const buttons=[...container.querySelectorAll('[data-tab]')];buttons.forEach((b,i)=>{b.addEventListener('click',()=>onChange(b.dataset.tab));b.addEventListener('keydown',event=>{let next=i;if(event.key==='ArrowRight')next=(i+1)%buttons.length;else if(event.key==='ArrowLeft')next=(i+buttons.length-1)%buttons.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=buttons.length-1;else return;event.preventDefault();onChange(buttons[next].dataset.tab);container.querySelector('[aria-selected=true]')?.focus();});});}
  function pager(container,total,size,current,change){const pages=Math.max(1,Math.ceil(total/size)),start=total?current*size+1:0,end=Math.min((current+1)*size,total);container.innerHTML='<span>显示 '+start+'–'+end+' / '+total+'</span><div class="page-buttons"><button type="button" data-page="prev" '+(current===0?'disabled':'')+'>上一页</button><span class="page-position">'+(current+1)+' / '+pages+'</span><button type="button" data-page="next" '+(current>=pages-1?'disabled':'')+'>下一页</button></div>';container.querySelector('[data-page=prev]').addEventListener('click',()=>change(current-1));container.querySelector('[data-page=next]').addEventListener('click',()=>change(current+1));}
  function empty() {
    const suggest = query().length && !favorites && !approved.checked;
    const other = Object.entries(modes).filter(([id]) => id !== mode);
    const links = suggest ? other.map(([id, entry]) => {
      const count = entry.items.filter(r => matches(r, true)).length;
      return count ? '<button type="button" data-mode="'+id+'">在'+entry.label+'中找到 '+count+' 项</button>' : '';
    }).join('') : '';
    const title = approved.checked ? '暂无已批准版本' : favorites ? '当前筛选中没有收藏' : '没有匹配结果';
    const hint = approved.checked ? '取消「已批准」可浏览候选示例。' : '试试中文名、英文名或别名。';
    return '<div class="empty"><h3>'+title+'</h3>'+(links ? '<div class="match-links">'+links+'</div>' : '<p>'+hint+'</p>')+'<button type="button" data-reset>重置筛选</button></div>';
  }
  function selectMode(id) {
    mode = id;
    domain = '';
    page = 0;
    navigate('home?mode='+id);
  }
  function indexRow(r) {
    const stock = inventoryFor(r.id);
    const subtitle = r.title.en && r.title.en !== r.title.zh ? r.title.en : r.kind === 'source' ? r.author || '' : '';
    const category = r.homepage_effect ? '主页实例' : r.kind === 'recipe' ? '完整组合' : r.kind === 'source' ? stock ? stock.entries.length+' 条参考' : '来源记录' : subjects.get(r.domain);
    const action = r.homepage_effect ? '体验示例' : r.kind === 'source' ? '查看来源' : '查看详情';
    return '<button type="button" class="index-row" data-detail="'+r.id+'"><span class="index-label"><strong>'+esc(r.title.zh)+'</strong>'+(subtitle?'<small>'+esc(subtitle)+'</small>':'')+'</span><span>'+esc(category)+'</span><span class="row-action">'+action+'</span></button>';
  }
  function renderSubjects(){const labels=[{id:'',label:'全部主题'},...data.subjects];$('subjects').innerHTML=labels.map(s=>'<button type="button" data-domain="'+s.id+'" aria-pressed="'+(domain===s.id)+'" '+(mode==='sources'?'disabled':'')+'>'+esc(s.label)+'<span>'+modes[mode].items.filter(r=>matches(r,true)&&(!s.id||r.domain===s.id||r.kind==='recipe'&&linked(r).some(e=>e.domain===s.id))).length+'</span></button>').join('');$('domain-select').innerHTML=labels.map(s=>'<option value="'+s.id+'" '+(s.id===domain?'selected':'')+'>'+esc(s.label)+'</option>').join('');$('domain-select').disabled=mode==='sources';$('subjects').querySelectorAll('[data-domain]').forEach(b=>b.addEventListener('click',()=>{domain=b.dataset.domain;page=0;renderHome();$('subjects').querySelector('[data-domain="'+domain+'"]')?.focus();}));}
  function renderHome(){
    const restoreTabFocus=$('content-tabs').contains(document.activeElement);
    window.VBCBuddy?.unmount();window.VBCUI?.unmount();
    const all=modes[mode].items.filter(r=>matches(r)),size=pageSize();page=Math.min(page,Math.max(0,Math.ceil(all.length/size)-1));const shown=all.slice(page*size,(page+1)*size);
    $('results').setAttribute('role','tabpanel');$('results').setAttribute('aria-labelledby','content-tabs-'+mode);$('home').querySelector('.subject-rail').hidden=mode==='sources';$('home').querySelector('.home-layout').classList.toggle('source-mode',mode==='sources');
    $('inventory').textContent=terms.length+' 词条 · '+elements.length+' 个独立元素 · '+siteTerms.length+' 个主页实例 · '+recipes.length+' 组合';
    tabs($('content-tabs'),['terms','elements','recipes','sources'].map(id=>[id,modes[id]]).map(([id,v])=>({id,label:v.label,count:v.items.length})),mode,selectMode);
    $('results-title').textContent=(favorites&&mode!=='sources'?'收藏的':'')+modes[mode].label;$('result-count').textContent=all.length+' 项结果';approved.closest('label').hidden = mode === 'sources' || !elements.some(accepted);
    random.disabled = !all.length || mode === 'sources';
    $('clear-search').hidden = !$('search').value;
    practices.hidden = mode !== 'elements' || Boolean(query().length || domain || favorites || approved.checked || page);
    $('more-tools').hidden = random.disabled && approved.closest('label').hidden;
    if(mode==='elements'){$('results').innerHTML=shown.length?'<div class="element-grid">'+shown.map((e,i)=>{
      if (e.homepage_effect) return indexRow(e);
      const t=headword(e),cover=covers[e.id],featured=i===0&&!page&&!query().length&&!domain&&!favorites;
      const art='<div class="pattern" data-effect="'+esc(cover?.effect||'static')+'" aria-hidden="true">'+(cover?.effect==='paper'?cover.html:'<div class="mini-stage">'+(cover?.html||'<div class="mini-type">Aa</div>')+'</div>')+'</div>';
      const title='<h3>'+esc(t.title.zh)+'<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m8 5 5 5-5 5"/></svg></h3>';
      const open='<button class="element-open" type="button" data-detail="'+t.id+'" aria-label="查看'+esc(t.title.zh)+'">';
      return '<article class="element-card'+(featured?' featured-element':'')+'" data-element="'+e.id+'">'+(featured?'<div class="featured-heading">'+open+title+'</button><p>'+esc(summaries[e.id]||t.plain_explanation)+'</p>'+(cover?.effect==='paper'?'<button class="paper-preview-toggle quiet" type="button" aria-pressed="false">减少动态</button>':'')+'</div>'+art:open+art+'<div class="element-text">'+title+'<p>'+esc(summaries[e.id]||t.plain_explanation)+'</p><small>'+esc(subjects.get(e.domain))+'</small></div></button>')+'<button class="save-element" type="button" data-save="'+e.id+'">'+bookmark+'</button></article>';
    }).join('')+'</div>':empty();}
    else { $('results').innerHTML = shown.length ? '<div class="index-list">'+shown.map(indexRow).join('')+'</div>' : empty(); }
    if(restoreTabFocus)$('content-tabs').querySelector('[aria-selected=true]')?.focus({preventScroll:true});
    pager($('pagination'),all.length,size,page,next=>{page=next;renderHome();$('results-title').focus({preventScroll:true});scrollTo(0,0);});renderSubjects();window.VBCUI?.mount($('results'));window.VBCBuddy?.mount($('results'));wireDetails($('results'));$('results').querySelectorAll('[data-save]').forEach(b=>b.addEventListener('click',()=>save(b.dataset.save)));$('results').querySelector('[data-reset]')?.addEventListener('click',reset);
    $('results').querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => {
      selectMode(button.dataset.mode);
      requestAnimationFrame(() => $('results-title').focus());
    }));
    updateSaved();
  }
  function navigate(hash){if(location.hash==='#'+hash)route();else location.hash=hash;}
  function openDetail(id, trigger) {
    if (detailId) {
      history.replaceState(null,'','#'+id);
      route();
    } else {
      homeScroll = scrollY;
      returnFocus = trigger || null;
      navigate(id);
    }
  }
  function wireDetails(container) {
    container.querySelectorAll('[data-detail]').forEach(button => {
      if (button.dataset.bound) return;
      button.dataset.bound = 'true';
      button.addEventListener('click', event => {
        if (button.matches('a')) {
          if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
        }
        openDetail(button.dataset.detail, button);
      });
    });
  }
  function reset() {
    domain = '';
    page = 0;
    favorites = false;
    $('search').value = '';
    approved.checked = false;
    renderHome();
    $('search').focus();
  }
  function returnHome(){navigate('home?mode='+mode);}
  function promptFor(record, e, usage, limits) {
    const url = 'https://imxiaowho.org/catalog/#' + record.id;
    const notes = [url, '请参考「'+record.title.zh+'」。', record.prompt || e?.integration_prompt, ...usage, ...limits.map(limit => '使用限制：'+limit)].filter(Boolean);
    if (record.homepage_effect) {
      notes.push('主页实例：'+window.VBCHomeExamples.original(record.id, true));
    }
    if (e) {
      notes.push('实例：'+e.preview_path, '运行文件：'+e.code_paths.join('、'), '接入、许可与来源附件：'+e.support_paths.join('、'), '版本：'+e.code_sha256, '保留相关资产来源、字体 OFL 许可、键盘、响应式和减少动态行为。', accepted(e)?'此版本已批准。':'此版本待审阅。');
    }
    return notes.join('\n');
  }
  async function copy(text){try{await navigator.clipboard.writeText(text);notify('接入说明已复制。');}catch{notify('无法自动复制，请手动复制文本。');let box=$('copy-fallback');if(!box){box=document.createElement('textarea');box.id='copy-fallback';box.className='copy-fallback';box.setAttribute('aria-label','手动复制接入说明');$('reader').append(box);}box.value=text;box.focus();box.select();}}
  function heading(record,e,description){return '<header class="detail-heading"><div><div class="detail-title-line"><h1>'+esc(record.title.zh)+'</h1>'+(record.title.en&&record.title.en!==record.title.zh?'<p class="english">'+esc(record.title.en)+'</p>':'')+'</div><p class="detail-description">'+esc(description)+'</p><p class="detail-tags"><span>'+esc(subjects.get(record.domain)||(record.kind==='recipe'?'组合方案':'来源记录'))+'</span><span class="review-label">'+(record.homepage_effect?'主页实例 · 可体验':record.kind==='source'?'来源已登记':e?.preview_path?'可体验示例':'定义与参考资料')+'</span></p></div><div class="detail-actions">'+(e?.kind==='element'?'<button type="button" data-save="'+e.id+'" class="quiet">'+bookmark+'收藏</button>':'')+(record.kind!=='source'?'<button class="primary" type="button" id="copy-main">复制接入说明</button>':'<a class="source-original" href="'+esc(record.url)+'" target="_blank" rel="noopener noreferrer">打开原始来源</a>')+'</div></header>';}
  function showCandidate(record) {
    detailReflow = null;
    const term = record.kind === 'term' ? record : record.kind === 'element' ? headword(record) : null;
    const e = ['recipe', 'element'].includes(record.kind) ? record : linked(record)[0];
    const r = term || record;
    const ids = [...new Set([...(r.source_ids || []), ...(e?.source_ids || []), ...(record.kind === 'recipe' ? linked(record).flatMap(item => item.source_ids || []) : [])])];
    const related = [...new Set([...(r.related_ids || []), ...(e ? terms.filter(t => t.element_ids.includes(e.id)).map(t => t.id) : []), ...recipes.filter(item => item.element_ids.some(id => (e?.kind === 'element' ? [e.id] : e?.element_ids || []).includes(id))).map(item => item.id), ...(record.kind === 'recipe' ? linked(record).map(headword).filter(Boolean).map(t => t.id) : [])])].filter(id => id !== r.id).map(id => records.get(id)).filter(Boolean);
    const usage = r.use_when || e?.use_when || r.integration_steps || [];
    const limits = r.avoid_when || e?.avoid_when || [];
    const inline = r.homepage_effect;
    const hasPreview = inline || e?.preview_path;
    const hints = {
      'term-0041': '先看占位块的形状，再点「完成加载」对照真实布局。',
      'term-0042': '试试「查看全部作品」，观察从空结果回到有内容的列表。',
      'term-0053': '<span class="fine-paper-instruction">把鼠标移过点阵，观察它怎样回弹。</span><span class="static-paper-instruction">点阵在触屏和减少动态设置下保持静止。</span>'
    };
    const variant = {'term-0041': '&state=skeleton', 'term-0042': '&state=empty'}[r.id] || '';
    const tips = [...new Set((e?.parameters || []).map(p => p.description?.trim()).filter(Boolean))];
    const firstTip = hints[r.id] || esc(tips[0] || '试试下方控件，比较示例的不同状态。');
    const original = inline ? esc(window.VBCHomeExamples.original(r.id)) : '';
    const runtime = e ? '<details class="file-list"><summary>运行文件 '+e.code_paths.length+' 项和接入附件 '+e.support_paths.length+' 项</summary><h3>运行文件</h3>'+list(e.code_paths)+'<h3>接入与许可附件</h3>'+list(e.support_paths)+'</details>' : '';
    const relatedLinks = related.length ? '<h2 class="guide-section">相关内容</h2><div class="inline-links">'+related.map(item=>'<button type="button" data-detail="'+item.id+'">'+esc(item.title.zh)+'</button>').join('')+'</div>' : '';
    const preview = inline
      ? window.VBCHomeExamples.sample(r.id,esc(r.first_action))
      : e?.preview_path ? '<p class="preview-instructions">'+firstTip+'</p><iframe src="../'+esc(e.preview_path)+'?v='+esc(e.code_sha256.slice(0,12))+'&view=compact'+variant+'" title="'+esc(r.title.zh)+'可操作示例" sandbox="allow-scripts"></iframe>' : '';
    const provenance = inline ? '与主页使用同一套交互。' : record.kind === 'recipe' ? '此组合由本库编排，机制依据见所引用的元素。' : '以下来源用于核对词义与实现机制。示例由本库独立编写。';
    const title = hasPreview ? '用法与接入' : '定义与用法';
    $('reader').innerHTML = heading(r,e,r.plain_explanation || r.intent || '') +
      '<div class="detail-tabs"><div class="tabs" id="detail-tabs" role="tablist" aria-label="详情内容"></div></div>' +
      (hasPreview ? `<section id="panel-preview" role="tabpanel" aria-labelledby="detail-tabs-preview"><div class="preview-layout">
        <div class="live-stage">${preview}<div class="preview-meta"><span>${inline?'小谁主页 · 原创实例':e.code_paths.some(path=>/\.jpg$/.test(path))?'独立练习 · AI 生成影像':'独立练习 · 演示数据'}</span>
        ${inline?'<a href="'+original+'">在主页查看 ↗</a>':''}</div></div>
        <aside class="quick-reference"><section><h2>适用场景</h2>${list(usage)}</section>
        ${inline?'<section><h2>其他操作方式</h2><p class="usage-tip">'+esc(r.fallback)+'</p></section>':''}</aside>
      </div></section>` : '') +
      `<section id="panel-guide" role="tabpanel" aria-labelledby="detail-tabs-guide" ${hasPreview?'hidden':''}><div class="guide-grid">
        <section><h2>${hasPreview?'实现原理':'定义'}</h2><p>${esc(r.mechanism||r.composition_constraints?.join(' ')||e?.implementation_provenance)}</p>
          <h2 class="guide-section">适合使用</h2>${list(usage)}
          ${limits.length?'<h2 class="guide-section">使用限制</h2>'+list(limits):''}
          ${r.good_example?'<details><summary>用法示例</summary><p>'+esc(r.good_example)+'</p><p>'+esc(r.poor_example)+'</p></details>':''}
        </section><section><h2>接入要求</h2><p class="prompt">${esc(r.prompt||e?.integration_prompt||r.integration_steps?.join('。'))}</p>
          ${runtime}${relatedLinks}
        </section></div>
      </section>
      <section id="panel-sources" role="tabpanel" aria-labelledby="detail-tabs-sources" hidden><div class="source-panel">
        <h2>来源与机制依据</h2><ul class="source-list" id="source-citations"></ul><nav id="citation-pagination" class="pagination" aria-label="依据来源分页"></nav>
        <p class="source-note">${provenance}</p>${original?'<a href="'+original+'">打开主页原例 ↗</a>':''}
        ${e?'<div class="detail-status"><h2>当前版本记录</h2><p><code>'+esc(e.code_sha256)+'</code></p><p>'+(accepted(e)?'作者已批准此版本。':'候选版本 · 待作者逐项审阅')+'</p><p>'+(e.review?.checks?.length?'当前版本含本地检查记录。':'公开索引未附当前版本的检查记录。')+'</p><button type="button" id="copy-review">复制审阅指令</button></div>':''}
      </div></section>`;
    const panels = [{id:'guide',label:title},{id:'sources',label:'来源与版本'}];
    if (hasPreview) panels.unshift({id:'preview',label:'示例'});
    tabs($('detail-tabs'),panels,panels[0].id,setPanel);
    if (inline) example = window.VBCEffects.mount($('reader'));

    let citationPage = 0;
    const citations = ids.map(id => records.get(id)).filter(Boolean);
    function renderCitations() {
      const size = innerWidth <= 360 ? 2 : innerWidth <= 600 ? 3 : 6;
      citationPage = Math.min(citationPage, Math.max(0,Math.ceil(citations.length/size)-1));
      $('source-citations').innerHTML = citations.slice(citationPage*size,(citationPage+1)*size).map(s=>'<li><div><button type="button" data-detail="'+s.id+'">'+esc(s.title.zh)+'</button><small>'+esc(s.id)+'</small></div><a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">原始来源</a></li>').join('');
      $('citation-pagination').hidden = citations.length <= size;
      if (citations.length > size) pager($('citation-pagination'),citations.length,size,citationPage,next=>{citationPage=next;renderCitations();scrollTo(0,0);});
      wireDetails($('source-citations'));
    }
    detailReflow = renderCitations;
    renderCitations();
    $('copy-main').addEventListener('click',()=>copy(promptFor(r,e,usage,limits)));
    $('reader').querySelector('[data-save]')?.addEventListener('click',()=>save(e.id));
    $('copy-review')?.addEventListener('click',()=>copy('我对 '+e.id+'「'+e.title.zh+'」（版本 '+e.code_sha256+'）的决定：[收录 / 修改 / 放弃 / 稍后]。\n备注：'));
    const pool = inline ? siteTerms : record.kind === 'recipe' ? recipes : elements;
    const at = pool.findIndex(item => item.id === (inline ? r.id : e?.id));
    if (at >= 0 && pool.length > 1) {
      const near = [...new Set([pool[(at-1+pool.length)%pool.length],pool[(at+1)%pool.length]])].map(item => item.kind === 'element' ? headword(item) : item).filter(Boolean);
      $('reader').insertAdjacentHTML('beforeend','<nav class="sample-pagination" aria-label="同级内容">'+near.map((item,i)=>'<button type="button" data-detail="'+item.id+'">'+(near.length===1?'另一项':i?'下一项':'上一项')+'<strong>'+esc(item.title.zh)+'</strong></button>').join('')+'</nav>');
    }
    wireDetails($('reader'));
    updateSaved();
  }
  function setPanel(name) {
    $('detail-tabs').querySelectorAll('[data-tab]').forEach(button => {
      const active = button.dataset.tab === name;
      button.setAttribute('aria-selected',String(active));
      button.tabIndex = active ? 0 : -1;
    });
    for (const panel of $('reader').querySelectorAll('[role=tabpanel]')) panel.hidden = panel.id !== 'panel-'+name;
    $('reader').querySelector('iframe')?.contentWindow.postMessage({type:'vbc-preview-visibility',visible:name==='preview'},'*');
    if (name === 'preview') example?.position();
    else example?.reset();
    scrollTo(0,0);
  }
  function sourceAvailability(source){
    if(source.status==='pending-source')return source.id==='src-0001'?'原文正文尚未获取；镜像文字与原文媒体的一致性待核实。':'官方身份、内容或可用入口待核实，暂缓实际采用。';
    const availability=source.availability||'';
    if(availability==='primary-text-read')return '已读取官方技术文档；此记录提供机制依据。';
    if(availability.startsWith('mirror-text-read'))return '已读取镜像文字；原始媒体与视觉效果尚未核实。';
    if(availability.startsWith('directory-and-selected-text-read'))return '已登记目录并读取部分文字；原站视觉检查尚未完成。';
    if(availability==='local-homepage-implementation')return '这些词条记录了小谁主页正在使用的交互。可打开词条体验，或去主页查看原例。';
    if(availability==='local-original-code-read')return '已读取本库原创实现；实际检查与逐项审阅另行记录。';
    if(availability.startsWith('Article body'))return '已读取文章正文与编号名称；配图内容尚未检查。';
    if(availability.startsWith('official text inspected'))return '已读取官方文字；尚未完成实际界面集成检查。';
    return '来源已登记，获取范围见下方记录；不代表复用批准。';
  }
  function sourceRelated(source) {
    const items = (source.related_ids || []).map(id => records.get(id)).filter(r => r?.homepage_effect);
    return items.length ? '<h2 class="guide-section">主页实例</h2><div class="inline-links">'+items.map(r => '<button type="button" data-detail="'+r.id+'">'+esc(r.title.zh)+'</button>').join('')+'</div>' : '';
  }
  function showSource(source){detailReflow=null;const inventory=inventoryFor(source.id);sourcePage=0;$('reader').innerHTML=heading(source,null,inventory?'此来源的目录已登记，可查看逐条处理进度与已关联的词条。':'保留原始出处与获取记录；登记不等于复用批准。')+'<div class="source-panel"><dl class="source-facts"><div><dt>来源作者</dt><dd>'+esc(source.author||'来源记录中未注明')+'</dd></div><div><dt>获取日期</dt><dd>'+esc(source.acquired_on?source.acquired_on.slice(0,10):'尚未获取')+(!source.acquired_on&&source.received_on?'<small>投稿：'+esc(source.received_on.slice(0,10))+'</small>':'')+'</dd></div><div><dt>复用许可</dt><dd>'+esc(typeof source.license==='string'?source.license:source.license?.name||'需按原始来源核对')+'</dd></div></dl>'+(inventory?'<h2>参考目录</h2><div class="source-tools"><label class="sr-only" for="reference-search">搜索来源目录</label><input id="reference-search" type="search" placeholder="搜索参考名称或编号"><label class="sr-only" for="reference-status">处理状态</label><select id="reference-status"><option value="">全部状态</option>'+Object.entries(disposition).map(([id,label])=>'<option value="'+id+'">'+label+'</option>').join('')+'</select></div><div id="reference-results"></div><nav id="reference-pagination" class="pagination" aria-label="参考目录分页"></nav>':'<h2>当前记录</h2><p>'+esc(sourceAvailability(source))+'</p><details><summary>获取记录与复用说明</summary><p>'+esc(source.reuse_note||source.availability||'请以原始出处和实际获取记录为准。')+'</p></details>')+sourceRelated(source)+(inventory?'<p class="source-note">目录数量、实现情况和逐项审阅分别记录。</p>':'')+'</div>';wireDetails($('reader'));if(inventory){const render=()=>{const search=$('reference-search').value.trim().toLocaleLowerCase(),state=$('reference-status').value,all=inventory.entries.filter(r=>(!state||r.disposition===state)&&[r.slug,r.title.zh,r.title.en,...r.term_ids].join(' ').toLocaleLowerCase().includes(search)),size=Math.max(2,Math.min(8,Math.floor((2*innerHeight-(innerWidth<=360?850:700))/(innerWidth<=600?125:95))));sourcePage=Math.min(sourcePage,Math.max(0,Math.ceil(all.length/size)-1));$('reference-results').innerHTML=all.slice(sourcePage*size,(sourcePage+1)*size).map(r=>'<div class="reference-row"><div><strong>'+esc(r.title.zh)+'</strong><small>'+(r.title.en?esc(r.title.en)+' · ':'')+esc(disposition[r.disposition])+'</small></div><div class="reference-actions">'+r.term_ids.map(id=>'<button type="button" data-detail="'+id+'">'+esc(records.get(id).title.zh)+'</button>').join('')+'<a href="'+esc(r.url)+'" target="_blank" rel="noopener noreferrer">原始来源</a></div></div>').join('')||'<div class="empty">没有匹配的参考，请清空关键词或切换状态。</div>';pager($('reference-pagination'),all.length,size,sourcePage,next=>{sourcePage=next;render();scrollTo(0,0);});wireDetails($('reference-results'));};detailReflow=render;for(const id of ['reference-search','reference-status'])$(id).addEventListener(id==='reference-search'?'input':'change',()=>{sourcePage=0;render();});render();}}
  function route() {
    window.VBCUI?.unmount();
    window.VBCBuddy?.unmount();
    example?.destroy();
    example = null;
    dispatchEvent(new Event('vbc-view-change'));
    const [raw,params=''] = location.hash.slice(1).split('?');
    const record = records.get(raw);
    const isDetail = record && ['term','element','recipe','source'].includes(record.kind);
    document.body.classList.toggle('is-detail',Boolean(isDetail));
    if (isDetail) {
      detailId = record.id;
      $('home').hidden = true;
      $('detail').hidden = false;
      $('breadcrumb-title').textContent = record.title.zh;
      if (record.kind === 'source') showSource(record);
      else showCandidate(record);
      document.title = record.title.zh+' · imxiaowho 前端词典';
      requestAnimationFrame(() => {
        scrollTo(0,0);
        $('reader').focus({preventScroll:true});
      });
      return;
    }
    const previous = detailId;
    detailId = '';
    const requested = new URLSearchParams(params).get('mode');
    mode = requested && Object.hasOwn(modes,requested) ? requested : raw === 'dictionary' ? 'terms' : ['sources','source-library','series'].includes(raw) ? 'sources' : mode;
    if (raw === 'gallery') mode = 'elements';
    if (raw === 'favorites') favorites = true;
    $('home').hidden = false;
    $('detail').hidden = true;
    $('reader').replaceChildren();
    renderHome();
    document.title = 'imxiaowho · 前端词典';
    requestAnimationFrame(() => {
      scrollTo(0,previous ? homeScroll : 0);
      if (!previous) return;
      const trigger = returnFocus?.isConnected ? returnFocus : $('results').querySelector('[data-detail="'+(returnFocus?.dataset.detail || previous)+'"]');
      (trigger || $('search')).focus({preventScroll:true});
      returnFocus = null;
    });
  }
  document.querySelector('a.skip').addEventListener('click', event => {
    event.preventDefault();
    (detailId ? $('reader') : $('search')).focus();
  });
  wireDetails(practices);
  $('search').addEventListener('input',()=>{page=0;renderHome();});
  $('clear-search').addEventListener('click',()=>{
    $('search').value = '';
    page = 0;
    renderHome();
    $('search').focus();
  });
  approved.addEventListener('change',()=>{page=0;renderHome();});
  $('domain-select').addEventListener('change',()=>{domain=$('domain-select').value;page=0;renderHome();});
  $('back-home').addEventListener('click',returnHome);
  $('favorites-toggle').addEventListener('click',()=>{favorites=!favorites;page=0;if(detailId)returnHome();else renderHome();});random.addEventListener('click',()=>{const pool=modes[mode].items.filter(r=>matches(r));if(!pool.length)return;const r=pool[Math.floor(Math.random()*pool.length)];openDetail(r.kind==='element'?(headword(r)||r).id:r.id,random);});
  addEventListener('vbc-buddy-found',event=>notify('找到啦！这是你第 '+event.detail.count+' 次抓到 xiaowho。它换个地方继续躲。'));
  addEventListener('hashchange',route);addEventListener('keydown',event=>{const editing=/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName)||document.activeElement?.isContentEditable;if(event.key==='/'&&!editing&&!detailId){event.preventDefault();$('search').focus();}if(event.key==='Escape'&&!editing&&detailId&&!$('pointer-panel').matches(':popover-open'))returnHome();});addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(!detailId)renderHome();else detailReflow?.();},150);});
  addEventListener('message',event=>{const frame=$('reader').querySelector('iframe');if(frame&&event.source===frame.contentWindow&&event.data?.type==='vbc-preview-height'){const height=Number(event.data.height);if(Number.isFinite(height)&&height>0)frame.style.height=Math.max(180,Math.ceil(height)+2)+'px';}});
  $('updated').textContent='· '+data.generated_at.slice(0,10);updateSaved();route();window.VBCUI?.ready();
})();
