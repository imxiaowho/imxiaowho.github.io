'use strict';

// The catalog renders the same effect controls as the personal homepage.
(() => {
  const effects = new Map((window.VBC_DATA?.records || []).filter(record => record.homepage_effect).map(record => [record.id, record.homepage_effect]));
  const anchors = {
    spotlight: 'vbc-spotlight',
    magnetic: 'vbc-magnetic-hover',
    magnifier: 'vbc-text-magnifier',
    marker: 'vbc-tab-marker',
    reveal: 'vbc-inline-reveal',
  };

  function original(id, canonical = false) {
    const link = new URL(canonical ? 'https://imxiaowho.org/?section=vbc' : document.querySelector('.site-nav a').href);
    link.hash = anchors[effects.get(id)];
    return link.href;
  }

  function sample(id, instruction) {
    const template = document.getElementById('catalog-example-' + effects.get(id));
    return '<div class="homepage-effect" data-home-design="index" data-art-layout="contained"><p class="effect-instructions" id="vbc-lens-instructions">'+
      instruction + '</p>' + template.innerHTML + '</div>';
  }

  window.VBCHomeExamples = { original, sample };
})();
