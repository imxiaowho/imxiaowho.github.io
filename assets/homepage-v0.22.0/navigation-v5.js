'use strict';

(() => {
  const copy={
    zh:{company:'OPC',companyName:'元舵 Tunenomics',about:'关于',description:'元舵是我的 OPC 公司，在这里继续探索 AI 与独立开发。',visit:'访问官网'},
    en:{company:'OPC',companyName:'Tunenomics',about:'About',description:'Tunenomics is my OPC company, exploring AI and independent development.',visit:'Visit site'}
  };
  function labels(){
    const en=document.documentElement.lang==='en',text=copy[en?'en':'zh'];
    document.querySelectorAll('[data-nav-copy]').forEach(element=>{element.textContent=text[element.dataset.navCopy];});
    document.querySelector('.company-name')?.closest('h2').setAttribute('lang',en?'en':'zh-CN');
    document.querySelector('[data-i18n="tab.vbc"]').textContent=en?'VBC':'前端词典';
    document.querySelector('meta[name="description"]').content=en?'Chen Zhen’s projects: Tunenomics, Skills, World Comics and VBC. A little better, every day.':'陈震的个人作品与探索：元舵、Skills、世界小剧场与前端词典。每一天，进步一点点。';
  }
  document.addEventListener('home-language-change',labels);
  labels();
})();
