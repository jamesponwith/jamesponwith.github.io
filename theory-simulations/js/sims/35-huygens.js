// 35 · Huygens' principle
(() => {
  const BAR = 70; const N = FIELD_W * FIELD_H; const SLITS = ['One slit', 'Two slits'];
  const hg = { re: new Float32Array(N), im: new Float32Array(N), screen: new Float32Array(FIELD_H), t: 0 };
  const apertures = () => {
    const { lambda, aperture, slitCount } = state.huygens; const w = aperture * lambda; const mid = FIELD_H / 2;
    return slitCount ? [[mid - 2 * lambda - w / 2, mid - 2 * lambda + w / 2], [mid + 2 * lambda - w / 2, mid + 2 * lambda + w / 2]] : [[mid - w / 2, mid + w / 2]];
  };

  // Huygens–Fresnel: every open point of the barrier re-emits a wavelet; precompute the complex sum per cell
  function build() {
    const k = 2 * Math.PI / state.huygens.lambda; const sources = []; const spacing = Math.max(0.5, state.huygens.lambda / 6);
    apertures().forEach(([y0, y1]) => { for (let y = Math.max(0, y0); y <= Math.min(FIELD_H, y1); y += spacing) sources.push(y); });
    let norm = 1e-9;
    for (let y = 0; y < FIELD_H; y += 1) for (let x = 0; x < FIELD_W; x += 1) {
      const i = y * FIELD_W + x;
      if (x < BAR) { hg.re[i] = Math.cos(k * (x - BAR)); hg.im[i] = Math.sin(k * (x - BAR)); continue; }
      let re = 0; let im = 0;
      for (const sy of sources) { const r = Math.hypot(x - BAR + 0.5, y + 0.5 - sy); const a = 1 / Math.sqrt(r + 1); re += a * Math.cos(k * r); im += a * Math.sin(k * r); }
      hg.re[i] = re; hg.im[i] = im; if (x === BAR + 6) norm = Math.max(norm, Math.hypot(re, im));
    }
    for (let y = 0; y < FIELD_H; y += 1) for (let x = BAR; x < FIELD_W; x += 1) { const i = y * FIELD_W + x; hg.re[i] /= norm; hg.im[i] /= norm; }
    for (let y = 0; y < FIELD_H; y += 1) { const i = y * FIELD_W + FIELD_W - 3; hg.screen[y] = hg.re[i] ** 2 + hg.im[i] ** 2; }
    hg.sources = sources;
  }

  defineTheory('huygens', {
    tab: ['Huygens’ principle', 'Wavelets · diffraction'],
    meta: {
      category: 'OPTICS',
      title: 'Every point is a new source',
      glyph: '◌',
      description: 'Huygens (1678): each point on a wavefront acts as a tiny source of new wavelets; the next wavefront is their envelope. Squeeze a wave through a gap and that idea predicts how it spreads.',
      visualTitle: 'Huygens–Fresnel construction · aperture diffraction',
      frame: 'WAVE FIELD',
      caption: 'Left: a plane wave arrives. Right: the sum of wavelets from every open point in the barrier. White rings: three of those wavelets. Far right: intensity on a screen.',
      equation: '<span class="accent">ψ(P) ∝ Σ_apertures e^(ikr) / √r</span>',
      equationNote: 'Each open point re-radiates with the incoming phase; the field anywhere beyond is the sum. Fresnel added interference to Huygens’ construction in 1818.',
      insight: 'A gap much wider than the wavelength passes a nearly straight beam; a gap narrower than one wavelength turns it into a circular wave. Sound bends around doorways while light seems not to—only because their wavelengths differ a million-fold. Two slits recover experiment 01’s fringes.',
      boundary: 'Scalar 2-D waves, an ideally thin absorbing barrier, and no reflections. The simple 1/√r wavelet ignores the obliquity factor, so very wide angles are approximate.',
    },
    defaults: { lambda: 10, aperture: 1, slitCount: 0 },
    formats: {
      lambda: (v) => `λ = ${v} cells`,
      aperture: (v) => `${v.toFixed(1)} λ wide`,
      slitCount: (v) => SLITS[v],
    },
    controls: () => `
      ${rangeControl('aperture', 'Gap width', 0.3, 8, 0.1, 'Narrow', 'Wide')}
      ${rangeControl('lambda', 'Wavelength', 6, 20, 1, 'Short', 'Long')}
      ${rangeControl('slitCount', 'Openings', 0, 1, 1, SLITS[0], SLITS[1])}
      <div class="readout" id="live-readout"></div>${playControls()}`,
    sim: {
      resetOn: ['lambda', 'aperture', 'slitCount'],
      reset() { build(); },
      tick(dt) { hg.t += dt; },
      draw() {
        const c = Math.cos(2 * Math.PI * hg.t); const s = Math.sin(2 * Math.PI * hg.t); const px = fieldImage.data; const open = apertures();
        for (let y = 0; y < FIELD_H; y += 1) {
          const blocked = !open.some(([y0, y1]) => y + 0.5 >= y0 && y + 0.5 <= y1);
          for (let x = 0; x < FIELD_W; x += 1) {
            const i = y * FIELD_W + x; const o = i * 4;
            if ((x === BAR || x === BAR - 1) && blocked) { px[o] = 255; px[o + 1] = 178; px[o + 2] = 107; px[o + 3] = 255; continue; }
            const v = Math.tanh(1.3 * (hg.re[i] * c + hg.im[i] * s)); const a = Math.abs(v);
            if (v > 0) { px[o] = 12 + 89 * a; px[o + 1] = 17 + 207 * a; px[o + 2] = 24 + 184 * a; } else { px[o] = 12 + 176 * a; px[o + 1] = 17 + 138 * a; px[o + 2] = 24 + 231 * a; }
            px[o + 3] = 255;
          }
        }
        fieldCtx.putImageData(fieldImage, 0, 0);
        ctx.imageSmoothingEnabled = true; ctx.drawImage(fieldCanvas, 0, 0, 960, 460);
        // three sample wavelets from the first opening
        const cell = 960 / FIELD_W; const lamPx = state.huygens.lambda * cell; const [y0, y1] = open[0];
        ctx.save(); ctx.beginPath(); ctx.rect(BAR * cell, 0, 960, 460); ctx.clip();
        [y0, (y0 + y1) / 2, y1].forEach((sy) => {
          for (let n = 0; n < 3; n += 1) {
            const r = (n + (hg.t % 1)) * lamPx; ctx.beginPath(); ctx.arc(BAR * cell, sy * cell, r, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.45 * (1 - n / 3)})`; ctx.lineWidth = 1; ctx.stroke();
          }
        });
        ctx.restore();
        // screen intensity
        const peak = Math.max(...hg.screen);
        ctx.fillStyle = 'rgba(9, 13, 18, .85)'; ctx.fillRect(892, 0, 68, 460);
        polyline(Array.from(hg.screen, (v, y) => [896 + v / peak * 58, (y + 0.5) * cell]), COLORS[1], 1.6);
        label('SCREEN', 898, 14, '#d4dfe6', 8);
        const [g0, g1] = open[0]; const ratio = (g1 - g0) / state.huygens.lambda;
        setReadout([['GAP / λ', ratio.toFixed(1)], ['WAVELETS', hg.sources.length], ['SPREADING', ratio < 1 ? 'circular' : ratio < 4 ? 'strong' : 'beam-like']]);
      },
    },
  });
})();
