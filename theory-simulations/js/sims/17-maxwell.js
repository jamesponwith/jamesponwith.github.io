// 17 · Maxwell's equations
(() => {
  const EM_W = FIELD_W; const EM_H = FIELD_H; const EM_C = 0.5; const EM_SPONGE = 18;
  const SCENES = ['Antenna', 'Double slit', 'Two antennas'];
  const em = { Ez: new Float32Array(EM_W * EM_H), Hx: new Float32Array(EM_W * EM_H), Hy: new Float32Array(EM_W * EM_H), wall: new Uint8Array(EM_W * EM_H), damp: new Float32Array(EM_W * EM_H) };
  for (let y = 0; y < EM_H; y += 1) for (let x = 0; x < EM_W; x += 1) {
    const d = Math.min(x, y, EM_W - 1 - x, EM_H - 1 - y);
    em.damp[y * EM_W + x] = d >= EM_SPONGE ? 1 : 1 - 0.08 * ((EM_SPONGE - d) / EM_SPONGE) ** 2;
  }

  defineTheory('maxwell', {
    tab: ['Maxwell’s equations', 'Fields · light'],
    meta: {
      category: 'ELECTROMAGNETISM',
      title: 'Light is a ripple in the field',
      glyph: '∇×',
      description: 'Maxwell (1865) united electricity and magnetism and found their ripples travel at exactly the speed of light. Light is one of those ripples.',
      visualTitle: 'Maxwell’s equations · 2-D FDTD solver',
      frame: 'Eᴢ FIELD',
      caption: 'Cyan and violet: electric field out of and into the screen. Click to move the antenna.',
      equation: '<span class="accent">∂B/∂t = −∇×E</span> · ∂E/∂t = c²∇×B',
      equationNote: 'In empty space these two curl equations make a wave moving at c = 1/√(μ₀ε₀). Solved on a Yee grid (TMz mode) with absorbing edges.',
      insight: 'A changing electric field makes a magnetic field, which makes an electric field—a self-sustaining wave. Add a wall with two slits and experiment 01’s interference appears from first principles. Radio, Wi-Fi, X-rays, and visible light are all this, at different wavelengths.',
      boundary: 'Two dimensions, one polarization, perfectly conducting walls, and a sponge layer instead of perfect absorption, so faint edge reflections remain.',
    },
    defaults: { scene: 0, freq: 0.3 },
    formats: {
      scene: (v) => SCENES[v],
      freq: (v) => `λ = ${(2 * Math.PI / v).toFixed(0)} cells`,
    },
    controls: () => `
      ${rangeControl('scene', 'Scene', 0, SCENES.length - 1, 1, SCENES[0], SCENES.at(-1))}
      ${rangeControl('freq', 'Frequency ω', 0.15, 0.6, 0.01, 'Radio', 'Higher')}
      <div class="readout" id="live-readout"></div>${playControls()}`,
    sim: {
      resetOn: ['scene'],
      reset() {
        em.Ez.fill(0); em.Hx.fill(0); em.Hy.fill(0); em.wall.fill(0); em.t = 0;
        const mid = Math.floor(EM_H / 2); const scene = state.maxwell.scene;
        if (scene === 0) em.src = [[EM_W / 2, mid]];
        if (scene === 1) {
          em.src = [[36, mid]];
          for (let y = 0; y < EM_H; y += 1) if (Math.abs(y - (mid - 14)) > 4 && Math.abs(y - (mid + 14)) > 4) { em.wall[y * EM_W + 90] = 1; em.wall[y * EM_W + 91] = 1; }
        }
        if (scene === 2) em.src = [[EM_W / 2, mid - 8], [EM_W / 2, mid + 8]];
      },
      pick(x, y) { em.src[0] = [Math.floor(x / 960 * EM_W), Math.floor(y / 460 * EM_H)]; },
      tick() {
        const { Ez, Hx, Hy, wall, damp } = em; const W = EM_W; const omega = state.maxwell.freq;
        for (let s = 0; s < 4; s += 1) {
          for (let i = 0; i < W * (EM_H - 1); i += 1) { Hx[i] = (Hx[i] - EM_C * (Ez[i + W] - Ez[i])) * damp[i]; Hy[i] = (Hy[i] + EM_C * (Ez[i + 1] - Ez[i])) * damp[i]; }
          for (let i = W; i < W * EM_H; i += 1) Ez[i] = wall[i] ? 0 : (Ez[i] + EM_C * (Hy[i] - Hy[i - 1] - Hx[i] + Hx[i - W])) * damp[i];
          em.t += EM_C;
          em.src.forEach(([x, y]) => { Ez[y * W + x] += 0.6 * Math.sin(omega * em.t); });
        }
      },
      draw() {
        const px = fieldImage.data;
        for (let i = 0; i < EM_W * EM_H; i += 1) {
          const v = Math.tanh(em.Ez[i] * 9); const a = Math.abs(v); const o = i * 4;
          if (em.wall[i]) { px[o] = 255; px[o + 1] = 178; px[o + 2] = 107; } else if (v > 0) { px[o] = 12 + 89 * a; px[o + 1] = 17 + 207 * a; px[o + 2] = 24 + 184 * a; } else { px[o] = 12 + 176 * a; px[o + 1] = 17 + 138 * a; px[o + 2] = 24 + 231 * a; }
          px[o + 3] = 255;
        }
        fieldCtx.putImageData(fieldImage, 0, 0);
        ctx.imageSmoothingEnabled = true; ctx.drawImage(fieldCanvas, 0, 0, 960, 460);
        em.src.forEach(([x, y]) => drawStar((x + 0.5) / EM_W * 960, (y + 0.5) / EM_H * 460, 4, '#fff1c4'));
        const lambda = 2 * Math.PI / state.maxwell.freq;
        setReadout([['SCENE', SCENES[state.maxwell.scene]], ['WAVELENGTH', `${lambda.toFixed(1)} cells`], ['WAVE SPEED', 'c (1 cell / time)'], ['ELAPSED', `${em.t.toFixed(0)} ticks`]]);
      },
    },
  });
})();
