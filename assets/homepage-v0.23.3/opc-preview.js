'use strict';

(() => {
  const panel = document.getElementById('panel-company');
  const preview = document.querySelector('.company-preview');
  const link = document.getElementById('company-project');
  if (!panel || !preview || !link) return;
  const paper = preview.querySelector('.preview-paper');
  const screen = preview.querySelector('.preview-screen');
  const frame = screen.querySelector('iframe');
  const chineseUrl = frame.dataset.src;
  const caption = preview.querySelector('.preview-caption');
  const main = preview.parentElement;
  const tabs = document.querySelector('.category-tabs');
  let opening = 0, closing = 0, dismissed = false;
  link.setAttribute('aria-controls', preview.id);
  link.setAttribute('aria-expanded', 'false');

  function reserve() {
    const paperStyle = getComputedStyle(paper);
    const previewStyle = getComputedStyle(preview);
    const viewportWidth = parseFloat(previewStyle.getPropertyValue('--preview-viewport-width'));
    const viewportHeight = parseFloat(previewStyle.getPropertyValue('--preview-viewport-height'));
    const mainBounds = main.getBoundingClientRect();
    const width = Math.max(0, mainBounds.width
      - parseFloat(paperStyle.paddingLeft) - parseFloat(paperStyle.paddingRight));
    const captionHeight = caption.offsetHeight || parseFloat(getComputedStyle(caption).minHeight);
    const margins = parseFloat(previewStyle.marginTop) + parseFloat(previewStyle.marginBottom);
    const scale = width / viewportWidth;
    const height = tabs.getBoundingClientRect().bottom - mainBounds.top
      + link.getBoundingClientRect().height + viewportHeight * scale + captionHeight + margins
      + parseFloat(paperStyle.paddingTop) + parseFloat(paperStyle.paddingBottom);
    const scaleValue = String(scale);
    const minHeight = `${Math.ceil(height)}px`;

    if (preview.style.getPropertyValue('--preview-scale') !== scaleValue) {
      preview.style.setProperty('--preview-scale', scaleValue);
    }
    if (main.style.minHeight !== minHeight) main.style.minHeight = minHeight;
  }

  function clearTimers() { clearTimeout(opening); clearTimeout(closing); }
  function close() {
    clearTimers();
    preview.dataset.state = 'closed';
    paper.inert = true;
    paper.setAttribute('aria-hidden', 'true');
    link.setAttribute('aria-expanded', 'false');
  }
  function loadFrame() {
    if (frame.getAttribute('src') !== frame.dataset.src) frame.src = frame.dataset.src;
  }
  function show() {
    clearTimers();
    if (panel.hidden || dismissed) return;
    loadFrame();
    preview.dataset.state = 'open';
    paper.inert = false;
    paper.setAttribute('aria-hidden', 'false');
    link.setAttribute('aria-expanded', 'true');
  }
  function enter(event) {
    clearTimers();
    if (event.pointerType !== 'touch') opening = setTimeout(show, 100);
  }
  function leave() {
    clearTimers();
    closing = setTimeout(() => {
      const focused = document.activeElement;
      if (!link.matches(':hover') && !preview.matches(':hover')
          && !link.contains(focused) && !preview.contains(focused)) {
        close(); dismissed = false;
      }
    }, 280);
  }
  [link, preview].forEach(element => {
    element.addEventListener('pointerenter', enter);
    element.addEventListener('pointerleave', leave);
    element.addEventListener('focusin', () => { if (!dismissed) show(); });
    element.addEventListener('focusout', leave);
  });
  function escape(event) {
    if (event.key !== 'Escape' || preview.dataset.state !== 'open') return;
    const inside = preview.contains(document.activeElement);
    dismissed = true; close();
    if (inside) link.focus({preventScroll: true});
    event.preventDefault();
  }
  document.addEventListener('keydown', escape);
  new MutationObserver(() => {
    close(); dismissed = false; preview.hidden = panel.hidden; reserve();
  }).observe(panel, {attributes: true, attributeFilter: ['hidden']});
  const size = new ResizeObserver(reserve);
  size.observe(main); size.observe(link); size.observe(tabs);
  function localize() {
    const english = document.documentElement.lang === 'en';
    const url = english ? frame.dataset.srcEn : chineseUrl;
    frame.dataset.src = url;
    frame.title = english ? 'Tunenomics website preview' : '元舵官网页面预览';
    link.href = caption.href = url;
    link.hreflang = caption.hreflang = english ? 'en' : 'zh-CN';
    if (!panel.hidden && preview.dataset.state === 'open') loadFrame();
    reserve();
  }
  document.addEventListener('home-language-change', localize);
  document.addEventListener('visibilitychange', () => { if (document.hidden) close(); });
  preview.hidden = panel.hidden;
  close(); localize();
})();
