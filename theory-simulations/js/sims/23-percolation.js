// 23 · Percolation
(() => {
  const PC_W = 120; const PC_H = 57; const PC = 0.5927; const perc = {};

  defineTheory('percolation', {
    tab: ['Percolation', 'Thresholds · connectivity'],
    meta: {
      category: 'CRITICAL PHENOMENA',
      title: 'When does water get through?',
      glyph: 'p_c',
      description: 'Open each site of a grid at random with probability p, then pour water in from the left. Below a sharp threshold it always stalls; above it, it always gets through.',
      visualTitle: 'Site percolation · flood from the left edge',
      frame: '120 × 57 SITES',
      caption: 'Dark: blocked. Gray: open but dry. Cyan: wet. Orange: the water reached the far side.',
      equation: '<span class="accent">p_c ≈ 0.5927</span> (square lattice, site percolation)',
      equationNote: 'Each site is open with probability p. The same random numbers are kept as p changes, so you watch one landscape fill in.',
      insight: 'No single site changes at p_c, yet the whole system flips from blocked to connected. Percolation describes coffee brewing, oil in porous rock, forest fires, and outbreaks on networks.',
      boundary: 'Independent sites on an ideal lattice. A finite grid blurs the threshold slightly; it is perfectly sharp only for an infinite one.',
    },
    defaults: { occupancy: 0.59 },
    formats: {
      occupancy: (v) => `p = ${v.toFixed(3)}`,
    },
    controls: () => `
      ${rangeControl('occupancy', 'Open-site probability', 0.4, 0.8, 0.005, '0.40', '0.80')}
      <div class="readout" id="live-readout"></div>${playControls('<button class="action-button secondary" data-action="reroll">⟳ NEW LATTICE</button>')}`,
    sim: {
      resetOn: ['occupancy'],
      reset() {
        if (!perc.r) perc.r = Float32Array.from({ length: PC_W * PC_H }, Math.random);
        const p = state.percolation.occupancy;
        perc.state = Uint8Array.from(perc.r, (r) => (r < p ? 1 : 0));
        perc.frontier = [];
        for (let y = 0; y < PC_H; y += 1) { const i = y * PC_W; if (perc.state[i]) { perc.state[i] = 2; perc.frontier.push(i); } }
        perc.wet = perc.frontier.length; perc.layers = 0; perc.spans = false; perc.timer = 0;
      },
      reroll() { perc.r = null; this.reset(); },
      tick(dt) {
        perc.timer += dt; if (perc.timer < 1 / 40 || !perc.frontier.length) return; perc.timer = 0;
        const next = [];
        for (const i of perc.frontier) {
          const x = i % PC_W; const y = (i - x) / PC_W;
          [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]].forEach(([nx, ny]) => {
            if (nx < 0 || ny < 0 || nx >= PC_W || ny >= PC_H) return;
            const k = ny * PC_W + nx; if (perc.state[k] !== 1) return;
            perc.state[k] = 2; next.push(k); perc.wet += 1; if (nx === PC_W - 1) perc.spans = true;
          });
        }
        perc.frontier = next; perc.layers += 1;
      },
      draw() {
        const cell = 8; const wetColor = perc.spans ? COLORS[1] : COLORS[0];
        const open = perc.state.reduce((n, s) => n + (s ? 1 : 0), 0);
        for (let i = 0; i < perc.state.length; i += 1) {
          ctx.fillStyle = perc.state[i] === 2 ? wetColor : perc.state[i] ? '#2c3a48' : '#0d1319';
          ctx.fillRect((i % PC_W) * cell, Math.floor(i / PC_W) * cell + 2, cell - 0.5, cell - 0.5);
        }
        const p = state.percolation.occupancy;
        setReadout([['p / p_c', (p / PC).toFixed(3)], ['OPEN SITES', `${(open / perc.state.length * 100).toFixed(1)}%`], ['WET SITES', perc.wet], ['STATUS', perc.spans ? 'PERCOLATES' : perc.frontier.length ? 'spreading…' : 'stuck']]);
      },
    },
  });
})();
