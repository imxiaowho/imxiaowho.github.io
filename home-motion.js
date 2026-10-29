'use strict';
(()=>{
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const welcome=document.getElementById('site-welcome');
 let exitTimer,hideTimer;
 function hideWelcome(){clearTimeout(exitTimer);welcome.classList.add('departing');hideTimer=setTimeout(()=>{welcome.hidden=true;welcome.classList.remove('departing')},430)}
 function playWelcome(){
  if(reduced.matches)return;
  clearTimeout(exitTimer);clearTimeout(hideTimer);welcome.classList.remove('departing');welcome.hidden=false;
  const face=welcome.querySelector('.welcome-center');face.getAnimations({subtree:true}).forEach(animation=>{animation.cancel();animation.play()});
  exitTimer=setTimeout(hideWelcome,1250);
 }
 document.getElementById('welcome-skip').addEventListener('click',hideWelcome);
 document.getElementById('motion-replay').addEventListener('click',playWelcome);
 let visited=false;try{visited=sessionStorage.getItem('xiaowho-home-arrived')==='1';sessionStorage.setItem('xiaowho-home-arrived','1')}catch{/* Arrival remains optional without storage. */}
 if(!visited&&(!location.hash||location.hash==='#top'))playWelcome();
 const wrappers=[...document.querySelectorAll('.cards>.card')].map((card,index)=>{
  const wrapper=document.createElement('div');wrapper.className='scroll-card-shell';wrapper.dataset.side=index%2===0?'-1':'1';const surface=document.createElement('div');surface.className='scroll-card-surface';card.before(wrapper);wrapper.append(surface);surface.append(card);return wrapper;
 });
 let scheduled=false;
 function updateCards(){
  scheduled=false;
  wrappers.forEach(wrapper=>{
   const rect=wrapper.getBoundingClientRect();
   // Only the final part of a card leaving the top edge folds back onto the desk.
   const visible=Math.min(1,Math.max(0,1-rect.bottom/Math.min(rect.height*.6,innerHeight*.48)));
   const p=reduced.matches?0:visible;
   wrapper.style.setProperty('--exit-y',-p*24+'px');wrapper.style.setProperty('--exit-rx',p*6+'deg');wrapper.style.setProperty('--exit-rz',p*Number(wrapper.dataset.side)*3.5+'deg');wrapper.style.setProperty('--exit-scale',1-p*.035);wrapper.style.setProperty('--exit-opacity',1-p*.22);
  });
 }
 function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(updateCards)}}
 window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);
 document.querySelectorAll('details.card').forEach(card=>card.addEventListener('toggle',schedule));
 reduced.addEventListener('change',()=>{if(reduced.matches){welcome.hidden=true;clearTimeout(exitTimer);clearTimeout(hideTimer)}schedule()});
 updateCards();
})();
