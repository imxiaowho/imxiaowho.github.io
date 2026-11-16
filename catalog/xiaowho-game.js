'use strict';
// One quiet visitor, scoped to the current element gallery; no animation loop.
(() => {
  const $ = id => document.getElementById(id);
  const toggle = $('xiaowho-play'), shuffle = $('xiaowho-rehide');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const preference = 'vbc.xiaowho-hide-and-seek.v1';
  let enabled = true, found = 0, gallery = null, cards = [], pet = null;
  let current = null, previous = '', timer = 0, phase = 'hidden', observer = null;
  try { enabled = localStorage.getItem(preference) !== 'off'; } catch { /* Session-only choice. */ }

  function clearTimer() { clearTimeout(timer); timer = 0; }
  function editing() {
    return Boolean(document.activeElement?.matches('input[type=search],input[type=text],textarea,select,[contenteditable=true]'));
  }
  function available() {
    return enabled && gallery?.isConnected && pet && !$('home').hidden && !document.hidden && document.hasFocus()
      && !$('pointer-panel').matches(':popover-open') && !editing();
  }
  function updateSettings() {
    if (toggle) toggle.checked = enabled;
    $('xiaowho-found').textContent = '找到 ' + found + ' 次';
    $('xiaowho-game-hint').textContent = !enabled ? '已关闭，随时可以叫我出来。' : !cards.length ? '切回元素页，就能找到我。'
      : reduced.matches ? '减少动态：静静待着，找到后再换位置。' : '偶尔从卡片上沿探头，点到我就换个地方。';
    if (shuffle) shuffle.disabled = !enabled || !cards.length;
  }
  function restoreFocus() {
    if (pet && document.activeElement === pet && document.hasFocus()) current?.querySelector('.element-open')?.focus({ preventScroll: true });
  }
  function hideNow() {
    clearTimer(); phase = 'hidden'; restoreFocus();
    if (pet) { observer?.unobserve(pet); pet.hidden = true; pet.remove(); }
    current?.classList.remove('xiaowho-host'); current = null; phase = 'hidden';
  }
  function queue(delay, explicit = false) {
    clearTimer();
    if (!available() || reduced.matches && !explicit) return;
    timer = setTimeout(() => { timer = 0; appear(); }, delay);
  }
  const quietPause = () => 11000 + Math.random() * 7000;
  function visibleCards() {
    const top = Math.max(8, document.querySelector('.app-header').getBoundingClientRect().bottom + 8);
    const rise = parseFloat(getComputedStyle(gallery).getPropertyValue('--xiaowho-rise')) || 30;
    return cards.filter(card => {
      const box = card.getBoundingClientRect();
      return box.width >= 96 && box.top - rise >= top && box.top + 14 < innerHeight - 12 && box.left >= 0 && box.right <= innerWidth;
    });
  }
  function leave() {
    if (!current || phase === 'caught' || document.activeElement === pet) return;
    clearTimer();
    if (reduced.matches) { hideNow(); return; }
    phase = 'leaving'; pet.dataset.state = phase;
    timer = setTimeout(() => { hideNow(); queue(quietPause()); }, 240);
  }
  function appear() {
    if (!available()) return;
    const visible = visibleCards();
    if (!visible.length) return; // Scroll/focus events resume; no offscreen polling.
    const alternatives = visible.filter(card => card.dataset.element !== previous);
    const pool = alternatives.length ? alternatives : visible;
    const card = pool[Math.floor(Math.random() * pool.length)];
    hideNow();
    const width = card.clientWidth, center = width * (.26 + Math.random() * .48);
    pet.style.left = Math.max(12, Math.min(width - 66, center - 27)).toFixed(1) + 'px';
    pet.setAttribute('aria-label', '找到躲在「' + card.querySelector('h3').textContent.trim() + '」上沿的 xiaowho');
    current = card; previous = card.dataset.element; phase = 'peeking';
    pet.dataset.state = phase; pet.hidden = false; card.classList.add('xiaowho-host'); card.append(pet);
    observer?.observe(pet);
    if (!reduced.matches) timer = setTimeout(leave, 6800);
  }
  function catchPet(event) {
    event.preventDefault(); event.stopPropagation();
    if (!current || phase === 'caught' || phase === 'leaving') return;
    clearTimer(); phase = 'caught'; pet.dataset.state = phase; found++; restoreFocus(); updateSettings();
    dispatchEvent(new CustomEvent('vbc-buddy-found', { detail: { count: found } }));
    if (reduced.matches) { hideNow(); queue(0, true); }
    else timer = setTimeout(() => { hideNow(); queue(900, true); }, 460);
  }
  function unmount() {
    hideNow(); observer?.disconnect(); observer = null; gallery = null; cards = []; pet = null; updateSettings();
  }
  function mount(container) {
    unmount(); gallery = container; cards = [...container.querySelectorAll('.element-card')];
    if (!cards.length) { updateSettings(); return; }
    pet = document.createElement('button'); pet.type = 'button'; pet.className = 'xiaowho-hideout';
    pet.hidden = true; pet.title = '找到我啦？';
    pet.innerHTML = '<span class="xiaowho-peek-window" aria-hidden="true"><span class="mascot-sprite"><img src="assets/xiaowho-cutout-display.webp" width="360" height="431" alt="" draggable="false"></span></span>';
    pet.addEventListener('click', catchPet);
    pet.addEventListener('focus', clearTimer);
    pet.addEventListener('blur', () => { if (current && phase === 'peeking' && !reduced.matches) timer = setTimeout(leave, 4000); });
    pet.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); hideNow(); queue(quietPause()); }
    });
    if ('IntersectionObserver' in window) observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.target === pet && (!entry.isIntersecting || entry.intersectionRatio < .5)) && current) { hideNow(); queue(1800); }
    }, { threshold: .5 });
    updateSettings(); queue(2400, true);
  }
  toggle?.addEventListener('change', () => {
    enabled = toggle.checked;
    try { localStorage.setItem(preference, enabled ? 'on' : 'off'); } catch { /* Session-only choice. */ }
    hideNow(); updateSettings(); if (enabled) queue(500, true);
  });
  shuffle?.addEventListener('click', () => {
    hideNow(); $('pointer-panel').hidePopover(); $('pointer-toggle').focus({ preventScroll: true }); queue(800, true);
  });
  $('pointer-panel').addEventListener('toggle', () => {
    if ($('pointer-panel').matches(':popover-open')) hideNow(); else queue(1000, true);
  });
  addEventListener('vbc-view-change', unmount);
  addEventListener('blur', hideNow);
  addEventListener('focus', () => { if (!current) queue(1200, true); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) hideNow(); else queue(1500, true); });
  document.addEventListener('focusin', () => { if (editing()) hideNow(); });
  document.addEventListener('focusout', () => { if (!current) queue(900); });
  addEventListener('scroll', () => {
    if (!current) queue(1200);
    else if (!observer) {
      const box = pet.getBoundingClientRect();
      if (box.bottom < 0 || box.top > innerHeight) { hideNow(); queue(1800); }
    }
  }, { passive: true });
  reduced.addEventListener('change', () => { hideNow(); updateSettings(); queue(800, true); });
  window.VBCBuddy = { mount, unmount };
  updateSettings();
})();
