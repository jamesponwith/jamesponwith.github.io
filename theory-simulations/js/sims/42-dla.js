// 42 · Diffusion-limited aggregation
(() => {
  const N = FIELD_W * FIELD_H; const MODES = ['Center seed', 'Ground line']; const STEPS_PER_FRAME = 120000;
  const dla = { order: new Int32Array(N) };
  const STEP = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const occupied = (x, y) => x >= 0 && y >= 0 && x < FIELD_W && y < FIELD_H && dla.order[y * FIELD_W + x] > 0;
  const touching = (x, y) => occupied(x + 1, y) || occupied(x - 1, y) || occupied(x, y + 1) || occupied(x, y - 1);
  function place(x, y) {
    dla.count += 1; dla.order[y * FIELD_W + x] = dla.count;
    if (state.dla.dlaMode === 0) { const r = Math.hypot(x - dla.cx, y - dla.cy); dla.radius = Math.max(dla.radius, r); dla.sumR2 += r * r; if (dla.count % 20 === 0) dla.hist.push([dla.count, Math.sqrt(dla.sumR2 / dla.count)]); }
    else dla.top = Math.min(dla.top, y);
  }
  function launch() {
    if (state.dla.dlaMode === 0) { const a = Math.random() * 2 * Math.PI; const r = dla.radius + 5; return [Math.round(dla.cx + r * Math.cos(a)), Math.round(dla.cy + r * Math.sin(a))]; }
    return [Math.floor(Math.random() * FIELD_W), Math.max(0, dla.top - 5)];
  }
  function fractalDimension() {
    const pts = dla.hist.filter(([n]) => n > 100);
    if (pts.length < 5) return null;
    const xs = pts.map(([, r]) => Math.log(r)); const ys = pts.map(([n]) => Math.log(n)); const mx = xs.reduce((a, b) => a + b) / xs.length; const my = ys.reduce((a, b) => a + b) / ys.length;
    return xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0) / xs.reduce((s, x) => s + (x - mx) ** 2, 0);
  }

  defineTheory('dla', {
    tab: ['Fractal growth', 'Random walks · DLA'],
    meta: {
      category: 'PATTERN FORMATION',
      title: 'Fractals from random walks',
      glyph: '❄',
      description: 'Let particles wander at random until they touch a growing cluster and stick. The result is not a blob but a branching fractal—the shape of lightning, mineral dendrites, coral, and frost.',
      visualTitle: 'Diffusion-limited aggregation (Witten & Sander, 1981)',
      frame: 'RANDOM WALKERS',
      caption: 'Color: arrival order, from cyan (first) to violet. Click to plant another seed.',
      equation: '<span class="accent">N ∝ R^D</span>, D ≈ 1.71 in two dimensions',
      equationNote: 'N is the number of particles and R the cluster’s radius of gyration. A solid disk would give D = 2; branching pulls D below 2.',
      insight: 'Tips poke out into the wandering particles and catch them first, so tips grow faster and split—the screening effect. Lower the stickiness and walkers creep deeper before sticking, thickening the branches. Electrodeposits, viscous fingers, and stressed bacterial colonies share the same law.',
      boundary: 'One walker at a time on a 240 × 115 square lattice, so large clusters feel the grid and the edges. D is fitted from growth in center-seed mode; clusters this small usually land between about 1.6 and 1.9.',
    },
    defaults: { stick: 1, dlaMode: 0 },
    formats: {
      stick: (v) => `${Math.round(v * 100)}% stick`,
      dlaMode: (v) => MODES[v],
    },
    controls: () => `
      ${rangeControl('stick', 'Stickiness', 0.05, 1, 0.05, 'Slippery', 'Sticky')}
      ${rangeControl('dlaMode', 'Seed', 0, 1, 1, MODES[0], MODES[1])}
      <div class="readout" id="live-readout"></div>${playControls()}`,
    sim: {
      resetOn: ['stick', 'dlaMode'],
      reset() {
        dla.order.fill(0); Object.assign(dla, { count: 0, radius: 1, sumR2: 0, hist: [], cx: Math.floor(FIELD_W / 2), cy: Math.floor(FIELD_H / 2), top: FIELD_H - 1, walker: null, done: false });
        if (state.dla.dlaMode === 0) place(dla.cx, dla.cy); else for (let x = 0; x < FIELD_W; x += 1) place(x, FIELD_H - 1);
      },
      pick(x, y) { const gx = Math.floor(x / 960 * FIELD_W); const gy = Math.floor(y / 460 * FIELD_H); if (!occupied(gx, gy)) place(gx, gy); },
      tick() {
        if (dla.done) return;
        const center = state.dla.dlaMode === 0;
        for (let s = 0; s < STEPS_PER_FRAME; s += 1) {
          if (!dla.walker) dla.walker = launch();
          let [x, y] = dla.walker; const [dx, dy] = STEP[Math.floor(Math.random() * 4)]; x += dx; y += dy;
          if (center) { if (Math.hypot(x - dla.cx, y - dla.cy) > dla.radius + 20) { dla.walker = null; continue; } }
          else { x = (x + FIELD_W) % FIELD_W; if (y < dla.top - 15) { dla.walker = null; continue; } }
          if (x < 0 || y < 0 || x >= FIELD_W || y >= FIELD_H) { dla.walker = null; continue; }
          dla.walker = [x, y];
          if (touching(x, y) && Math.random() < state.dla.stick) {
            place(x, y); dla.walker = null;
            if ((center && dla.radius > FIELD_H / 2 - 4) || (!center && dla.top < 4)) { dla.done = true; return; }
          }
        }
      },
      draw() {
        const px = fieldImage.data;
        for (let i = 0; i < N; i += 1) {
          const o = i * 4; const k = dla.order[i];
          if (k) { const f = k / dla.count; px[o] = 101 + 87 * f; px[o + 1] = 224 - 69 * f; px[o + 2] = 208 + 47 * f; } else { px[o] = 12; px[o + 1] = 17; px[o + 2] = 24; }
          px[o + 3] = 255;
        }
        fieldCtx.putImageData(fieldImage, 0, 0);
        ctx.imageSmoothingEnabled = false; ctx.drawImage(fieldCanvas, 0, 0, 960, 460); ctx.imageSmoothingEnabled = true;
        const D = fractalDimension();
        setReadout([['PARTICLES', dla.count.toLocaleString()], ['FRACTAL DIM. D', D ? D.toFixed(2) : state.dla.dlaMode ? 'center mode only' : '…'], ['STATUS', dla.done ? 'reached the edge' : 'growing']]);
      },
    },
  });
})();
