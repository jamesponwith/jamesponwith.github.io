// 27 · Mandelbrot set
(() => {
  const MB_W = 320; const MB_H = 153; const mb = {};
  const mbCanvas = document.createElement('canvas'); mbCanvas.width = MB_W; mbCanvas.height = MB_H;
  const mbCtx = mbCanvas.getContext('2d'); const mbImage = mbCtx.createImageData(MB_W, MB_H);

  defineTheory('mandelbrot', {
    tab: ['Mandelbrot set', 'Fractals · infinity'],
    meta: {
      category: 'FRACTAL GEOMETRY',
      title: 'Infinite complexity from z² + c',
      glyph: 'ℂ',
      description: 'Take a number c; square and add, over and over. Either the result escapes to infinity or it doesn’t. The border between the two never runs out of detail.',
      visualTitle: 'Mandelbrot set · continuous zoom',
      frame: 'COMPLEX PLANE',
      caption: 'Black: points that never escape. Color: how fast the rest flee. Click to choose where to dive.',
      equation: '<span class="accent">z₀ = 0, zₙ₊₁ = zₙ² + c</span> · c ∈ M ⇔ |zₙ| stays bounded',
      equationNote: 'Colored by smoothed escape time. Any orbit that reaches |z| > 2 is guaranteed to escape.',
      insight: 'Zoom anywhere on the edge and spirals, seahorses, and tiny copies of the whole set keep appearing. The boundary is so crinkled its fractal dimension is exactly 2 (Shishikura, 1998). Along the real axis it encodes the period doubling of experiment 03.',
      boundary: 'Double precision runs out near 10¹²× magnification, so the dive restarts there. Points needing more iterations than the limit are drawn as inside.',
    },
    defaults: { depth: 250, zoom: 0.5 },
    formats: {
      depth: (v) => `${v}`,
      zoom: (v) => `${v.toFixed(2)} e-folds/s`,
    },
    controls: () => `
      ${rangeControl('depth', 'Max iterations', 50, 1000, 50, 'Fast', 'Detailed')}
      ${rangeControl('zoom', 'Zoom speed', 0, 1.5, 0.05, 'Still', 'Dive')}
      <div class="readout" id="live-readout"></div>${playControls()}`,
    sim: {
      reset() { Object.assign(mb, { x: -0.6, y: 0, span: 3.4, tx: -0.743643887037151, ty: 0.13182590420533 }); },
      pick(x, y) { mb.tx = mb.x + (x / 960 - 0.5) * mb.span; mb.ty = mb.y - (y / 460 - 0.5) * mb.span * MB_H / MB_W; },
      tick(dt) {
        mb.span *= Math.exp(-state.mandelbrot.zoom * dt);
        const k = Math.min(1, 2.5 * dt); mb.x += (mb.tx - mb.x) * k; mb.y += (mb.ty - mb.y) * k;
        if (mb.span < 3.4e-12) this.reset();
      },
      draw() {
        const px = mbImage.data; const maxIter = state.mandelbrot.depth; const aspect = MB_H / MB_W;
        for (let py = 0; py < MB_H; py += 1) {
          const ci = mb.y - (py / MB_H - 0.5) * mb.span * aspect;
          for (let pxi = 0; pxi < MB_W; pxi += 1) {
            const cr = mb.x + (pxi / MB_W - 0.5) * mb.span; const o = (py * MB_W + pxi) * 4;
            const q = (cr - 0.25) ** 2 + ci * ci; let n = maxIter;
            if (q * (q + cr - 0.25) > 0.25 * ci * ci && (cr + 1) ** 2 + ci * ci > 0.0625) {
              let zr = 0; let zi = 0; let zr2 = 0; let zi2 = 0; n = 0;
              while (n < maxIter && zr2 + zi2 < 256) { zi = 2 * zr * zi + ci; zr = zr2 - zi2 + cr; zr2 = zr * zr; zi2 = zi * zi; n += 1; }
              if (n < maxIter) {
                const t = (n + 1 - Math.log2(Math.log(zr2 + zi2) / 2)) * 0.06;
                px[o] = 40 + 90 * (0.5 + 0.5 * Math.cos(6.28 * (t + 0.55))) + 120 * (0.5 + 0.5 * Math.cos(6.28 * (t + 0.05))) ** 6;
                px[o + 1] = 30 + 190 * (0.5 + 0.5 * Math.cos(6.28 * (t + 0.35)));
                px[o + 2] = 50 + 170 * (0.5 + 0.5 * Math.cos(6.28 * (t + 0.15)));
                px[o + 3] = 255; continue;
              }
            }
            px[o] = 4; px[o + 1] = 6; px[o + 2] = 10; px[o + 3] = 255;
          }
        }
        mbCtx.putImageData(mbImage, 0, 0);
        ctx.imageSmoothingEnabled = true; ctx.drawImage(mbCanvas, 0, 0, 960, 460);
        polyline([[472, 230], [488, 230]], 'rgba(255, 255, 255, .4)', 1); polyline([[480, 222], [480, 238]], 'rgba(255, 255, 255, .4)', 1);
        setReadout([['MAGNIFICATION', `${sci(3.4 / mb.span)}×`], ['CENTER', `${mb.x.toFixed(6)}`], ['', `${mb.y >= 0 ? '+' : '−'}${Math.abs(mb.y).toFixed(6)} i`], ['MAX ITERATIONS', maxIter]]);
      },
    },
  });
})();
