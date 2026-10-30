/* Original-site scenes: assets, markup, styles and behavior are reused verbatim. */
(() => {
  'use strict';
  const assetBase=new URL('.',document.currentScript.src),siteBase=new URL('../',assetBase);
  const home=['intro','expression','hover','scroll-exit'];
  const story=['greet','footsteps','progress','unfold','smooth'];
  const selectors={intro:'.site-welcome img',expression:'.mascot-stage image',hover:'.cards>.card:first-child img','scroll-exit':'.cards>.card:first-child img',idle:'.desk-buddy img',greet:'.chapter-1 img',footsteps:'.chapter-1 img',progress:'.chapter-visual img',smooth:'.chapter-visual img'};
  const pages=new Map(),resources=new Map();
  const get=url=>{const key=String(url);if(!resources.has(key))resources.set(key,fetch(key).then(r=>{if(!r.ok)throw new Error('Resource '+r.status);return r.text();}));return resources.get(key);};
  const page=id=>new URL(home.includes(id)?'index.html':story.includes(id)?'workbench-footsteps.html':'workbench-playground.html',siteBase);
  async function build(id,options={}){
    const url=page(id);if(!pages.has(url.href))pages.set(url.href,get(url));
    const doc=new DOMParser().parseFromString(await pages.get(url.href),'text/html');
    doc.querySelectorAll('script[src*="bookshelf.js"],link[href*="bookshelf.css"],script[src*="notebook-reference.js"],link[href*="notebook-reference.css"]').forEach(n=>n.remove());
    if(id==='footsteps')doc.querySelector('script[src*="footsteps-demo.js"]')?.remove();
    const keep=new Set(selectors[id]?[...doc.querySelectorAll(selectors[id])]:[]);
    doc.querySelectorAll('img,image').forEach(n=>{if(!keep.has(n)){n.removeAttribute('src');n.removeAttribute('href');n.removeAttribute('loading');}else{n.setAttribute('loading','eager');}});
    const base=doc.createElement('base');base.href=url.href;doc.head.prepend(base);
    doc.documentElement.dataset.motionScene=id;doc.documentElement.dataset.sceneLanguage=options.lang==='en'?'en':'zh';doc.documentElement.dataset.sceneTheme=options.theme==='dark'?'dark':'light';
    if(options.presentation==='discovery')doc.documentElement.dataset.motionPresentation='discovery';
    const host=doc.createElement('script');host.src=new URL('motion-scene-host.js?v=20261030-selected10',assetBase).href;host.defer=true;doc.head.append(host);
    return {doc,url};
  }
  function mount(host,id,options={}){
    let dead=false,loaded=false,desired='idle';
    host.classList.add('original-scene');host.replaceChildren();
    const frame=document.createElement('iframe');frame.title=(options.lang==='en'?'Original site demo: ':'原站组件演示：')+id;frame.loading='lazy';frame.referrerPolicy='same-origin';host.append(frame);
    const send=(action,value)=>frame.contentWindow?.postMessage({kind:'motion-scene-command',action,value},'*');
    frame.addEventListener('load',()=>{loaded=true;if(options.reduced)send('reduce',true);if(desired==='play')send('play');});
    build(id,options).then(({doc})=>{if(!dead)frame.srcdoc='<!doctype html>'+doc.documentElement.outerHTML;}).catch(()=>{if(!dead){host.textContent=options.lang==='en'?'Preview could not load. Open the original page below.':'演示未能加载，请使用下方的原站入口。';}});
    return {play(){desired='play';if(loaded)send('play');},pause(){desired='pause';if(loaded)send('pause');},destroy(){dead=true;frame.remove();},theme(value){if(loaded)send('theme',value);}};
  }
  const dataCache=new Map();
  async function dataURL(url){
    if(!dataCache.has(url))dataCache.set(url,fetch(url).then(r=>{if(!r.ok)throw new Error('Asset '+r.status);return r.blob();}).then(blob=>new Promise(resolve=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.readAsDataURL(blob);})));return dataCache.get(url);
  }
  async function inlineCSS(css,base){
    const matches=[...css.matchAll(/url\(["']?([^"')]+)["']?\)/g)];
    const values=await Promise.all(matches.map(async m=>{if(m[1].startsWith('data:')||m[1].startsWith('#'))return m[0];return 'url("'+await dataURL(new URL(m[1],base).href)+'")';}));
    for(let i=0;i<matches.length;i++)css=css.replace(matches[i][0],values[i]);return css;
  }
  async function standalone(id,options={}){
    const {doc,url}=await build(id,options);doc.documentElement.setAttribute('data-standalone','');
    for(const link of [...doc.querySelectorAll('link')]){
      if(link.rel==='stylesheet'){const address=new URL(link.getAttribute('href'),url),style=doc.createElement('style');style.textContent=await inlineCSS(await get(address),address);link.replaceWith(style);}else link.remove();
    }
    for(const style of doc.querySelectorAll('style')){if(!style.textContent.includes('data:'))style.textContent=await inlineCSS(style.textContent,url);}
    for(const image of doc.querySelectorAll('img[src],image[href]')){const attr=image.hasAttribute('src')?'src':'href';image.setAttribute(attr,await dataURL(new URL(image.getAttribute(attr),url).href));}
    for(const script of doc.querySelectorAll('script[src]')){
      const address=new URL(script.getAttribute('src'),url);let code=await get(address);
      if(address.pathname.includes('site-preferences.js')){
        const dict=await get(new URL('site-translations.json',assetBase));
        code=code.replace("const dictionary = await fetch(new URL('site-translations.json', script.src)).then(response => response.json());",'const dictionary = '+dict+';');
      }
      script.removeAttribute('src');script.removeAttribute('defer');script.textContent=code;
    }
    // Inline deferred scripts after the original page has finished parsing.
    const scripts=[...doc.querySelectorAll('script')];scripts.forEach(s=>{s.remove();doc.body.append(s);});
    const scene=doc.body.querySelector('script:last-child');
    // The scene adapter must run after the original initialization and DOMContentLoaded.
    if(scene?.textContent.includes('Presentation adapter'))scene.textContent="addEventListener('DOMContentLoaded',()=>{\n"+scene.textContent+'\n});';
    doc.querySelector('base')?.remove();
    return '<!doctype html>\n'+doc.documentElement.outerHTML;
  }
  window.MotionRecipes={css:'',mount,standalone};
})();
