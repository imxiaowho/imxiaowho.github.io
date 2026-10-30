/* Homepage notebook: supplied physical artwork, semantic notes and ordinary links. */
(() => {
 'use strict';
 const assetBase=new URL('.',document.currentScript.src);
 const source=new URL('selected-notebook.png',assetBase).href;
 const peek=new URL('notebook-peek-cutout.webp',assetBase).href;
 const clean=new URL('notebook-clean-spread.webp',assetBase).href;
 const art=(x,y,w,h,extra='')=>`<span class="nb-art ${extra}" aria-hidden="true"><img src="${source}" alt="" width="1435" height="1096" style="width:${1435/w*100}%;left:${-x/w*100}%;top:${-y/h*100}%"></span>`;
 const box=(x,y,w,h)=>`style="left:${x/1435*100}%;top:${y/1096*100}%;width:${w/1435*100}%;height:${h/1096*100}%"`;
 const copy=(zh,en,cls='')=>`<span class="${cls}" data-nb-zh="${zh}" data-nb-en="${en}">${zh}</span>`;
 function mount(home,{bookPath}){
  home.classList.add('notebook-entry','exact-notebook-entry');home.setAttribute('data-no-translate','');
  home.innerHTML=`<div class="nb-surface">
   <header class="nb-bar" ${box(120,20,1195,42)}><a href="#top" class="nb-brand" aria-label="陈震的小角落，返回主页">${art(120,24,150,30)}${copy('陈震的小角落。','Chen’s little corner.','nb-semantic nb-en-copy')}</a><nav aria-label="学习笔记导航"><a href="#things">${copy('日常','Everyday')}</a><i aria-hidden="true">/</i><a href="#bookshelf">${copy('学习手记','Field notes')}</a><i aria-hidden="true">/</i><a href="#about">${copy('关于','About')}</a><button type="button" class="nb-language" aria-label="Switch to English">EN</button></nav></header>
   <h2 id="shelf-title" class="nb-title" ${box(115,95,435,170)}>${art(115,95,435,170)}${copy('这个小动作，<br>我想记下来。','This little motion,<br>I want to keep it.','nb-semantic nb-en-copy')}</h2>
   <p class="nb-intro" ${box(166,278,555,56)}>${copy('做网页的时候，总会遇到一些让我忍不住点第二次的小东西。<br>这里记下它们，也记下我怎么慢慢学会。','Little things I want to try twice.<br> My notes on making them work.')}</p>
   <div class="nb-mascot" ${box(850,130,350,255)}>${art(850,130,350,255)}<img class="nb-peek-cutout" src="${peek}" alt="" width="1470" height="1070" aria-hidden="true"></div>
   <div class="nb-handnote" ${box(1210,260,200,165)}>${art(1210,260,200,165)}${copy('这个我玩了好几遍','I tried this over and over.','nb-semantic nb-en-copy')}</div>
   <div class="nb-book" ${box(65,341,1320,500)}>${art(65,341,1320,500,'nb-book-print')}<img class="nb-book-clean" src="${clean}" alt="" width="1320" height="500"><button type="button" class="nb-trail" aria-label="重播书页上的脚印">${art(130,485,590,160)}</button></div>
   <section class="nb-print-note" ${box(812,405,345,260)}><small>${copy('今天翻到：','Opening today:')}</small><h3>${copy('让脚印走起来','Let the footsteps walk')}</h3><p>${copy('本来只是想做一个普通的脚印动画，没想到稍微调一调，脚印居然可以沿着鼠标，或者一条线，稳稳地走过去。','A small footstep experiment: adjust position, spacing and timing, and the footprints can follow a path.')}</p><p class="nb-insight">${copy('原来，脚印可以沿着一条线走。','A little path. One step at a time.')}</p></section>
   <a class="nb-open" href="${bookPath}" ${box(813,676,184,49)}>${copy('踩一遍看看 ↗','Step inside ↗','nb-semantic nb-en-copy')}</a>
   <div class="nb-leaf" ${box(0,813,278,283)}>${art(0,813,278,283)}</div>
   <div class="nb-small-first" ${box(86,830,150,145)}>${art(86,830,150,145)}</div>
   <section class="nb-after nb-after-first" ${box(267,835,412,133)}><h3>${art(267,835,412,48)}${copy('第一次试的时候，脚印全挤在了一起。','At first, the footsteps all crowded together.','nb-semantic nb-en-copy')}</h3><p>${copy('我一开始直接把所有脚印放出来，结果全都堆在起点，一点也不顺畅。看起来很笨，完全不是我想要的效果。','Putting all the footsteps at the start made them crowd together. Spacing them along a path gives each step room.')}</p></section>
   <span class="nb-divider" ${box(719,836,1,118)} aria-hidden="true"></span>
   <section class="nb-after nb-after-second" ${box(837,835,365,138)}><h3>${art(837,835,365,48)}${copy('后来才明白，要让路线跟着屏幕一起变。','Let the path fit the screen.','nb-semantic nb-en-copy')}</h3><p>${copy('不能写死位置，而是根据屏幕的尺寸和路径，实时计算每一步的位置。这样不管在什么设备上，脚印都能自然地走起来。','Calculate each step from the path and the screen size, rather than fixed coordinates. The movement can then adapt to different devices.')}</p></section>
   <div class="nb-small-second" ${box(1235,830,178,145)}>${art(1235,830,178,145)}</div>
   <a class="nb-volume" href="${bookPath}" ${box(280,975,1002,121)}>${art(280,975,1002,121)}${copy('网页里的小动作 · 继续翻 ↗','Little motions on the web · Keep reading ↗','nb-semantic nb-en-copy')}</a>
  </div>`;
  const book=home.querySelector('.nb-book'),trail=home.querySelector('.nb-trail');
  let animation=null,timer=null;
  trail.addEventListener('click',()=>{
   animation?.cancel();clearTimeout(timer);book.classList.remove('is-replaying');trail.setAttribute('aria-busy','false');
   if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;
   book.classList.add('is-replaying');trail.setAttribute('aria-busy','true');animation=trail.querySelector('.nb-art').animate([{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0 0 0)'}],{duration:1800,easing:'linear',fill:'forwards'});
   timer=setTimeout(()=>{book.classList.remove('is-replaying');trail.setAttribute('aria-busy','false');},1900);
  });
  home.querySelector('.nb-language').addEventListener('click',()=>document.getElementById('language-toggle')?.click());
  function localize(){
   const en=document.documentElement.lang==='en';
   home.querySelectorAll('[data-nb-zh]').forEach(n=>n.innerHTML=en?n.dataset.nbEn:n.dataset.nbZh);
   home.querySelector('.nb-bar nav').setAttribute('aria-label',en?'Field notes navigation':'学习笔记导航');
   home.querySelector('.nb-language').textContent=en?'中文':'EN';home.querySelector('.nb-language').setAttribute('aria-label',en?'Switch to Chinese':'Switch to English');
   home.querySelector('.nb-brand').setAttribute('aria-label',en?'Chen’s little corner — homepage':'陈震的小角落，返回主页');
   trail.setAttribute('aria-label',en?'Replay the footsteps on the page':'重播书页上的脚印');
   home.querySelector('.nb-volume').setAttribute('aria-label',en?'Keep reading: little motions on the web':'网页里的小动作，继续翻');
  }
  function updateShelfVisibility(){const r=home.getBoundingClientRect();document.documentElement.classList.toggle('is-notebook-visible',r.bottom>0&&r.top<innerHeight);}
  function resize(){home.style.setProperty('--nb-viewport',document.documentElement.clientWidth+'px');updateShelfVisibility();}
  localize();resize();addEventListener('site-preferences-change',()=>{const keep=document.documentElement.classList.contains('is-notebook-visible');localize();if(keep)requestAnimationFrame(()=>{home.scrollIntoView({block:'start',behavior:'instant'});updateShelfVisibility();});});addEventListener('resize',resize);
  addEventListener('scroll',updateShelfVisibility,{passive:true});
  addEventListener('load',()=>{if(location.hash==='#bookshelf')home.scrollIntoView({block:'start',behavior:'instant'});updateShelfVisibility();},{once:true});
  let opening=false;
  for(const link of home.querySelectorAll('.nb-open,.nb-volume'))link.addEventListener('click',async e=>{
   if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button!==0||matchMedia('(prefers-reduced-motion:reduce)').matches)return;
   e.preventDefault();if(opening)return;opening=true;const href=e.currentTarget.href;
   try{await book.animate([{transform:'none',opacity:1},{transform:'perspective(1100px) rotateY(-12deg) translateX(-25px)',opacity:0}],{duration:420,easing:'ease-in',fill:'forwards'}).finished;sessionStorage.setItem('xiaowho-book-opening','1');}catch{}
   location.assign(href);
  });
 }
 window.NotebookEntry={mount};
})();
