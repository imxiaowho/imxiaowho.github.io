/* Preserve the supplied visual at rest; activate its independent paper on input. */
(() => {
 'use strict';
 const stage=document.getElementById('drag-stage'),paper=document.getElementById('paper-toy');
 const localize=()=>{const en=document.documentElement.lang==='en';paper.setAttribute('aria-label',en?'Pick up the note. Drag it into the dotted outline.':'拿起这张纸，拖到虚线框里试试');document.querySelector('.discovery-brand').setAttribute('aria-label',en?'xiaowho’s discovery desk — homepage':'小谁的发现桌，返回主页');};
 localize();addEventListener('site-preferences-change',localize);
 paper.addEventListener('pointerdown',()=>stage.classList.add('is-interacting'));
 paper.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')stage.classList.toggle('is-interacting',paper.classList.contains('is-placed'));});
 document.getElementById('reset-toy').addEventListener('click',()=>stage.classList.remove('is-interacting'));
 addEventListener('resize',()=>stage.classList.remove('is-interacting'));
 addEventListener('site-preferences-change',()=>stage.classList.remove('is-interacting'));
 const reduced=()=>matchMedia('(prefers-reduced-motion:reduce)').matches;
 function animate(id,frames,duration){const button=document.getElementById(id),art=button.querySelector('.reference-art');button.addEventListener('click',()=>{if(!reduced())art.animate(frames,{duration,easing:'cubic-bezier(.2,.7,.3,1)'});});}
 animate('expression-object',[{transform:'rotate(0)'},{transform:'rotate(-4deg) translateY(-6px)',offset:.35},{transform:'rotate(3deg)',offset:.7},{transform:'none'}],520);
 document.getElementById('expression-object').addEventListener('click',e=>{const button=e.currentTarget,active=button.classList.toggle('is-winking'),en=document.documentElement.lang==='en';button.setAttribute('aria-label',en?(active?'Change expression. Current: Happy wink':'Change expression. Current: Relaxed'):(active?'切换小谁的表情，当前：开心眨眼':'切换小谁的表情，当前：放松'));});
 animate('footsteps-object',[{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0 0 0)'}],1600);
 animate('stamp-object',[{transform:'translateY(-15px) rotate(-5deg) scale(1.04)'},{transform:'translateY(3px)',offset:.65},{transform:'none'}],420);
})();
