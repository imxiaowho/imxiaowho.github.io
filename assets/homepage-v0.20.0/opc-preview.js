'use strict';

(() => {
  const panel = document.getElementById('panel-company');
  const preview = document.querySelector('.company-preview');
  const link = document.getElementById('company-project');
  if (!panel || !preview || !link) return;
  const paper = preview.querySelector('.preview-paper');
  const screen = preview.querySelector('.preview-screen');
  const frame = screen.querySelector('iframe');
  const main = preview.parentElement;
  const tabs = document.querySelector('.category-tabs');
  let opening = 0, closing = 0, dismissed = false;
  link.setAttribute('aria-controls', preview.id);
  link.setAttribute('aria-expanded', 'false');

  function reserve() {
    const width = main.clientWidth;
    preview.style.setProperty('--preview-scale', String(width / 1265));
    const height = tabs.getBoundingClientRect().bottom - main.getBoundingClientRect().top
      + link.getBoundingClientRect().height + width * 712 / 1265 + 28 + 44;
    const value = `${Math.ceil(height)}px`;
    if (main.style.minHeight !== value) main.style.minHeight = value;
  }
  function clearTimers() { clearTimeout(opening); clearTimeout(closing); }
  function close() {
    clearTimers();
    preview.dataset.state = 'closed';
    paper.inert = true;
    paper.setAttribute('aria-hidden', 'true');
    link.setAttribute('aria-expanded', 'false');
  }
  function show() {
    clearTimers();
    if (panel.hidden || dismissed) return;
    if (!frame.hasAttribute('src')) frame.src = frame.dataset.src;
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
  document.addEventListener('home-language-change', () => {
    frame.title = document.documentElement.lang.startsWith('en') ? 'Tunenomics website preview' : '元舵官网页面预览';
    close(); reserve();
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) close(); });
  frame.title = document.documentElement.lang.startsWith('en') ? 'Tunenomics website preview' : '元舵官网页面预览';
  preview.hidden = panel.hidden;
  reserve(); close();
})();
