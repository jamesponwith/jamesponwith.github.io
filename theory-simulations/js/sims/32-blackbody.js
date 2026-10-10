// 32 · Black-body radiation
(() => {
  const PL = { h: 6.626e-34, c: 2.998e8, k: 1.381e-23, sigma: 5.670e-8, wien: 2.898e-3 };
  const planck = (lam, T) => 2 * PL.h * PL.c ** 2 / lam ** 5 / Math.expm1(PL.h * PL.c / (lam * PL.k * T));
  const rayleighJeans = (lam, T) => 2 * PL.c * PL.k * T / lam ** 4;
  const T_REFS = [[310, 'human body'], [1400, 'lava'], [2800, 'incandescent bulb'], [5772, 'the Sun'], [9940, 'Sirius'], [12100, 'Rigel']];
  const bb = { photons: [], carry: 0 };
  // approximate color of a black body (Helland's fit)
  function blackbodyRGB(T) {
    const t = T / 100; const clamp = (v) => Math.max(0, Math.min(255, v));
    const r = t <= 66 ? 255 : clamp(329.7 * (t - 60) ** -0.1332);
    const g = t <= 66 ? clamp(99.47 * Math.log(t) - 161.12) : clamp(288.12 * (t - 60) ** -0.0755);
    const b = t >= 66 ? 255 : t <= 19 ? 0 : clamp(138.52 * Math.log(t - 10) - 305.04);
    return [r, g, b];
  }
  function samplePhotonLambda(T) {
    for (;;) { const x = 0.05 + Math.random() * 12; if (Math.random() * 0.65 < x * x / Math.expm1(x)) return PL.h * PL.c / (x * PL.k * T); }
  }

  defineTheory('blackbody', {
    tab: ['Black-body radiation', 'Planck · the first quantum'],
    meta: {
      category: 'QUANTUM ORIGINS',
      title: 'The glow that launched quantum theory',
      glyph: 'hν',
      description: 'Every warm object glows. Classical physics predicted that glow should be infinitely bright in the ultraviolet. Planck (1900) fixed it by assuming light comes in packets of energy hν—the first quantum.',
      visualTitle: 'Black-body radiation · Planck vs Rayleigh–Jeans',
      frame: 'SPECTRUM',
      caption: 'Left: photons sampled from Planck’s law (grey: invisible infrared or ultraviolet). Right: the spectrum, and the classical curve that blows up.',
      equation: '<span class="accent">B(λ,T) = (2hc²/λ⁵) · 1 / (e^(hc/λkT) − 1)</span>',
      equationNote: 'At long wavelengths this becomes Rayleigh–Jeans, B ≈ 2ckT/λ⁴, which diverges at short ones. Wien: λ_peak = 2.898 mm·K / T. Total power: σT⁴.',
      insight: 'Cool objects glow only in infrared—you do too, peaking near 9 μm. Heat iron toward 1,000 K and the visible tail turns red; the Sun at 5,772 K peaks in the visible; hot stars glow blue-white. Star colors are thermometers.',
      boundary: 'An ideal black body. Real surfaces emit less (emissivity below 1), star spectra carry absorption lines, and on-screen colors are approximate.',
    },
    defaults: { kelvin: Math.log10(5772) },
    formats: {
      kelvin: (v) => {
        const T = 10 ** v; const near = T_REFS.find(([t]) => Math.abs(Math.log10(t) - v) < 0.04);
        return `${Math.round(T).toLocaleString()} K${near ? ` · ${near[1]}` : ''}`;
      },
    },
    controls: () => `
      ${rangeControl('kelvin', 'Temperature', 2.4, 4.5, 0.005, '250 K', '30,000 K')}
      <div class="readout" id="live-readout"></div>${playControls()}`,
    sim: {
      reset() { bb.photons = []; bb.carry = 0; },
      tick(dt) {
        const T = 10 ** state.blackbody.kelvin;
        bb.carry += dt * 140;
        while (bb.carry >= 1) {
          bb.carry -= 1; const a = Math.random() * 2 * Math.PI;
          bb.photons.push({ x: 230 + 72 * Math.cos(a), y: 230 + 72 * Math.sin(a), vx: Math.cos(a) * 170, vy: Math.sin(a) * 170, nm: samplePhotonLambda(T) * 1e9 });
        }
        bb.photons.forEach((p) => { p.x += p.vx * dt; p.y += p.vy * dt; });
        bb.photons = bb.photons.filter((p) => p.x > 0 && p.x < 470 && p.y > 0 && p.y < 460);
      },
      draw() {
        const T = 10 ** state.blackbody.kelvin; const [r, g, b] = blackbodyRGB(T);
        const brightness = Math.max(0.08, Math.min(1, (state.blackbody.kelvin - 2.75) / 0.85));
        for (const p of bb.photons) {
          if (p.nm >= 380 && p.nm <= 750) { const [pr, pg, pb] = wavelengthRGB(p.nm); ctx.fillStyle = `rgb(${pr}, ${pg}, ${pb})`; ctx.fillRect(p.x - 1.6, p.y - 1.6, 3.2, 3.2); }
          else { ctx.fillStyle = p.nm > 750 ? 'rgba(140, 90, 90, .45)' : 'rgba(150, 140, 200, .45)'; ctx.fillRect(p.x - 1, p.y - 1, 2, 2); }
        }
        const glow = ctx.createRadialGradient(230, 230, 20, 230, 230, 120);
        glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.55 * brightness})`); glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(230, 230, 120, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `rgb(${r * brightness}, ${g * brightness}, ${b * brightness})`; ctx.beginPath(); ctx.arc(230, 230, 70, 0, Math.PI * 2); ctx.fill();
        if (brightness < 0.15) label('glowing only in infrared', 168, 320, '#a9b6c0');
        // spectrum on a log-wavelength axis, normalized to the Planck peak
        const gx = 520; const gw = 400; const gy = 50; const gh = 300; const lo = Math.log10(50e-9);
        const toX = (lam) => gx + (Math.log10(lam) - lo) / 3 * gw; const peak = planck(PL.wien / T, T); const toY = (v) => gy + gh * (1 - Math.min(1.15, v) / 1.15);
        label('SPECTRAL RADIANCE (relative)', gx, 36, '#d4dfe6');
        for (let nm = 380; nm <= 750; nm += 5) { const [vr, vg, vb] = wavelengthRGB(nm); ctx.fillStyle = `rgba(${vr}, ${vg}, ${vb}, .22)`; ctx.fillRect(toX(nm * 1e-9), gy, toX((nm + 5) * 1e-9) - toX(nm * 1e-9) + 0.5, gh); }
        drawGrid(gx, gy, gw, gh, 4);
        const lams = Array.from({ length: 300 }, (_, i) => 10 ** (lo + i / 299 * 3));
        polyline(lams.map((lam) => [toX(lam), toY(rayleighJeans(lam, T) / peak)]).filter(([, y]) => y > gy + 0.5), COLORS[1], 1.6, [5, 5]);
        polyline(lams.map((lam) => [toX(lam), toY(planck(lam, T) / peak)]), COLORS[0], 2.2);
        polyline([[toX(PL.wien / T), gy], [toX(PL.wien / T), gy + gh]], 'rgba(255, 241, 196, .4)', 1, [2, 4]);
        label('50 nm', gx, gy + gh + 15, '#596a78'); label('visible', toX(470e-9), gy + gh + 15, '#a9b6c0'); label('5 μm', toX(5e-6) - 10, gy + gh + 15, '#596a78'); label('50 μm', gx + gw - 30, gy + gh + 15, '#596a78');
        label('— Planck (quantum)', gx, gy + gh + 40, COLORS[0]); label('- - Rayleigh–Jeans (classical) → ∞', gx + 150, gy + gh + 40, COLORS[1]);
        // fraction of radiance emitted in the visible band
        let vis = 0; for (let nm = 380; nm < 750; nm += 1) vis += planck(nm * 1e-9, T) * 1e-9;
        const total = PL.sigma * T ** 4 / Math.PI;
        const peakNm = PL.wien / T * 1e9;
        setReadout([['PEAK λ', peakNm > 1000 ? `${(peakNm / 1000).toFixed(2)} μm` : `${peakNm.toFixed(0)} nm`], ['POWER σT⁴', `${sci(PL.sigma * T ** 4)} W/m²`], ['VISIBLE SHARE', `${(vis / total * 100).toFixed(vis / total < 0.01 ? 4 : 1)}%`]]);
      },
    },
  });
})();
