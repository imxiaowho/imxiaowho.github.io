"use strict";

// Shell-only delight: no business state, network calls, or persistent animation loop.
const xiaowhoTheme = (()=>{
  const portraits={ts:'/workbench/marks/xiaowho-yellow.png',ks:'/workbench/marks/xiaowho-blue.png'};
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const button=document.querySelector('#xiaowho-buddy'),image=document.querySelector('#workspace-mark');
  const greeting=document.querySelector('#xiaowho-greeting');
  const phrases=['今天也一起，一张张来。','先做一件小事，也很好。','忙的时候，记得歇一会儿。','我在这儿，陪你慢慢推进。'];
  let scope='',phrase=0,hideTimer=null,sparkTimer=null,wave=null;
  function clear(){clearTimeout(hideTimer);clearTimeout(sparkTimer);try{wave?.cancel();}catch{}wave=null;button?.classList.remove('is-waving');if(greeting)greeting.hidden=true;}
  function nod(){
    if(reduced.matches || document.hidden || !image?.animate)return;
    try{
      wave?.cancel();
      wave=image.animate([{transform:'translateY(0) rotate(0)'},{transform:'translateY(-5px) rotate(-8deg)',offset:.32},{transform:'translateY(-2px) rotate(7deg)',offset:.64},{transform:'translateY(0) rotate(0)'}],{duration:620,easing:'cubic-bezier(.2,.8,.2,1)'});
      button.classList.add('is-waving');sparkTimer=setTimeout(()=>button.classList.remove('is-waving'),800);
    }catch{wave=null;button?.classList.remove('is-waving');}
  }
  function portrait(key){return portraits[key==='ks'?'ks':'ts'];}
  function sync(key){
    key=key==='ks'?'ks':'ts';if(key===scope)return;
    const changed=Boolean(scope);clear();scope=key;document.documentElement.dataset.workspace=key;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content',key==='ts'?'#292720':'#17283b');
    for(const img of document.querySelectorAll('[data-xiaowho-portrait]')){
      if(img.getAttribute('src')!==portrait(key))img.setAttribute('src',portrait(key));
    }
    if(image)image.alt=`xiaowho · ${key==='ts'?'TS 黄色围巾':'KS 蓝色围巾'}`;
    if(button)button.title=`${key==='ts'?'TS 黄围巾':'KS 蓝围巾'} · 点一下打个招呼`;
    if(changed)nod();
  }
  if(button && greeting)button.addEventListener('click',()=>{
    clear();greeting.textContent=phrases[phrase++ % phrases.length];greeting.hidden=false;nod();
    hideTimer=setTimeout(clear,2800);
  });
  document.addEventListener('keydown',event=>{if(event.key==='Escape')clear();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)clear();});
  reduced.addEventListener('change',clear);
  let saved='ts';try{if(localStorage.getItem('yuandu.workspace')==='ks')saved='ks';}catch{}
  sync(saved);
  return {sync,portrait};
})();
