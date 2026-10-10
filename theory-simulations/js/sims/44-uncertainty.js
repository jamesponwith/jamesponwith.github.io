// 44 · Uncertainty principle
(() => {
  const X_MIN = -15; const X_MAX = 45; const unc = { t: 0 };
  // free Gaussian packet, ħ = m = 1: s = σ₀² + it/2, ψ ∝ exp(−(x − k₀t)²/(4s) + i k₀ x − i k₀² t / 2) / √s
  function psi(x) {
    const { sigma, k0 } = state.uncertainty; const t = unc.t; const sr = sigma * sigma; const si = t / 2; const d = sr * sr + si * si;
    const q = (x - k0 * t) ** 2 / 4; const re = -q * sr / d; const im = q * si / d + k0 * x - k0 * k0 * t / 2;
    const amp = Math.exp(re) / d ** 0.25; const ph = im - 0.5 * Math.atan2(si, sr);
    return [amp * Math.cos(ph), amp * Math.sin(ph)];
  }

  defineTheory('uncertainty', {
    tab: ['Uncertainty principle', 'Heisenberg · waves'],
    meta: {
      category: 'QUANTUM MECHANICS',
      title: 'The uncertainty principle',
      glyph: 'ΔxΔp',
      description: 'A particle confined to a small region must have a wide spread of momenta. Heisenberg (1927): the product of the two spreads can never fall below ħ/2. It is a property of waves, not a flaw of instruments.',
      visualTitle: 'Free Gaussian wave packet · position, momentum, phase space',
      frame: 'ħ = m = 1',
      caption: 'Top: position probability and Re ψ. Bottom left: momentum probability. Bottom right: the phase-space ellipse—its area never shrinks.',
      equation: '<span class="accent">σₓ σₚ ≥ ħ/2</span>',
      equationNote: 'A Gaussian packet meets the bound exactly at t = 0. Free motion shears the phase-space ellipse: σₓ(t) = σ₀ √(1 + (ħt / 2mσ₀²)²) while σₚ stays fixed.',
      insight: 'Squeeze the packet and its momentum spread widens—so it spreads out faster. That is why an electron cannot sit on the nucleus: confinement costs momentum, which costs energy. Short laser pulses and short sounds obey the same trade-off with bandwidth (experiment 14).',
      boundary: 'One free particle in one dimension starting as a Gaussian; the run restarts when it leaves the window.',
    },
    defaults: { sigma: 1.5, k0: 2 },
    formats: {
      sigma: (v) => `σ₀ = ${v.toFixed(2)}`,
      k0: (v) => `k₀ = ${v.toFixed(1)}`,
    },
    controls: () => `
      ${rangeControl('sigma', 'Initial width σ₀', 0.4, 4, 0.05, 'Tight', 'Wide')}
      ${rangeControl('k0', 'Average momentum k₀', 0.5, 4, 0.1, 'Slow', 'Fast')}
      <div class="readout" id="live-readout"></div>${playControls()}`,
    sim: {
      resetOn: ['sigma', 'k0'],
      reset() { unc.t = 0; },
      tick(dt) { unc.t += dt * 2; if (state.uncertainty.k0 * unc.t > X_MAX - 5) unc.t = 0; },
      draw() {
        const { sigma, k0 } = state.uncertainty; const sp = 1 / (2 * sigma); const sx = sigma * Math.sqrt(1 + (unc.t / (2 * sigma * sigma)) ** 2);
        // position space
        const px = 30; const pw = 900; const py = 30; const ph = 170; const toX = (x) => px + (x - X_MIN) / (X_MAX - X_MIN) * pw;
        const samples = Array.from({ length: 900 }, (_, i) => { const x = X_MIN + i / 899 * (X_MAX - X_MIN); const [re, im] = psi(x); return [x, re, re * re + im * im]; });
        const top = 1 / Math.sqrt(sigma * sigma) * 1.05;
        label('POSITION  |ψ(x)|²', px, py - 8, '#d4dfe6'); polyline([[px, py + ph], [px + pw, py + ph]], 'rgba(135, 157, 172, .35)', 1);
        polyline(samples.map(([x, re]) => [toX(x), py + ph / 2 - re / Math.sqrt(top) * ph / 2.4]), 'rgba(188, 155, 255, .45)', 1);
        ctx.beginPath(); ctx.moveTo(toX(X_MIN), py + ph); samples.forEach(([x, , p]) => ctx.lineTo(toX(x), py + ph - p / top * ph)); ctx.lineTo(toX(X_MAX), py + ph); ctx.closePath();
        ctx.fillStyle = 'rgba(101, 224, 208, .25)'; ctx.fill(); ctx.strokeStyle = COLORS[0]; ctx.lineWidth = 1.6; ctx.stroke();
        polyline([[toX(k0 * unc.t - sx), py + ph + 10], [toX(k0 * unc.t + sx), py + ph + 10]], COLORS[0], 2); label(`2σₓ = ${(2 * sx).toFixed(2)}`, toX(k0 * unc.t + sx) + 6, py + ph + 14, COLORS[0], 8);
        // momentum space (constant for a free particle)
        const mx = 30; const mw = 420; const my = 260; const mh = 150; const pMax = 8; const toP = (p) => mx + p / pMax * mw;
        label('MOMENTUM  |φ(p)|²', mx, my - 8, '#d4dfe6'); polyline([[mx, my + mh], [mx + mw, my + mh]], 'rgba(135, 157, 172, .35)', 1);
        polyline(Array.from({ length: 300 }, (_, i) => { const p = i / 299 * pMax; return [toP(p), my + mh - Math.exp(-((p - k0) ** 2) / (2 * sp * sp)) * mh * 0.95]; }), COLORS[1], 2);
        polyline([[toP(k0 - sp), my + mh + 10], [toP(k0 + sp), my + mh + 10]], COLORS[1], 2); label(`2σₚ = ${(2 * sp).toFixed(2)}`, toP(k0 + sp) + 6, my + mh + 14, COLORS[1], 8);
        // phase-space ellipse: covariance [[σx², σp² t], [σp² t, σp²]] around (k0 t, k0)
        const ex = 520; const ew = 400; const ey = 260; const eh = 150; const t = unc.t;
        const toEX = (x) => ex + (x - X_MIN) / (X_MAX - X_MIN) * ew; const toEY = (p) => ey + eh - p / pMax * eh;
        label('PHASE SPACE (x, p)', ex, ey - 8, '#d4dfe6'); drawGrid(ex, ey, ew, eh, 2);
        const a = sx; const b = sp * sp * t / a; const d = Math.sqrt(Math.max(1e-9, sp * sp - b * b));
        const ell = (cx, cy, a1, b1, d1) => Array.from({ length: 73 }, (_, i) => { const th = i / 72 * 2 * Math.PI; return [toEX(cx + a1 * Math.cos(th)), toEY(cy + b1 * Math.cos(th) + d1 * Math.sin(th))]; });
        polyline(ell(0, k0, sigma, 0, sp), 'rgba(169, 182, 192, .35)', 1, [3, 4]);
        polyline(ell(k0 * t, k0, a, b, d), '#fff1c4', 2);
        label(`area ∝ σₓσₚ at t = 0: ${(sigma * sp).toFixed(3)} = ħ/2`, ex, ey + eh + 16, '#798995', 8);
        setReadout([['σₓ (now)', sx.toFixed(3)], ['σₚ', sp.toFixed(3)], ['σₓ · σₚ', `${(sx * sp).toFixed(3)} ≥ 0.5`], ['TIME', t.toFixed(1)]]);
      },
    },
  });
})();
