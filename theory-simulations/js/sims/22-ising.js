// 22 · Ising model
(() => {
  const TC = 2 / Math.log(1 + Math.SQRT2);
  const spins = new Int8Array(FIELD_W * FIELD_H);
  const onsager = (T) => (T >= TC ? 0 : (1 - Math.sinh(2 / T) ** -4) ** 0.125);

  defineTheory('ising', {
    wave: 'WAVE 05 · CRITICALITY & COMPUTATION',
    tab: ['Ising model', 'Magnets · phase transitions'],
    meta: {
      category: 'STATISTICAL MECHANICS',
      title: 'How a magnet chooses a direction',
      glyph: '⇅',
      description: 'Atomic spins each prefer to align with their neighbors, but heat jostles them. Below a critical temperature order wins and a magnet is born—the textbook phase transition.',
      visualTitle: 'Ising model · Metropolis Monte Carlo',
      frame: '240 × 115 SPINS',
      caption: 'Cyan: spin up. Violet: spin down. Click to paint up-spins. Inset: magnetization vs Onsager’s exact solution.',
      equation: '<span class="accent">E = −J Σ⟨ij⟩ sᵢsⱼ − h Σᵢ sᵢ</span>',
      equationNote: 'Each spin sᵢ = ±1. A flip is accepted with probability min(1, e^(−ΔE/kT)). Onsager (1944): T_c = 2J / k ln(1+√2) ≈ 2.269.',
      insight: 'Cool below T_c and domains grow until one direction wins; heat above it and order dissolves into noise. Right at T_c, clusters of every size appear—the fingerprint of criticality shared by magnets, alloys, and boiling water.',
      boundary: 'Square lattice, nearest-neighbor coupling, wrap-around edges. Below T_c the grid can stay stuck in stripes for a long time; a finite grid rounds the sharp transition.',
    },
    defaults: { temp: 2.27, field: 0 },
    formats: {
      temp: (v) => `T = ${v.toFixed(2)}`,
      field: (v) => `h = ${v.toFixed(2)}`,
    },
    controls: () => `
      ${rangeControl('temp', 'Temperature', 0.5, 5, 0.01, 'Cold', 'Hot')}
      ${rangeControl('field', 'External field', -1, 1, 0.05, 'Down', 'Up')}
      <div class="readout" id="live-readout"></div>${playControls()}`,
    sim: {
      reset() { for (let i = 0; i < spins.length; i += 1) spins[i] = Math.random() < 0.5 ? 1 : -1; },
      pick(x, y) {
        const gx = Math.floor(x / 960 * FIELD_W); const gy = Math.floor(y / 460 * FIELD_H);
        for (let dy = -10; dy <= 10; dy += 1) for (let dx = -10; dx <= 10; dx += 1) if (dx * dx + dy * dy <= 100) spins[((gy + dy + FIELD_H) % FIELD_H) * FIELD_W + ((gx + dx + FIELD_W) % FIELD_W)] = 1;
      },
      tick() {
        const { temp, field } = state.ising; const n = spins.length;
        for (let k = 0; k < 2 * n; k += 1) {
          const i = Math.floor(Math.random() * n); const x = i % FIELD_W; const y = (i - x) / FIELD_W;
          const sum = spins[y * FIELD_W + (x + 1) % FIELD_W] + spins[y * FIELD_W + (x + FIELD_W - 1) % FIELD_W] + spins[((y + 1) % FIELD_H) * FIELD_W + x] + spins[((y + FIELD_H - 1) % FIELD_H) * FIELD_W + x];
          const dE = 2 * spins[i] * (sum + field);
          if (dE <= 0 || Math.random() < Math.exp(-dE / temp)) spins[i] = -spins[i];
        }
      },
      draw() {
        const px = fieldImage.data; let m = 0; let e = 0; const h = state.ising.field;
        for (let i = 0; i < spins.length; i += 1) {
          const o = i * 4; const s = spins[i]; m += s;
          const x = i % FIELD_W; const y = (i - x) / FIELD_W;
          e -= s * (spins[y * FIELD_W + (x + 1) % FIELD_W] + spins[((y + 1) % FIELD_H) * FIELD_W + x]) + h * s;
          if (s > 0) { px[o] = 70; px[o + 1] = 190; px[o + 2] = 180; } else { px[o] = 40; px[o + 1] = 30; px[o + 2] = 70; }
          px[o + 3] = 255;
        }
        fieldCtx.putImageData(fieldImage, 0, 0);
        ctx.imageSmoothingEnabled = false; ctx.drawImage(fieldCanvas, 0, 0, 960, 460); ctx.imageSmoothingEnabled = true;
        m /= spins.length; e /= spins.length;
        // inset: |m| vs T with Onsager's exact curve
        const ix = 690; const iy = 300; const iw = 230; const ih = 120; const T = state.ising.temp; const toX = (t) => ix + (t - 0.5) / 4.5 * iw;
        ctx.fillStyle = '#0c1219'; ctx.fillRect(ix - 34, iy - 28, iw + 50, ih + 54); ctx.strokeStyle = '#26313d'; ctx.strokeRect(ix - 34, iy - 28, iw + 50, ih + 54);
        label('|m| vs TEMPERATURE', ix - 24, iy - 12, '#d4dfe6', 8);
        polyline(Array.from({ length: 200 }, (_, i) => { const t = 0.5 + i / 199 * 4.5; return [toX(t), iy + ih * (1 - onsager(t))]; }), COLORS[1], 1.5);
        polyline([[toX(TC), iy], [toX(TC), iy + ih]], 'rgba(255, 241, 196, .3)', 1, [3, 4]); label('T_c', toX(TC) + 3, iy + 10, '#fff1c4', 8);
        drawStar(toX(T), iy + ih * (1 - Math.abs(m)), 4, COLORS[0]);
        label('0.5', ix - 6, iy + ih + 14, '#596a78', 8); label('T → 5', ix + iw - 28, iy + ih + 14, '#596a78', 8);
        setReadout([['MAGNETIZATION m', m.toFixed(3)], ['ONSAGER |m|', onsager(T).toFixed(3)], ['ENERGY / SPIN', e.toFixed(3)], ['T / T_c', (T / TC).toFixed(2)]]);
      },
    },
  });
})();
