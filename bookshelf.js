/* Shared, keyboard-accessible bookshelf. All links are ordinary page links. */
(() => {
  'use strict';
  const script=document.querySelector('script[src*="bookshelf.js"]');
  const bookPath=script.dataset.bookPath;
  const portrait=new URL('xiaowho-avatar-yellow.png',new URL('../',script.src)).href;
  const coverMarkup=href=>`<a class="shelf-book" href="${href}" data-book-open data-no-translate><span class="book-pages" aria-hidden="true"></span><span class="book-front"><small>FIELD NOTES<br>VOL. 01 / MOTION</small><strong data-cover-title>让网页<br>动起来<span>。</span></strong><span class="cover-orbit" aria-hidden="true"></span><img class="cover-mascot" src="${portrait}" width="512" height="512" alt=""><span class="cover-sticker" data-cover-sticker>动一下 ↗</span><span class="cover-footer"><span data-cover-footer>小谁的学习手记</span><span aria-hidden="true">↗</span></span></span></a>`;
  const cover=coverMarkup(bookPath);
  function contents(){return `<div class="shelf-heading"><div><p class="eyebrow">XIAOWHO'S BOOKSHELF</p><h2 id="shelf-title">一页一页，留住学会的事。</h2><p>把做过的尝试，收成以后还能翻开的书。</p></div><span class="shelf-count">VOL. 01 / 14 RECIPES</span></div><div class="shelf-content">${cover}<div class="shelf-notes"><div data-shelf-outline data-no-translate></div><a href="${bookPath}">翻开第一本 <span aria-hidden="true">↗</span></a></div></div><div class="shelf-bottom"><span>可试玩 · 可查找 · 可带走</span><span>从我用过的东西，慢慢写起。</span></div>`;}
  const home=document.getElementById('bookshelf');
  if(home&&window.NotebookEntry)NotebookEntry.mount(home,{bookPath});
  const hero=document.querySelector('[data-motion-cover]');
  if(hero)hero.innerHTML=coverMarkup('#reading-desk');
  const launcher=document.createElement('button');launcher.className='shelf-launcher';launcher.type='button';launcher.setAttribute('aria-haspopup','dialog');launcher.setAttribute('aria-controls','bookshelf-dialog');launcher.innerHTML='<svg viewBox="0 0 26 26" aria-hidden="true"><path d="M3 22h20M5 19V5h5v14M12 19V3h4v16M19 19l-1-13 4-1 1 14M5 8h5M12 7h4"/></svg><span>我的书架</span>';
  const dialog=document.createElement('dialog');dialog.className='shelf-dialog';dialog.id='bookshelf-dialog';dialog.setAttribute('aria-labelledby','shelf-dialog-title');dialog.innerHTML='<div class="shelf-dialog-top"><span id="shelf-dialog-title">小谁的书架</span><button type="button" aria-label="收起书架">×</button></div><section class="knowledge-shelf">'+contents().replace('id="shelf-title"','')+'</section>';
  document.body.append(launcher,dialog);
  function localizeCover(){
    const en=document.documentElement.lang==='en';
    home?.querySelectorAll('[data-zh][data-en]').forEach(n=>n.textContent=en?n.dataset.en:n.dataset.zh);
    const entries=en?[['01','Characters & reactions','An entrance, a greeting, a change of mood.','expression'],['02','Interface & feedback','Lift a card, move a task, mark a small win.','drag'],['03','Reading & paths','Follow the footprints and find your place.','footsteps']]:[['01','角色与回应','开场、表情、招呼，让小谁有一点生命力。','expression'],['02','界面与反馈','拿起卡片、交接任务，为完成的一步盖章。','drag'],['03','阅读与路径','沿着脚印走，知道自己读到了哪里。','footsteps']];
    document.querySelectorAll('[data-shelf-outline]').forEach(n=>n.innerHTML='<p class="shelf-outline-label">'+(en?'14 MOTIONS · A GROWING FIELD NOTEBOOK':'14 个动效，收进一本学习手记')+'</p><h3>'+(en?'Little things worth keeping.':'从看见，到亲手复现。')+'</h3><div class="shelf-outline-list">'+entries.map(([num,title,desc,id])=>'<a href="'+bookPath+'#'+id+'"><span>'+num+'</span><div><strong>'+title+'</strong><p>'+desc+'</p></div><b aria-hidden="true">↗</b></a>').join('')+'</div>');
    document.querySelectorAll('[data-cover-title]').forEach(n=>n.innerHTML=en?'A little book<br>of motion<span>.</span>':'让网页<br>动起来<span>。</span>');
    document.querySelectorAll('[data-cover-sticker]').forEach(n=>n.textContent=en?'PLAY A LITTLE ↗':'动一下 ↗');
    document.querySelectorAll('[data-cover-footer]').forEach(n=>n.textContent=en?'xiaowho’s field notes':'小谁的学习手记');
    document.querySelectorAll('[data-book-open]').forEach(n=>n.setAttribute('aria-label',en?'Open the little book of motion':'翻开《让网页动起来》'));
  }
  localizeCover();addEventListener('site-preferences-change',localizeCover);
  let opening=false;
  document.addEventListener('click',async event=>{
    const link=event.target.closest('[data-book-open],.shelf-notes a');
    if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;
    event.preventDefault();if(opening)return;opening=true;
    const source=link.matches('[data-book-open]')?link:link.closest('.shelf-content').querySelector('.shelf-book');
    const overlay=document.createElement('div');overlay.className='book-opening';overlay.setAttribute('aria-hidden','true');
    const front=source.querySelector('.book-front').cloneNode(true);
    const spread=document.createElement('div');spread.className='opening-spread';
    spread.innerHTML='<div class="opening-paper opening-left"></div><div class="opening-paper opening-right"><span>THE LITTLE MOTION BOOK</span><strong>'+ (document.documentElement.lang==='en'?'A little motion.<br>A little life.':'一点互动，<br>一点生命力。')+'</strong><img src="'+portrait+'" alt=""></div><div class="opening-leaf"></div>';
    const coverPage=document.createElement('div');coverPage.className='opening-cover';coverPage.append(front);spread.append(coverPage);overlay.append(spread);
    // Closing the shelf dialog allows the opening spread to sit above every page.
    const rect=source.getBoundingClientRect();
    if(dialog.open)dialog.close();document.body.append(overlay);
    const target=spread.getBoundingClientRect();
    front.style.width='224px';front.style.height='300px';front.style.transformOrigin='top left';front.style.transform='scale('+(target.width/224)+')';
    const from={transform:'translate('+(rect.left+rect.width/2-target.left-target.width/2)+'px,'+(rect.top+rect.height/2-target.top-target.height/2)+'px) scale('+Math.min(rect.width/target.width,rect.height/target.height)+')',opacity:.8};
    const travel=spread.animate([from,{transform:'translate(0,0) scale(1)',opacity:1}],{duration:300,easing:'cubic-bezier(.2,.7,.2,1)',fill:'both'});
    await travel.finished;overlay.classList.add('is-open');
    const flip=coverPage.animate([{transform:'rotateY(0deg)'},{transform:'rotateY(-158deg)'}],{duration:650,easing:'cubic-bezier(.25,.65,.2,1)',fill:'forwards'});
    spread.querySelector('.opening-leaf').animate([{transform:'rotateY(0deg)'},{transform:'rotateY(-142deg)'}],{duration:550,delay:130,easing:'cubic-bezier(.25,.65,.2,1)',fill:'forwards'});
    await flip.finished;
    const destination=new URL(link.href,location.href);
    if(destination.pathname===location.pathname&&destination.hash){overlay.remove();opening=false;document.querySelector(destination.hash)?.scrollIntoView({behavior:'smooth'});return;}
    try{sessionStorage.setItem('xiaowho-book-opening','1');}catch{}
    location.assign(destination.href);
  });
  launcher.addEventListener('click',()=>dialog.showModal());
  dialog.querySelector('button').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
})();
