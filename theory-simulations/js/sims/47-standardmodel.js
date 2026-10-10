// 47 · The Standard Model
(() => {
  // [symbol, name, mass in MeV, charge, spin, kind, discovered]; neutrino masses are upper bounds
  const P = {
    u: ['u', 'up', 2.16, '+2/3', '1/2', 'quark', 1968], c: ['c', 'charm', 1270, '+2/3', '1/2', 'quark', 1974], t: ['t', 'top', 172570, '+2/3', '1/2', 'quark', 1995],
    d: ['d', 'down', 4.67, '−1/3', '1/2', 'quark', 1968], s: ['s', 'strange', 93.4, '−1/3', '1/2', 'quark', 1968], b: ['b', 'bottom', 4180, '−1/3', '1/2', 'quark', 1977],
    e: ['e', 'electron', 0.511, '−1', '1/2', 'lepton', 1897], mu: ['μ', 'muon', 105.66, '−1', '1/2', 'lepton', 1936], tau: ['τ', 'tau', 1776.9, '−1', '1/2', 'lepton', 1975],
    ve: ['νₑ', 'e neutrino', 1e-6, '0', '1/2', 'lepton', 1956], vm: ['νμ', 'μ neutrino', 1e-6, '0', '1/2', 'lepton', 1962], vt: ['ντ', 'τ neutrino', 1e-6, '0', '1/2', 'lepton', 2000],
    g: ['g', 'gluon', 0, '0', '1', 'gauge', 1979], ph: ['γ', 'photon', 0, '0', '1', 'gauge', 1923], Z: ['Z', 'Z boson', 91188, '0', '1', 'gauge', 1983], W: ['W', 'W boson', 80369, '±1', '1', 'gauge', 1983],
    H: ['H', 'Higgs boson', 125200, '0', '0', 'scalar', 2012],
  };
  const GRID = [['u', 'c', 't', 'g', 'H'], ['d', 's', 'b', 'ph', null], ['e', 'mu', 'tau', 'Z', null], ['ve', 'vm', 'vt', 'W', null]];
  const KIND_COLOR = { quark: COLORS[2], lepton: COLORS[0], gauge: COLORS[1], scalar: '#fff1c4' };
  // lines: [type, x1, y1, x2, y2, label]; types: f fermion, a antifermion, y photon, g gluon, w W/Z, h Higgs
  const PROCESSES = [
    ['Beta decay (weak)', ['d', 'u', 'W', 'e', 've'], 'W boson', 'weak', '~10⁻¹⁸ m', [['f', 500, 100, 920, 100, 'u'], ['f', 500, 140, 920, 140, 'd'], ['f', 500, 200, 650, 200, 'd'], ['f', 650, 200, 920, 180, 'u'], ['w', 650, 200, 770, 270, 'W⁻'], ['f', 770, 270, 920, 240, 'e⁻'], ['a', 770, 270, 920, 300, 'ν̄ₑ']], 'neutron (udd)', 'proton (uud)'],
    ['e⁺e⁻ → μ⁺μ⁻ (electromagnetic)', ['e', 'mu', 'ph'], 'photon', 'electromagnetic', 'infinite', [['f', 500, 100, 640, 190, 'e⁻'], ['a', 500, 280, 640, 190, 'e⁺'], ['y', 640, 190, 780, 190, 'γ'], ['f', 780, 190, 920, 100, 'μ⁻'], ['a', 780, 190, 920, 280, 'μ⁺']], '', ''],
    ['Quark scattering (strong)', ['u', 'd', 'g'], 'gluon', 'strong', '~10⁻¹⁵ m (confined)', [['f', 500, 110, 700, 110, 'u (red)'], ['f', 700, 110, 920, 110, 'u (green)'], ['f', 500, 280, 700, 280, 'd (green)'], ['f', 700, 280, 920, 280, 'd (red)'], ['g', 700, 110, 700, 280, 'g']], '', ''],
    ['Higgs → γγ (discovery channel)', ['H', 't', 'ph'], 'Higgs field', 'Higgs (gives mass)', 'short', [['h', 500, 190, 690, 190, 'H'], ['f', 690, 190, 760, 150, 't'], ['f', 760, 150, 760, 230, 't'], ['f', 760, 230, 690, 190, 't'], ['y', 760, 150, 920, 100, 'γ'], ['y', 760, 230, 920, 280, 'γ']], 'top-quark loop', ''],
  ];
  const sm = { t: 0, picked: 'H' };
  const cell = (r, c) => [22 + c * 86, 46 + r * 96];
  function styledLine([type, x1, y1, x2, y2], color, width) {
    const len = Math.hypot(x2 - x1, y2 - y1); const ux = (x2 - x1) / len; const uy = (y2 - y1) / len;
    if (type === 'y' || type === 'w') { polyline(Array.from({ length: 60 }, (_, i) => { const s = i / 59 * len; const w = Math.sin(s / 6) * 5; return [x1 + ux * s - uy * w, y1 + uy * s + ux * w]; }), color, width); }
    else if (type === 'g') { polyline(Array.from({ length: 120 }, (_, i) => { const s = i / 119 * len; const ph = s / 5; return [x1 + ux * (s - 4 * Math.sin(ph)) - uy * 6 * Math.cos(ph), y1 + uy * (s - 4 * Math.sin(ph)) + ux * 6 * Math.cos(ph)]; }), color, width); }
    else if (type === 'h') polyline([[x1, y1], [x2, y2]], color, width, [7, 5]);
    else {
      polyline([[x1, y1], [x2, y2]], color, width);
      const mx = (x1 + x2) / 2; const my = (y1 + y2) / 2; const dir = type === 'a' ? -1 : 1;
      polyline([[mx - dir * ux * 7 - uy * 5, my - dir * uy * 7 + ux * 5], [mx, my], [mx - dir * ux * 7 + uy * 5, my - dir * uy * 7 - ux * 5]], color, width);
    }
  }

  defineTheory('standardmodel', {
    tab: ['The Standard Model', 'Particles · forces'],
    meta: {
      category: 'PARTICLE PHYSICS',
      title: 'Everything is made of seventeen things',
      glyph: '⚛',
      description: 'Six quarks, six leptons, four force carriers, and the Higgs boson account for every experiment ever run at a particle collider. Forces are particles too—exchanged between the others.',
      visualTitle: 'Standard Model particles · Feynman diagrams',
      frame: '17 FIELDS',
      caption: 'Left: the particles—violet quarks, cyan leptons, orange force carriers, gold Higgs (click one for details). Right: the selected process as a Feynman diagram, time flowing left to right. Bottom: masses on a log scale.',
      equation: '<span class="accent">SU(3) × SU(2) × U(1)</span> + Higgs field',
      equationNote: 'The symmetry groups of the strong, weak, and electromagnetic forces fix how particles interact; the Higgs field gives the W, Z, quarks, and charged leptons their masses.',
      insight: 'Masses span more than eleven orders of magnitude, from neutrinos below 1 eV to the top quark at 173 GeV, and nobody knows why. The 2012 Higgs discovery at CERN completed the model, yet it leaves out gravity, dark matter, and why neutrinos have mass at all.',
      boundary: 'Antiparticles are implied rather than listed. Light-quark masses are scheme-dependent estimates; neutrino masses are shown at their upper bound. Diagrams are leading-order sketches.',
    },
    defaults: { process: 0 },
    formats: {
      process: (v) => PROCESSES[v][0],
    },
    controls: () => `
      ${rangeControl('process', 'Process', 0, PROCESSES.length - 1, 1, 'Weak', 'Higgs')}
      <div class="readout" id="live-readout"></div>${playControls()}`,
    sim: {
      reset() { sm.t = 0; },
      pick(x, y) { GRID.forEach((row, r) => row.forEach((key, c) => { const [cx, cy] = cell(r, c); if (key && x >= cx && x < cx + 80 && y >= cy && y < cy + 90) sm.picked = key; })); },
      tick(dt) { sm.t = (sm.t + dt / 3) % 1.25; },
      draw() {
        const [name, involved, mediator, force, range, lines, leftLabel, rightLabel] = PROCESSES[state.standardmodel.process];
        label('THE PARTICLES', 22, 34, '#d4dfe6');
        GRID.forEach((row, r) => row.forEach((key, c) => {
          if (!key) return; const [x, y] = cell(r, c); const [sym, pname, mass, , , kind] = P[key]; const on = involved.includes(key) || key === sm.picked;
          ctx.fillStyle = on ? 'rgba(255, 255, 255, .06)' : '#0f161d'; ctx.fillRect(x, y, 80, 90);
          ctx.strokeStyle = key === sm.picked ? '#fff1c4' : involved.includes(key) ? KIND_COLOR[kind] : '#26313d'; ctx.lineWidth = key === sm.picked ? 2 : 1; ctx.strokeRect(x, y, 80, 90);
          label(sym, x + 10, y + 42, KIND_COLOR[kind], 22); label(pname, x + 8, y + 64, '#a9b6c0', 8);
          label(mass === 0 ? '0' : mass < 1e-3 ? '< 1 eV' : mass >= 1000 ? `${(mass / 1000).toPrecision(3)} GeV` : `${mass.toPrecision(3)} MeV`, x + 8, y + 80, '#596a78', 8);
        }));
        // Feynman diagram with a sweeping time cursor
        label(name.toUpperCase(), 500, 34, '#d4dfe6');
        const cursor = 500 + 420 * Math.min(1, sm.t);
        lines.forEach((ln) => styledLine(ln, 'rgba(169, 182, 192, .3)', 1.2));
        ctx.save(); ctx.beginPath(); ctx.rect(480, 40, cursor - 480, 300); ctx.clip();
        lines.forEach((ln) => styledLine(ln, ln[0] === 'y' || ln[0] === 'g' || ln[0] === 'w' || ln[0] === 'h' ? COLORS[1] : COLORS[0], 2));
        ctx.restore();
        lines.forEach(([, x1, y1, x2, y2, text]) => label(text, (x1 + x2) / 2 + 6, (y1 + y2) / 2 - 8, '#d4dfe6', 9));
        if (leftLabel) label(leftLabel, 500, 330, '#798995', 8); if (rightLabel) label(rightLabel, 840, 330, '#798995', 8);
        polyline([[cursor, 50], [cursor, 320]], 'rgba(255, 241, 196, .35)', 1, [3, 4]); label('time →', 880, 48, '#596a78', 8);
        // mass ladder, log scale from 1 eV to 1 TeV
        const mx = 500; const mw = 420; const my = 400; const toX = (m) => mx + (Math.log10(m) + 6) / 12 * mw;
        label('MASS (log scale)', mx, my - 26, '#d4dfe6', 8); polyline([[mx, my], [mx + mw, my]], 'rgba(169, 182, 192, .4)', 1);
        [['1 eV', 1e-6], ['1 keV', 1e-3], ['1 MeV', 1], ['1 GeV', 1e3], ['1 TeV', 1e6]].forEach(([t, m]) => { polyline([[toX(m), my - 4], [toX(m), my + 4]], '#596a78', 1); label(t, toX(m) - 12, my + 18, '#596a78', 8); });
        Object.entries(P).forEach(([key, [sym, , mass, , , kind]]) => { if (!mass) return; drawStar(toX(mass), my, key === sm.picked ? 5 : 3, key === sm.picked ? '#fff1c4' : KIND_COLOR[kind]); if (key === sm.picked) label(sym, toX(mass) - 4, my - 10, '#fff1c4', 9); });
        const [, pname, pmass, charge, spin, kind, year] = P[sm.picked];
        setReadout([['FORCE', force], ['CARRIED BY', mediator], ['RANGE', range], ['SELECTED', pname], ['CHARGE · SPIN', `${charge} · ${spin}`], ['FOUND', `${year} · ${kind}`]]);
        void pmass;
      },
    },
  });
})();
