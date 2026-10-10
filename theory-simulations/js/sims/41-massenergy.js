// 41 · E = mc²
(() => {
  const U_MEV = 931.494; const J_PER_G = 8.98755e13;
  // measured atomic masses (u); products and reactants as [label, mass, radius, color]
  const REACTIONS = [
    ['D–T fusion', [['²H', 2.014102, 7, COLORS[0]], ['³H', 3.016049, 8, COLORS[0]]], [['⁴He', 4.002602, 9, '#fff1c4'], ['n', 1.008665, 5, '#a9b6c0']]],
    ['Uranium fission', [['n', 1.008665, 5, '#a9b6c0'], ['²³⁵U', 235.04393, 22, COLORS[2]]], [['¹⁴¹Ba', 140.914411, 17, COLORS[1]], ['⁹²Kr', 91.926156, 14, COLORS[1]], ['n', 1.008665, 5, '#a9b6c0'], ['n', 1.008665, 5, '#a9b6c0'], ['n', 1.008665, 5, '#a9b6c0']]],
    ['Sun’s pp chain (net)', [['¹H', 1.007825, 5, COLORS[0]], ['¹H', 1.007825, 5, COLORS[0]], ['¹H', 1.007825, 5, COLORS[0]], ['¹H', 1.007825, 5, COLORS[0]]], [['⁴He', 4.002602, 9, '#fff1c4']]],
    ['Annihilation e⁻ + e⁺', [['e⁻', 0.00054858, 4, COLORS[0]], ['e⁺', 0.00054858, 4, COLORS[1]]], []],
  ];
  const MEASURED = [[2, 1.112, '²H'], [4, 7.074, '⁴He'], [12, 7.680, '¹²C'], [56, 8.790, '⁵⁶Fe'], [235, 7.591, '²³⁵U']];
  const EVERYDAY = [[3.9e10, 'a household’s yearly electricity'], [6.3e13, 'the Hiroshima bomb'], [6e20, 'a year of all human energy use']];
  // semi-empirical mass formula, binding energy per nucleon at the most stable Z for each A
  function semfPerNucleon(A) {
    const Z = A / (1.98 + 0.0155 * A ** (2 / 3));
    const B = 15.75 * A - 17.8 * A ** (2 / 3) - 0.711 * Z * Z / A ** (1 / 3) - 23.7 * (A - 2 * Z) ** 2 / A;
    return B / A;
  }
  const me = { t: 0 };

  defineTheory('massenergy', {
    tab: ['E = mc²', 'Mass · energy'],
    meta: {
      category: 'MASS–ENERGY',
      title: 'A little mass is a lot of energy',
      glyph: 'mc²',
      description: 'Einstein (1905): mass and energy are one thing, exchanged at the rate c². In nuclear reactions a sliver of mass vanishes and reappears as energy—the sliver that powers the Sun and nuclear reactors.',
      visualTitle: 'Mass defect · binding energy per nucleon',
      frame: 'NUCLEAR SCALE',
      caption: 'Left: the reaction, with total mass before and after. Right: binding energy per nucleon—fusion climbs from the left, fission from the right, both toward iron.',
      equation: '<span class="accent">E = Δm c²</span> · 1 u = 931.494 MeV',
      equationNote: 'Masses are measured atomic masses in unified atomic mass units. The curve is the semi-empirical (liquid-drop) mass formula; dots are measured values.',
      insight: 'Fusing light nuclei and splitting heavy ones both move toward iron-56, the most tightly bound nucleus, releasing the difference as energy. D–T fusion converts 0.4% of its mass; burning fuel manages about one part in a billion.',
      boundary: 'Single representative reactions; real fission splits many ways, and energy is shared among products and neutrinos. The curve leaves out shell effects such as helium-4’s spike.',
    },
    defaults: { reaction: 0, grams: 0 },
    formats: {
      reaction: (v) => REACTIONS[v][0],
      grams: (v) => `${10 ** v >= 1 ? (10 ** v).toPrecision(2) : (10 ** v).toExponential(0)} g`,
    },
    controls: () => `
      ${rangeControl('reaction', 'Reaction', 0, REACTIONS.length - 1, 1, 'Fusion', 'Annihilation')}
      ${rangeControl('grams', 'Mass fully converted', -6, 3, 0.1, '1 μg', '1 kg')}
      <div class="readout" id="live-readout"></div>${playControls()}`,
    sim: {
      resetOn: ['reaction'],
      reset() { me.t = 0; },
      tick(dt) { me.t = (me.t + dt) % 4; },
      draw() {
        const [name, before, after] = REACTIONS[state.massenergy.reaction];
        const mBefore = before.reduce((s, p) => s + p[1], 0); const mAfter = after.reduce((s, p) => s + p[1], 0);
        const dm = mBefore - mAfter; const mev = dm * U_MEV; const cx = 250; const cy = 170;
        label(name.toUpperCase(), 18, 30, '#d4dfe6');
        // phase 0–1.5 s: reactants converge; 1.5–1.8 s: flash; then products fly apart
        if (me.t < 1.5) {
          const f = me.t / 1.5;
          before.forEach(([sym, , r, color], i) => { const a = (i / before.length) * 2 * Math.PI; const d = 160 * (1 - f); drawStar(cx + d * Math.cos(a), cy + d * Math.sin(a) * 0.6, r, color); label(sym, cx + d * Math.cos(a) - 8, cy + d * Math.sin(a) * 0.6 - r - 6, '#a9b6c0', 8); });
        } else {
          const f = Math.min(1, (me.t - 1.5) / 2);
          if (me.t < 2.2) { ctx.fillStyle = `rgba(255, 241, 196, ${1 - (me.t - 1.5) / 0.7})`; ctx.beginPath(); ctx.arc(cx, cy, 20 + 140 * (me.t - 1.5), 0, Math.PI * 2); ctx.fill(); }
          after.forEach(([sym, , r, color], i) => { const a = (i / after.length) * 2 * Math.PI + 0.4; const d = 170 * f; drawStar(cx + d * Math.cos(a), cy + d * Math.sin(a) * 0.6, r, color); label(sym, cx + d * Math.cos(a) - 8, cy + d * Math.sin(a) * 0.6 - r - 6, '#a9b6c0', 8); });
          if (!after.length || state.massenergy.reaction === 2) for (let g = 0; g < 2; g += 1) { const a = g * Math.PI + 0.9; polyline(Array.from({ length: 30 }, (_, j) => { const d = j / 29 * 200 * f; return [cx + d * Math.cos(a) - 8 * Math.sin(j) * Math.sin(a), cy + d * Math.sin(a) * 0.6 + 8 * Math.sin(j) * Math.cos(a)]; }), '#fff1c4', 1.5); }
        }
        // mass bars, zoomed so the missing sliver is visible
        const bx = 40; const by = 330; const bw = 380; const lo = mAfter - dm * 3; const toW = (m) => (m - lo) / (mBefore - lo) * bw;
        label('TOTAL MASS (axis zoomed to show the difference)', bx, by - 12, '#d4dfe6', 8);
        ctx.fillStyle = 'rgba(101, 224, 208, .55)'; ctx.fillRect(bx, by, toW(mBefore), 18); label(`before ${mBefore.toFixed(6)} u`, bx + 6, by + 13, '#0c1219');
        ctx.fillStyle = 'rgba(255, 178, 107, .55)'; ctx.fillRect(bx, by + 26, toW(mAfter), 18); label(`after ${mAfter.toFixed(6)} u`, bx + 6, by + 39, '#0c1219');
        ctx.strokeStyle = '#fff1c4'; ctx.setLineDash([3, 3]); ctx.strokeRect(bx + toW(mAfter), by + 26, toW(mBefore) - toW(mAfter), 18); ctx.setLineDash([]);
        label(`Δm = ${dm.toFixed(6)} u (${(dm / mBefore * 100).toPrecision(3)}%) → ${mev.toFixed(2)} MeV`, bx, by + 66, '#fff1c4', 10);
        // binding-energy curve
        const gx = 520; const gw = 400; const gy = 50; const gh = 300; const toX = (A) => gx + Math.log10(A) / Math.log10(250) * gw; const toY = (b) => gy + gh * (1 - b / 9.5);
        label('BINDING ENERGY PER NUCLEON (MeV)', gx, 36, '#d4dfe6'); drawGrid(gx, gy, gw, gh, 4);
        polyline(Array.from({ length: 200 }, (_, i) => { const A = 8 * (240 / 8) ** (i / 199); return [toX(A), toY(semfPerNucleon(A))]; }), COLORS[0], 2);
        MEASURED.forEach(([A, b, sym]) => { drawStar(toX(A), toY(b), 3.5, '#fff1c4'); label(sym, toX(A) + 5, toY(b) - 6, '#a9b6c0', 8); });
        label('fusion →', toX(3), toY(4.5), COLORS[0]); label('← fission', toX(150), toY(6.4), COLORS[1]); label('iron: most stable', toX(40), toY(9.2), '#798995', 8);
        label('mass number A (log) →', gx + gw - 120, gy + gh + 15, '#596a78');
        const J = 10 ** state.massenergy.grams * J_PER_G; const ref = [...EVERYDAY].reverse().find(([e]) => J >= e * 0.1);
        label(`${formats.grams(state.massenergy.grams)} → ${sci(J)} J${ref ? ` ≈ ${(J / ref[0]).toPrecision(2)} × ${ref[1]}` : ''}`, gx, gy + gh + 40, COLORS[1], 9);
        setReadout([['MASS LOST', `${(dm / mBefore * 100).toPrecision(3)}%`], ['ENERGY / EVENT', `${mev.toFixed(2)} MeV`], ['PER KG OF FUEL', `${sci(dm / mBefore * 1000 * J_PER_G)} J`]]);
      },
    },
  });
})();
