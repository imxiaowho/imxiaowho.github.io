'use strict';

const compact = new URLSearchParams(location.search).get('view') === 'compact';
if (compact) {
  document.documentElement.setAttribute('data-vbc-compact', '');
  const specimen = document.querySelector('main');
  const reportHeight = () => {
    window.parent.postMessage({
      type: 'vbc-preview-height',
      height: specimen.getBoundingClientRect().height,
    }, '*');
  };
  new ResizeObserver(reportHeight).observe(specimen);
  reportHeight();
}

const surface = document.querySelector('#surface');
const canvas = document.querySelector('#head');
const poster = document.querySelector('#poster');
const readout = document.querySelector('#readout');
const bounceButton = document.querySelector('#bounce');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

const divisions = 44;
const pullRadius = 0.46;
// The falloff has a maximum slope of 1.5 / pullRadius. This cap keeps the
// displacement gradient below 1, even when two shapes are interpolated.
const maxPull = 0.235;
const rest = new Float32Array((divisions + 1) ** 2 * 2);
const triangles = new Uint16Array(divisions ** 2 * 6);
for (let y = 0, vertex = 0, face = 0; y <= divisions; y++) {
  for (let x = 0; x <= divisions; x++, vertex++) {
    rest[vertex * 2] = x / divisions;
    rest[vertex * 2 + 1] = y / divisions;
    if (x < divisions && y < divisions) {
      const below = vertex + divisions + 1;
      triangles.set([vertex, vertex + 1, below, vertex + 1, below + 1, below], face);
      face += 6;
    }
  }
}

// Calm uses the existing logo contours. The open, round surprised eyes come
// from surprised/sheet-01. The asymmetric strained pose follows pain/sheet-06.
const expressions = [
  [[106.4, 142.5, 7, 15.1, 0], [138.4, 137.7, 6.7, 14.4, 0],
    [89, 118, 97, 108, 105, 109], [135, 104, 146, 103, 153, 114]],
  [[105.4, 142.1, 10.7, 12.2, -0.08], [139.8, 137.2, 10.5, 12.6, 0.08],
    [85.5, 111.5, 95, 100, 105, 102], [134, 98, 146, 94, 155, 104]],
  [[106.4, 142.9, 6.5, 17.4, -0.08], [139.3, 140.2, 7.8, 8.6, -0.26],
    [88, 114, 97.5, 106, 107, 114], [132.5, 114, 141, 99, 153.5, 103.5]],
];

function paintFace(context, emotion) {
  const first = expressions[emotion <= 1 ? 0 : 1];
  const second = expressions[emotion <= 1 ? 1 : 2];
  const blend = emotion <= 1 ? emotion : emotion - 1;
  const parts = first.map((part, index) => part.map((value, axis) =>
    value + (second[index][axis] - value) * blend));

  context.clearRect(0, 0, 256, 256);
  context.fillStyle = '#fff7dc';
  context.strokeStyle = '#fff7dc';
  context.lineWidth = 4.4;
  context.lineCap = 'round';

  for (const [x, y, radiusX, radiusY, angle] of parts.slice(0, 2)) {
    context.save();
    context.translate(x, y);
    context.rotate(angle);
    const height = radiusY * 1.333;
    context.beginPath();
    context.moveTo(-radiusX, 0);
    context.bezierCurveTo(-radiusX, -height, radiusX, -height, radiusX, 0);
    context.bezierCurveTo(radiusX, height, -radiusX, height, -radiusX, 0);
    context.fill();
    context.restore();
  }

  for (const [x, y, controlX, controlY, endX, endY] of parts.slice(2)) {
    context.beginPath();
    context.moveTo(x, y);
    context.quadraticCurveTo(controlX, controlY, endX, endY);
    context.stroke();
  }
}

