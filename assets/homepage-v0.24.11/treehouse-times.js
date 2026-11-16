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
      file: '../homepage-v0.24.0/illustrations/dawn.webp',
      zhAlt: '薄雾绕着高树的树根，小谁站在小木屋的门廊给花浇水。',
      enAlt: 'Morning mist hugs the tall tree while tiny Xiaowho waters flowers on the treehouse porch.'
    },
    day: {
      zh: '白天', en: 'Day',
      file: '../homepage-v0.23.3/assets/illustration/butterfly.webp',
      zhAlt: '十五厘米高的小谁在自己的树屋下，踏着落叶向一只蝴蝶伸手。',
      enAlt: 'Palm-sized Xiaowho steps along a fallen leaf and reaches toward a butterfly beneath its treehouse.'
    },
    dusk: {
      zh: '傍晚', en: 'Dusk',
      file: '../homepage-v0.24.0/illustrations/dusk.webp',
      zhAlt: '夕光擦过高树，树屋的灯刚亮，小谁坐在门廊画蝴蝶。',
      enAlt: 'The porch lamp comes on as Xiaowho sketches a butterfly in the last light.'
    },
    night: {
      zh: '夜晚', en: 'Night',
      file: '../homepage-v0.24.0/illustrations/night.webp',
      zhAlt: '夜里，树屋的暖窗照亮一幅蝴蝶画，暖米白的小谁在树下把草稿收进黄包。',
      enAlt: 'A warm window lights the butterfly drawing while ivory Xiaowho puts a draft into its yellow pouch.'
    },
    spring: {
      zh: '春天', en: 'Spring',
      file: '../homepage-v0.24.1/illustrations/spring.webp',
      zhAlt: '小谁站在大叶片上拿着一枝小花，一只蚂蚁从脚边爬过。',
      enAlt: 'Xiaowho stands on the broad leaf holding a flower as an ant passes by its feet.'
    },
    summer: {
      zh: '夏天', en: 'Summer',
      file: '../homepage-v0.24.1/illustrations/summer.webp',
      zhAlt: '小谁坐在树荫下，用叶子扇风，一只蜻蜓从旁边飞过。',
      enAlt: 'Xiaowho fans itself with a leaf in the shade while a dragonfly passes.'
    },
    autumn: {
      zh: '秋天', en: 'Autumn',
      file: '../homepage-v0.24.1/illustrations/autumn.webp',
      zhAlt: '小谁低头把一片落叶收进黄包。',
      enAlt: 'Xiaowho looks down and tucks an autumn leaf into its mustard pouch.'
    },
    winter: {
      zh: '冬天', en: 'Winter',
      file: '../homepage-v0.24.1/illustrations/winter.webp',
      zhAlt: '小谁围着砖红色围巾，在结霜的叶片上搓手取暖。',
      enAlt: 'Xiaowho wears a brick-red scarf and rubs its hands for warmth on the frosted leaf.'
    },
    wind: {
      zh: '刮风', en: 'Wind',
      file: 'illustrations/wind-hand-fix.webp',
      zhAlt: '小谁迎着风迈步，一手护住黄包，一手在身后保持平衡。',
      enAlt: 'Xiaowho leans into a gust, holding its pouch and balancing with the other arm.'
    },
    snow: {
      zh: '下雪', en: 'Snow',
      file: '../homepage-v0.24.1/illustrations/snow.webp',
      zhAlt: '围着砖红色围巾的小谁仰起头，双手接雪。',
      enAlt: 'Xiaowho wears a brick-red scarf and cups both hands to catch a snowflake.'
    },
    rain: {
      zh: '下雨', en: 'Rain',
      file: '../homepage-v0.24.1/illustrations/rain.webp',
      zhAlt: '小谁撑着叶伞，走过湿漉漉的叶片。',
      enAlt: 'Xiaowho steps across the wet leaf under a small leaf umbrella.'
    },
    sun: {
      zh: '晴天', en: 'Clear sky',
      file: '../homepage-v0.24.1/illustrations/sun.webp',
      zhAlt: '小谁迎着阳光伸懒腰，蝴蝶在一旁飞过。',
      enAlt: 'Xiaowho stretches in the sunlight as a butterfly flutters nearby.'
    }
  };
  const sequence = Object.keys(scenes);
  const scriptUrl = document.currentScript.src;
  // Calendar seasons at the treehouse, January through December.
  const seasonByMonth = [
    'winter', 'winter', 'spring', 'spring', 'spring', 'summer',
    'summer', 'summer', 'autumn', 'autumn', 'autumn', 'winter'
  ];
  const saturdayWeather = { spring: 'rain', summer: 'sun', autumn: 'wind', winter: 'snow' };
  let current = sceneAt(new Date());
  let switching = false;

  function sceneAt(date) {
    const hour = date.getHours();
    if (hour < 5 || hour >= 20) return 'night';
    if (hour < 9) return 'dawn';
    if (hour >= 17) return 'dusk';

    const weekday = date.getDay();
    if (weekday === 0) return 'day';
    const season = seasonByMonth[date.getMonth()];
    return weekday === 6 ? saturdayWeather[season] : season;
  }

  function nextScene() {
    return sequence[(sequence.indexOf(current) + 1) % sequence.length];
  }

  function updateLabels() {
    const english = document.documentElement.lang === 'en';
    const scene = scenes[current];
    const next = scenes[nextScene()];
    picture.alt = english ? scene.enAlt : scene.zhAlt;
    lantern.title = english ? 'Next scene: ' + next.en : '下一幕 · ' + next.zh;
    lantern.setAttribute('aria-label', english
      ? 'Treehouse scene: ' + scene.en + '. Next scene: ' + next.en + '.'
      : '当前插画：' + scene.zh + '。点灯查看下一幕：' + next.zh + '。');
  }

  function sceneUrl(scene) {
    return new URL(scenes[scene].file, scriptUrl).href;
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
