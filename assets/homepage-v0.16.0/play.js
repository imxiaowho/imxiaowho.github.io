'use strict';

(() => {
  const {setText} = window.homeLocale;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const texture = document.getElementById('surface-texture');
  const materialButtons = [...document.querySelectorAll('[data-material-choice]')];
  const materialKey = 'xiaowho.home-background.v4';
  let material = 'ink';
  try { material = localStorage.getItem(materialKey) || material; } catch { /* Session preference. */ }
  if (!materialButtons.some(button => button.dataset.materialChoice === material)) material = 'ink';
  function selectMaterial(value) {
    material = value;
    texture.dataset.material = value;
    materialButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.materialChoice === value)));
    try { localStorage.setItem(materialKey, value); } catch { /* Session preference. */ }
  }
  materialButtons.forEach(button => button.addEventListener('click', () => selectMaterial(button.dataset.materialChoice)));
  selectMaterial(material);

  const brand = document.getElementById('brand-play');
  const catchButton = document.getElementById('logo-xiaowho');
  const logoNote = document.getElementById('logo-note');
  const headElement = document.getElementById('logo-head');
  const head = window.XiaowhoHead.create(headElement);
  const expressions = ['calm', 'curious'];
  const live = document.getElementById('logo-status');
  const wordmark = brand.querySelector('.wordmark');
  const wordmarkText = wordmark.querySelector('[data-lens-label]');
  const baseline = wordmark.querySelector('.wordmark-baseline');
  const letterGroups = [{start: 1, end: 3, name: 'mx'}, {start: 4, end: 6, name: 'ao'}];
  const spots = [0, 0];
  let logoTimer, moveTimer, logoInside = false, logoInView = true;
  let spot = 0, dodges = 0, caught = 0, peeks = 0, armedAt = performance.now() + 320;
  function positionHead() {
    const node = wordmarkText.firstChild;
    const box = brand.getBoundingClientRect();
    const ranges = letterGroups.map((group, index) => {
      const range = document.createRange();
      range.setStart(node, group.start); range.setEnd(node, group.end);
      const rect = range.getBoundingClientRect();
      spots[index] = rect.left + rect.width / 2 - box.left;
      return rect;
    });
    const windowWidth = Math.min(32, ...ranges.map(rect => rect.width - 4));
    const size = Math.min(38, (windowWidth - 2) / .682);
    // Noto Serif SC600: the i dot's lower contour is655/1000em above baseline.
    const dotBottom = baseline.getBoundingClientRect().top - box.top - parseFloat(getComputedStyle(wordmark).fontSize) * .655;
    brand.style.setProperty('--peek-x', spots[spot] + 'px');
    brand.style.setProperty('--peek-y', (dotBottom - 44) + 'px');
    brand.style.setProperty('--peek-window', windowWidth + 'px');
    brand.style.setProperty('--peek-size', size + 'px');
    brand.dataset.letters = letterGroups[spot].name;
  }
  function poseHead(expression) {
    const facing = spot === 0 ? 1 : -1;
    head.pose(expression, facing, facing * 3);
    brand.dataset.expression = expression;
    brand.dataset.facing = facing === 1 ? 'right' : 'left';
  }
  positionHead();
  document.fonts.ready.then(positionHead);
  poseHead('calm');
  const logoEnabled = () => !reduced.matches && !document.hidden && logoInView;
  function clearLogoTimers() { clearTimeout(logoTimer); clearTimeout(moveTimer); logoTimer = moveTimer = undefined; }
  function showSpot(index) {
    spot = index; positionHead();
    brand.dataset.spot = String(index);
    brand.dataset.peeks = String(++peeks);
    // Set the new direction while fully concealed; only the rise should transition.
    headElement.style.transition = 'none';
    poseHead(expressions[peeks % expressions.length]);
    headElement.getBoundingClientRect();
    headElement.style.removeProperty('transition');
    brand.dataset.state = 'peeking';
    armedAt = performance.now() + 320;
  }
  function queueLogo(delay = 2800) {
    if (!logoEnabled() || logoInside || brand.contains(document.activeElement) || logoTimer || moveTimer) return;
    logoTimer = setTimeout(() => { logoTimer = undefined; duck(); }, delay);
  }
  function duck(pointerX) {
    if (!logoEnabled() || brand.dataset.state !== 'peeking' || performance.now() < armedAt || catchButton === document.activeElement) return;
    clearLogoTimers();
    let next = (spot + 1) % spots.length;
    if (typeof pointerX === 'number') {
      dodges++; brand.dataset.dodges = String(dodges);
      if (dodges % 4 === 0) { armedAt = performance.now() + 1600; return; }
      const box = brand.getBoundingClientRect();
      next = spots.map((value, index) => ({index, distance: Math.abs(box.left + value - pointerX)}))
        .filter(item => item.index !== spot).sort((a, b) => b.distance - a.distance)[0].index;
      setText(logoNote, ['logo.almost', 'logo.moved', 'logo.find'][(dodges - 1) % 3]);
    }
    brand.dataset.state = 'hiding';
    moveTimer = setTimeout(() => {
      moveTimer = undefined;
      if (!logoEnabled()) return;
      showSpot(next); queueLogo();
    }, 150);
  }
  function syncLogo() {
    if (!logoEnabled()) { clearLogoTimers(); brand.dataset.state = 'peeking'; }
    else queueLogo();
  }
  brand.addEventListener('pointerenter', () => { logoInside = true; clearTimeout(logoTimer); logoTimer = undefined; });
  brand.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || !fine.matches) return;
    const box = catchButton.getBoundingClientRect();
    if (Math.abs(event.clientX - box.left - box.width / 2) < 38 && Math.abs(event.clientY - box.top - box.height / 2) < 42) duck(event.clientX);
  });
  brand.addEventListener('pointerleave', () => { logoInside = false; queueLogo(1700); });
  catchButton.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch' && fine.matches) duck(event.clientX); });
  catchButton.addEventListener('focus', () => { clearLogoTimers(); brand.dataset.state = 'peeking'; armedAt = Infinity; });
  catchButton.addEventListener('blur', () => { armedAt = performance.now() + 320; queueLogo(); });
  catchButton.addEventListener('click', () => {
    clearLogoTimers(); caught++; brand.dataset.caught = String(caught);
    brand.dataset.state = 'caught';
    poseHead('curious');
    setText(logoNote, 'logo.caught');
    setText(live, 'logo.status');
    logoTimer = setTimeout(() => { logoTimer = undefined; brand.dataset.state = 'peeking'; armedAt = performance.now() + 450; queueLogo(1300); }, 900);
  });
  new IntersectionObserver(entries => { logoInView = entries[0].isIntersecting; syncLogo(); }).observe(brand);

  const home = document.getElementById('mascot-home');
  const actor = document.getElementById('xiaowho-greeting');
  const image = document.getElementById('companion-image');
  const canvas = document.getElementById('companion-canvas');
  const still = new URL('assets/xiaowho-idle-v2-still.png', document.currentScript.src).href;
  let inView = true;

  function updatePlayback() {
    const playing = !reduced.matches && !document.hidden && inView;
    if (image.getAttribute('src') !== still) image.src = still;
    canvas?.dispatchEvent(new CustomEvent('xiaowho-playback', {detail: playing}));
    document.documentElement.dataset.companionPaused = String(!playing);
    home.dataset.playback = playing ? 'playing' : 'resting';
    syncLogo();
  }
  function resetPlay() {
    clearLogoTimers();
    brand.dataset.state = 'peeking';
    positionHead();
    updatePlayback();
  }
  addEventListener('resize', resetPlay, {passive: true});
  addEventListener('blur', resetPlay);
  document.addEventListener('visibilitychange', resetPlay);
  reduced.addEventListener('change', resetPlay);
  const observer = new IntersectionObserver(entries => {
    inView = entries[0].isIntersecting;
    updatePlayback();
  });
  observer.observe(home);
  actor.dataset.state = 'passive';
  updatePlayback();
})();
