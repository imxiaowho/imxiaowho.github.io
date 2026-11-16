'use strict';
// Compact embedding is presentation only; each example keeps its real controls.
(() => {
  if(new URLSearchParams(location.search).get('view')!=='compact')return;
  document.documentElement.classList.add('vbc-compact');
  const labels={
    'visual-0001':'把重要内容放在前面','visual-0002':'字号与行高，影响阅读节奏',
    'visual-0003':'颜色有明确分工','visual-0004':'圆角与阴影','visual-0006':'为内容建立视觉秩序',
    'visual-0007':'行宽与阅读体验','visual-0008':'颜色需要足够的对比','visual-0009':'主体位置与裁切',
    'visual-0010':'清晰信息，稳定对比','visual-0011':'比较字体与长标题',
    'layout-0001':'自适应内容网格','layout-0002':'容器改变，内容重排','layout-0003':'内容权重决定版面',
    'component-0001':'卡片的信息与操作','component-0002':'折叠内容与就地帮助',
    'component-0003':'分组内容与模态操作','component-0004':'加载状态与可恢复结果',
    'component-0005':'表单驱动的即时预览','component-0006':'操作结果与错误恢复',
    'motion-0003':'指针靠近，界面反馈','motion-0007':'局部响应，自然回弹'
  };
  const id=document.body.dataset.studio,heading=document.querySelector('h1');
  if(heading&&labels[id])heading.textContent=labels[id];
  if(id==='motion-0004'){
    const input=document.getElementById('text');input.value='让交互反馈更清楚';input.dispatchEvent(new Event('input',{bubbles:true}));
  }
  if(document.body.dataset.scene==='project-case')heading.textContent='阅读优先的项目介绍';
  if(document.body.dataset.scene==='portfolio')heading.textContent='可筛选的作品列表';
  const set=(selector,text)=>{const node=document.querySelector(selector);if(node)node.textContent=text;};
  if(id==='visual-0002'){
    document.getElementById('sample').innerHTML='<p>字号影响一行容纳的文字，行高影响行间距离。调整参数，观察同一段内容的换行、密度和阅读节奏。</p>';
    document.getElementById('size').dispatchEvent(new Event('input',{bubbles:true}));
  }
  if(id==='visual-0007')document.getElementById('sample').innerHTML='<p>行宽影响每行的文字数量。较长的行减少换行，也让视线需要移动更远；较短的行换行更频繁。</p><p>调整下面的行宽，比较同一段内容。正文保持连续阅读，标题负责说明主题。</p>';
  if(id==='layout-0001'){const gap=document.getElementById('gap');gap.value='16';gap.dispatchEvent(new Event('input',{bubbles:true}));}
  if(id==='layout-0002'){
    set('.room-grid p','调整容器宽度，观察图文从并排变为上下排列。断点取决于这个容器，而不是整个浏览器窗口。');
    const width=document.getElementById('width');width.min='160';const resizeWidth=()=>{const followMax=width.value===width.max,next=Math.max(260,Math.min(900,document.querySelector('.responsive-stage').clientWidth));width.max=String(next);width.value=String(followMax?next:Math.min(Number(width.value),next));width.dispatchEvent(new Event('input',{bubbles:true}));};addEventListener('resize',resizeWidth);resizeWidth();
  }
  if(id==='component-0001'){
    set('.feature-card h2','内容卡片');set('.feature-card>div>p','一张卡片组织标题、摘要和明确操作。');
    const questions=['卡片包含哪些信息？','主要操作如何区分？','收藏代表什么？'];
    const answers=['标题说明内容，摘要帮助判断，操作给出明确结果。','每张卡片保留一个主要操作。','收藏用于找回内容，与版本批准分别记录。'];
    document.querySelectorAll('.reading-notes details').forEach((node,i)=>{node.querySelector('summary').textContent=questions[i];node.querySelector('p').textContent=answers[i];});
  }
  if(id==='component-0005'){const title=document.getElementById('title');title.value='实时内容预览';title.dispatchEvent(new Event('input',{bubbles:true}));set('#summary','调整表单，查看当前结果。');set('.editor-preview .scene-meta','内容预览');}
  if(!id&&document.querySelector('.composition')){
    set('#desk-title','裁切参数');set('.desk-heading>span','');set('.fit-field label','填充方式');
    const imageWindow=document.getElementById('image-window');
    const fitFrame=()=>{const [a,b]=getComputedStyle(imageWindow).aspectRatio.split('/').map(Number);imageWindow.style.maxWidth=innerWidth<=640?Math.round(150*(a/b))+'px':'';};
    document.querySelectorAll('[data-ratio]').forEach(button=>button.addEventListener('click',fitFrame));addEventListener('resize',fitFrame);fitFrame();
  }
  if(document.body.dataset.scene==='project-case'){
    set('.case-story h2','信息结构与阅读');set('.case-story .case-lead','先组织信息层次，再安排图文与颜色。');
    const paragraphs=document.querySelectorAll('.case-story>div>p');if(paragraphs[1])paragraphs[1].textContent='标题标出主题，正文保持可读行宽；图文随容器重排，配色可在下方切换。';if(paragraphs[2])paragraphs[2].remove();
  }
  // Opaque previews do not permit form submission; close the local demo explicitly.
  document.querySelectorAll('dialog form[method="dialog"] button').forEach(button=>button.addEventListener('click',event=>{event.preventDefault();button.closest('dialog').close(button.value);}));
  let queued=false;
  const report=()=>{if(queued||parent===window)return;queued=true;requestAnimationFrame(()=>{queued=false;parent.postMessage({type:'vbc-preview-height',height:Math.ceil(document.body.getBoundingClientRect().height)},'*');});};
  new ResizeObserver(report).observe(document.body);document.fonts.ready.then(report);addEventListener('load',report);report();
})();
