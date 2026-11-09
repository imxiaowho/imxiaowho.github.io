'use strict';

(() => {
  const surface = document.getElementById('surface-texture');
  if (!surface) return;
  const motion = document.getElementById('background-motion');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const canvas = document.createElement('canvas');
  canvas.className = 'ink-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.hidden = true;
  surface.append(canvas);

  let gl, locations, loaded = false, running = false;
  let request = 0, last = 0, elapsed = 0, frames = 0;
  let pointer = [.5, .5], target = [.5, .5];
  const image = new Image();
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
    uniform sampler2D pigment;
    uniform float phase;
    uniform float strength;
    uniform vec2 pointer;
    void main() {
      vec2 primary = vec2(sin(uv.y * 4.5 + phase), cos(uv.x * 4.0 - phase));
      vec2 secondary = vec2(cos(uv.x * 3.0 + phase * 2.0), sin(uv.y * 3.5 + phase * 2.0));
      vec2 distance = uv - pointer;
      vec2 curl = vec2(-distance.y, distance.x) * exp(-dot(distance, distance) * 9.0);
      vec2 flow = (primary * .008 + secondary * .004 + curl * .028) * strength;
      vec3 ink = texture2D(pigment, clamp(uv + flow, .001, .999)).rgb;
      gl_FragColor = vec4(ink, 1.0);
    }
  `;

  function shader(type, source) {
    const result = gl.createShader(type);
    gl.shaderSource(result, source);
    gl.compileShader(result);
    if (!gl.getShaderParameter(result, gl.COMPILE_STATUS)) throw new Error('Ink shader unavailable');
    return result;
  }
  function initialize() {
    gl = canvas.getContext('webgl', {alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'low-power'});
    if (!gl) return;
    const vertex = shader(gl.VERTEX_SHADER, vertexSource);
    const fragment = shader(gl.FRAGMENT_SHADER, fragmentSource);
    const program = gl.createProgram();
    gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program);
    gl.deleteShader(vertex); gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Ink program unavailable');
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    locations = Object.fromEntries(['phase', 'strength', 'pointer'].map(name => [name, gl.getUniformLocation(program, name)]));
    gl.uniform1i(gl.getUniformLocation(program, 'pigment'), 0);
  }
  function draw() {
    if (!gl || !loaded) return;
    gl.uniform1f(locations.phase, (elapsed * .12) % (Math.PI * 2));
    gl.uniform1f(locations.strength, 1 - Math.exp(-elapsed / 3));
    gl.uniform2f(locations.pointer, pointer[0], pointer[1]);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (++frames % 15 === 0 || frames === 1) canvas.dataset.frames = String(frames);
  }
  function animate(now) {
    request = 0;
    if (!running) return;
    if (!last || now - last >= 1000 / 30 - 1) {
      const dt = last ? Math.min(100, now - last) / 1000 : 0;
      last = now; elapsed += dt;
      const ease = 1 - Math.exp(-dt / .14);
      pointer = pointer.map((value, i) => value + (target[i] - value) * ease);
      draw();
    }
    request = requestAnimationFrame(animate);
  }
  function stop() {
    cancelAnimationFrame(request); request = 0; last = 0; running = false;
  }
  function sync() {
    stop();
    const selected = surface.dataset.material === 'ink';
    const active = selected && loaded && !document.hidden && !reduced.matches && motion.getAttribute('aria-pressed') === 'true';
    surface.dataset.inkRenderer = gl ? 'webgl' : 'css';
    surface.dataset.inkFallback = String(!gl);
    surface.dataset.inkRunning = String(active);
    canvas.hidden = !gl || !selected || !loaded;
    if (gl && selected && loaded) { surface.dataset.inkReady = 'true'; draw(); }
    else delete surface.dataset.inkReady;
    canvas.dataset.state = !selected ? 'inactive' : active ? 'running' : 'static';
    if (active && gl) { running = true; request = requestAnimationFrame(animate); }
  }
  function resize() {
    const width = surface.clientWidth, height = surface.clientHeight;
    const scale = Math.min(1, Math.sqrt(1200000 / (width * height)));
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    if (gl) gl.viewport(0, 0, canvas.width, canvas.height);
    sync();
  }
  image.onload = () => {
    loaded = true;
    try { initialize(); } catch { gl = null; }
    resize();
  };
  image.onerror = () => { loaded = false; sync(); };
  image.src = new URL('assets/ink-v14/ink-field.webp', document.currentScript.src).href;
  new MutationObserver(sync).observe(surface, {attributes: true, attributeFilter: ['data-material']});
  new MutationObserver(sync).observe(motion, {attributes: true, attributeFilter: ['aria-pressed']});
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
  addEventListener('resize', resize, {passive: true});
  addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') return;
    target = [(event.clientX + 36) / (innerWidth + 72), 1 - (event.clientY + 36) / (innerHeight + 72)];
  }, {passive: true});
  document.documentElement.addEventListener('pointerleave', () => { target = [.5, .5]; });
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault(); gl = null; sync();
  });
  resize();
})();
