// 36 · Chemical waves (excitable media)
(() => {
  // Barkley model on the shared field grid, no-flux edges
  const N = FIELD_W * FIELD_H; const DX = 0.3; const A = 0.75; const B = 0.02; const STARTS = ['Spiral', 'Spiral pair', 'Sparks'];
  const bz = { u: new Float32Array(N), v: new Float32Array(N), u2: new Float32Array(N) };
  const excite = (cx, cy, r) => {
    for (let y = Math.max(0, cy - r); y <= Math.min(FIELD_H - 1, cy + r); y += 1) for (let x = Math.max(0, cx - r); x <= Math.min(FIELD_W - 1, cx + r); x += 1) {
      if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) bz.u[y * FIELD_W + x] = 1;
    }
  };

  function step(eps) {
    const { u, v, u2 } = bz; const dt = Math.min(0.02, eps / 2); const c = dt / (DX * DX);
    for (let y = 0; y < FIELD_H; y += 1) {
      const up = Math.max(0, y - 1) * FIELD_W; const dn = Math.min(FIELD_H - 1, y + 1) * FIELD_W; const row = y * FIELD_W;
      for (let x = 0; x < FIELD_W; x += 1) {
        const i = row + x;
        const lap = u[row + Math.max(0, x - 1)] + u[row + Math.min(FIELD_W - 1, x + 1)] + u[up + x] + u[dn + x] - 4 * u[i];
        u2[i] = u[i] + dt / eps * u[i] * (1 - u[i]) * (u[i] - (v[i] + B) / A) + c * lap;
        v[i] += dt * (u[i] - v[i]);
      }
    }
    bz.u.set(u2);
  }

  defineTheory('excitable', {
    tab: ['Chemical waves', 'Spirals · excitable media'],
    meta: {
      category: 'NONLINEAR CHEMISTRY',
      title: 'Spirals in a dish',
      glyph: '@',
      description: 'In the Belousov–Zhabotinsky reaction a still liquid pulses with orange and blue waves that curl into rotating spirals. The same physics drives heartbeats, nerve signals, and slime-mold aggregation.',
      visualTitle: 'Barkley model · excitable medium',
      frame: 'PETRI DISH',
      caption: 'Orange: excited. Blue: recovering (refractory). Click to trigger a new wave.',
      equation: '<span class="accent">∂u/∂t = u(1−u)(u − (v+b)/a)/ε + ∇²u</span> · ∂v/∂t = u − v',
      equationNote: 'u is the fast “excited” chemical, v the slow inhibitor. Small ε makes sharp fronts. Each point fires once, then must recover before it can fire again.',
      insight: 'Because a just-fired region cannot fire again, colliding waves annihilate instead of passing through, and a broken wavefront curls into a self-sustaining spiral. In the heart, such spirals are a cause of dangerous arrhythmias; defibrillation resets the whole medium at once.',
      boundary: 'The Barkley model is a generic two-variable caricature of excitable chemistry, not the BZ reaction’s full mechanism. Edges are sealed; the grid is 240 × 115.',
    },
    defaults: { eps: 0.02, bzStart: 0 },
    formats: {
      eps: (v) => `ε = ${v.toFixed(3)}`,
      bzStart: (v) => STARTS[v],
    },
    controls: () => `
      ${rangeControl('eps', 'Front sharpness ε', 0.02, 0.06, 0.002, 'Sharp', 'Soft')}
      ${rangeControl('bzStart', 'Starting condition', 0, STARTS.length - 1, 1, STARTS[0], STARTS.at(-1))}
      <div class="readout" id="live-readout"></div>${playControls()}`,
    sim: {
      resetOn: ['bzStart'],
      reset() {
        bz.u.fill(0); bz.v.fill(0); bz.t = 0; const mode = state.excitable.bzStart; const mx = FIELD_W / 2; const my = FIELD_H / 2;
        for (let y = 0; y < FIELD_H; y += 1) for (let x = 0; x < FIELD_W; x += 1) {
          const i = y * FIELD_W + x;
          if (mode === 0) { bz.u[i] = y < my ? 1 : 0; bz.v[i] = x < mx ? A / 2 : 0; }
          if (mode === 1 && x > FIELD_W / 4 && x < 3 * FIELD_W / 4) { if (Math.abs(y - my) < 3) bz.u[i] = 1; else if (y < my - 3 && y > my - 12) bz.v[i] = A / 2; }
        }
        if (mode === 2) for (let k = 0; k < 6; k += 1) excite(Math.floor(Math.random() * FIELD_W), Math.floor(Math.random() * FIELD_H), 3);
      },
      pick(x, y) { excite(Math.floor(x / 960 * FIELD_W), Math.floor(y / 460 * FIELD_H), 4); },
      tick() { for (let s = 0; s < 12; s += 1) step(state.excitable.eps); bz.t += 12 * Math.min(0.02, state.excitable.eps / 2); },
      draw() {
        const px = fieldImage.data; let excited = 0;
        for (let i = 0; i < N; i += 1) {
          const u = Math.max(0, Math.min(1, bz.u[i])); const v = Math.max(0, Math.min(1, bz.v[i] / A)); const o = i * 4; if (u > 0.5) excited += 1;
          px[o] = Math.min(255, 12 + 30 * v + 243 * u); px[o + 1] = Math.min(255, 17 + 70 * v + 150 * u); px[o + 2] = Math.min(255, 24 + 150 * v + 30 * u); px[o + 3] = 255;
        }
        fieldCtx.putImageData(fieldImage, 0, 0);
        ctx.imageSmoothingEnabled = true; ctx.drawImage(fieldCanvas, 0, 0, 960, 460);
        setReadout([['MODEL TIME', bz.t.toFixed(1)], ['EXCITED', `${(excited / N * 100).toFixed(1)}%`], ['START', STARTS[state.excitable.bzStart]]]);
      },
    },
  });
})();
