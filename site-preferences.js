/* Shared reading preferences and reversible translation of static/dynamic copy. */
(() => {
  const root = document.documentElement;
  const query = new URLSearchParams(location.search);
  const read = (key, fallback) => { try { return localStorage.getItem(key) || fallback; } catch { return fallback; } };
  const save = (key, value) => { try { localStorage.setItem(key, value); } catch { /* Preferences remain usable for this page. */ } };
  let language = query.get('lang') || root.dataset.sceneLanguage || read('chen-language', 'zh');
  language = language === 'en' ? 'en' : 'zh';
  let theme = query.get('theme') || root.dataset.sceneTheme || read('chen-reading-theme', 'light');
  theme = theme === 'dark' ? 'dark' : 'light';
  root.dataset.theme = theme;
  root.lang = language === 'en' ? 'en' : 'zh-CN';
  document.addEventListener('DOMContentLoaded', async () => {
    const script = document.querySelector('script[src*="site-preferences.js"]');
    const dictionary = await fetch(new URL('site-translations.json', script.src)).then(response => response.json());
    const phrases = Object.keys(dictionary).sort((a, b) => b.length - a.length);
    const originals = new WeakMap();
    const translate = value => {
      if (dictionary[value.trim()]) return value.replace(value.trim(), dictionary[value.trim()]);
      let result = value;
      for (const phrase of phrases) result = result.split(phrase).join(dictionary[phrase]);
      return result;
    };
    const controls = document.createElement('div');
    controls.className = 'reading-controls';
    controls.innerHTML = '<button type="button" id="language-toggle">EN</button>';
    const header = document.querySelector('header');
    header.append(controls);
    let themeButton = document.querySelector('#theme-toggle, #theme');
    if (!themeButton) {
      themeButton = document.createElement('button');
      themeButton.type = 'button'; themeButton.textContent = '◐';
    }
    controls.append(themeButton);
    const languageButton = document.getElementById('language-toggle');
    function update() {
      root.lang = language === 'en' ? 'en' : 'zh-CN';
      root.dataset.theme = theme;
      languageButton.textContent = language === 'en' ? '中文' : 'EN';
      languageButton.setAttribute('aria-label', language === 'en' ? 'Switch to Chinese' : 'Switch to English');
      themeButton.setAttribute('aria-pressed', String(theme === 'dark'));
      themeButton.setAttribute('aria-label', language === 'en' ? (theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode') : (theme === 'dark' ? '切换浅色阅读模式' : '切换深色阅读模式'));
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.content = theme === 'dark' ? '#202420' : '#fcfcf9';
      const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (node.parentElement.closest('script, style, pre, code, [data-no-translate], .reading-controls')) continue;
        const previous = originals.get(node);
        const source = previous && node.data === previous.output ? previous.source : node.data;
        const output = language === 'en' ? translate(source) : source;
        originals.set(node, {source, output});
        if (node.data !== output) node.data = output;
      }
      document.querySelectorAll('[aria-label], [alt], meta[name="description"]').forEach(element => {
        const values = originals.get(element) || {};
        for (const attr of ['aria-label', 'alt', 'content']) {
          if (!element.hasAttribute(attr) || element.closest('.reading-controls, [data-no-translate]')) continue;
          const current = element.getAttribute(attr), previous = values[attr];
          const source = previous && current === previous.output ? previous.source : current;
          const output = language === 'en' ? translate(source) : source;
          values[attr] = {source, output};
          if (current !== output) element.setAttribute(attr, output);
        }
        originals.set(element, values);
      });
    }
    const announce = () => window.dispatchEvent(new CustomEvent('site-preferences-change', {detail:{language, theme}}));
    languageButton.addEventListener('click', () => { language = language === 'en' ? 'zh' : 'en'; save('chen-language', language); update(); announce(); window.dispatchEvent(new Event('resize')); });
    themeButton.addEventListener('click', () => { theme = theme === 'dark' ? 'light' : 'dark'; save('chen-reading-theme', theme); update(); announce(); });
    let disposed = false;
    const observer = new MutationObserver(() => { observer.disconnect(); if (disposed || !root.isConnected) return; update(); observe(); });
    const observe = () => { if (!disposed && root.isConnected) observer.observe(root, {subtree:true, childList:true, characterData:true, attributes:true, attributeFilter:['aria-label', 'alt']}); };
    window.addEventListener('pagehide', () => { disposed = true; observer.disconnect(); });
    window.addEventListener('pageshow', event => { if (event.persisted) { disposed = false; observe(); } });
    update(); observe(); announce();
  });
})();
