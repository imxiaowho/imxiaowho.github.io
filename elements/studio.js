'use strict';
// Only visual lifecycle coordination; every study owns its actual interaction.
(() => {
  if(parent!==window)document.documentElement.classList.add('vbc-embedded');
  let paused=[];
  addEventListener('message',event=>{
    if(event.source!==parent||event.data?.type!=='vbc-preview-visibility')return;
    if(!event.data.visible){
      document.documentElement.classList.add('vbc-suspended');
      paused=document.getAnimations().filter(a=>a.playState==='running');
      paused.forEach(a=>a.pause());
    }else{
      document.documentElement.classList.remove('vbc-suspended');
      if(!matchMedia('(prefers-reduced-motion:reduce)').matches)paused.forEach(a=>{if(a.playState==='paused')a.play();});
      paused=[];
    }
  });
})();
