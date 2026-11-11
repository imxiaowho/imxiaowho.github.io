'use strict';

// Logo-only reuse of the accepted controller; no painted-scene actor is created.
(() => {
  const {setText} = window.homeLocale;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const brand = document.getElementById('brand-play');
  if (!brand) return;
  const catchButton = document.getElementById('logo-xiaowho');
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
  let windowActive = true;
  const logoEnabled = () => !reduced.matches && !document.hidden && logoInView && windowActive;
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
    setText(live, 'logo.status');
    logoTimer = setTimeout(() => { logoTimer = undefined; brand.dataset.state = 'peeking'; armedAt = performance.now() + 450; queueLogo(1300); }, 900);
  });
  new IntersectionObserver(entries => { logoInView = entries[0].isIntersecting; syncLogo(); }).observe(brand);

  function resetLogo() { clearLogoTimers(); brand.dataset.state = 'peeking'; positionHead(); syncLogo(); }
  addEventListener('resize', resetLogo, {passive: true});
  addEventListener('blur', () => { windowActive = false; syncLogo(); });
  addEventListener('focus', () => { windowActive = true; syncLogo(); });
  document.addEventListener('visibilitychange', resetLogo);
  reduced.addEventListener('change', resetLogo);
  syncLogo();
})();
