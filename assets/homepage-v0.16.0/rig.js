'use strict';

const TAU = Math.PI * 2;
export const DURATION = 16;
const asset = path => new URL(path, import.meta.url).href;
const loadImage = src => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = reject;
  image.src = src;
});
const smooth = value => { const x = Math.max(0, Math.min(1, value)); return x * x * (3 - 2 * x); };
const lerp = (a, b, amount) => a + (b - a) * amount;
function envelope(t, start, rise, hold, fall) {
  if (t < start || t >= start + rise + hold + fall) return 0;
  if (t < start + rise) return smooth((t - start) / rise);
  if (t < start + rise + hold) return 1;
  return 1 - smooth((t - start - rise - hold) / fall);
}

export function poseAt(time) {
  const t = ((time % DURATION) + DURATION) % DURATION;
  const wave = envelope(t, .25, .6, 1.05, .7) + envelope(t, 8.25, .55, .7, .7);
  const wrist = Math.sin((t - .85) * TAU * 2.5) * wave;
  const patGate = envelope(t, 5.1, .2, .8, .3) + envelope(t, 13.1, .2, .8, .3);
  const pat = Math.sin((t - 5.1) * TAU * 2) * patGate * 1.6;
  let blink = 0;
  for (const center of [3.2, 6.5, 11.2, 14.5]) blink = Math.max(blink, envelope(t, center - .1, .07, .035, .12));
  return {
    t, wave, blink, breath: Math.sin(TAU * t / 4), gaze: Math.sin(TAU * t / 8) * 1.15,
    left: {x: lerp(53, 56, wave) + wrist * 2.4, y: lerp(185, 106, wave) + wrist * .65,
      c1x: lerp(57, 46, wave), c1y: lerp(146, 144, wave), c2x: lerp(47, 43, wave), c2y: lerp(167, 125, wave)},
    right: {x: 179 + pat * .22, y: 174 + pat}, wrist
  };
}

function eye(ctx, x, y, ry, blink) {
  const rx = 5.4;
  const height = lerp(ry, .9, blink);
  const arch = blink * 2;
  const edge = blink * .5;
  ctx.beginPath();
  ctx.moveTo(x - rx, y + edge);
  ctx.bezierCurveTo(x - rx, y - height * 1.333 - arch, x + rx, y - height * 1.333 - arch, x + rx, y + edge);
  ctx.bezierCurveTo(x + rx, y + height * 1.333 - arch, x - rx, y + height * 1.333 - arch, x - rx, y + edge);
  ctx.fill();
}

function draw(ctx, body, hand, time, white = false) {
  const p = poseAt(time);
  const scale = ctx.canvas.width / 256;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.clearRect(0, 0, 256, 256);
  if (white) { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 256, 256); }
  ctx.save();
  ctx.translate(128, 241);
  ctx.rotate(Math.sin(TAU * p.t / 8) * .004);
  ctx.scale(1 - p.breath * .0025, 1 + p.breath * .006);
  ctx.translate(-128, -241);
  ctx.lineWidth = 5.2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#292924';
  // Continuous limbs are drawn behind the raster body; the shoulder joins stay covered.
  ctx.beginPath();
  ctx.moveTo(78, 142);
  ctx.bezierCurveTo(p.left.c1x, p.left.c1y, p.left.c2x, p.left.c2y, p.left.x, p.left.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(182, 139);
  ctx.bezierCurveTo(203, 144, 204, 164, p.right.x, p.right.y);
  ctx.stroke();
  ctx.drawImage(body, 0, 0, 256, 256);
  ctx.fillStyle = '#faf5e7';
  eye(ctx, 116.76 + p.gaze, 99.07, 11.8, p.blink);
  eye(ctx, 140.08 + p.gaze, 97.37, 11.5, p.blink);
  ctx.lineWidth = 2.6;
  ctx.strokeStyle = '#faf5e7';
  const browLift = p.wave * .7;
  ctx.beginPath(); ctx.moveTo(104, 81 - browLift); ctx.quadraticCurveTo(110, 73 - browLift, 119, 76 - browLift); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(138, 73 - browLift); ctx.quadraticCurveTo(145, 71 - browLift, 150, 79 - browLift); ctx.stroke();
  function mitten(x, y, angle, mirror = false) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
    if (mirror) ctx.scale(-1, 1);
    ctx.drawImage(hand, -10, -9.26, 20, 18.52); ctx.restore();
  }
  const leftAngle = Math.atan2(p.left.y - p.left.c2y, p.left.x - p.left.c2x) + Math.PI / 2 + p.wrist * .2;
  mitten(p.left.x, p.left.y, leftAngle);
  mitten(p.right.x, p.right.y, Math.atan2(p.right.y - 164, p.right.x - 204) + Math.PI / 2, true);
  ctx.restore();
  return p;
}

