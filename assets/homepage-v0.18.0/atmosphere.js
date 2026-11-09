'use strict';

(() => {
  const surface = document.querySelector('[data-atmosphere="fog"]');
  const motion = document.getElementById('background-motion');
  if (!surface || !motion) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const canvas = document.createElement('canvas');
  canvas.className = 'fog-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.hidden = true;
  surface.append(canvas);

  let gl, locations, request = 0, last = 0, elapsed = 0, frames = 0;
  let cssWidth = 1, cssHeight = 1, running = false;
  const vertexSource = `
    attribute vec2 position;
    varying vec2 uv;
    void main() { uv = position * .5 + .5; gl_Position = vec4(position, 0., 1.); }
  `;
  const fragmentSource = `
    #ifdef GL_FRAGMENT_PRECISION_HIGH
      precision highp float;
    #else
      precision mediump float;
    #endif
    varying vec2 uv;
    uniform vec2 resolution;
    uniform float phase;
    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }
    float noise(vec2 p) {
      vec2 cell = floor(p), f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(cell), hash(cell + vec2(1., 0.)), f.x),
                 mix(hash(cell + vec2(0., 1.)), hash(cell + vec2(1., 1.)), f.x), f.y);
    }
    float fbm(vec2 p) {
      float value = 0., weight = .5;
      mat2 turn = mat2(.8, -.6, .6, .8);
      for (int i = 0; i < 4; i++) {
        value += weight * noise(p);
        p = turn * p * 2.03 + vec2(7.1, 3.7);
        weight *= .5;
      }
      return value;
    }
    void main() {
      vec2 p = vec2(uv.x * resolution.x / resolution.y, uv.y);
      vec2 windA = vec2(sin(phase + uv.x * 1.7) * .72, cos(phase) * .45);
      vec2 windB = vec2(cos(phase * 2. + .7) * .65, sin(phase + 1.4) * .4);
      float bend = fbm(p * 1.55 + windA);
      float billow = fbm(p * 2.2 + vec2(bend * .9, -bend * .6) + windB);
      float veil = fbm(vec2(p.x * 3., p.y * 1.5) + vec2(-bend * .6, bend * .8) - windA * .65);
      float density = smoothstep(.34, .70, billow * .72 + veil * .28);
      density *= .86 + .14 * sin(phase * 3. + uv.y * 3. + uv.x * 2.);
      float edge = pow(abs(uv.x - .5) * 2., 1.8);
      float alpha = density * (.008 + .32 * edge);
      gl_FragColor = vec4(vec3(.43, .44, .42), alpha);
    }
  `;

  function shader(type, source) {
    const result = gl.createShader(type);
    gl.shaderSource(result, source); gl.compileShader(result);
    if (!gl.getShaderParameter(result, gl.COMPILE_STATUS)) throw new Error('Fog shader unavailable');
    return result;
  }
  function initialize() {
    gl = canvas.getContext('webgl', {alpha: true, premultipliedAlpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'low-power'});
    if (!gl) return;
    const vertex = shader(gl.VERTEX_SHADER, vertexSource);
    const fragment = shader(gl.FRAGMENT_SHADER, fragmentSource);
    const program = gl.createProgram();
    gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program);
    gl.deleteShader(vertex); gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Fog program unavailable');
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    locations = Object.fromEntries(['phase', 'resolution'].map(name => [name, gl.getUniformLocation(program, name)]));
  }
  function draw() {
    if (!gl) return;
    gl.uniform1f(locations.phase, (elapsed * .016) % (Math.PI * 2));
    gl.uniform2f(locations.resolution, cssWidth, cssHeight);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (++frames % 15 === 0 || frames === 1) canvas.dataset.frames = String(frames);
  }
  function animate(now) {
    request = 0;
    if (!running) return;
    if (!last || now - last >= 1000 / 30 - 1) {
      elapsed += last ? Math.min(100, now - last) / 1000 : 0;
      last = now; draw();
    }
    request = requestAnimationFrame(animate);
  }
  function stop() {
    cancelAnimationFrame(request); request = 0; last = 0; running = false;
  }
  function label() {
    const en = document.documentElement.lang === 'en';
    const on = motion.getAttribute('aria-pressed') === 'true' && !reduced.matches;
    const target = motion.querySelector('[data-background-label]');
    if (target) target.textContent = en ? `Atmosphere: ${on ? 'on' : 'off'}` : `动态背景：${on ? '开启' : '关闭'}`;
  }
  function sync() {
    stop();
    const selected = surface.dataset.material === 'ink';
    const active = selected && !document.hidden && !reduced.matches && motion.getAttribute('aria-pressed') === 'true';
    surface.dataset.fogRenderer = gl ? 'webgl' : 'css';
    surface.dataset.fogRunning = String(active);
    canvas.hidden = !gl || !selected;
    canvas.dataset.state = !selected ? 'inactive' : active ? 'running' : 'static';
    if (gl && selected) draw();
    if (active && gl) { running = true; request = requestAnimationFrame(animate); }
    label();
  }
  function resize() {
    cssWidth = Math.max(1, surface.clientWidth); cssHeight = Math.max(1, surface.clientHeight);
    const scale = Math.min(1, Math.sqrt(540000 / (cssWidth * cssHeight)));
    canvas.width = Math.max(1, Math.round(cssWidth * scale));
    canvas.height = Math.max(1, Math.round(cssHeight * scale));
    if (gl) gl.viewport(0, 0, canvas.width, canvas.height);
    sync();
  }
  try { initialize(); } catch { gl = null; }
  new MutationObserver(sync).observe(surface, {attributes: true, attributeFilter: ['data-material']});
  new MutationObserver(sync).observe(motion, {attributes: true, attributeFilter: ['aria-pressed']});
  document.addEventListener('visibilitychange', sync);
  document.addEventListener('home-language-change', label);
  reduced.addEventListener('change', sync);
  addEventListener('resize', resize, {passive: true});
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); gl = null; sync(); });
  resize();
})();
