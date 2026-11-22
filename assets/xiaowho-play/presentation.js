'use strict';

(() => {
  const english = new Map([
    ['等待加载', 'Loading…'],
    ['等你来拉', 'Ready to pull'],
    ['可以往外拉', 'Drag to pull'],
    ['拉扯中', 'Pulling'],
    ['轻弹了一下', 'Bounced'],
    ['回弹中', 'Springing back'],
    ['红晕在消退', 'Color fading'],
    ['WebGL 暂不可用，已显示静态头像。', 'Showing a still portrait. WebGL is unavailable.'],
    ['头像加载失败，请刷新页面再试。', 'The portrait could not load. Refresh to try again.'],
    ['已复制', 'Copied'],
    ['提示词已选中，可手动复制。', 'The prompt is selected. Copy it manually.'],
  ]);
  const feeds = [
    [document.querySelector('#readout'), document.querySelector('#portrait-play-status')],
    [document.querySelector('#copy-status'), document.querySelector('#portrait-play-copy-status')],
  ];
  const promptDetails = document.querySelector('#prompt');
  const promptLink = document.querySelector('#prompt-link');

  function updateStatus() {
    const translate = document.documentElement.lang === 'en';
    for (const [source, output] of feeds) {
      const message = source.textContent;
      const text = translate ? english.get(message) ?? message : message;
      if (output.textContent !== text) output.textContent = text;
    }
  }

  const statusObserver = new MutationObserver(updateStatus);
  for (const [source] of feeds) statusObserver.observe(source, { childList: true });
  document.addEventListener('home-language-change', updateStatus);
  promptDetails.addEventListener('toggle', () => {
    promptLink.setAttribute('aria-expanded', String(promptDetails.open));
    if (!promptDetails.open) promptLink.focus();
  });
  updateStatus();
})();
