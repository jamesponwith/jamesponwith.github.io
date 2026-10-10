// 11 · Hawking radiation
(() => {
  const PHYS = { G: 6.674e-11, c: 2.998e8, hbar: 1.0546e-34, k: 1.381e-23 };
  const MASS_REFS = [[3.2, 'a car'], [9.8, 'the Great Pyramid'], [22.9, 'the Moon'], [24.8, 'Earth'], [27.3, 'Jupiter'], [30.3, 'the Sun']];
  const bh = {};

  defineTheory('hawking', {
    tab: ['Hawking radiation', 'Black holes · heat'],
    meta: {
      category: 'BLACK HOLE THERMODYNAMICS',
      title: 'Black holes are not black',
      glyph: '◐',
      description: 'Hawking (1974): quantum fields near a horizon make a black hole glow with heat. Small ones are hot and evaporate; big ones are colder than empty space.',
      visualTitle: 'Hawking evaporation · compressed timeline',
      frame: 'EVENT HORIZON',
      caption: 'The animation compresses the lifetime; the readout gives real values for the mass you choose.',
      equation: '<span class="accent">T = ℏc³ / 8πGMk</span>, S = kc³A / 4Gℏ',
      equationNote: 'Temperature falls as mass grows; entropy scales with horizon area A, not volume. Lifetime t ≈ 5120πG²M³ / ℏc⁴.',
      insight: 'A solar-mass black hole sits at 60 billionths of a kelvin—colder than the 2.7 K cosmic background, so today it grows rather than shrinks. Only holes lighter than about the Moon outshine the background. Evaporating makes a hole hotter, so its final moments are a burst.',
      boundary: 'Lifetime assumes photon-only emission from a non-rotating, uncharged hole; more particle species shorten it. Hawking radiation has never been observed. The particle-pair picture is a popular heuristic, not the actual calculation.',
    },
    defaults: { mass: 12 },
    formats: {
      mass: (v) => {
        const near = MASS_REFS.find(([m]) => Math.abs(m - v) <= 0.5);
        return `10${String(v).replace(/./g, (c) => SUP[c] || c)} kg${near ? ` ≈ ${near[1]}` : ''}`;
      },
    },
    controls: () => `
      ${rangeControl('mass', 'Black hole mass', 3, 31, 1, 'Car', 'Star')}
      <div class="readout" id="live-readout"></div>${playControls()}`,
    sim: {
      reset() { Object.assign(bh, { f: 0, spawn: 0, flash: 0, particles: [] }); },
      tick(dt) {
        const m = Math.cbrt(1 - bh.f);
        if (bh.f < 1) {
          bh.f = Math.min(1, bh.f + dt / 14);
          bh.spawn += dt * 22 / Math.max(m, 0.05);
          while (bh.spawn >= 1) {
            bh.spawn -= 1; const ang = Math.random() * 2 * Math.PI; const r = 8 + 100 * m;
            bh.particles.push({ ang, r: r + 3, dr: 170, heat: m }, { ang: ang + 0.08, r: r + 3, dr: -60, heat: m });
          }
        } else {
          bh.flash += dt; if (bh.flash > 2.5) this.reset();
        }
        bh.particles.forEach((p) => { p.r += p.dr * dt; });
        bh.particles = bh.particles.filter((p) => p.r < 520 && p.r > 0 && (p.dr > 0 || p.r > 8 + 100 * Math.cbrt(1 - bh.f) - 12));
      },
      draw() {
        const cx = 290; const cy = 230; const m = Math.cbrt(1 - bh.f); const R = 8 + 100 * m;
        const tempColor = (heat) => { const h = Math.min(1, (1 / Math.max(heat, 0.02) - 1) / 6); return h < 0.5 ? mix([255, 120, 70], [255, 245, 225], h * 2) : mix([255, 245, 225], [140, 180, 255], h * 2 - 1); };
        bh.particles.forEach((p) => { ctx.fillStyle = p.dr > 0 ? tempColor(p.heat) : 'rgba(120, 130, 150, .5)'; ctx.fillRect(cx + p.r * Math.cos(p.ang) - 1.2, cy + p.r * Math.sin(p.ang) - 1.2, 2.4, 2.4); });
        if (bh.f < 1) {
          const glow = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.6);
          glow.addColorStop(0, tempColor(m)); glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.globalAlpha = 0.35 + 0.4 * (1 - m); ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(cx, cy, R * 1.6, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
          ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
        } else {
          const a = Math.max(0, 1 - bh.flash / 1.5);
          ctx.fillStyle = `rgba(230, 240, 255, ${a})`; ctx.beginPath(); ctx.arc(cx, cy, 10 + bh.flash * 260, 0, Math.PI * 2); ctx.fill();
          label('EVAPORATED', cx - 30, cy + 4, '#d4dfe6');
        }
        label('HAWKING RADIATION · emission rate and color track temperature', 18, 30, '#d4dfe6');
        // M(t) and T(t) charts against fraction of lifetime
        const gx = 630; const gw = 290;
        [[50, 'MASS  M / M₀', (f) => Math.cbrt(1 - f), COLORS[2]], [255, 'TEMPERATURE  T / T₀ (cap 10)', (f) => Math.min(10, 1 / Math.cbrt(Math.max(1e-9, 1 - f))) / 10, COLORS[1]]].forEach(([gy, title, fn, color]) => {
          const gh = 130; label(title, gx, gy - 10, '#d4dfe6'); drawGrid(gx, gy, gw, gh, 2);
          polyline(Array.from({ length: 200 }, (_, i) => [gx + i / 199 * gw, gy + gh * (1 - fn(i / 199 * 0.99999))]), color, 1.8);
          drawStar(gx + bh.f * gw, gy + gh * (1 - fn(Math.min(bh.f, 0.99999))), 4, '#fff1c4');
          label('lifetime →', gx + gw - 60, gy + gh + 14, '#798995');
        });
        // real physics for the chosen mass
        const M = 10 ** state.hawking.mass; const { G, c, hbar, k } = PHYS;
        const T = hbar * c ** 3 / (8 * Math.PI * G * M * k); const rs = 2 * G * M / c ** 2;
        const S = 4 * Math.PI * G * M * M / (hbar * c); const life = 5120 * Math.PI * G * G * M ** 3 / (hbar * c ** 4);
        const years = life / 3.156e7;
        setReadout([['HORIZON RADIUS', `${sci(rs)} m`], ['TEMPERATURE', `${sci(T)} K`], ['ENTROPY S/k', sci(S)], ['LIFETIME', years > 1 ? `${sci(years)} yr` : `${sci(life)} s`], ['TODAY', T > 2.725 ? 'evaporating' : 'growing · CMB is hotter']]);
      },
    },
  });
})();