export async function createXiaowhoRig(canvas, onFrame = () => {}) {
  const [body, hand] = await Promise.all([
    loadImage(asset('assets/xiaowho-body-v3.png')),
    loadImage(asset('assets/xiaowho-hand-v3.png'))
  ]);
  const ctx = canvas.getContext('2d');
  let playing = false, frame = 0, phase = 0, last = 0, rate = 1, count = 0;
  const intervals = [];
  function paint(t = phase) {
    const pose = draw(ctx, body, hand, t);
    canvas.dataset.clock = pose.t.toFixed(4);
    canvas.dataset.handX = pose.left.x.toFixed(3);
    canvas.dataset.handY = pose.left.y.toFixed(3);
    canvas.dataset.blink = pose.blink.toFixed(4);
    onFrame(pose);
  }
  function tick(now) {
    frame = 0;
    if (!playing) return;
    if (last) {
      const delta = now - last;
      intervals.push(delta); if (intervals.length > 360) intervals.shift();
      phase = (phase + Math.min(delta, 80) / 1000 * rate) % DURATION;
    }
    last = now;
    paint();
    canvas.dataset.frames = String(++count);
    frame = requestAnimationFrame(tick);
  }
  function setPlaying(value) {
    playing = value;
    canvas.dataset.playing = String(value);
    cancelAnimationFrame(frame); frame = 0; last = 0;
    if (value) frame = requestAnimationFrame(tick);
  }
  paint(0);
  canvas.dataset.ready = 'true';
  return {
    setPlaying,
    setRate(value) { rate = value; },
    seek(value) { phase = value; paint(); },
    stats() { return {samples: intervals.length, meanMs: intervals.reduce((a, b) => a + b, 0) / (intervals.length || 1), maxMs: Math.max(0, ...intervals)}; },
    async exportSheet(progress = () => {}) {
      const cell = 256, columns = 20, fps = 50, total = DURATION * fps;
      const sheet = document.createElement('canvas');
      sheet.width = columns * cell; sheet.height = Math.ceil(total / columns) * cell;
      const tile = document.createElement('canvas'); tile.width = tile.height = cell;
      const tileContext = tile.getContext('2d'), sheetContext = sheet.getContext('2d');
      for (let i = 0; i < total; i++) {
        draw(tileContext, body, hand, i / fps, true);
        sheetContext.drawImage(tile, i % columns * cell, Math.floor(i / columns) * cell);
        if (i % 25 === 0) { progress(i / total); await new Promise(resolve => requestAnimationFrame(resolve)); }
      }
      progress(1);
      return new Promise(resolve => sheet.toBlob(resolve, 'image/png'));
    }
  };
}

const canvas = document.getElementById('companion-canvas');
if (canvas) {
  const fallback = document.getElementById('companion-image');
  const home = document.getElementById('mascot-home');
  createXiaowhoRig(canvas).then(rig => {
    canvas.hidden = false; fallback.hidden = true;
    canvas.addEventListener('xiaowho-playback', event => rig.setPlaying(event.detail));
    rig.setPlaying(home.dataset.playback === 'playing');
    canvas.addEventListener('xiaowho-stats', () => {
      const stats = rig.stats();
      canvas.dataset.meanFrameMs = stats.meanMs.toFixed(3);
      canvas.dataset.maxFrameMs = stats.maxMs.toFixed(3);
    });
  }).catch(() => { canvas.hidden = true; fallback.hidden = false; });
}
