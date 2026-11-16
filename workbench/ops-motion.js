"use strict";
// Native workbench motion with operations selectors; no business calls.
window.opsMotion = (()=>{
const coreMotion = (()=>{
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover: hover) and (pointer: fine)');
  const active=new Set(),playing=new WeakMap(),status=new Map(),counts=new Map(),pendingDetails=new WeakMap();
  let signature='',scope='',origin=null,initialized=false,frame=0,surface=null;
  const enabled=()=>!reduced.matches && !document.hidden;
  function animate(element,frames,options={}) {
    if(!enabled() || !element?.isConnected || !element.animate)return;
    try {
      playing.get(element)?.cancel();
      const animation=element.animate(frames,{duration:230,easing:'cubic-bezier(.2,.8,.2,1)',...options});
      playing.set(element,animation);active.add(animation);
      const cleanup=()=>{active.delete(animation);if(playing.get(element)===animation)playing.delete(element);};
      animation.finished.then(cleanup,cleanup);return animation;
    } catch { /* Presentation must never block application actions. */ }
  }
  function render(root,workspace,view) {
    scope=workspace;
    for(const animation of active)if(!animation.effect?.target?.isConnected)animation.cancel();
    const category=root.querySelector('[data-work-category][aria-pressed="true"]')?.dataset.workCategory || '';
    const stage=root.querySelector('[data-work-stage].primary')?.dataset.workStage || '';
    const query=root.querySelector('#work-search,#search')?.value || '';
    const page=root.querySelector('.history-pagination span')?.textContent.split('/')[0].trim() || '';
    const next=[workspace,view,category,stage,query,page].join('|'),enter=next!==signature;signature=next;
    if(enter) {
      const elements=[...root.querySelectorAll('.ops-editor,.ops-section-head,.desk-head,.desk-stats,.desk-toolbar,.work-card,.audit-prompt-card,.collection-mode,.monitor-module')]
        .filter(el=>{const r=el.getBoundingClientRect();return r.bottom>0 && r.top<innerHeight;}).slice(0,12);
      (elements.length?elements:[root]).forEach((el,i)=>animate(el,[{opacity:.3,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],{delay:Math.min(i*15,90),duration:240}));
    }
    for(const card of root.querySelectorAll('[data-motion-task]')) {
      const key=workspace+':'+card.dataset.motionTask,value=card.dataset.motionStatus;
      if(!enter && status.has(key) && status.get(key)!==value)animate(card,[{boxShadow:'0 0 0 3px rgba(115,160,135,.30)'},{boxShadow:'0 0 0 0 rgba(115,160,135,0)'}],{duration:550});
      status.set(key,value);
    }
    for(const stat of root.querySelectorAll('.desk-stat,.ops-section-head h2')) {
      const ops=stat.matches('.ops-section-head h2'),label=ops?stat.firstChild?.textContent:stat.querySelector('span')?.textContent,number=stat.querySelector(ops?'.column-count':'strong'),key=workspace+':'+view+':'+label;
      if(number && !enter && counts.has(key) && counts.get(key)!==number.textContent)animate(number,[{opacity:.55,transform:'translateY(3px)'},{opacity:1,transform:'translateY(0)'}]);
      if(number)counts.set(key,number.textContent);
    }
    if(status.size>1200)status.clear();
  }
  function clearSurface() {
    if(surface){for(const name of ['--light-x','--light-y','--tilt-x','--tilt-y'])surface.style.removeProperty(name);surface=null;}
    if(frame){cancelAnimationFrame(frame);frame=0;}
  }
  function init() {
    if(initialized)return;initialized=true;
    document.addEventListener('click',event=>{
      const button=event.target.closest('button,summary');if(!button || button.disabled)return;
      const task=button.dataset.detail || button.dataset.handoff || button.dataset.task;
      if(task)origin={rect:button.getBoundingClientRect(),task,scope,time:performance.now()};
      const details=button.closest('summary')?.parentElement || (button.matches('[data-work-tools]')?document.querySelector('#business-tools'):null);
      if(details?.tagName==='DETAILS')pendingDetails.set(details,performance.now());
      if(button.matches('.button') && !button.matches('[data-close]'))animate(button,[{transform:'scale(.97)'},{transform:'scale(1.012)',offset:.6},{transform:'scale(1)'}],{duration:210});
    },true);
    document.addEventListener('toggle',event=>{
      const details=event.target;if(details.tagName!=='DETAILS' || !details.open || performance.now()-(pendingDetails.get(details) ?? -Infinity)>1200)return;
      pendingDetails.delete(details);
      [...details.children].filter(el=>el.tagName!=='SUMMARY').slice(0,6).forEach((el,i)=>animate(el,[{opacity:.3,transform:'translateY(-4px)'},{opacity:1,transform:'translateY(0)'}],{delay:i*12,duration:200}));
    },true);
    const dialogObserver=new MutationObserver(records=>{
      for(const {target} of records){if(!target.open)continue;
        const mobile=matchMedia('(max-width:640px)').matches;
        let transform=mobile?'translateY(24px) scale(.995)':'translateY(10px) scale(.975)',options={};
        const task=target.querySelector('#ops-detail-title,#ops-handoff-card')?.textContent;
        if(!mobile && origin && origin.scope===scope && performance.now()-origin.time<1000 && task?.startsWith(origin.task)){
          const r=target.getBoundingClientRect(),x=Math.max(0,Math.min(100,100*(origin.rect.left+origin.rect.width/2-r.left)/r.width)),y=Math.max(0,Math.min(100,100*(origin.rect.top-r.top)/r.height));
          options={transformOrigin:`${x}% ${y}%`};
        }
        animate(target,[{opacity:0,transform,...options},{opacity:1,transform:'translateY(0) scale(1)',...options}],{duration:250});origin=null;
      }
    });
    document.querySelectorAll('dialog').forEach(dialog=>dialogObserver.observe(dialog,{attributes:true,attributeFilter:['open']}));
    const toast=document.querySelector('#toast');if(toast)new MutationObserver(()=>{if(!toast.hidden)animate(toast,[{opacity:0,transform:'translateY(8px) scale(.98)'},{opacity:1,transform:'translateY(0) scale(1)'}]);}).observe(toast,{attributes:true,attributeFilter:['hidden']});
    document.addEventListener('pointermove',event=>{
      if(!fine.matches || !enabled())return;
      const card=event.target.closest('.ops-editor,.ops-card,.desk-stat,.monitor-module,.collection-mode,.audit-prompt-card');
      if(card!==surface)clearSurface();if(!card)return;surface=card;if(frame)cancelAnimationFrame(frame);
      const x=event.clientX,y=event.clientY;
      frame=requestAnimationFrame(()=>{frame=0;if(!card.isConnected || surface!==card || !enabled())return;const r=card.getBoundingClientRect(),px=Math.max(0,Math.min(1,(x-r.left)/r.width)),py=Math.max(0,Math.min(1,(y-r.top)/r.height));card.style.setProperty('--light-x',`${px*100}%`);card.style.setProperty('--light-y',`${py*100}%`);if(card.matches('.desk-stat,.ops-editor')){card.style.setProperty('--tilt-x',`${(.5-py)*1.4}deg`);card.style.setProperty('--tilt-y',`${(px-.5)*1.4}deg`);}});
    },{passive:true});
    document.addEventListener('pointerout',event=>{if(surface && (!(event.relatedTarget instanceof Node) || !surface.contains(event.relatedTarget)))clearSurface();},{passive:true});
    const stop=()=>{for(const animation of active)animation.cancel();clearSurface();};
    reduced.addEventListener('change',stop);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  }
  return {render,init,animate};
})();

  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const button=document.querySelector('#xiaowho-buddy'),image=document.querySelector('#workspace-mark'),greeting=document.querySelector('#xiaowho-greeting');
  const phrases=['今天也一起，一张张来。','先做一件小事，也很好。','忙的时候，记得歇一会儿。','我在这儿，陪你慢慢推进。'];
  let phrase=0,greetingTimer=null,sparkTimer=null,effectTimer=null,burst=null,wave=null;
  const enabled=()=>!reduced.matches&&!document.hidden;
  function clearAvatar(){clearTimeout(greetingTimer);clearTimeout(sparkTimer);try{wave?.cancel();}catch{}wave=null;button?.classList.remove('is-waving');if(greeting)greeting.hidden=true;}
  function nod(){
    if(!enabled()||!image)return;
    wave=coreMotion.animate(image,[{transform:'translateY(0) rotate(0)'},{transform:'translateY(-5px) rotate(-8deg)',offset:.32},{transform:'translateY(-2px) rotate(7deg)',offset:.64},{transform:'translateY(0) rotate(0)'}],{duration:620,easing:'cubic-bezier(.2,.8,.2,1)'});
    button?.classList.add('is-waving');clearTimeout(sparkTimer);sparkTimer=setTimeout(()=>button?.classList.remove('is-waving'),800);
  }
  function clearLanding(){clearTimeout(effectTimer);burst?.remove();burst=null;document.querySelectorAll('.ops-card.work-landed').forEach(card=>card.classList.remove('work-landed'));}
  function cardNode(id){return [...document.querySelectorAll('.ops-card')].find(card=>card.dataset.card===id);}
  function reveal(id){
    const card=cardNode(id);if(!card||!enabled())return;
    coreMotion.animate(card,[{opacity:.35,transform:'translateY(9px) scale(.985)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:280});
  }
  function landed(id){
    clearLanding();const card=cardNode(id);if(!card||document.hidden)return;
    const before=card.getBoundingClientRect();if(before.top<0||before.bottom>innerHeight)card.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});
    card.classList.add('work-landed');
    if(enabled()){
      coreMotion.animate(card,[{transform:'translateY(-17px) scale(1.015)'},{transform:'translateY(3px) scale(.995)',offset:.64},{transform:'translateY(0) scale(1)'}],{duration:430});
      const rect=card.getBoundingClientRect();burst=document.createElement('div');burst.className='work-starburst';burst.setAttribute('aria-hidden','true');
      [[-40,-26],[-13,-45],[26,-35],[44,-4],[25,29],[-35,18]].forEach(([x,y],index)=>{const star=document.createElement('span');star.textContent='✦';star.style.left=(rect.left+rect.width*.65)+'px';star.style.top=(rect.top+Math.min(45,rect.height/3))+'px';star.style.setProperty('--star-x',x+'px');star.style.setProperty('--star-y',y+'px');star.style.animationDelay=(index*13)+'ms';burst.append(star);});
      document.body.append(burst);
    }
    effectTimer=setTimeout(clearLanding,850);
  }
  function projectChanged(){clearAvatar();clearLanding();nod();}
  if(button&&greeting)button.addEventListener('click',()=>{clearAvatar();greeting.textContent=phrases[phrase++%phrases.length];greeting.hidden=false;nod();greetingTimer=setTimeout(clearAvatar,2800);});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){clearAvatar();clearLanding();}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){clearAvatar();clearLanding();}});
  reduced.addEventListener('change',()=>{clearAvatar();clearLanding();});
  coreMotion.init();
  return {render:(root,project)=>coreMotion.render(root,'ops',project),projectChanged,reveal,landed};
})();