function createRenderer(plate, faceCanvas) {
  const gl = canvas.getContext('webgl', { alpha: true, antialias: false });
  if (!gl) return null;

  const program = gl.createProgram();
  const vertexSource = `
    attribute vec2 a_position;
    attribute vec2 a_uv;
    uniform vec2 u_scale;
    varying vec2 v_uv;

    void main() {
      vec2 local = (a_position - 0.5) * u_scale;
      gl_Position = vec4(local.x, -local.y, 0.0, 1.0);
      v_uv = a_uv;
    }
  `;
  const fragmentSource = `
    precision mediump float;
    uniform sampler2D u_ink;
    uniform sampler2D u_face;
    uniform vec2 u_grip;
    uniform float u_flush;
    varying vec2 v_uv;

    void main() {
      vec4 ink = texture2D(u_ink, v_uv);
      vec4 face = texture2D(u_face, v_uv);
      vec2 delta = (v_uv - u_grip) * vec2(1.0, 1.12);
      float blush = u_flush * exp(-dot(delta, delta) / 0.012);
      vec3 warmInk = ink.rgb * vec3(1.02, 0.82, 0.80) + vec3(0.54, 0.17, 0.13);
      vec3 color = mix(mix(ink.rgb, warmInk, blush), face.rgb, face.a);
      gl_FragColor = vec4(color * ink.a, ink.a);
    }
  `;

  for (const [type, source] of [[gl.VERTEX_SHADER, vertexSource], [gl.FRAGMENT_SHADER, fragmentSource]]) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
    gl.attachShader(program, shader);
    gl.deleteShader(shader);
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  gl.useProgram(program);

  function attribute(name, usage) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, rest, usage);
    const location = gl.getAttribLocation(program, name);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
    return buffer;
  }

  attribute('a_uv', gl.STATIC_DRAW);
  const positionBuffer = attribute('a_position', gl.DYNAMIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triangles, gl.STATIC_DRAW);

  function texture(name, unit, image) {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(gl.getUniformLocation(program, name), unit);
  }

  texture('u_ink', 0, plate);
  texture('u_face', 1, faceCanvas);
  const scale = gl.getUniformLocation(program, 'u_scale');
  const grip = gl.getUniformLocation(program, 'u_grip');
  const flush = gl.getUniformLocation(program, 'u_flush');

  return {
    draw(positions, scene, anchor, redness, faceChanged) {
      if (faceChanged) {
        gl.activeTexture(gl.TEXTURE1);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, faceCanvas);
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(scale, 2 * scene.side / scene.width, 2 * scene.side / scene.height);
      gl.uniform2f(grip, anchor[0], anchor[1]);
      gl.uniform1f(flush, redness);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, positions);
      gl.drawElements(gl.TRIANGLES, triangles.length, gl.UNSIGNED_SHORT, 0);
    },
  };
}

const promptBox = document.querySelector('#prompt');
function revealPrompt() {
  if (location.hash === '#prompt') promptBox.open = true;
}
revealPrompt();
window.addEventListener('hashchange', revealPrompt);
document.querySelector('#prompt-link').addEventListener('click', () => { promptBox.open = true; });
document.querySelector('#copy-prompt').addEventListener('click', async () => {
  const content = document.querySelector('#prompt-text');
  const status = document.querySelector('#copy-status');
  const blocks = Array.from(content.children, (block) => block.tagName === 'OL'
    ? Array.from(block.children, (item, index) => `${index + 1}. ${item.textContent.trim()}`).join('\n\n')
    : block.textContent.trim());
  try {
    await navigator.clipboard.writeText(blocks.join('\n\n'));
    status.textContent = '已复制';
  } catch {
    const range = document.createRange();
    range.selectNodeContents(content);
    const selection = getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    status.textContent = '提示词已选中，可手动复制。';
  }
});

const smooth = (value) => value * value * (3 - 2 * value);
const unit = (value) => Math.max(0, Math.min(1, value));
const middle = [0.5, 0.5];

function setStatus(label, active = false) {
  if (readout.textContent !== label) readout.textContent = label;
  readout.toggleAttribute('data-active', active);
}

