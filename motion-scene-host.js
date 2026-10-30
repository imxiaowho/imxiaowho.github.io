/* Presentation adapter: original components, with layout fitted to a card. */
(() => {
 'use strict';
 const root=document.documentElement,id=root.dataset.motionScene;
 if(!id)return;
 const en=root.dataset.sceneLanguage==='en',t=(zh,eng)=>en?eng:zh;
 const style=document.createElement('style');
 style.textContent=`
 html,body{margin:0!important;width:100%;min-height:100%;scroll-padding-top:0;background:var(--paper,var(--bg,#fcfcf9))!important}
 body{padding:0!important}body>*:not(#scene-root):not(dialog):not(.drop-spark):not(.drag-ghost){display:none!important}
 #scene-root{box-sizing:border-box;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:18px;position:relative;isolation:isolate}
 .scene-object{flex:none;transform-origin:center;position:relative}.scene-object>.card{width:100%;margin:0}.scene-object>.chapter-visual{width:100%;margin:0;transform:none!important}.scene-object .chapter-visual img{width:100%}
 #scene-root .mascot-stage{margin:0;padding:0;min-height:0;width:100%}#scene-root .mascot{width:min(220px,calc(100vh - 55px));height:min(220px,calc(100vh - 55px));max-width:100%}#scene-root .mascot-stage:before{width:175px;height:175px;top:24px}
 #scene-root .desk-buddy{margin:0;min-width:0;width:250px;max-width:100%}#scene-root .buddy-portrait img{width:145px;height:145px}#scene-root .desk-buddy>span{font-size:12px}
 #scene-root .site-welcome{position:absolute!important;inset:0}#scene-root .welcome-center{display:block}#scene-root .welcome-skip{display:none}
 #scene-root .task-card{width:100%;margin:0}#scene-root .finish{margin:0;width:100%;max-width:none}
 #scene-root.scene-board{display:flex;align-items:flex-start;justify-content:center;padding:14px 0;min-height:100vh;overflow:hidden}.scene-board .scene-object{transform-origin:top center;margin:0}.scene-board #board{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.scene-board .column{min-height:230px;padding:12px}.scene-board .task-card{margin-bottom:12px}.scene-board .task-card~.task-card{display:none}.drag-ghost{width:var(--scene-card-width)!important;transform:rotate(5deg) scale(var(--scene-drag-scale,1));transform-origin:top left}.scene-board .column h3{font-size:15px}.scene-board .empty{font-size:14px}
 #scene-root.scene-document{display:block;padding:0 16px}.scene-document .site-header{height:48px;min-height:48px;position:sticky;top:0;display:flex;justify-content:center;z-index:5}.scene-document .brand,.scene-document .reading-controls,.scene-document .draft-tag{display:none!important}.scene-document nav{width:100%;justify-content:space-between;gap:5px}.scene-document nav a{font-size:12px;min-height:44px}.scene-document nav a>span{display:none}.scene-document #journey{margin:0}.scene-document .chapter{display:grid!important;grid-template-columns:1fr 1fr!important;gap:14px;align-items:center;min-height:230px;padding:20px 8px!important;scroll-margin-top:50px}.scene-document .chapter-visual{grid-column:1!important;grid-row:1!important;width:100%!important;margin:0!important;transform:none!important}.scene-document .chapter-caption{grid-column:2!important;grid-row:1!important;padding:0!important;margin:0!important;background:transparent}.scene-document .chapter-caption h2{font-size:16px!important;line-height:1.7;margin:8px 0}.scene-document .chapter-index{font-size:23px}.scene-document .chapter-meta{margin:0}.scene-document .chapter-meta time,.scene-document .chapter-lead,.scene-document .version-note,.scene-document .chapter-notes,.scene-document .journey-end,.scene-document .replay-steps{display:none}.scene-document .walking-trail{opacity:.55}
 #scene-root.scene-scroll-exit{display:block;min-height:850px;padding:32px 18px 350px}.scene-scroll-exit .scroll-card-shell{width:280px;max-width:100%;margin:0 auto}
 #scene-root.scene-notes{display:block;padding:35px 24px}.scene-notes .chapter-notes{max-width:500px;margin:auto}.scene-notes .chapter-copy p{font-size:15px;line-height:1.9}.scene-notes .chapter-notes summary{font-size:15px;margin-top:0}
 #scene-root.scene-footsteps{padding:20px;display:flex;flex-direction:column;gap:12px;overflow:hidden}.scene-footsteps .walking-trail{position:static;width:100%;height:auto;z-index:auto;overflow:visible}.scene-footsteps .trail-caption{width:100%;display:flex;justify-content:space-between;gap:16px;font:12px/1.6 var(--sans,sans-serif);color:var(--muted)}
 .scene-idle #scene-root *{animation:none!important}.scene-paused #scene-root *{animation-play-state:paused!important}.scene-reduced #scene-root *{animation:none!important;transition:none!important;scroll-behavior:auto!important}
 .scene-idle #scene-root .site-welcome[hidden]{display:grid!important}.scene-idle #scene-root .welcome-slip{opacity:1}dialog{max-width:calc(100% - 20px);max-height:calc(100dvh - 20px);overflow:auto}
 `;
 style.textContent+=`html,body{scrollbar-width:none}html::-webkit-scrollbar,body::-webkit-scrollbar{display:none}#scene-root{font-family:var(--sans,'Noto Sans SC',sans-serif)}#scene-root button,#scene-root summary,#scene-root h2,#scene-root h3{font-family:inherit}.scene-document .site-header{height:60px;min-height:60px;padding:8px 0;box-sizing:border-box}.scene-document .chapter{scroll-margin-top:74px}.scene-document .chapter-caption h2{overflow-wrap:anywhere}`;
 style.textContent+='html[data-motion-presentation=discovery] .mascot-stage:before{display:none}html[data-motion-presentation=discovery] .expression-status{display:none}html[data-motion-presentation=discovery] #scene-root .mascot{width:min(230px,calc(100vh - 12px));height:min(230px,calc(100vh - 12px))}html[data-motion-presentation=discovery] .trail-caption{display:none!important}html[data-motion-presentation=discovery] #scene-root.scene-footsteps{padding-right:65px}';
 document.head.append(style);
 const stage=document.createElement('div');stage.id='scene-root';document.body.append(stage);
 const find=selector=>document.querySelector(selector);
 const append=selector=>{const node=find(selector);if(node)stage.append(node);return node;};
 let timers=[],animations=[],action=()=>{};
 const later=(fn,delay)=>timers.push(setTimeout(fn,delay));
 const clear=()=>{timers.forEach(clearTimeout);timers=[];};
 // Fit the whole original object, including its shadow; don't rewrite its type or keyframes.
 function fit(node,width){
  if(!node)return;
  const wrap=document.createElement('div');wrap.className='scene-object';wrap.style.width=width+'px';node.before(wrap);wrap.append(node);
  const resize=()=>{wrap.style.transform='';const height=wrap.offsetHeight,padding=root.dataset.motionPresentation==='discovery'?12:36,scale=Math.min(1,(innerWidth-padding)/width,(innerHeight-padding)/Math.max(1,height));wrap.style.transform='scale('+scale+')';stage.style.height=innerHeight+'px';};
  new ResizeObserver(resize).observe(wrap);addEventListener('resize',resize);document.fonts.ready.then(resize);resize();return wrap;
 }
 stage.addEventListener('pointerdown',()=>root.classList.remove('scene-idle','scene-paused'));
 stage.addEventListener('click',event=>{const a=event.target.closest('a[href^="#"]'),target=a&&document.getElementById(a.getAttribute('href').slice(1));if(target){event.preventDefault();target.scrollIntoView({behavior:root.classList.contains('scene-reduced')||matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'});}});
 switch(id){
  case 'intro':{const welcome=append('#site-welcome');new MutationObserver(()=>{if(welcome.hidden)root.classList.add('scene-idle');}).observe(welcome,{attributes:true,attributeFilter:['hidden']});action=()=>find('#motion-replay').click();break;}
  case 'expression':fit(append('.mascot-stage'),280);action=()=>find('#mascot').click();break;
  case 'hover':{
   const card=append('.cards .scroll-card-shell .card')||append('.cards>.card');fit(card,310);
   const extra=document.createElement('style');let rules='';
   function collect(list){for(const rule of list){if(rule.conditionText&&!matchMedia(rule.conditionText).matches)continue;if(rule.cssRules)collect(rule.cssRules);else if(rule.selectorText?.includes('.card:hover'))rules+=rule.selectorText.replaceAll('.card:hover','.card.source-hover')+'{'+rule.style.cssText+'}';}}
   for(const sheet of document.styleSheets){try{collect(sheet.cssRules);}catch{}}
   extra.textContent=rules;document.head.append(extra);
   action=()=>{card?.classList.remove('source-hover');requestAnimationFrame(()=>card?.classList.add('source-hover'));later(()=>card?.classList.remove('source-hover'),1300);};break;
  }
  case 'scroll-exit':{
   stage.classList.add('scene-scroll-exit');const shell=append('.scroll-card-shell');
   const resize=()=>{shell.style.transformOrigin='top center';shell.style.transform='scale('+Math.min(1,(innerHeight-65)/shell.offsetHeight)+')';};new ResizeObserver(resize).observe(shell);addEventListener('resize',resize);resize();
   action=()=>{scrollTo({top:0,behavior:'instant'});later(()=>scrollTo({top:Math.max(0,shell.getBoundingClientRect().bottom+scrollY-innerHeight*.45),behavior:'smooth'}),200);later(()=>scrollTo({top:0,behavior:'smooth'}),1800);};break;
  }
  case 'idle':append('.desk-buddy');action=()=>find('.buddy-portrait')?.classList.add('is-awake');break;
  case 'greet':fit(append('.chapter-1 .chapter-visual'),390);action=()=>find('#scene-root .scene-button')?.click();break;
  case 'drag':{
   stage.classList.add('scene-board');const board=append('#board'),wrap=fit(board,480);
   const layout=()=>{const columns=[...board.querySelectorAll('.column')],advanced=!!columns[1]?.querySelector('.task-card')||!!columns[2]?.querySelector('.task-card');columns.forEach((c,i)=>c.hidden=advanced?i===0:i===2);const scale=Math.min(1,(innerWidth-30)/480);wrap.style.transform='scale('+scale+')';root.style.setProperty('--scene-drag-scale',scale*1.03);root.style.setProperty('--scene-card-width',(board.querySelector('.task-card')?.offsetWidth||210)+'px');};
   new MutationObserver(layout).observe(board,{childList:true,subtree:true});new ResizeObserver(layout).observe(board);addEventListener('resize',layout);layout();
   action=()=>find('#reset').click();break;
  }
  case 'particles':fit(append('.task-card'),280);action=()=>{if(typeof dropSpark==='function')dropSpark(innerWidth*.5,innerHeight*.5);};stage.addEventListener('pointerdown',e=>{if(!e.target.closest('button'))action();});break;
  case 'arrive':{
   const card=append('.task-card');fit(card,280);action=()=>card?.getAnimations().forEach(a=>{a.cancel();a.play();});break;
  }
  case 'stamp':{append('#finish .stamp');action=()=>find('#scene-root .stamp')?.getAnimations().forEach(a=>{a.cancel();a.play();});break;}
  case 'footsteps':{
   stage.classList.add('scene-footsteps');const svg=append('#walking-trail'),route=find('#trail-path'),group=find('#footprints');
   svg.setAttribute('viewBox','0 0 540 170');svg.removeAttribute('height');svg.removeAttribute('width');
   route.setAttribute('d','M22 100C90 22 155 155 235 92S395 35 515 91');
   const drawn=FootstepMotion.create(route,{step:46,spread:7,size:1.8});group.replaceChildren(drawn.fragment);
   const caption=document.createElement('div');caption.className='trail-caption';caption.innerHTML='<span>'+t('一步一步，留下脚印。','One little step at a time.')+'</span><span>01 → 14</span>';stage.append(caption);
   action=()=>{drawn.feet.forEach(f=>{f.walked=false;f.node.classList.remove('is-walked');});drawn.feet.forEach((f,i)=>{FootstepMotion.stamp(f,i*150,root.classList.contains('scene-reduced'));animations.push(...f.sole.getAnimations(),...f.dust.getAnimations());});};break;
  }
  case 'progress':case 'smooth':{
   stage.classList.add('scene-document');append('.site-header');append('#journey');
   action=()=>{scrollTo({top:0,behavior:'instant'});later(()=>{if(id==='smooth')find('[data-nav="2"]')?.click();else scrollTo({top:440,behavior:'smooth'});},200);};requestAnimationFrame(()=>dispatchEvent(new Event('resize')));break;
  }
  case 'unfold':{stage.classList.add('scene-notes');const details=append('.chapter-1 .chapter-notes');action=()=>{details.open=false;requestAnimationFrame(()=>details.open=true);};break;}
 }
 root.classList.add('scene-idle');root.dataset.theme=root.dataset.sceneTheme||'light';
 function play(){clear();root.classList.remove('scene-idle','scene-paused');document.getAnimations().forEach(a=>{if(a.playState==='paused')a.play();});action();}
 function pause(){clear();root.classList.add('scene-paused');document.getAnimations().forEach(a=>a.pause());animations.forEach(a=>a.pause());scrollTo({top:scrollY,behavior:'instant'});}
 addEventListener('message',e=>{if(e.source!==parent||e.data?.kind!=='motion-scene-command')return;const {action:command,value}=e.data;if(command==='play')play();if(command==='pause')pause();if(command==='reduce'){root.classList.toggle('scene-reduced',!!value);pause();}if(command==='theme')root.dataset.theme=value==='dark'?'dark':'light';});
 if(root.hasAttribute('data-standalone')){
  const controls=document.createElement('div');controls.className='scene-controls';controls.style.cssText='position:fixed;bottom:10px;right:10px;z-index:1000;display:flex;gap:8px';
  for(const [label,fn] of [[t('播放 / 重播','Play / replay'),play],[t('暂停','Pause'),pause]]){const button=document.createElement('button');button.textContent=label;button.onclick=fn;button.style.cssText='font:14px/1.5 sans-serif;padding:10px 18px;border:1px solid #aeb9a0;border-radius:24px;background:#fcfcf9;color:#29392e';controls.append(button);}stage.append(controls);
 }
})();
