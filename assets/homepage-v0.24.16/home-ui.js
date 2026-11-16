'use strict';

(() => {
  // The time-driven atmosphere controller owns its localized motion label.
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const canMove = () => fine.matches && !reduced.matches;
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const panels = [...document.querySelectorAll('[role="tabpanel"]')];
  const tabBar = document.querySelector('.category-tabs');
  const marker = document.getElementById('tab-marker');
  const effects = window.VBCEffects.mount(document);
  let active = 0, panelMotion;

  function positionMarker() {
    window.VBCEffects.placeMarker(tabBar, tabs[active], marker);
    effects.position();
  }

  function selectTab(index, focus = false, animate = true) {
    panelMotion?.cancel();
    active = index;
    tabs.forEach((tab, i) => {
      const selected = i === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[i].hidden = !selected;
    });
    positionMarker();
    if (animate && !reduced.matches) {
      panelMotion = panels[index].animate(
        [{opacity: .65, transform: 'translateY(5px)'}, {opacity: 1, transform: 'translateY(0)'}],
        {duration: 200, easing: 'cubic-bezier(.22,.61,.36,1)'}
      );
    }
    if (focus) tabs[index].focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTab(index));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); selectTab(next, true); }
    });
  });

  const light = document.getElementById('pointer-light');
  const paper = document.getElementById('surface-texture');
  const toggle = document.getElementById('background-motion');
  const preferenceKey = 'xiaowho.home-paper.v1';
  let optedOut = false;
  try { optedOut = localStorage.getItem(preferenceKey) === 'off'; } catch { /* Session-only preference. */ }
  let enabled = false, frame = 0, previous = 0, renderCount = 0;
  let x = 0, y = 0, targetX = 0, targetY = 0;
  function paint() {
    light.style.setProperty('--light-x', x.toFixed(2) + 'px');
    light.style.setProperty('--light-y', y.toFixed(2) + 'px');
    light.dataset.x = x.toFixed(2); light.dataset.y = y.toFixed(2);
    light.dataset.renderCount = String(++renderCount);
    paper.style.setProperty('--paper-x', (-x * .035).toFixed(2) + 'px');
    paper.style.setProperty('--paper-y', (-y * .035).toFixed(2) + 'px');
  }
  function animateLight(now) {
    frame = 0;
    if (!enabled || document.hidden) return;
    const dt = Math.min(40, Math.max(4, now - previous));
    previous = now;
    const ease = 1 - Math.exp(-dt / 190);
    x += (targetX - x) * ease; y += (targetY - y) * ease;
    if (Math.abs(targetX - x) + Math.abs(targetY - y) < .1) {
      x = targetX; y = targetY; light.dataset.state = 'idle'; paint(); return;
    }
    light.dataset.state = 'moving'; paint();
    frame = requestAnimationFrame(animateLight);
  }
  function wake() {
    if (enabled && !frame && !document.hidden) {
      previous = performance.now(); frame = requestAnimationFrame(animateLight);
    }
  }
  function resetLight() {
    cancelAnimationFrame(frame); frame = 0;
    x = y = targetX = targetY = 0;
    light.style.setProperty('--light-visible', '0');
    light.dataset.state = enabled ? 'idle' : 'static';
    paint();
  }
  function resetFeedback() {
    effects.reset(); panelMotion?.cancel();
  }
  function configure() {
    resetLight(); resetFeedback();
    const available = !reduced.matches;
    enabled = canMove() && !optedOut;
    light.dataset.enabled = String(enabled);
    light.dataset.state = enabled ? 'idle' : 'static';
    toggle.disabled = !available;
    toggle.setAttribute('aria-pressed', String(available && !optedOut));
    // Coarse pointers can play ambient fog; the label is synchronized separately.
  }
  addEventListener('pointermove', event => {
    if (!enabled || event.pointerType === 'touch') return;
    const maxX = Math.min(320, innerWidth * .36), maxY = Math.min(240, innerHeight * .3);
    targetX = Math.max(-maxX, Math.min(maxX, (event.clientX - innerWidth / 2) * .8));
    targetY = Math.max(-maxY, Math.min(maxY, (event.clientY - innerHeight / 2) * .8));
    light.style.setProperty('--light-visible', '1');
    wake();
  }, {passive: true});
  function release() { resetLight(); resetFeedback(); }
  document.documentElement.addEventListener('pointerleave', release);
  addEventListener('pointercancel', release);
  addEventListener('blur', release);
  addEventListener('resize', () => { release(); positionMarker(); }, {passive: true});
  document.addEventListener('visibilitychange', () => {
    release();
    light.dataset.state = document.hidden ? 'paused' : enabled ? 'idle' : 'static';
  });
  for (const query of [fine, reduced]) query.addEventListener('change', configure);
  toggle.addEventListener('click', () => {
    optedOut = !optedOut;
    try { localStorage.setItem(preferenceKey, optedOut ? 'off' : 'on'); } catch { /* Session-only preference. */ }
    configure();
  });
  document.fonts.ready.then(positionMarker);
  document.addEventListener('home-language-change', () => requestAnimationFrame(positionMarker));
  const section = new URLSearchParams(location.search).get('section');
  const initialTab = section === 'vbc' ? tabs.findIndex(tab => tab.id === 'tab-vbc') : 0;
  selectTab(Math.max(0, initialTab), false, false);
  configure();

  function revealLinkedExample() {
    const id = location.hash.slice(1);
    const entry = document.getElementById(id);
    if (new URLSearchParams(location.search).get('section') !== 'vbc' || !entry?.matches('#panel-vbc .vbc-entry')) return;
    selectTab(tabs.findIndex(tab => tab.id === 'tab-vbc'), false, false);
    entry.open = true;
    document.fonts.ready.then(() => requestAnimationFrame(() => entry.scrollIntoView({block: 'nearest'})));
  }
  addEventListener('hashchange', revealLinkedExample);
  revealLinkedExample();
})();