async function start() {
  const plate = new Image();
  plate.src = window.XIAOWHO_HEAD_PLATE;
  await plate.decode();

  const faceCanvas = document.createElement('canvas');
  faceCanvas.width = faceCanvas.height = 256;
  const faceContext = faceCanvas.getContext('2d');
  const posterContext = poster.getContext('2d');
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = plate.width;
  maskCanvas.height = plate.height;
  const mask = maskCanvas.getContext('2d', { willReadFrequently: true });
  mask.drawImage(plate, 0, 0);
  const pixels = mask.getImageData(0, 0, plate.width, plate.height).data;
  const positions = rest.slice();
  const scene = { width: 0, height: 0, side: 0 };
  let renderer;
  let held;
  let spring;
  let blush;
  let stretch = 0;
  let painted = 0;
  let frame = 0;
  paintFace(faceContext, 0);

  function queueRender() {
    if (renderer && !frame) frame = requestAnimationFrame(render);
  }

  function resize() {
    const { width, height } = surface.getBoundingClientRect();
    const ratio = Math.min(devicePixelRatio, 2.5);
    scene.width = width;
    scene.height = height;
    scene.side = Math.min(width * 0.88, height * 0.8, 560);
    for (const target of [canvas, poster]) {
      const w = Math.round(width * ratio);
      const h = Math.round(height * ratio);
      if (target.width !== w) target.width = w;
      if (target.height !== h) target.height = h;
    }
    const size = scene.side * ratio;
    const left = (poster.width - size) / 2;
    const top = (poster.height - size) / 2;
    posterContext.clearRect(0, 0, poster.width, poster.height);
    paintFace(faceContext, 0);
    posterContext.drawImage(plate, left, top, size, size);
    posterContext.drawImage(faceCanvas, left, top, size, size);
    paintFace(faceContext, painted);
    queueRender();
  }

  function switchRenderer() {
    try {
      renderer = createRenderer(plate, faceCanvas);
    } catch (error) {
      console.error(error);
      renderer = null;
    }
    canvas.hidden = !renderer;
    poster.hidden = Boolean(renderer);
    bounceButton.disabled = !renderer;
    setStatus(renderer ? '等你来拉' : 'WebGL 暂不可用，已显示静态头像。');
    resize();
  }

  function surfacePoint(event) {
    const bounds = canvas.getBoundingClientRect();
    return [(event.clientX - bounds.left - scene.width / 2) / scene.side + 0.5,
      (event.clientY - bounds.top - scene.height / 2) / scene.side + 0.5];
  }

  function opaque(point) {
    const x = Math.floor(point[0] * plate.width);
    const y = Math.floor(point[1] * plate.height);
    return x >= 0 && x < plate.width && y >= 0 && y < plate.height
      && pixels[(y * plate.width + x) * 4 + 3] >= 48;
  }

  function findGrip(point) {
    if (!stretch) return opaque(point) ? point : null;

    // Pick on the displayed triangles so a new grab can land mid-rebound.
    for (let index = 0; index < triangles.length; index += 3) {
      const a = triangles[index] * 2;
      const b = triangles[index + 1] * 2;
      const c = triangles[index + 2] * 2;
      const px = point[0] - positions[a];
      const py = point[1] - positions[a + 1];
      const bx = positions[b] - positions[a];
      const by = positions[b + 1] - positions[a + 1];
      const cx = positions[c] - positions[a];
      const cy = positions[c + 1] - positions[a + 1];
      const area = bx * cy - by * cx;
      const u = (px * cy - py * cx) / area;
      const v = (bx * py - by * px) / area;
      if (u >= 0 && v >= 0 && u + v <= 1) {
        const sample = [rest[a] + (rest[b] - rest[a]) * u + (rest[c] - rest[a]) * v,
          rest[a + 1] + (rest[b + 1] - rest[a + 1]) * u + (rest[c + 1] - rest[a + 1]) * v];
        return opaque(sample) ? sample : null;
      }
    }
    return null;
  }

  function grab(anchor, point, pointerId) {
    const weights = new Float32Array(positions.length / 2);
    for (let index = 0; index < weights.length; index++) {
      const distance = Math.hypot(rest[index * 2] - anchor[0], rest[index * 2 + 1] - anchor[1]);
      weights[index] = 1 - smooth(unit(distance / pullRadius));
    }
    held = { anchor, point, origin: point, pointerId, weights, start: null,
      previous: stretch ? positions.slice() : null, previousStretch: stretch, keys: new Set() };
    spring = null;
    canvas.setAttribute('data-dragging', '');
    queueRender();
  }

  function move(point, now) {
    if (point[0] === held.point[0] && point[1] === held.point[1]) return;
    held.point = point;
    if (held.start === null) {
      held.start = now;
      blush = { anchor: held.anchor, start: now, release: null };
    }
    queueRender();
  }

  function deform(now) {
    const { point, origin, anchor, weights, previous, previousStretch } = held;
    const dx = point[0] - anchor[0];
    const dy = point[1] - anchor[1];
    const distance = Math.hypot(dx, dy);
    const limit = maxPull / Math.max(maxPull, distance);
    const travel = Math.hypot(point[0] - origin[0], point[1] - origin[1]);
    const elapsed = Math.max(0, now - held.start);
    const blend = previous ? 1 - Math.exp(-(elapsed / 28 + travel * 24)) : 1;

    for (let vertex = 0; vertex < weights.length; vertex++) {
      const x = vertex * 2;
      const y = x + 1;
      const factor = weights[vertex] * limit;
      const nextX = rest[x] + dx * factor;
      const nextY = rest[y] + dy * factor;
      positions[x] = previous ? previous[x] + (nextX - previous[x]) * blend : nextX;
      positions[y] = previous ? previous[y] + (nextY - previous[y]) * blend : nextY;
    }
    stretch = previousStretch * (1 - blend) + distance * limit * blend;
  }

  function rednessAt(now) {
    if (!blush) return 0;
    const release = blush.release;
    if (!release) return 0.19 + 0.54 * smooth(unit((now - blush.start) / 370));
    const age = now - (release.start ?? now);
    if (age < 106) return release.from + (0.96 - release.from) * smooth(unit(age / 106));
    return 0.96 * (1 - smooth(unit((age - 106) / 1070)));
  }

  function release(now) {
    if (!held) return;
    if (held.start !== null) {
      deform(now);
      blush.release = { start: null, from: rednessAt(now) };
    }
    if (stretch && !reducedMotion.matches) {
      spring = { shape: positions.slice(), strength: stretch, start: null };
    } else {
      positions.set(rest);
      stretch = 0;
    }
    const pointerId = held.pointerId;
    held = null;
    canvas.removeAttribute('data-dragging');
    if (pointerId !== undefined && canvas.hasPointerCapture(pointerId)) canvas.releasePointerCapture(pointerId);
    queueRender();
  }

  function reset() {
    const pointerId = held?.pointerId;
    held = spring = blush = null;
    stretch = 0;
    positions.set(rest);
    canvas.removeAttribute('data-hover');
    canvas.removeAttribute('data-dragging');
    if (pointerId !== undefined && canvas.hasPointerCapture(pointerId)) canvas.releasePointerCapture(pointerId);
    queueRender();
  }

  function render(now) {
    frame = 0;
    if (!renderer) return;
    if (held && held.start !== null) deform(now);
    if (spring) {
      // Show the released shape for a frame, including a pull shorter than one refresh interval.
      spring.start ??= now;
      const age = (now - spring.start) / 1000;
      if (age >= 0.57) {
        positions.set(rest);
        stretch = 0;
        spring = null;
      } else {
        const envelope = Math.exp(-9.8 * age);
        const angle = 25 * age;
        const amount = envelope * (Math.cos(angle) + 9.8 / 25 * Math.sin(angle));
        for (let i = 0; i < positions.length; i++) positions[i] = rest[i] + (spring.shape[i] - rest[i]) * amount;
        stretch = spring.strength * envelope;
      }
    }

    if (blush?.release) blush.release.start ??= now;
    const redness = rednessAt(now);
    const emotion = smooth(unit((stretch - 0.003) / 0.06)) + smooth(unit((stretch - 0.073) / 0.137));
    const faceChanged = emotion !== painted;
    if (faceChanged) {
      paintFace(faceContext, emotion);
      painted = emotion;
    }
    renderer.draw(positions, scene, blush?.anchor ?? middle, redness, faceChanged);

    if (blush && blush.release !== null && redness === 0) blush = null;
    const label = held ? (held.start === null ? '可以往外拉' : '拉扯中')
      : spring ? '回弹中' : blush ? '红晕在消退' : '等你来拉';
    setStatus(label, Boolean(held || spring || blush));
    if (spring || (blush && (blush.release !== null || now - blush.start < 370))) queueRender();
  }

  canvas.addEventListener('pointerdown', (event) => {
    if (held || event.button !== 0 || !event.isPrimary) return;
    const point = surfacePoint(event);
    const anchor = findGrip(point);
    if (!anchor) return;
    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    grab(anchor, point, event.pointerId);
  });

  canvas.addEventListener('pointermove', (event) => {
    if (!held) {
      if (event.pointerType === 'mouse') canvas.toggleAttribute('data-hover', Boolean(findGrip(surfacePoint(event))));
      return;
    }
    if (event.pointerId !== held.pointerId) return;
    const now = performance.now();
    for (const sample of event.getCoalescedEvents?.() ?? []) move(surfacePoint(sample), now);
    move(surfacePoint(event), now);
  });

  canvas.addEventListener('pointerleave', () => canvas.removeAttribute('data-hover'));
  canvas.addEventListener('pointerup', (event) => {
    if (event.pointerId !== held?.pointerId) return;
    const now = performance.now();
    move(surfacePoint(event), now);
    release(now);
  });

  for (const type of ['pointercancel', 'lostpointercapture']) {
    canvas.addEventListener(type, (event) => {
      if (event.pointerId === held?.pointerId) release(performance.now());
    });
  }

  const arrows = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
  canvas.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') return reset();
    const direction = arrows[event.key];
    if (!direction || held?.pointerId !== undefined) return;
    event.preventDefault();
    if (!held) {
      const point = [direction[0] < 0 ? 0.36 : 0.64, 0.67];
      grab(findGrip(point) ?? point, point);
    }
    held.keys.add(event.key);
    let [x, y] = held.point;
    x += direction[0] * 0.06;
    y += direction[1] * 0.06;
    const dx = x - held.anchor[0];
    const dy = y - held.anchor[1];
    const limit = maxPull / Math.max(maxPull, Math.hypot(dx, dy));
    move([held.anchor[0] + dx * limit, held.anchor[1] + dy * limit], performance.now());
  });
  canvas.addEventListener('keyup', (event) => {
    if (held?.keys.delete(event.key) && held.keys.size === 0) release(performance.now());
  });
  canvas.addEventListener('blur', () => {
    if (held && held.pointerId === undefined) release(performance.now());
  });

  bounceButton.addEventListener('click', () => {
    if (held) return;
    const point = [0.635, 0.66];
    const now = performance.now();
    grab(findGrip(point) ?? point, point);
    move([point[0] + 0.192, point[1] + 0.066], now);
    release(now);
  });

  window.addEventListener('blur', reset);
  if (compact) window.addEventListener('message', (event) => {
    if (event.source === window.parent && event.data?.type === 'vbc-preview-visibility' && !event.data.visible) reset();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) reset();
    else queueRender();
  });
  reducedMotion.addEventListener('change', reset);
  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    renderer = null;
    reset();
    paintFace(faceContext, 0);
    painted = 0;
    canvas.hidden = true;
    poster.hidden = false;
    bounceButton.disabled = true;
    setStatus('WebGL 暂不可用，已显示静态头像。');
  });
  canvas.addEventListener('webglcontextrestored', switchRenderer);
  new ResizeObserver(resize).observe(surface);
  switchRenderer();
}

start().catch((error) => {
  console.error(error);
  setStatus('头像加载失败，请刷新页面再试。');
});
