'use strict';

(() => {
  // Open-eye geometry reuses actual calm/curious library cues and the canonical head.
  // Chen withdrew the narrow closed-eye pleased profile on 2026-11-09.
  const profiles = {
    calm: {gaze: 0, left: 15.1, right: 14.4, arch: 0, browLeft: 'M89 118 Q97 108 105 109', browRight: 'M135 104 Q146 103 153 114'},
    curious: {gaze: 4, left: 16, right: 18, arch: 0, browLeft: 'M88 115 Q96 105 105 108', browRight: 'M135 96 Q147 91 155 100'}
  };
  function eye(x, y, rx, ry, arch) {
    const height = ry * 1.333;
    return `M${x-rx} ${y} C${x-rx} ${y-height-arch} ${x+rx} ${y-height-arch} ${x+rx} ${y} C${x+rx} ${y+height-arch} ${x-rx} ${y+height-arch} ${x-rx} ${y}Z`;
  }
  function create(svg) {
    function pose(expression = 'calm', facing = 1, tilt = -4) {
      const selected = expression === 'pleased' ? 'curious' : expression;
      const p = profiles[selected];
      svg.querySelector('[data-part="eye-left"]').setAttribute('d', eye(106.4 + p.gaze, 142.5, p.width ?? 7, p.left, p.arch));
      svg.querySelector('[data-part="eye-right"]').setAttribute('d', eye(138.4 + p.gaze, 137.7, p.width ?? 6.7, p.right, p.arch));
      svg.querySelector('[data-part="brow-left"]').setAttribute('d', p.browLeft);
      svg.querySelector('[data-part="brow-right"]').setAttribute('d', p.browRight);
      svg.style.setProperty('--head-facing', String(facing));
      svg.style.setProperty('--head-tilt', tilt + 'deg');
      svg.dataset.expression = selected;
      svg.dataset.facing = facing === 1 ? 'right' : 'left';
      svg.dataset.tilt = String(tilt);
    }
    pose();
    return {pose};
  }
  window.XiaowhoHead = {create};
})();
