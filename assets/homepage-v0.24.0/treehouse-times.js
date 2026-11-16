'use strict';

(() => {
  const picture = new Image(1024, 1536);
  picture.id = 'treehouse-picture';
  picture.decoding = 'async';
  picture.fetchPriority = 'high';
  const lantern = document.getElementById('treehouse-lantern');
  const announcement = document.getElementById('treehouse-announcement');
  const vignette = document.getElementById('treehouse-vignette');
  const plate = document.getElementById('treehouse-plate');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const scenes = {
    dawn: {
      zh: '清晨', en: 'Dawn',
      zhAlt: '薄雾绕着高树的树根，小谁站在小木屋的门廊给花浇水。',
      enAlt: 'Morning mist hugs the tall tree while tiny Xiaowho waters flowers on the treehouse porch.'
    },
    day: {
      zh: '白天', en: 'Day',
      zhAlt: '十五厘米高的小谁在自己的树屋下，踏着落叶向一只蝴蝶伸手。',
      enAlt: 'Palm-sized Xiaowho steps along a fallen leaf and reaches toward a butterfly beneath its treehouse.'
    },
    dusk: {
      zh: '傍晚', en: 'Dusk',
      zhAlt: '夕光擦过高树，树屋的灯刚亮，小谁坐在门廊画蝴蝶。',
      enAlt: 'The porch lamp comes on as Xiaowho sketches a butterfly in the last light.'
    },
    night: {
      zh: '夜晚', en: 'Night',
      zhAlt: '夜里，树屋的暖窗照亮一幅蝴蝶画，暖米白的小谁在树下把草稿收进黄包。',
      enAlt: 'A warm window lights the butterfly drawing while ivory Xiaowho puts a draft into its yellow pouch.'
    }
  };
  const sequence = Object.keys(scenes);
  const assetRoot = new URL('illustrations/', document.currentScript.src);
  const dayImage = new URL('../homepage-v0.23.3/assets/illustration/butterfly.webp', document.currentScript.src).href;
  const hour = new Date().getHours();
  let current = hour < 5 || hour >= 20 ? 'night' : hour < 9 ? 'dawn' : hour < 17 ? 'day' : 'dusk';
  let switching = false;

  function nextScene() {
    return sequence[(sequence.indexOf(current) + 1) % sequence.length];
  }

  function updateLabels() {
    const english = document.documentElement.lang === 'en';
    const scene = scenes[current];
    const next = scenes[nextScene()];
    picture.alt = english ? scene.enAlt : scene.zhAlt;
    lantern.title = english ? 'See ' + next.en.toLowerCase() : '看' + next.zh + '的树屋';
    lantern.setAttribute('aria-label', english
      ? scene.en + ' at the treehouse. Show ' + next.en.toLowerCase()
      : '现在是' + scene.zh + '，查看' + next.zh + '的树屋');
  }

  function sceneUrl(scene) {
    return scene === 'day' ? dayImage : new URL(scene + '.webp', assetRoot).href;
  }

  function show(scene) {
    current = scene;
    const url = sceneUrl(scene);
    document.body.dataset.scene = scene;
    plate.dataset.scene = scene;
    picture.src = url;
    plate.style.setProperty('--scene-image', 'url("' + url + '")');
    updateLabels();
  }

  async function advance() {
    if (switching) return;
    switching = true;
    const next = nextScene();
    const loaded = new Image();
    loaded.src = sceneUrl(next);
    let previous;
    try {
      await loaded.decode();
      if (!motion.matches && picture.currentSrc) {
        previous = plate.cloneNode(true);
        previous.removeAttribute('id');
        previous.querySelector('img').removeAttribute('id');
        previous.setAttribute('aria-hidden', 'true');
        plate.after(previous);
        vignette.classList.add('is-switching');
      }
      show(next);
      if (previous) {
        const options = {duration:420, easing:'ease-out'};
        const incoming = plate.animate([{opacity:0}, {opacity:1}], options);
        const outgoing = previous.animate([{opacity:1}, {opacity:0}], options);
        await Promise.all([incoming.finished, outgoing.finished]);
      }
      announcement.textContent = scenes[current][document.documentElement.lang === 'en' ? 'en' : 'zh'];
    } catch {
      announcement.textContent = document.documentElement.lang === 'en'
        ? 'The next scene could not load. Activate the lantern to retry.'
        : '这一幕暂时没有加载出来，可以点灯重试。';
    } finally {
      previous?.remove();
      vignette.classList.remove('is-switching');
      switching = false;
    }
  }

  picture.addEventListener('load', () => { lantern.hidden = false; });
  picture.addEventListener('error', () => {
    if (current !== 'day') show('day');
  });
  lantern.addEventListener('click', advance);
  document.addEventListener('home-language-change', () => queueMicrotask(updateLabels));
  document.addEventListener('DOMContentLoaded', updateLabels, {once:true});
  show(current);
  plate.prepend(picture);
})();
