/* Real pointer/keyboard toy and original-source discoveries. No application state is changed. */
(() => {
 'use strict';
 const $=id=>document.getElementById(id),root=document.documentElement;
 const t=(zh,en)=>root.lang==='en'?en:zh;
 const stage=$('drag-stage'),paper=$('paper-toy'),target=$('drop-target');
 let held=null,placed=false;
 function move(x,y){paper.style.setProperty('--toy-x',x+'px');paper.style.setProperty('--toy-y',y+'px');}
 function reset(){placed=false;held=null;paper.classList.remove('is-held','is-placed');paper.classList.add('is-settling');target.classList.remove('is-over');move(0,0);$('toy-status').textContent='';}
 function place(){const a=paper.getBoundingClientRect(),b=target.getBoundingClientRect();const x=parseFloat(paper.style.getPropertyValue('--toy-x'))||0,y=parseFloat(paper.style.getPropertyValue('--toy-y'))||0;move(x+b.x+b.width/2-a.x-a.width/2,y+b.y+b.height/2-a.y-a.height/2);paper.classList.add('is-placed');placed=true;$('toy-status').textContent=t('放好了。再试一次，看看影子怎么变。','There it is. Try again and watch the shadow.');}
 paper.addEventListener('pointerdown',e=>{if(e.button!==0)return;if(placed)reset();paper.classList.remove('is-settling');held={id:e.pointerId,x:e.clientX,y:e.clientY};paper.setPointerCapture(e.pointerId);paper.classList.add('is-held');$('toy-status').textContent=t('拿起来了，挪到虚线框里试试。','Picked up. Try the dotted outline.');});
 paper.addEventListener('pointermove',e=>{if(!held)return;const bounds=stage.getBoundingClientRect(),dx=Math.max(-paper.offsetLeft+10,Math.min(stage.clientWidth-paper.offsetLeft-paper.offsetWidth-10,e.clientX-held.x)),dy=Math.max(-paper.offsetTop+10,Math.min(stage.clientHeight-paper.offsetTop-paper.offsetHeight-55,e.clientY-held.y));move(dx,dy);const r=target.getBoundingClientRect();target.classList.toggle('is-over',e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom);});
 function release(e){if(!held)return;const accepted=e.type==='pointerup'&&target.classList.contains('is-over');held=null;paper.classList.remove('is-held');paper.classList.add('is-settling');target.classList.remove('is-over');if(paper.hasPointerCapture(e.pointerId))paper.releasePointerCapture(e.pointerId);if(accepted)place();else{move(0,0);$('toy-status').textContent=t('松开了，它又回到桌上。','Released. Back on the desk.');}}
 paper.addEventListener('pointerup',release);paper.addEventListener('pointercancel',release);
 paper.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();paper.classList.add('is-settling');placed?reset():place();}});
 $('reset-toy').onclick=reset;addEventListener('resize',reset);
 let scenes=[];
 function mount(){document.title=t('小谁的发现桌 · 学习与笔记','xiaowho’s discovery desk · Learning & notes');document.querySelector('.book-skip').textContent=t('跳到试玩','Skip to the playground');$('expression-object').setAttribute('aria-label',t('切换小谁的表情','Change xiaowho’s expression'));$('footsteps-object').setAttribute('aria-label',t('重播脚印','Replay the footsteps'));$('stamp-object').setAttribute('aria-label',t('盖一次完成章','Play the stamp'));$('motion-search').setAttribute('aria-label',t('找一页笔记','Find a note'));document.querySelector('.desk-mascot').alt=t('戴黄色 Chz 帽子的小谁正在推纸片','xiaowho in a yellow Chz cap, nudging a paper note');scenes.forEach(s=>s.destroy());scenes=[];if($('expression-object').querySelector('.reference-art'))return;const config={lang:root.lang==='en'?'en':'zh',theme:root.dataset.theme,presentation:'discovery'};scenes=[MotionRecipes.mount($('expression-scene'),'expression',config),MotionRecipes.mount($('footsteps-scene'),'footsteps',config)];scenes[1].play();}
 function localizeIllustrations(){document.querySelector('.little-discoveries').setAttribute('aria-label',t('继续发现','More discoveries'));($('stamp-object').querySelector('img.accessible-copy')||$('stamp-object').querySelector('img')).alt=t('金黄色的小谁印章','A golden xiaowho stamp');}
 localizeIllustrations();addEventListener('site-preferences-change',localizeIllustrations);
 $('expression-object').onclick=()=>scenes[0]?.play();$('footsteps-object').onclick=()=>scenes[1]?.play();
 $('stamp-object').onclick=()=>{if(!matchMedia('(prefers-reduced-motion:reduce)').matches)$('stamp-object').querySelector('img').animate([{transform:'translateY(-10px) scale(1.15) rotate(-5deg)'},{transform:'translateY(2px) scale(.98)',offset:.65},{transform:'none'}],{duration:420,easing:'cubic-bezier(.2,.7,.3,1)'});};
 document.querySelector('a[href="#notes"]').addEventListener('click',()=>$('notes-drawer').open=true);
 addEventListener('site-preferences-change',()=>{mount();reset();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)scenes.forEach(s=>s.pause());});mount();
})();
