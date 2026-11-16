'use strict';
(() => {
  if (parent === window) return;
  document.documentElement.classList.add('vbc-embedded');
  let queued = false;
  const report = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      parent.postMessage({type:'vbc-preview-height',height:Math.ceil(document.body.getBoundingClientRect().height)},'*');
    });
  };
  new ResizeObserver(report).observe(document.body);
  document.fonts.ready.then(report);
  document.querySelectorAll('img').forEach(image => image.addEventListener('load', report));
  addEventListener('message',event => {
    if (event.source === parent && event.data?.type === 'vbc-preview-visibility') {
      document.documentElement.classList.toggle('scene-suspended',!event.data.visible);
      if (event.data.visible) report();
    }
  });
  report();
})();
