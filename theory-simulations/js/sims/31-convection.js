// 31 · Mantle convection
(() => {
  // Boussinesq vorticity–streamfunction, periodic in x, free-slip top and bottom.
  // Row 0 = bottom (T = 1), row NY−1 = top (T = 0). Grid units, κ = ν.
  const NX = 120; const NY = 57; const H = NY - 1; const K = 0.2; const RA_C = 27 * Math.PI ** 4 / 4;
  const T = new Float64Array(NX * NY); const W = new Float64Array(NX * NY); const P = new Float64Array(NX * NY);
  const T2 = new Float64Array(NX * NY); const W2 = new Float64Array(NX * NY);
  const id = (x, y) => y * NX + ((x + NX) % NX);
  const cv = { maxU: 0, steps: 0 };
  const cvCanvas = document.createElement('canvas'); cvCanvas.width = NX; cvCanvas.height = NY;
  const cvCtx = cvCanvas.getContext('2d'); const cvImage = cvCtx.createImageData(NX, NY);
  const velocity = (x, y) => [(P[(y + 1) * NX + x] - P[(y - 1) * NX + x]) / 2, -(P[id(x + 1, y)] - P[id(x - 1, y)]) / 2];

  function step() {
    const g = 10 ** state.convection.rayleigh * K * K / H ** 3;
    for (let it = 0; it < 12; it += 1) for (let y = 1; y < H; y += 1) for (let x = 0; x < NX; x += 1) {
      const i = y * NX + x;
      P[i] += 1.85 * ((P[id(x - 1, y)] + P[id(x + 1, y)] + P[i - NX] + P[i + NX] + W[i]) / 4 - P[i]);
    }
    let maxU = 1e-9;
    for (let y = 1; y < H; y += 1) for (let x = 0; x < NX; x += 1) { const [u, v] = velocity(x, y); maxU = Math.max(maxU, Math.abs(u), Math.abs(v)); }
    // upwind advection stays bounded only if advection and diffusion share one step budget
    const dt = 0.9 / (4 * K + 2 * maxU);
    for (let y = 1; y < H; y += 1) for (let x = 0; x < NX; x += 1) {
      const i = y * NX + x; const l = id(x - 1, y); const r = id(x + 1, y); const d = i - NX; const up = i + NX;
      const u = (P[up] - P[d]) / 2; const v = -(P[r] - P[l]) / 2;
      const adv = (F) => (u > 0 ? u * (F[i] - F[l]) : u * (F[r] - F[i])) + (v > 0 ? v * (F[i] - F[d]) : v * (F[up] - F[i]));
      const lap = (F) => F[l] + F[r] + F[d] + F[up] - 4 * F[i];
      T2[i] = T[i] + dt * (-adv(T) + K * lap(T));
      W2[i] = W[i] + dt * (-adv(W) + K * lap(W) + g * (T[r] - T[l]) / 2);
    }
    for (let i = NX; i < H * NX; i += 1) { T[i] = T2[i]; W[i] = W2[i]; }
    cv.maxU = maxU; cv.steps += 1;
  }

  defineTheory('convection', {
    tab: ['Plate tectonics', 'Mantle convection'],
    meta: {
      category: 'GEOPHYSICS',
      title: 'The engine under the plates',
      glyph: '⟳',
      description: 'Earth’s mantle is solid rock, yet over millions of years it flows. Heated from below and cooled from above, it overturns in giant convection cells that drag tectonic plates across the surface.',
      visualTitle: 'Rayleigh–Bénard convection · Boussinesq model',
      frame: 'MANTLE CROSS-SECTION',
      caption: 'Color: temperature—hot rises, cold sinks. Top strip: surface motion, with spreading ridges and sinking trenches marked.',
      equation: '<span class="accent">Ra = gαΔT d³ / κν</span> · convection begins above Ra_c ≈ 658',
      equationNote: 'Ra compares buoyancy with how fast diffusion drains heat and momentum. Solved with a vorticity–streamfunction scheme: free-slip walls, hot floor, cold lid. Onset is slow just above Ra_c.',
      insight: 'Below Ra_c heat just conducts and nothing moves. Above it, plumes rise and sheets sink; the Nusselt number counts how much faster convection moves heat than conduction. Earth’s mantle sits near Ra ≈ 10⁷: hot rock rises under ridges and cold slabs dive at trenches.',
      boundary: 'A 2-D box with uniform viscosity and no plates of its own; ridges and trenches are read off the flow. The real mantle is so viscous that inertia is irrelevant (Prandtl ≈ 10²³); here viscosity equals diffusivity so it runs in seconds.',
    },
    defaults: { rayleigh: 5 },
    formats: {
      rayleigh: (v) => `Ra = 10${String(v.toFixed(1)).replace(/./g, (c) => SUP[c] || (c === '.' ? '·' : c))}`,
    },
    controls: () => `
      ${rangeControl('rayleigh', 'Rayleigh number (log)', 2.5, 6.5, 0.1, 'Sluggish', 'Vigorous')}
      <div class="readout" id="live-readout"></div>${playControls()}`,
    sim: {
      reset() {
        for (let y = 0; y < NY; y += 1) for (let x = 0; x < NX; x += 1) T[y * NX + x] = 1 - y / H + (y > 0 && y < H ? 0.05 * (Math.random() - 0.5) : 0);
        W.fill(0); P.fill(0); cv.steps = 0; cv.maxU = 0;
      },
      tick() { for (let s = 0; s < 10; s += 1) step(); },
      draw() {
        const px = cvImage.data;
        for (let y = 0; y < NY; y += 1) for (let x = 0; x < NX; x += 1) {
          const t = Math.max(0, Math.min(1, T[y * NX + x])); const o = ((H - y) * NX + x) * 4;
          const c = t < 0.5 ? [20 + 300 * t, 30 + 40 * t, 70 - 40 * t] : [170 + 170 * (t - 0.5), 50 + 340 * (t - 0.5), 50 + 140 * (t - 0.5)];
          px[o] = c[0]; px[o + 1] = c[1]; px[o + 2] = c[2]; px[o + 3] = 255;
        }
        cvCtx.putImageData(cvImage, 0, 0);
        const top = 46; const cell = 960 / NX; const rowH = (460 - top) / NY;
        ctx.imageSmoothingEnabled = true; ctx.drawImage(cvCanvas, 0, top, 960, 460 - top);
        // sparse flow arrows
        for (let y = 4; y < H; y += 7) for (let x = 3; x < NX; x += 7) {
          const [u, v] = velocity(x, y); const s = 9 / Math.max(cv.maxU, 1e-6);
          const sx = (x + 0.5) * cell; const sy = top + (H - y + 0.5) * rowH;
          polyline([[sx, sy], [sx + u * s, sy - v * s]], 'rgba(230, 240, 255, .35)', 1);
        }
        // surface strip: plate motion, ridges (divergence) and trenches (convergence)
        ctx.fillStyle = '#0c1219'; ctx.fillRect(0, 0, 960, top);
        const surf = Array.from({ length: NX }, (_, x) => velocity(x, H - 1)[0]);
        const div = surf.map((_, x) => surf[(x + 1) % NX] - surf[(x - 1 + NX) % NX]);
        const maxDiv = Math.max(1e-9, ...div.map(Math.abs));
        for (let x = 2; x < NX; x += 5) polyline([[(x + 0.5) * cell, 30], [(x + 0.5) * cell + surf[x] / Math.max(cv.maxU, 1e-6) * 18, 30]], 'rgba(169, 182, 192, .7)', 1.5);
        label('SURFACE', 8, 14, '#d4dfe6', 8);
        div.forEach((d, x) => {
          const peak = Math.abs(d) > 0.4 * maxDiv && Math.abs(d) >= Math.abs(div[(x + 1) % NX]) && Math.abs(d) >= Math.abs(div[(x - 1 + NX) % NX]);
          if (!peak || cv.maxU < 0.01) return;
          label(d > 0 ? '▲ ridge' : '▼ trench', (x + 0.5) * cell - 14, 14, d > 0 ? COLORS[0] : COLORS[1], 8);
        });
        let nu = 0; for (let x = 0; x < NX; x += 1) nu += (T[(H - 1) * NX + x] - T[H * NX + x]) * H; nu /= NX;
        const ra = 10 ** state.convection.rayleigh;
        setReadout([['Ra / Ra_c', (ra / RA_C).toFixed(1)], ['NUSSELT Nu', nu.toFixed(2)], ['MAX SPEED', `${cv.maxU.toFixed(3)} cells/step`], ['STATE', ra < RA_C ? 'conducting' : cv.maxU < 0.01 ? 'instability growing…' : 'convecting']]);
      },
    },
  });
})();
