// 38 · Kepler's laws
(() => {
  const WEDGES = 12; const A_PX = 200; const CX = 300; const CY = 230;
  const PLANETS = [['Mercury', 0.387, 0.241], ['Venus', 0.723, 0.615], ['Earth', 1, 1], ['Mars', 1.524, 1.881], ['Jupiter', 5.203, 11.86], ['Saturn', 9.537, 29.46], ['Uranus', 19.19, 84.01], ['Neptune', 30.07, 164.8]];
  const kep = { f: 0 };
  function position(frac) {
    const e = state.kepler.ecc; const M = 2 * Math.PI * frac; let E = M;
    for (let k = 0; k < 12; k += 1) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    const b = A_PX * Math.sqrt(1 - e * e);
    return [CX + A_PX * e + A_PX * (Math.cos(E) - e), CY - b * Math.sin(E)];
  }
  const area = (pts) => Math.abs(pts.reduce((s, [x, y], i) => { const [x2, y2] = pts[(i + 1) % pts.length]; return s + x * y2 - x2 * y; }, 0)) / 2;

  defineTheory('kepler', {
    tab: ['Kepler’s laws', 'Orbits · harmony'],
    meta: {
      category: 'CELESTIAL MECHANICS',
      title: 'The laws of planetary motion',
      glyph: '⊙',
      description: 'From Tycho Brahe’s observations, Kepler (1609–1619) found three laws: orbits are ellipses with the Sun at a focus, a planet sweeps equal areas in equal times, and the square of the period grows as the cube of the orbit’s size.',
      visualTitle: 'Elliptical orbit · equal areas in equal times',
      frame: 'SUN AT A FOCUS',
      caption: 'Each colored wedge is swept in the same time—1/12 of an orbit. Right: period vs orbit size for the eight planets.',
      equation: '<span class="accent">T² ∝ a³</span> · dA/dt = constant',
      equationNote: 'a is the semi-major axis, T the period. Position from Kepler’s equation M = E − e sin E, solved numerically each frame.',
      insight: 'Near the Sun the planet moves fast and its wedges are short and wide; far away it crawls and they are long and thin—yet every area matches. Newton later showed all three laws follow from an inverse-square force; equal areas is conservation of angular momentum.',
      boundary: 'A single planet around a fixed Sun, ignoring the other planets’ tugs. The animation shows every orbit at the same speed; the readout gives the real period.',
    },
    defaults: { ecc: 0.6, semiMajor: 0 },
    formats: {
      ecc: (v) => `e = ${v.toFixed(2)}`,
      semiMajor: (v) => `a = ${(10 ** v).toFixed(2)} AU`,
    },
    controls: () => `
      ${rangeControl('ecc', 'Eccentricity', 0, 0.9, 0.01, 'Circle', 'Stretched')}
      ${rangeControl('semiMajor', 'Orbit size (log)', -0.5, 1.6, 0.01, '0.3 AU', '40 AU')}
      <div class="readout" id="live-readout"></div>${playControls()}`,
    sim: {
      reset() { kep.f = 0; },
      tick(dt) { kep.f = (kep.f + dt / 6) % 1; },
      draw() {
        const e = state.kepler.ecc; const done = Math.floor(kep.f * WEDGES); const areas = [];
        for (let k = 0; k <= done; k += 1) {
          const end = k < done ? (k + 1) / WEDGES : kep.f; const pts = [[CX + A_PX * e, CY]];
          for (let j = 0; j <= 24; j += 1) pts.push(position(k / WEDGES + (end - k / WEDGES) * j / 24));
          ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
          ctx.fillStyle = k % 2 ? 'rgba(188, 155, 255, .28)' : 'rgba(101, 224, 208, .28)'; ctx.fill();
          if (k < done) areas.push(area(pts));
        }
        polyline(Array.from({ length: 181 }, (_, i) => position(i / 180)), 'rgba(169, 182, 192, .4)', 1);
        drawStar(CX + A_PX * e, CY, 9, COLORS[1]); label('Sun', CX + A_PX * e - 10, CY + 24, COLORS[1]);
        polyline([[CX - A_PX * 0.02, CY], [CX + A_PX * 0.02, CY]], 'rgba(169, 182, 192, .5)', 1); label('center', CX - 18, CY - 8, '#596a78', 8);
        drawStar(...position(kep.f), 5.5, '#a9d8ff');
        // third law: log-log period vs semi-major axis
        const gx = 650; const gw = 270; const gy = 60; const gh = 260; const toX = (a) => gx + (Math.log10(a) + 0.5) / 2.1 * gw; const toY = (t) => gy + gh * (1 - (Math.log10(t) + 0.8) / 3.3);
        label('PERIOD vs SIZE (log–log)', gx, 40, '#d4dfe6'); drawGrid(gx, gy, gw, gh, 4);
        polyline([[toX(10 ** -0.5), toY(10 ** -0.75)], [toX(10 ** 1.6), toY(10 ** 2.4)]], 'rgba(255, 178, 107, .5)', 1, [4, 4]);
        PLANETS.forEach(([name, a, t]) => { drawStar(toX(a), toY(t), 3, '#d4dfe6'); label(name, toX(a) + 6, toY(t) + 3, '#798995', 8); });
        const a = 10 ** state.kepler.semiMajor; const T = a ** 1.5;
        drawStar(toX(a), toY(T), 5, COLORS[0]);
        label('slope 3/2: T² = a³', gx, gy + gh + 16, COLORS[1]);
        const spread = areas.length > 1 ? (Math.max(...areas) / Math.min(...areas) - 1) * 100 : 0;
        setReadout([['PERIOD', T < 1 ? `${(T * 365.25).toFixed(0)} days` : `${T.toFixed(2)} years`], ['SPEED RATIO', `${((1 + e) / (1 - e)).toFixed(2)}× peri / aph`], ['WEDGE AREAS', areas.length > 1 ? `equal to ${spread.toFixed(2)}%` : '…']]);
      },
    },
  });
})();
