// 51 · CMB acoustic peaks
(() => {
  // Toy acoustic model: oscillation in k·r_s with baryon loading R, radiation driving, Silk damping, and a large-scale plateau.
  // Calibrated so the default parameters reproduce the shape of the Planck 2018 spectrum; not a Boltzmann solver.
  function dl(l, ob, oc, ot) {
    const R = 30 * ob; const L = l * Math.sqrt(ot); const x = Math.PI * (L + 80) / 300;
    const osc = (1 + 0.28 * R) * Math.cos(x) - 0.28 * R; const dop = 0.6 * Math.sin(x) / Math.sqrt(1 + R);
    const drive = 1 + 1.5 * Math.exp(-L / 260) * (0.12 / oc) ** 0.7;
    const damp = Math.exp(-((L / 1180) ** 2.1) * (0.0224 / ob) ** 0.3);
    const onset = 1 - Math.exp(-((L / 140) ** 2));
    return (osc * osc + dop * dop) * drive * damp * onset + 0.55 * Math.exp(-L / 160);
  }
  const NORM = 5750 / dl(220, 0.0224, 0.12, 1);
  const spectrum = (l) => NORM * dl(l, state.cmb.baryons, state.cmb.darkMatter, state.cmb.omegaTotal);
  const DATA = Array.from({ length: 40 }, (_, i) => { const l = 30 + i * 60; return [l, NORM * dl(l, 0.0224, 0.12, 1) * (1 + 0.03 * Math.sin(i * 1.9))]; });
  // sky patch: a sum of random plane waves whose multipoles are drawn in proportion to the spectrum
  const MAP = 120; const PATCH = 0.35; const WAVES = 260;
  const sky = { field: new Float32Array(MAP * MAP), key: '' };
  const cCanvas = document.createElement('canvas'); cCanvas.width = MAP; cCanvas.height = MAP;
  const cCtx = cCanvas.getContext('2d'); const cImage = cCtx.createImageData(MAP, MAP);
  const PHASES = Array.from({ length: WAVES }, () => [Math.random() * 2 * Math.PI, Math.random() * 2 * Math.PI, Math.random(), Math.random()]);
  function buildSky() {
    const key = `${state.cmb.baryons}|${state.cmb.darkMatter}|${state.cmb.omegaTotal}`; if (key === sky.key) return; sky.key = key;
    const cdf = []; let total = 0; for (let k = 0; k < 400; k += 1) { const l = 10 * 250 ** (k / 399); total += spectrum(l); cdf.push([l, total]); }
    sky.field.fill(0);
    for (const [dir, phase, u] of PHASES) {
      const target = u * total; const l = cdf.find(([, c]) => c >= target)[0]; const k = l * PATCH / MAP;
      const kx = k * Math.cos(dir); const ky = k * Math.sin(dir);
      for (let j = 0; j < MAP; j += 1) for (let i = 0; i < MAP; i += 1) sky.field[j * MAP + i] += Math.cos(kx * i + ky * j + phase);
    }
    let sd = 0; for (const v of sky.field) sd += v * v; sky.sd = Math.sqrt(sd / sky.field.length);
  }

  defineTheory('cmb', {
    tab: ['CMB acoustic peaks', 'The Big Bang’s afterglow'],
    meta: {
      category: 'COSMOLOGY',
      title: 'Sound waves from the infant universe',
      glyph: 'ℓ',
      description: 'For 380,000 years the universe was a hot plasma ringing with sound waves. When it cooled and light broke free, those waves froze into the cosmic microwave background as hot and cold spots of characteristic sizes.',
      visualTitle: 'CMB temperature power spectrum · toy acoustic model',
      frame: '20° SKY PATCH',
      caption: 'Left: a simulated patch of microwave sky. Right: how much variation there is at each angular scale ℓ; dots are mock data shaped like Planck’s.',
      equation: '<span class="accent">Dℓ = ℓ(ℓ+1)Cℓ / 2π</span> · peaks at ℓ ≈ ℓ_A (n − ¼), ℓ_A ≈ 300',
      equationNote: 'ℓ ≈ 180° / angle on the sky. Peak positions measure the geometry of space; the odd-to-even peak ratio measures ordinary (baryonic) matter; peak heights respond to dark matter.',
      insight: 'The first peak near ℓ ≈ 220 (spots about 1° across) says space is flat. Baryons load the plasma and boost compression peaks over rarefaction peaks; the third peak’s height needs dark matter. From these wiggles Planck pinned the universe at 5% ordinary matter, 27% dark matter, 68% dark energy.',
      boundary: 'A qualitative toy, not a Boltzmann solver like CAMB or CLASS: it captures how peaks move and grow, not precise values. The data points are mock values shaped like Planck 2018.',
    },
    defaults: { baryons: 0.0224, darkMatter: 0.12, omegaTotal: 1 },
    formats: {
      baryons: (v) => `Ω_b h² = ${v.toFixed(4)}`,
      darkMatter: (v) => `Ω_c h² = ${v.toFixed(3)}`,
      omegaTotal: (v) => `Ω = ${v.toFixed(2)}${Math.abs(v - 1) < 0.005 ? ' · flat' : v > 1 ? ' · closed' : ' · open'}`,
    },
    controls: () => `
      ${rangeControl('baryons', 'Ordinary matter', 0.008, 0.04, 0.0004, 'Less', 'More')}
      ${rangeControl('darkMatter', 'Dark matter', 0.05, 0.25, 0.005, 'Less', 'More')}
      ${rangeControl('omegaTotal', 'Geometry of space', 0.7, 1.3, 0.01, 'Open', 'Closed')}
      <div class="readout" id="live-readout"></div>`,
    sim: {
      reset() { sky.key = ''; },
      draw() {
        buildSky(); const px = cImage.data;
        for (let i = 0; i < MAP * MAP; i += 1) {
          const v = Math.max(-1, Math.min(1, sky.field[i] / (2.2 * sky.sd))); const o = i * 4;
          if (v > 0) { px[o] = 40 + 215 * v; px[o + 1] = 40 + 120 * v; px[o + 2] = 60 - 30 * v; } else { px[o] = 40 + 10 * v; px[o + 1] = 40 - 10 * v; px[o + 2] = 60 - 160 * v; }
          px[o + 3] = 255;
        }
        cCtx.putImageData(cImage, 0, 0); ctx.imageSmoothingEnabled = true; ctx.drawImage(cCanvas, 20, 30, 400, 400);
        label('MICROWAVE SKY (20° × 20°)', 20, 22, '#d4dfe6'); polyline([[30, 418], [50, 418]], '#fff1c4', 2); label('1°', 54, 421, '#fff1c4', 8);
        // power spectrum
        const gx = 490; const gw = 430; const gy = 50; const gh = 330; const lMax = 2500; const yMax = 9000;
        const toX = (l) => gx + l / lMax * gw; const toY = (d) => gy + gh * (1 - Math.min(d, yMax) / yMax);
        label('POWER SPECTRUM Dℓ (μK²)', gx, 36, '#d4dfe6'); drawGrid(gx, gy, gw, gh, 3);
        DATA.forEach(([l, d]) => { polyline([[toX(l), toY(d * 0.95)], [toX(l), toY(d * 1.05)]], 'rgba(255, 178, 107, .6)', 1); drawStar(toX(l), toY(d), 2.5, COLORS[1]); });
        const curve = Array.from({ length: 500 }, (_, i) => { const l = 2 + i / 499 * (lMax - 2); return [l, spectrum(l)]; });
        polyline(curve.map(([l, d]) => [toX(l), toY(d)]), COLORS[0], 2.2);
        const peaks = curve.filter(([, d], i) => i > 0 && i < curve.length - 1 && d > curve[i - 1][1] && d > curve[i + 1][1] && curve[i][0] > 100).slice(0, 3);
        peaks.forEach(([l, d], i) => label(['1st', '2nd', '3rd'][i], toX(l) - 8, toY(d) - 8, '#fff1c4', 8));
        [0, 500, 1000, 1500, 2000, 2500].forEach((l) => label(String(l), toX(l) - 10, gy + gh + 15, '#596a78', 8));
        [0, 3000, 6000, 9000].forEach((d) => label(String(d), gx - 30, toY(d) + 3, '#596a78', 8));
        label('multipole ℓ →  (smaller spots to the right)', gx + gw - 210, gy + gh + 32, '#798995', 8);
        const chi = DATA.reduce((s, [l, d]) => s + ((spectrum(l) - d) / (0.05 * d)) ** 2, 0) / DATA.length;
        setReadout([['FIRST PEAK', peaks[0] ? `ℓ ≈ ${Math.round(peaks[0][0])} (${(180 / peaks[0][0]).toFixed(2)}°)` : '—'], ['PEAK 1 : 2 : 3', peaks.length === 3 ? peaks.map(([, d]) => (d / peaks[0][1]).toFixed(2)).join(' : ') : '—'], ['MATCH TO DATA', chi < 1.5 ? 'excellent' : chi < 10 ? 'off' : 'ruled out']]);
      },
    },
  });
})();
