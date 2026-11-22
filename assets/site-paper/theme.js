'use strict';

(() => {
  const root = document.documentElement;
  const storageKey = 'chen-reading-theme';
  const queryTheme = new URLSearchParams(location.search).get('theme');
  const isTheme = value => value === 'light' || value === 'dark';
  const embedded = window.top !== window || new URLSearchParams(location.search).get('view') === 'compact';
  const reading = ['reading', 'playground'].includes(root.dataset.sitePage);

  if (embedded) root.setAttribute('data-site-embedded', '');

  function storedTheme() {
    try { return localStorage.getItem(storageKey); }
    catch { return null; }
  }

  function refreshControls() {
    const english = root.lang === 'en';
    const dark = root.dataset.siteTheme === 'dark';
    for (const button of document.querySelectorAll('[data-site-theme-toggle]')) {
      const label = button.querySelector('[data-site-theme-label]') || button;
      const title = english ? (dark ? 'Light' : 'Dark') : (dark ? '浅底' : '深底');
      if (label.textContent !== title) label.textContent = title;
      button.setAttribute('aria-pressed', String(dark));
      button.hidden = false;
    }
  }

  function apply(theme) {
    const changed = root.dataset.siteTheme !== theme;
    root.dataset.siteTheme = theme;
    if (reading) root.dataset.theme = theme;
    if (!embedded) {
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.content = theme === 'dark' ? '#252721' : '#f8f8f5';
    }
    refreshControls();
    if (changed) document.dispatchEvent(new Event('site-theme-change'));
  }

  function choose(theme) {
    try { localStorage.setItem(storageKey, theme); }
    catch { /* The choice still applies to the current page. */ }
    const url = new URL(location.href);
    if (url.searchParams.has('theme')) {
      url.searchParams.set('theme', theme);
      history.replaceState(history.state, '', url);
    }
    apply(theme);
  }

  document.addEventListener('DOMContentLoaded', () => {
    refreshControls();
    for (const button of document.querySelectorAll('[data-site-theme-toggle]')) {
      button.addEventListener('click', () => choose(root.dataset.siteTheme === 'dark' ? 'light' : 'dark'));
    }
    if (document.querySelector('[data-site-theme-toggle]')) {
      new MutationObserver(refreshControls).observe(root, { attributes: true, attributeFilter: ['lang'] });
    }
  });
  window.addEventListener('pageshow', event => {
    const saved = storedTheme();
    if (event.persisted && isTheme(saved)) apply(saved);
  });
  window.addEventListener('storage', event => {
    if (event.key === storageKey) apply(isTheme(event.newValue) ? event.newValue : 'light');
  });

  const saved = storedTheme();
  apply(isTheme(queryTheme) ? queryTheme : isTheme(saved) ? saved : 'light');
})();
