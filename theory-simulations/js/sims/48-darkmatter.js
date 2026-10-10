// 48 · Dark matter and rotation curves
(() => {
  const G = 4.30091e-6; // kpc (km/s)² / solar mass
  const DISK = { M: 5e10, a: 4 }; const BULGE = { M: 1e10, b: 0.6 }; const HALO_V = 150; const HALO_RC = 5; const R_MAX = 30;
  const plummer = (M, a, r) => G * M * r * r / (r * r + a * a) ** 1.5;
  const vVisible = (r) => Math.sqrt(plummer(DISK.M, DISK.a, r) + plummer(BULGE.M, BULGE.b, r));
  const vHalo = (r, s) => s * HALO_V * Math.sqrt(Math.max(0, 1 - HALO_RC / r * Math.atan(r / HALO_RC)));
  const vTotal = (r, s) => Math.hypot(vVisible(r), vHalo(r, s));
  // mock observations: the model with a full halo, plus fixed scatter
  const OBS = Array.from({ length: 14 }, (_, i) => { const r = 1.5 + i * 2; return [r, vTotal(r, 1) * (1 + 0.04 * Math.sin(i * 2.7))]; });
  const STARS = Array.from({ length: 1400 }, (_, i) => {
    const r = i < 250 ? Math.abs(gauss()) * 1.2 : -DISK.a * Math.log(1 - Math.random() * 0.995) * 0.9 + 0.3;
    const arm = Math.floor(Math.random() * 2); const ang = Math.log(Math.max(r, 0.3)) / 0.3 + arm * Math.PI + gauss() * 0.35;
    return { r: Math.min(R_MAX, r), a0: i < 250 || Math.random() < 0.3 ? Math.random() * 2 * Math.PI : ang };
  });
  const dm = { t: 0 };

  defineTheory('darkmatter', {
    tab: ['Dark matter', 'Rotation curves'],
    meta: {
      category: 'ASTROPHYSICS',
      title: 'The galaxies are spinning too fast',
      glyph: '◎',
      description: 'Stars far from a galaxy’s center should orbit slowly, like outer planets. Vera Rubin and colleagues found in the 1970s that they don’t: rotation stays flat out to the edge. Something unseen supplies the extra gravity.',
      visualTitle: 'Galaxy rotation curve · visible matter vs dark halo',
      frame: 'SPIRAL GALAXY',
      caption: 'Left: stars orbiting at the speeds of the chosen mass model. Right: measured speeds (dots) vs the visible-matter prediction and the dark-halo contribution.',
      equation: '<span class="accent">v(r) = √(G M(&lt;r) / r)</span>',
      equationNote: 'The speed of a circular orbit reveals the mass enclosed. Visible matter: a bulge and a disk. Dark halo: a pseudo-isothermal sphere whose speed rises to a constant.',
      insight: 'With visible matter alone the curve falls like the Solar System’s, missing the data badly. Add a halo and the curve goes flat. Across the universe dark matter outweighs ordinary matter about five to one; lensing (experiment 02) and the cosmic microwave background point the same way.',
      boundary: 'An illustrative galaxy with smooth mass models and mock data shaped like real flat curves. Alternatives such as modified gravity (MOND) also fit rotation curves but struggle elsewhere.',
    },
    defaults: { halo: 0 },
    formats: {
      halo: (v) => (v ? `${Math.round(v * 100)}% of fitted halo` : 'visible matter only'),
    },
    controls: () => `
      ${rangeControl('halo', 'Dark matter halo', 0, 1.5, 0.05, 'None', 'Heavy')}
      <div class="readout" id="live-readout"></div>${playControls()}`,
    sim: {
      reset() { dm.t = 0; },
      tick(dt) { dm.t += dt; },
      draw() {
        const s = state.darkmatter.halo; const cx = 240; const cy = 235; const scale = 7.2;
        ctx.fillStyle = 'rgba(255, 220, 170, .08)'; ctx.beginPath(); ctx.arc(cx, cy, 30, 0, Math.PI * 2); ctx.fill();
        if (s > 0) { const halo = ctx.createRadialGradient(cx, cy, 10, cx, cy, R_MAX * scale); halo.addColorStop(0, `rgba(188, 155, 255, ${0.16 * s})`); halo.addColorStop(1, 'rgba(188, 155, 255, 0)'); ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(cx, cy, R_MAX * scale, 0, Math.PI * 2); ctx.fill(); }
        for (const st of STARS) {
          const omega = vTotal(st.r, s) / st.r * 0.012; const a = st.a0 + omega * dm.t; const x = cx + st.r * scale * Math.cos(a); const y = cy + st.r * scale * Math.sin(a) * 0.55;
          ctx.fillStyle = st.r < 2 ? 'rgba(255, 225, 180, .9)' : 'rgba(190, 215, 255, .75)'; ctx.fillRect(x - 0.9, y - 0.9, 1.8, 1.8);
        }
        label(s ? 'GALAXY · with dark halo' : 'GALAXY · visible matter only', 18, 30, '#d4dfe6');
        // rotation curve
        const gx = 520; const gw = 400; const gy = 50; const gh = 300; const vMax = 260; const toX = (r) => gx + r / R_MAX * gw; const toY = (v) => gy + gh * (1 - v / vMax);
        label('ROTATION SPEED (km/s) vs RADIUS (kpc)', gx, 36, '#d4dfe6'); drawGrid(gx, gy, gw, gh, 4);
        const rs = Array.from({ length: 150 }, (_, i) => 0.2 + i / 149 * (R_MAX - 0.2));
        polyline(rs.map((r) => [toX(r), toY(vVisible(r))]), COLORS[0], 1.6, [5, 4]);
        if (s) polyline(rs.map((r) => [toX(r), toY(vHalo(r, s))]), COLORS[2], 1.6, [2, 3]);
        polyline(rs.map((r) => [toX(r), toY(vTotal(r, s))]), '#fff1c4', 2.2);
        OBS.forEach(([r, v]) => { drawStar(toX(r), toY(v), 3.5, COLORS[1]); polyline([[toX(r), toY(v * 0.95)], [toX(r), toY(v * 1.05)]], COLORS[1], 1); });
        [0, 10, 20, 30].forEach((r) => label(String(r), toX(r) - 4, gy + gh + 15, '#596a78'));
        [0, 100, 200].forEach((v) => label(String(v), gx - 24, toY(v) + 3, '#596a78'));
        label('● measured   - - visible matter   ··· dark halo   — total model', gx, gy + gh + 36, '#a9b6c0', 8);
        const chi = OBS.reduce((sum, [r, v]) => sum + ((v - vTotal(r, s)) / (0.05 * v)) ** 2, 0) / OBS.length;
        const rOut = 28; const mVisible = DISK.M + BULGE.M; const mTotal = vTotal(rOut, s) ** 2 * rOut / G;
        const vEsc = Math.sqrt(2 * G * mVisible / rOut); const vObs = OBS.at(-1)[1];
        setReadout([['FIT TO DATA', chi < 2 ? 'good' : chi < 10 ? 'poor' : 'fails'], ['DARK / TOTAL MASS', `${Math.max(0, (1 - mVisible / mTotal) * 100).toFixed(0)}% (r < ${rOut} kpc)`], ['OUTER STARS', `${vObs.toFixed(0)} km/s`], ['ESCAPE (VISIBLE)', `${vEsc.toFixed(0)} km/s`]]);
      },
    },
  });
})();
