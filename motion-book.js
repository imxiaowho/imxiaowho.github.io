/* Visual index first; original-site scenes and learning notes on demand. */
(() => {
 'use strict';
 const catalog=window.MotionCatalog,recipes=window.MotionRecipes,$=id=>document.getElementById(id);
 const categories={all:['全部','All'],entrance:['入场与展开','Entrance'],response:['操作反馈','Feedback'],scroll:['跟随阅读','Reading'],character:['角色小动作','Character']};
 const assets=new URL('.',document.currentScript.src),site=new URL('../',assets);
 const previews=new Map();let previewObserver=null;
 let language=document.documentElement.lang==='en'?'en':'zh',category='all',query='',selected=catalog[0],runtime=null,activePreview=null;
 const t=(zh,en)=>language==='en'?en:zh,text=p=>p[language==='en'?1:0],esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const count=item=>String(catalog.indexOf(item)+1).padStart(2,'0');
 const sourceURL=path=>new URL(path,site).href;
 const normalize=v=>v.normalize('NFKC').toLocaleLowerCase().trim();
 const visible=()=>catalog.filter(i=>(category==='all'||i.category===category)&&normalize([...i.title,i.term,i.aliases].join(' ')).includes(normalize(query)));
 const config=()=>({lang:language,theme:document.documentElement.dataset.theme});
 const exports=new Map();
 function htmlFor(item){const key=[item.id,language,config().theme].join(':');if(!exports.has(key))exports.set(key,recipes.standalone(item.id,config()).catch(e=>{exports.delete(key);throw e;}));return exports.get(key);}
 function renderStatic(){
  document.querySelectorAll('[data-zh][data-en]').forEach(n=>n.textContent=language==='en'?n.dataset.en:n.dataset.zh);
  $('close-reader').setAttribute('aria-label',t('关闭详情','Close details'));
  $('book-filters').innerHTML=Object.entries(categories).map(([id,label])=>'<button type="button" data-category="'+id+'" aria-pressed="'+(category===id)+'">'+esc(text(label))+'</button>').join('');
  $('motion-search').placeholder=t('找一页笔记…','Find a note…');
 }
 function stopPreview(){}
 function renderList(){
  const items=visible();
  $('recipe-list').innerHTML=items.map(item=>'<article class="note-item"><span>'+count(item)+'</span><div><a href="#'+item.id+'" data-recipe="'+item.id+'">'+esc(text(item.title))+'</a><p>'+esc(text(item.summary))+'</p></div><small>'+esc(item.term)+'</small></article>').join('');
  $('no-results').hidden=items.length>0;$('result-count').textContent=t(items.length+' 页笔记',items.length+' notes');
 }
 function renderReader(){
  runtime?.destroy();const item=selected;
  $('recipe-reader').innerHTML=`<div class="recipe-topline"><span>FIELD NOTE ${count(item)} / 14</span><span>${esc(text(categories[item.category]))}</span></div><h2 id="recipe-title" tabindex="-1">${esc(text(item.title))}</h2><p class="recipe-term">${esc(item.term)}</p><p class="recipe-summary">${esc(text(item.summary))}</p><div class="demo-frame"><div class="demo-label"><span>ORIGINAL / ${count(item)}</span><span>${t('原站组件 · 交互保留','ORIGINAL COMPONENT · INTERACTIVE')}</span></div><div id="demo-stage" class="original-scene"></div></div><div class="demo-toolbar"><div class="demo-buttons"><button type="button" id="play-recipe">${t('播放 / 重播','Play / replay')} ↻</button><button type="button" id="pause-recipe">${t('暂停','Pause')} Ⅱ</button></div><a href="${sourceURL(item.where)}" target="_blank" rel="noopener">${t('打开原页面','Open original page')} ↗</a></div><p class="demo-status" id="demo-status" role="status">${t('素材和动作都来自原页面。脚印横着走，质感不变；拖拽请按住卡片上的六点柄。','Original art, styles and timing. Tap, drag or scroll inside the frame; use the six-dot grip for dragging.')}</p><div class="recipe-notes"><section><h3>${t('它是怎么做的？','How it works')}</h3><p>${esc(text(item.how))}</p></section><section class="learning-note"><h3>${t('我在网站里怎么用','How I use it here')}</h3><p>${esc(text(item.note))}</p></section></div><p class="recipe-caution">↳ ${esc(text(item.caution))}</p><div class="source-links">${item.source.map(path=>'<a class="source-file" href="'+sourceURL(path)+'" target="_blank" rel="noopener">'+esc(path)+' ↗</a>').join('')}</div><section class="carry-home"><div class="carry-heading"><h3>${t('把这个效果带走','Take this effect with you')}</h3><span>ORIGINAL SOURCE + ASSETS</span></div><p class="carry-intro">${t('下载的是带素材的原站组件快照，保留原页面初始化结构以便独立运行。首次准备需要读取图片和字体，不会用简化图形替换。','Download an original-component snapshot with embedded artwork, fonts and initialization scaffolding. The first export takes time to gather assets; no simplified stand-ins are used.')}</p><div class="carry-actions"><button type="button" id="download-example">${t('下载原版 HTML','Download original HTML')} ↓</button><button type="button" id="copy-example">${t('复制完整代码','Copy full source')}</button><button type="button" id="copy-prompt">${t('复制给 AI 的描述','Copy prompt for AI')}</button></div><p id="copy-status" class="copy-status" role="status"></p><p class="prompt-note" id="prompt-text">${esc(text(item.prompt))}</p><details class="source-details" id="source-details"><summary>${t('查看原版组件完整源码','View complete component source')}</summary><pre tabindex="0"><code id="example-code">${t('展开后准备原站素材…','Open to prepare original assets…')}</code></pre></details></section><div class="reader-pagination"><button type="button" id="previous-recipe" ${catalog.indexOf(item)===0?'disabled':''}>← ${t('前一页','Previous')}</button><button type="button" id="next-recipe" ${catalog.indexOf(item)===catalog.length-1?'disabled':''}>${t('后一页','Next')} →</button></div>`;
  runtime=recipes.mount($('demo-stage'),item.id,config());
  $('play-recipe').onclick=()=>runtime.play();$('pause-recipe').onclick=()=>runtime.pause();
  $('copy-prompt').onclick=()=>copy(text(item.prompt),$('copy-status'));
  async function prepare(){const status=$('copy-status');status.textContent=t('正在装入原站图片、字体和样式…','Gathering original artwork, fonts and styles…');try{const html=await htmlFor(item);if(selected===item){$('example-code').textContent=html;status.textContent=t('原版素材已准备好。','Original assets are ready.');}return html;}catch{status.textContent=t('素材读取失败，请稍后重试或打开原页面。','Asset loading failed. Try again or open the original page.');return null;}}
  $('source-details').ontoggle=()=>{if($('source-details').open)prepare();};
  $('copy-example').onclick=async()=>{const html=await prepare();if(html)copy(html,$('copy-status'));};
  $('download-example').onclick=async event=>{event.currentTarget.disabled=true;const html=await prepare();if(html){const blob=new Blob([html],{type:'text/html;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='original-motion-'+item.id+'.html';link.click();setTimeout(()=>URL.revokeObjectURL(url),10000);}$('download-example').disabled=false;};
  $('previous-recipe').onclick=()=>open(catalog[catalog.indexOf(item)-1]);$('next-recipe').onclick=()=>open(catalog[catalog.indexOf(item)+1]);
 }
 async function copy(value,status){try{await navigator.clipboard.writeText(value);status.textContent=t('已复制','Copied');}catch{status.textContent=t('自动复制未获允许，请在详情里手动复制。','Copy was unavailable; open details to copy manually.');}}
 function open(item){if(!item)return;stopPreview();selected=item;history.replaceState(null,'','#'+item.id);renderReader();if(!$('recipe-modal').open)$('recipe-modal').showModal();$('recipe-modal').scrollTop=0;}
 $('close-reader').onclick=()=>$('recipe-modal').close();$('recipe-modal').addEventListener('close',()=>{runtime?.destroy();runtime=null;history.replaceState(null,'',location.pathname+location.search);});
 $('motion-search').oninput=e=>{query=e.target.value;renderList();};
 $('book-filters').onclick=e=>{const b=e.target.closest('[data-category]');if(b){category=b.dataset.category;renderStatic();renderList();}};
 $('clear-search').onclick=()=>{query='';category='all';$('motion-search').value='';renderStatic();renderList();};
 $('recipe-list').onclick=e=>{
  const link=e.target.closest('[data-recipe]');if(link&&!e.metaKey&&!e.ctrlKey&&!e.shiftKey){e.preventDefault();open(catalog.find(i=>i.id===link.dataset.recipe));return;}
  if(e.target.closest('[data-stop]')){stopPreview();return;}
  const button=e.target.closest('[data-play]');if(button){const item=catalog.find(i=>i.id===button.dataset.play),host=button.closest('.card-preview'),live=host.querySelector('.preview-live');stopPreview();let preview=previews.get(item.id);if(!preview){preview={runtime:recipes.mount(live,item.id,config()),host};previews.set(item.id,preview);}const controller=preview.runtime;host.classList.add('is-playing');button.hidden=true;activePreview={runtime:controller,host,button,id:item.id};controller.play();return;}
  const b=e.target.closest('[data-copy]');if(b){const item=catalog.find(i=>i.id===b.dataset.copy);copy(text(item.prompt),b.closest('.gallery-card').querySelector('.card-copy-status'));}
 };
 addEventListener('hashchange',()=>{const item=catalog.find(i=>i.id===location.hash.slice(1));if(item)open(item);});
 addEventListener('site-preferences-change',()=>{const next=document.documentElement.lang==='en'?'en':'zh';if(next!==language){language=next;renderStatic();renderList();if($('recipe-modal').open)renderReader();}runtime?.theme(config().theme);previews.forEach(p=>p.runtime.theme(config().theme));});
 renderStatic();renderList();const initial=catalog.find(i=>i.id===location.hash.slice(1));if(initial)open(initial);
})();
