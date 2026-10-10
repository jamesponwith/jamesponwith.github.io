// 20 · Brownian motion
(() => {
  const BR = { x: 20, y: 40, w: 580, h: 380 }; const BR_N = 700; const BR_R = 20; const brown = { show: true };

  defineTheory('brownian', {
    tab: ['Brownian motion', 'Molecules · diffusion'],
    meta: {
      category: 'STATISTICAL PHYSICS',
      title: 'Atoms are real',
      glyph: '√t',
      description: 'Pollen grains jitter in water for no visible reason. Einstein (1905) showed the jitter is the drumbeat of invisible molecules—and that measuring it reveals how many there are.',
      visualTitle: 'Brownian motion · one grain among molecules',
      frame: 'MICROSCOPE',
      caption: 'Hide the molecules to see what Robert Brown saw in 1827: a grain dancing on its own.',
      equation: '<span class="accent">⟨r²⟩ = 4Dt</span>, D = k_BT / 6πηa',
      equationNote: 'In 2-D the mean squared displacement grows linearly in time. Einstein tied D to temperature T, viscosity η, and grain radius a.',
      insight: 'Over short lags the grain coasts and MSD curves upward like t²; after many kicks it diffuses and MSD turns straight. Jean Perrin used Einstein’s formula in 1908 to measure Avogadro’s number, ending the debate over whether atoms exist.',
      boundary: 'A dilute 2-D gas of non-interacting molecules with elastic grain collisions, in a box. The Stokes formula describes dense liquids, not this gas; the walls eventually cap the MSD.',
    },
    defaults: { heat: 1, grainMass: 20 },
    formats: {
      heat: (v) => `${v.toFixed(1)}×`,
      grainMass: (v) => `${v} m`,
    },
    controls: () => `
      ${rangeControl('heat', 'Temperature', 0.3, 2, 0.1, 'Cold', 'Hot')}
      ${rangeControl('grainMass', 'Grain mass', 10, 200, 10, 'Light', 'Heavy')}
      <div class="readout" id="live-readout"></div>${playControls('<button class="action-button secondary" data-action="molecules">◐ SHOW / HIDE MOLECULES</button>')}`,
    sim: {
      resetOn: ['heat', 'grainMass'],
      reset() {
        const speed = 70 * state.brownian.heat;
        Object.assign(brown, { mx: new Float64Array(BR_N), my: new Float64Array(BR_N), mvx: new Float64Array(BR_N), mvy: new Float64Array(BR_N), gx: BR.w / 2, gy: BR.h / 2, gvx: 0, gvy: 0, trail: [], samples: [], sample: 0 });
        for (let i = 0; i < BR_N; i += 1) {
          do { brown.mx[i] = Math.random() * BR.w; brown.my[i] = Math.random() * BR.h; } while (Math.hypot(brown.mx[i] - brown.gx, brown.my[i] - brown.gy) < BR_R + 2);
          brown.mvx[i] = gauss() * speed; brown.mvy[i] = gauss() * speed;
        }
      },
      molecules() { brown.show = !brown.show; },
      tick(dt) {
        const M = state.brownian.grainMass; const b = brown;
        for (let s = 0; s < 2; s += 1) {
          const h = dt / 2;
          b.gx += b.gvx * h; b.gy += b.gvy * h;
          if (b.gx < BR_R || b.gx > BR.w - BR_R) { b.gvx = -b.gvx; b.gx = Math.max(BR_R, Math.min(BR.w - BR_R, b.gx)); }
          if (b.gy < BR_R || b.gy > BR.h - BR_R) { b.gvy = -b.gvy; b.gy = Math.max(BR_R, Math.min(BR.h - BR_R, b.gy)); }
          for (let i = 0; i < BR_N; i += 1) {
            b.mx[i] += b.mvx[i] * h; b.my[i] += b.mvy[i] * h;
            if (b.mx[i] < 0 || b.mx[i] > BR.w) { b.mvx[i] = -b.mvx[i]; b.mx[i] = Math.max(0, Math.min(BR.w, b.mx[i])); }
            if (b.my[i] < 0 || b.my[i] > BR.h) { b.mvy[i] = -b.mvy[i]; b.my[i] = Math.max(0, Math.min(BR.h, b.my[i])); }
            const dx = b.mx[i] - b.gx; const dy = b.my[i] - b.gy; const d = Math.hypot(dx, dy);
            if (d < BR_R && d > 0) {
              const nx = dx / d; const ny = dy / d; const vn = (b.mvx[i] - b.gvx) * nx + (b.mvy[i] - b.gvy) * ny;
              if (vn < 0) {
                b.mvx[i] -= 2 * M / (1 + M) * vn * nx; b.mvy[i] -= 2 * M / (1 + M) * vn * ny;
                b.gvx += 2 / (1 + M) * vn * nx; b.gvy += 2 / (1 + M) * vn * ny;
              }
              b.mx[i] = b.gx + nx * BR_R; b.my[i] = b.gy + ny * BR_R;
            }
          }
        }
        b.sample += dt;
        if (b.sample >= 0.1) {
          b.sample = 0; b.samples.push([b.gx, b.gy]); b.trail.push([b.gx, b.gy]);
          if (b.samples.length > 3000) b.samples.shift(); if (b.trail.length > 600) b.trail.shift();
        }
      },
      draw() {
        const b = brown;
        ctx.strokeStyle = 'rgba(135, 157, 172, .3)'; ctx.strokeRect(BR.x, BR.y, BR.w, BR.h);
        if (b.show) { ctx.fillStyle = 'rgba(169, 216, 255, .6)'; for (let i = 0; i < BR_N; i += 1) ctx.fillRect(BR.x + b.mx[i] - 1, BR.y + b.my[i] - 1, 2, 2); }
        polyline(b.trail.map(([x, y]) => [BR.x + x, BR.y + y]), 'rgba(255, 178, 107, .6)', 1.2);
        const g = ctx.createRadialGradient(BR.x + b.gx - 6, BR.y + b.gy - 6, 2, BR.x + b.gx, BR.y + b.gy, BR_R);
        g.addColorStop(0, '#fff1c4'); g.addColorStop(0.5, '#ffb26b'); g.addColorStop(1, '#b76e50');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(BR.x + b.gx, BR.y + b.gy, BR_R, 0, Math.PI * 2); ctx.fill();
        label(b.show ? 'GRAIN + MOLECULES' : 'GRAIN ONLY · as Brown saw it', BR.x, 30, '#d4dfe6');
        // mean squared displacement vs lag
        const lags = 60; const msd = [];
        for (let k = 1; k <= lags; k += 1) {
          let sum = 0; let n = 0;
          for (let i = 0; i + k < b.samples.length; i += 1) { sum += (b.samples[i + k][0] - b.samples[i][0]) ** 2 + (b.samples[i + k][1] - b.samples[i][1]) ** 2; n += 1; }
          msd.push(n ? sum / n : 0);
        }
        const gx = 650; const gw = 270; const gy = 60; const gh = 230; const yMax = Math.max(1, ...msd) * 1.1;
        label('MEAN SQUARED DISPLACEMENT', gx, 40, '#d4dfe6'); drawGrid(gx, gy, gw, gh, 4);
        if (b.samples.length > lags + 10) {
          polyline(msd.map((m, k) => [gx + (k + 1) / lags * gw, gy + gh * (1 - m / yMax)]), COLORS[0], 2);
          const slope = (msd[lags - 1] - msd[lags / 2 - 1]) / (lags / 2 * 0.1);
          polyline([[gx + 0.5 * gw, gy + gh * (1 - msd[lags / 2 - 1] / yMax)], [gx + gw, gy + gh * (1 - msd[lags - 1] / yMax)]], COLORS[1], 1, [4, 4]);
          label(`late slope → D ≈ ${(slope / 4).toFixed(1)} px²/s`, gx, gy + gh + 40, COLORS[1]);
        } else label('collecting samples…', gx + 80, gy + gh / 2, '#798995');
        label('lag τ → 6 s', gx + gw - 60, gy + gh + 15, '#798995');
        setReadout([['SAMPLES', b.samples.length], ['GRAIN SPEED', `${Math.hypot(b.gvx, b.gvy).toFixed(1)} px/s`], ['TRAIL', `${(b.trail.length / 10).toFixed(0)} s`]]);
      },
    },
  });
})();
