// 16 · General relativity
(() => {
  const orb = {}; const GR_DPHI = 0.004;
  const grForce = (u) => 1 / (orb.h * orb.h) + 3 * u * u - u;
  function grStep() {
    const d = GR_DPHI; const { u, w } = orb;
    const k1u = w; const k1w = grForce(u);
    const k2u = w + d / 2 * k1w; const k2w = grForce(u + d / 2 * k1u);
    const k3u = w + d / 2 * k2w; const k3w = grForce(u + d / 2 * k2u);
    const k4u = w + d * k3w; const k4w = grForce(u + d * k3u);
    orb.u += d / 6 * (k1u + 2 * k2u + 2 * k3u + k4u); orb.w += d / 6 * (k1w + 2 * k2w + 2 * k3w + k4w); orb.phi += d;
    if (w > 0 && orb.w <= 0) orb.peri.push(orb.phi);
  }

  defineTheory('grorbit', {
    wave: 'WAVE 04 · FIELDS & COLLECTIVES',
    tab: ['General relativity', 'Orbits · precession'],
    meta: {
      category: 'GENERAL RELATIVITY',
      title: 'Orbits that never close',
      glyph: '⊛',
      description: 'In Newton’s gravity a planet retraces the same ellipse forever. In Einstein’s, each orbit swings forward. Mercury’s extra 43″ per century was general relativity’s first triumph.',
      visualTitle: 'Schwarzschild geodesic vs Newtonian ellipse',
      frame: 'ORBITAL PLANE',
      caption: 'Dashed: Newton’s closed ellipse. Solid: the relativistic orbit, precessing into a rosette.',
      equation: '<span class="accent">d²u/dφ² + u = GM/h² + 3GMu²/c²</span>',
      equationNote: 'u = 1/r; h is angular momentum per unit mass. The last term is relativity’s correction—drop it and you get Newton’s ellipse. Weak-field precession: Δφ ≈ 6πGM / c²a(1−e²).',
      insight: 'Far from the mass the shift is small and matches the formula; close in it runs away. Near a few Schwarzschild radii, orbits “zoom and whirl” around the hole before swinging out—the regime probed by black-hole mergers and the star S2 orbiting Sgr A*.',
      boundary: 'A test particle around a non-rotating mass, timed by its own clock. No gravitational-wave decay, spin, or other planets (which cause most of Mercury’s total precession).',
    },
    defaults: { periapsis: 10, ecc: 0.5 },
    formats: {
      periapsis: (v) => `${v} r_s`,
      ecc: (v) => v.toFixed(2),
    },
    controls: () => `
      ${rangeControl('periapsis', 'Closest approach', 3, 60, 1, '3 r_s', '60 r_s')}
      ${rangeControl('ecc', 'Eccentricity e', 0, 0.7, 0.05, 'Circle', 'Elongated')}
      <div class="readout" id="live-readout"></div>${playControls()}`,
    sim: {
      resetOn: ['periapsis', 'ecc'],
      reset() {
        const rp = 2 * state.grorbit.periapsis; const e = state.grorbit.ecc;
        const u1 = 1 / rp; const u2 = (1 - e) / (rp * (1 + e));
        // choose h so the relativistic orbit shares the ellipse's perihelion and aphelion
        Object.assign(orb, { h: 1 / Math.sqrt((u1 + u2) / 2 - (u1 * u1 + u1 * u2 + u2 * u2)), u: u1, w: 0, phi: 0, peri: [0], trail: [[0, rp]], rp, ra: 1 / u2, e });
        orb.period = 2 * Math.PI * ((rp + orb.ra) / 2) ** 1.5;
      },
      tick(dt) {
        let budget = dt * orb.period / 3.5; let lastPhi = orb.trail.at(-1)[0];
        while (budget > 0 && orb.u < 0.5) {
          grStep(); budget -= GR_DPHI / (orb.h * orb.u * orb.u);
          if (orb.phi - lastPhi > 0.03) { orb.trail.push([orb.phi, 1 / orb.u]); lastPhi = orb.phi; }
        }
        if (orb.trail.length > 5000) orb.trail.splice(0, orb.trail.length - 5000);
        if (orb.u >= 0.5) this.reset();
      },
      draw() {
        const cx = 320; const cy = 232; const scale = 195 / orb.ra; const toS = (phi, r) => [cx + r * scale * Math.cos(phi), cy - r * scale * Math.sin(phi)];
        const p = orb.rp * (1 + orb.e);
        ctx.beginPath(); ctx.arc(cx, cy, 6 * scale, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(255, 178, 107, .25)'; ctx.setLineDash([2, 5]); ctx.stroke(); ctx.setLineDash([]);
        label('3 r_s', cx + 6 * scale * 0.72 + 4, cy - 6 * scale * 0.72, 'rgba(255, 178, 107, .6)', 8);
        polyline(Array.from({ length: 241 }, (_, i) => { const phi = i / 240 * 2 * Math.PI; return toS(phi, p / (1 + orb.e * Math.cos(phi))); }), 'rgba(255, 241, 196, .35)', 1.2, [5, 6]);
        polyline(orb.trail.map(([phi, r]) => toS(phi, r)), 'rgba(101, 224, 208, .6)', 1.4);
        orb.peri.forEach((phi) => { const [x, y] = toS(phi, orb.rp); ctx.fillStyle = COLORS[1]; ctx.fillRect(x - 2, y - 2, 4, 4); });
        ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(cx, cy, Math.max(2.5, 2 * scale), 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(255, 178, 107, .7)'; ctx.stroke();
        drawStar(...toS(orb.phi, 1 / orb.u), 5, '#a9d8ff');
        label('ORBIT · black disk = event horizon', 18, 30, '#d4dfe6');
        // precession vs periapsis: weak-field formula for this eccentricity, plus the measured value
        const gx = 650; const gw = 270; const gy = 60; const gh = 230;
        const measured = orb.peri.length > 1 ? (orb.peri.at(-1) - orb.peri.at(-2) - 2 * Math.PI) * 180 / Math.PI : null;
        const formula = (k) => 6 * Math.PI / (2 * k * (1 + orb.e)) * 180 / Math.PI;
        const yMax = Math.max(180, (measured ?? 0) * 1.1); const toX = (k) => gx + (Math.log(k) - Math.log(3)) / (Math.log(60) - Math.log(3)) * gw; const toY = (deg) => gy + gh * (1 - Math.min(1, deg / yMax));
        label('PRECESSION PER ORBIT', gx, 40, '#d4dfe6'); drawGrid(gx, gy, gw, gh, 4);
        polyline(Array.from({ length: 100 }, (_, i) => { const k = 3 * 20 ** (i / 99); return [toX(k), toY(formula(k))]; }), COLORS[1], 1.6, [5, 5]);
        if (measured !== null) drawStar(toX(state.grorbit.periapsis), toY(measured), 5, COLORS[0]);
        label(`${Math.round(yMax)}°`, gx - 32, gy + 4, '#596a78'); label('0°', gx - 18, gy + gh + 3, '#596a78');
        label('3 r_s', gx, gy + gh + 15, '#596a78'); label('periapsis (log) → 60 r_s', gx + gw - 120, gy + gh + 15, '#596a78');
        label('- - weak-field formula', gx, gy + gh + 40, COLORS[1]); label('●  this orbit, measured', gx, gy + gh + 58, COLORS[0]);
        label('Mercury: 0.10″ per orbit at 2.7 × 10⁷ r_s', gx, gy + gh + 82, '#798995');
        setReadout([['ORBITS', Math.max(0, orb.peri.length - 1)], ['MEASURED', measured === null ? '—' : `${measured.toFixed(2)}° / orbit`], ['FORMULA', `${formula(state.grorbit.periapsis).toFixed(2)}° / orbit`]]);
      },
    },
  });
})();
