'use strict';
(() => {
  const image=document.getElementById('treehouse-picture');
  const surface=document.getElementById('surface-texture');
  const buttons=[...document.querySelectorAll('[data-material-choice]')];
  function material(value){surface.dataset.material=value;buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.materialChoice===value)));}
  buttons.forEach(button=>button.addEventListener('click',()=>material(button.dataset.materialChoice)));
  function labels(){
    const en=document.documentElement.lang==='en';
    document.querySelector('[data-i18n="tab.skills"]').textContent='Skills';
    document.querySelector('[data-i18n="tab.comics"]').textContent=en?'World Comics':'世界小剧场';
    document.querySelector('meta[name="description"]').content=en?'Chen Zhen’s projects: Skills, World Comics and the UI Dictionary. A little better, every day.':'陈震的个人作品：Skills、世界小剧场与前端词典。每一天，进步一点点。';
    image.alt=en?'Palm-sized Xiaowho steps along a fallen leaf and reaches toward a butterfly beneath its treehouse.':'十五厘米高的小谁在自己的树屋下，踏着落叶向一只蝴蝶伸手。';
  }
  function ready(){document.body.dataset.artReady=String(image.complete&&image.naturalWidth>0);}
  image.addEventListener('load',ready);image.addEventListener('error',ready);
  document.addEventListener('home-language-change',labels);
  material('ink');labels();ready();
})();
