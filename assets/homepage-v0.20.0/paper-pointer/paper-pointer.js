'use strict';

(() => {
  const body = document.body;
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const supported = !!window.CSS?.supports('cursor', 'url("quiet-arrow.svg") 4 3, auto');
  const assetBase = new URL('.', document.currentScript.src);
  const nativeFrames = Array.from({length:17}, (_, index) => new URL(`native-frames/morph-${String(index).padStart(2, '0')}.svg`, assetBase).href);
  let framesReady = false, morphFrame = 0, morphProgress = 0, shownFrame = -1;
  const pointer = document.createElement('div');
  pointer.id = 'paper-pointer'; pointer.setAttribute('aria-hidden', 'true');
  pointer.innerHTML = '<div class="paper-pointer-aperture"><span id="paper-pointer-copy"></span></div>';
  body.append(pointer);
  const aperture = pointer.querySelector('.paper-pointer-aperture');
  const copy = document.getElementById('paper-pointer-copy');
  const zoom = 1.22, radius = 12;
  let enabled = true, frame = 0, point = null, settleUntil = 0;
  let host = null, labels = [], activeLabel = null, activeText = '';
  body.dataset.paperPointer = 'on';
  body.dataset.paperPointerRenderer = 'native';
  body.dataset.paperPointerFrames = 'loading';

  function setState(name, value) {
    if (body.dataset[name] === value) return;
    body.dataset[name] = value;
    if (name === 'paperPointerState') morphTo(value === 'link' ? 1 : 0);
  }
  function showCursorFrame() {
    if (!framesReady || !canAnimate()) return;
    const index = Math.round(morphProgress * (nativeFrames.length - 1));
    if (shownFrame === index) return;
    shownFrame = index;
    body.style.setProperty('--paper-pointer-cursor', `url("${nativeFrames[index]}") 20 20, auto`);
  }
  function resetNativeCursor() {
    cancelAnimationFrame(morphFrame); morphFrame = 0;
    morphProgress = 0; shownFrame = -1;
    body.style.removeProperty('--paper-pointer-cursor');
    showCursorFrame();
  }
  function morphTo(target) {
    cancelAnimationFrame(morphFrame); morphFrame = 0;
    if (!framesReady || !canAnimate()) return;
    const from = morphProgress, start = performance.now();
    if (from === target) { showCursorFrame(); return; }
    const duration = (target ? 190 : 150) * Math.abs(target - from);
    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      morphProgress = from + (target - from) * (1 - Math.pow(1 - t, 3));
      showCursorFrame();
      morphFrame = t < 1 ? requestAnimationFrame(tick) : 0;
    }
    morphFrame = requestAnimationFrame(tick);
  }
  function place(event) {
    point = {x:event.clientX, y:event.clientY, target:event.target};
    // The browser positions the visible cursor; this coordinate is only for text zoom.
  }
  function clearFx() {
    cancelAnimationFrame(frame); frame = 0; settleUntil = 0;
    body.dataset.paperPointerReady = 'false'; body.dataset.paperPointerLens = 'false';
    body.dataset.paperPointerState = 'plain';
    host = null; labels = []; activeLabel = null; activeText = ''; copy.textContent = '';
    resetNativeCursor();
  }
  function hide() {
    body.dataset.paperPointerActive = 'false'; point = null; clearFx();
  }
  function canAnimate() { return enabled && fine.matches && !reduced.matches && supported; }
  function requestPaint() {
    if (canAnimate() && point && !frame) frame = requestAnimationFrame(paint);
  }
  function clickableAt(target) {
    const control = target?.closest('a[href],button:not(:disabled),summary');
    return control?.getAttribute('aria-disabled') === 'true' ? null : control;
  }
  function isNativeText(target, control) {
    return target?.closest('input,textarea,[contenteditable]') || (!control && target?.closest('p,h1,h2'));
  }
  function configureCopy(label) {
    const style = getComputedStyle(label);
    const properties = ['fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'fontStretch', 'fontVariant', 'fontFeatureSettings', 'fontKerning', 'lineHeight', 'letterSpacing', 'wordSpacing', 'direction', 'color', 'whiteSpace', 'textAlign', 'textTransform', 'textWrap', 'textDecoration', 'textDecorationThickness', 'textUnderlineOffset'];
    const styles = Object.fromEntries(properties.map(property => [property, style[property]]));
    let backgroundColor = '';
    for (let element = host; element; element = element.parentElement) {
      const background = getComputedStyle(element).backgroundColor;
      if (background !== 'rgba(0, 0, 0, 0)' && background !== 'transparent') {
        backgroundColor = background; break;
      }
    }
    // Finish style reads before changing the clipped copy.
    activeLabel = label; activeText = label.textContent;
    copy.textContent = activeText;
    Object.assign(copy.style, styles);
    copy.lang = label.closest('[lang]')?.lang || document.documentElement.lang;
    aperture.style.backgroundColor = backgroundColor;
  }
  function paint(now) {
    frame = 0;
    if (!canAnimate() || !point) return;
    // Native input already resolved the hit. Recheck only after layout invalidation.
    const target = point.target?.isConnected ? point.target : document.elementFromPoint(point.x, point.y);
    if (!target) { hide(); return; }
    const control = clickableAt(target);
    if (isNativeText(target, control)) {
      clearFx(); body.dataset.paperPointerState = 'text'; return;
    }
    const state = control ? 'link' : 'plain';
    setState('paperPointerState', state);
    if (host !== control) {
      host = control; activeLabel = null; activeText = ''; copy.textContent = '';
      labels = host ? [...host.querySelectorAll('[data-lens-label]')] : [];
      if (host?.matches('[data-lens-label]')) labels.unshift(host);
    }
    let found = null, rect = null;
    for (const label of labels) {
      if (!label.isConnected) continue;
      const box = label.getBoundingClientRect();
      if (point.x >= box.left && point.x <= box.right && point.y >= box.top && point.y <= box.bottom && box.width && box.height) {
        found = label; rect = box; break;
      }
    }
    if (found) {
      if (activeLabel !== found || activeText !== found.textContent) configureCopy(found);
      pointer.style.transform = `translate3d(${point.x}px,${point.y}px,0)`;
      copy.style.width = `${rect.width}px`; copy.style.height = `${rect.height}px`;
      copy.style.transform = `translate3d(${radius + (rect.left - point.x) * zoom}px,${radius + (rect.top - point.y) * zoom}px,0) scale(${zoom})`;
    } else {
      copy.textContent = ''; activeLabel = null; activeText = '';
    }
    const lens = String(!!found);
    if (body.dataset.paperPointerLens !== lens) body.dataset.paperPointerLens = lens;
    // Readiness applies only to the optional clipped text; the native cursor stays visible.
    setState('paperPointerReady', 'true');
    // Magnetic row text settles for180ms. Follow only this bounded transition,
    // measuring the moving label instead of freezing its entry rectangle.
    if (host?.matches('.project-row') && now < settleUntil) frame = requestAnimationFrame(paint);
  }
  document.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') { hide(); return; }
    if (!enabled || !fine.matches) return;
    setState('paperPointerActive', 'true');
    const control = clickableAt(event.target);
    if (isNativeText(event.target, control)) {
      if (frame || body.dataset.paperPointerReady === 'true') clearFx();
      point = null; setState('paperPointerState', 'text'); return;
    }
    setState('paperPointerState', control ? 'link' : 'plain');
    if (!canAnimate()) return;
    if (activeLabel && !activeLabel.contains(event.target)) {
      copy.textContent = ''; activeLabel = null; activeText = '';
      setState('paperPointerLens', 'false');
    }
    place(event);
    if (control?.matches('.project-row')) settleUntil = performance.now() + 240;
    requestPaint();
  }, {passive:true,capture:true});
  document.addEventListener('click', event => {
    if (!enabled || !fine.matches) return;
    if (!event.detail) { hide(); return; }
    // Existing handlers have now updated localized/dynamic control labels.
    if (!canAnimate() || isNativeText(event.target, clickableAt(event.target))) return;
    activeLabel = null; host = null; labels = [];
    setState('paperPointerActive', 'true');
    place(event);
    if (event.target.closest('.project-row')) settleUntil = performance.now() + 240;
    requestPaint();
  });
  document.addEventListener('keydown', event => {
    if (event.isComposing) return;
    if (['Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) hide();
    if (event.key === 'Escape') {
      enabled = false; body.dataset.paperPointer = 'system'; hide();
    }
  });
  document.documentElement.addEventListener('pointerleave', hide);
  document.addEventListener('pointercancel', hide);
  document.addEventListener('visibilitychange', hide);
  document.addEventListener('home-language-change', hide);
  document.addEventListener('toggle', () => {
    if (point) point.target = null;
    host = null; labels = []; activeLabel = null; requestPaint();
  }, true);
  addEventListener('resize', hide);
  addEventListener('scroll', hide, {passive:true,capture:true});
  addEventListener('blur', hide);
  fine.addEventListener('change', hide);
  reduced.addEventListener('change', hide);
  document.fonts?.ready.then(hide);
  const frameImages = nativeFrames.map(src => {
    const image = new Image(); image.src = src; return image;
  });
  Promise.all(frameImages.map(image => image.decode())).then(() => {
    framesReady = true; body.dataset.paperPointerFrames = 'ready';
    if (body.dataset.paperPointerActive === 'true' && body.dataset.paperPointerState === 'link') morphTo(1);
    else showCursorFrame();
  }).catch(() => { body.dataset.paperPointerFrames = 'fallback'; });
  hide();
})();
