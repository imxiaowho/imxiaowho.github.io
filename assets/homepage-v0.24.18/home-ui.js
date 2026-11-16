'use strict';

(() => {
  // The time-driven atmosphere controller owns its localized motion label.
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const canMove = () => fine.matches && !reduced.matches;
  const tabBar = document.querySelector('.category-tabs[role="tablist"]');
  const tabs = [...tabBar.querySelectorAll('[role="tab"]')];
  const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
  const categories = tabs.map(tab => tab.dataset.category);
  const marker = document.getElementById('tab-marker');
  const effects = window.VBCEffects.mount(document);
  let active = -1, panelMotion, routedURL;

  function positionMarker() {
    window.VBCEffects.placeMarker(tabBar, tabs[active], marker);
    effects.position();
  }

  function readRoute() {
    const {searchParams, hash} = new URL(location.href);
    const requested = searchParams.get('section');
    return {
      section: categories.includes(requested) ? requested : 'company',
      issue: searchParams.get('issue'),
      page: searchParams.get('page'),
      hash,
    };
  }

  function updateTitle() {
    if (active < 0) return;
    const category = categories[active];
    document.title = category === 'company' ? window.homeLocale.t('page.title')
      : tabs[active].textContent.trim() + ' · imxiaowho';
  }

  function applyRoute(reason, focusTab = false) {
    const route = readRoute();
    const index = categories.indexOf(route.section);
    const changesSection = index !== active;
    const heldFocus = panels[active]?.contains(document.activeElement)
      || (active >= 0 && tabBar.contains(document.activeElement));
    if (changesSection) {
      panelMotion?.cancel();
      active = index;
      for (const [n, tab] of tabs.entries()) {
        const selected = n === active;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
        panels[n].hidden = !selected;
      }
      positionMarker();
      if (reason === 'tab' && !reduced.matches) {
        panelMotion = panels[active].animate(
          [{opacity: .65, transform: 'translateY(5px)'}, {opacity: 1, transform: 'none'}],
          {duration: 200, easing: 'cubic-bezier(.22,.61,.36,1)'}
        );
      }
    }
    if (focusTab || (reason === 'history' && changesSection && heldFocus)) {
      tabs[active].focus({preventScroll: true});
    }

    const target = document.getElementById(route.hash.slice(1));
    if (target && panels[active].contains(target)) {
      if (target.matches('#panel-vbc .vbc-entry')) target.open = true;
      requestAnimationFrame(() => {
        if (!panels[active].hidden && location.hash === route.hash && panels[active].contains(target)) {
          target.scrollIntoView({block: 'nearest'});
        }
      });
    }
    updateTitle();
    routedURL = location.href;
    document.dispatchEvent(new CustomEvent('home-route-change', {detail: {...route, reason}}));
  }

  function go(section, {issue, page, reason = 'tab', focusTab = false} = {}) {
    const route = new URL(location.href);
    route.hash = '';
    route.searchParams.delete('intro');
    if (section === 'company') route.searchParams.delete('section');
    else route.searchParams.set('section', section);
    for (const [key, value] of [['issue', issue], ['page', page]]) {
      if (section === 'comics' && value != null) route.searchParams.set(key, value);
      else route.searchParams.delete(key);
    }
    if (route.href !== location.href) history.pushState(null, '', route);
    applyRoute(reason, focusTab);
  }

  window.homeRouter = {read: readRoute, go};
  addEventListener('popstate', () => applyRoute('history'));
  addEventListener('hashchange', () => {
    if (routedURL !== location.href) applyRoute('hash');
  });
  tabs.forEach((tab, index) => {
    const activate = (next, focus) => {
      if (next !== active) go(categories[next], {focusTab: focus});
    };
    tab.addEventListener('click', () => activate(index, false));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        activate(next, true);
      }
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
    document.body.dataset.automaticMotion = available && !optedOut ? 'on' : 'off';
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
  document.addEventListener('home-language-change', () => {
    updateTitle();
    requestAnimationFrame(positionMarker);
  });
  applyRoute('initial');
  configure();
})();
