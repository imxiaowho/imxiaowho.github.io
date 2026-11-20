'use strict';

(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const languageButton = document.querySelector('#reading-language');
  const themeButton = document.querySelector('#reading-theme');
  const lampButton = document.querySelector('#reading-lamp');
  const light = document.querySelector('.reading-light');
  const portrait = document.querySelector('[data-portrait]');
  const title = document.title;
  const options = new URLSearchParams(location.search);
  const languageKey = 'xiaowho.home-language.v1';
  const themeKey = 'chen-reading-theme';
  const lampKey = 'xiaowho.home-paper.v1';
  let language = options.get('lang') || recall(languageKey);
  let dark = (options.get('theme') || recall(themeKey)) === 'dark';
  let lampOn = recall(lampKey) !== 'off';

  function recall(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  }

  function save(key, value) {
    try { localStorage.setItem(key, value); } catch { /* Session preference. */ }
  }

  const messages = [
    ['[data-en]', 'en', null], ['[data-en-alt]', 'enAlt', 'alt'],
    ['[data-en-label]', 'enLabel', 'aria-label'],
  ].flatMap(([selector, key, attribute]) => [...document.querySelectorAll(selector)].map(node => ({
    node, attribute, zh: attribute ? node.getAttribute(attribute) : node.textContent, en: node.dataset[key],
  })));

  function applyPreferences() {
    const english = language === 'en';
    root.lang = english ? 'en' : 'zh-CN';
    root.dataset.theme = dark ? 'dark' : 'light';
    document.title = english ? root.dataset.englishTitle : title;
    document.querySelector('meta[name="theme-color"]').content = dark ? '#252721' : '#f6f5f1';
    for (const { node, attribute, zh, en } of messages) {
      const value = english ? en : zh;
      if (attribute) node.setAttribute(attribute, value);
      else node.textContent = value;
    }
    languageButton.querySelector('span').textContent = english ? '中文' : 'EN';
    languageButton.setAttribute('aria-label', english ? '切换为中文' : 'Switch to English');
    themeButton.querySelector('span').textContent = dark ? (english ? 'Light' : '浅底') : (english ? 'Dark' : '深底');
    themeButton.setAttribute('aria-pressed', String(dark));
    if (portrait) {
      const source = portrait.dataset[dark ? 'dark' : 'light'];
      if (portrait.getAttribute('src') !== source) portrait.src = source;
      portrait.alt = dark ? portrait.dataset[english ? 'darkEn' : 'darkZh'] : portrait.dataset[english ? 'lightEn' : 'lightZh'];
    }
    document.dispatchEvent(new CustomEvent('home-language-change', { detail: english ? 'en' : 'zh' }));
  }

  function resetLight() { light.dataset.on = 'false'; }
  function configureLight() {
    lampButton.hidden = !fine.matches;
    lampButton.disabled = reduced.matches;
    lampButton.setAttribute('aria-pressed', String(lampOn && !reduced.matches));
    resetLight();
  }

  window.addEventListener('pointermove', event => {
    if (!fine.matches || reduced.matches || !lampOn || event.pointerType === 'touch') return;
    light.style.setProperty('--light-x', event.clientX + 'px');
    light.style.setProperty('--light-y', event.clientY + 'px');
    light.dataset.on = 'true';
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', resetLight);
  window.addEventListener('blur', resetLight);
  document.addEventListener('visibilitychange', resetLight);
  for (const query of [reduced, fine]) query.addEventListener('change', configureLight);

  languageButton.addEventListener('click', () => {
    language = language === 'en' ? 'zh' : 'en';
    save(languageKey, language);
    applyPreferences();
  });
  themeButton.addEventListener('click', () => {
    dark = !dark;
    save(themeKey, dark ? 'dark' : 'light');
    applyPreferences();
  });
  lampButton.addEventListener('click', () => {
    lampOn = !lampOn;
    save(lampKey, lampOn ? 'on' : 'off');
    configureLight();
  });
  applyPreferences();
  configureLight();
  languageButton.hidden = false;
  themeButton.hidden = false;

  function loadArt(figure) {
    const img = figure.querySelector('img[data-src]');
    if (!img) return;
    img.srcset = img.dataset.srcset;
    img.src = img.dataset.src;
    delete img.dataset.src;
    delete img.dataset.srcset;
  }
  const figures = [...document.querySelectorAll('.chapter-art')];
  if ('IntersectionObserver' in window) {
    const art = new IntersectionObserver(changes => {
      for (const change of changes) {
        if (!change.isIntersecting) continue;
        loadArt(change.target);
        art.unobserve(change.target);
      }
    }, { rootMargin: '170px 0px' });
    for (const figure of figures) art.observe(figure);
  } else {
    for (const figure of figures) loadArt(figure);
  }

  const links = [...document.querySelectorAll('.chapter-index a')];
  function selectChapter() {
    const hash = location.hash || '#chapter-1';
    for (const link of links) {
      if (link.hash === hash) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  }
  addEventListener('hashchange', selectChapter);
  selectChapter();
})();
