'use strict';
(() => {
  if (parent !== window) document.documentElement.classList.add('vbc-embedded');
  const $ = id => document.getElementById(id);
  const formats = [...document.querySelectorAll('[data-ratio]')];
  const labels = { '3 / 2': ['原幅 3:2', '3:2 / ORIGINAL'], '16 / 9': ['横幅 16:9', '16:9 / LANDSCAPE'], '1 / 1': ['方形 1:1', '1:1 / SQUARE'], '4 / 5': ['竖版 4:5', '4:5 / PORTRAIT'] };
  let ratio = '16 / 9';
  function update(announce = true) {
    const contain = $('fit').value === 'contain';
    $('image-window').style.aspectRatio = ratio;
    $('photo').style.objectFit = $('fit').value;
    $('photo').style.objectPosition = $('focal').value + '% 50%';
    $('focal').disabled = contain;
    $('focal-value').textContent = contain ? '—' : $('focal').value + '%';
    $('focus-note').textContent = contain ? '保留完整影像，不进行焦点裁切。' : '竖版裁切时，移动焦点看见门洞与树。';
    $('thirds').hidden = !$('grid').checked;
    $('frame-label').textContent = labels[ratio][1];
    formats.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.ratio === ratio)));
    $('composition-code').textContent = 'aspect-ratio: ' + ratio + ';\nobject-fit: ' + $('fit').value + ';\nobject-position: ' + $('focal').value + '% 50%;';
    if (announce) $('composition-state').textContent = labels[ratio][0] + ' · ' + (contain ? '保留全貌' : '铺满画面 · 水平焦点 ' + $('focal').value + '%');
  }
  for (const button of formats) button.addEventListener('click', () => { ratio = button.dataset.ratio; update(); });
  $('fit').addEventListener('change', () => update());
  $('grid').addEventListener('change', () => update(false));
  $('focal').addEventListener('input', () => update(false));
  $('focal').addEventListener('change', () => update());
  $('reset').addEventListener('click', () => {
    ratio = '16 / 9'; $('fit').value = 'cover'; $('focal').value = '65'; $('grid').checked = false; update();
  });
  update();
  if (parent !== window) {
    let queued = false;
    const report = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        parent.postMessage({ type: 'vbc-preview-height', height: Math.ceil(document.body.getBoundingClientRect().height) }, '*');
      });
    };
    new ResizeObserver(report).observe(document.body);
    $('photo').addEventListener('load', report);
    document.fonts.ready.then(report);
    report();
  }
})();
