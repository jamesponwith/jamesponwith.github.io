// 19 · Evolution of cooperation
(() => {
  const PD_W = 120; const PD_H = 57; const pd = { s: new Uint8Array(PD_W * PD_H), prev: new Uint8Array(PD_W * PD_H), score: new Float32Array(PD_W * PD_H) };
  const PD_STARTS = ['One defector', 'Random 10%'];

  defineTheory('cooperation', {
    tab: ['Evolution of cooperation', 'Game theory · structure'],
    meta: {
      category: 'GAME THEORY',
      title: 'The evolution of cooperation',
      glyph: '⇄',
      description: 'In a one-shot Prisoner’s Dilemma, cheating always pays more. So why does cooperation exist? On a grid, cooperators who cluster can hold out against cheaters.',
      visualTitle: 'Spatial Prisoner’s Dilemma · Nowak & May (1992)',
      frame: '120 × 57 PLAYERS',
      caption: 'Blue: cooperator. Red: defector. Green / yellow: just switched to cooperating / defecting.',
      equation: '<span class="accent">payoff: C·C = 1 · D·C = b · C·D = D·D = 0</span>',
      equationNote: 'Each round everyone plays their 8 neighbors and themselves, then copies the highest-scoring strategy nearby. b is the temptation to defect.',
      insight: 'Cooperators score well among cooperators, so clusters survive even though a lone cooperator loses. With b between 1.8 and 2, one defector grows into an endlessly shifting kaleidoscope where neither side wins—structure alone sustains cooperation.',
      boundary: 'Deterministic imitation, no memory or reputation, wrap-around grid. Axelrod’s tit-for-tat reaches cooperation through repeated play instead of spatial structure.',
    },
    defaults: { temptation: 1.85, start: 0 },
    formats: {
      temptation: (v) => `b = ${v.toFixed(2)}`,
      start: (v) => PD_STARTS[v],
    },
    controls: () => `
      ${rangeControl('temptation', 'Temptation to defect', 1.05, 2.5, 0.01, 'Low', 'High')}
      ${rangeControl('start', 'Starting world', 0, 1, 1, PD_STARTS[0], PD_STARTS[1])}
      <div class="readout" id="live-readout"></div>${playControls()}`,
    sim: {
      resetOn: ['temptation', 'start'],
      reset() {
        if (state.cooperation.start === 0) { pd.s.fill(1); pd.s[Math.floor(PD_H / 2) * PD_W + PD_W / 2] = 0; } else pd.s.forEach((_, i) => { pd.s[i] = Math.random() < 0.1 ? 0 : 1; });
        pd.prev.set(pd.s); pd.gen = 0; pd.timer = 0;
      },
      tick(dt) {
        pd.timer += dt; if (pd.timer < 1 / 7) return; pd.timer = 0;
        const b = state.cooperation.temptation; const { s, score } = pd;
        const around = (i, fn) => { const x = i % PD_W; const y = Math.floor(i / PD_W); for (let dy = -1; dy <= 1; dy += 1) for (let dx = -1; dx <= 1; dx += 1) fn(((y + dy + PD_H) % PD_H) * PD_W + ((x + dx + PD_W) % PD_W)); };
        for (let i = 0; i < s.length; i += 1) { let sc = 0; around(i, (j) => { if (s[j]) sc += s[i] ? 1 : b; }); score[i] = sc; }
        pd.prev.set(s);
        const next = new Uint8Array(s.length);
        for (let i = 0; i < s.length; i += 1) { let best = i; around(i, (j) => { if (score[j] > score[best]) best = j; }); next[i] = pd.prev[best]; }
        pd.s.set(next); pd.gen += 1;
      },
      draw() {
        const cell = 8; const colors = [['#ff7a5a', '#ffd76e'], ['#5ee0a0', '#77a9ff']]; // [now][before]
        for (let i = 0; i < pd.s.length; i += 1) { ctx.fillStyle = colors[pd.s[i]][pd.prev[i]]; ctx.fillRect((i % PD_W) * cell, Math.floor(i / PD_W) * cell + 2, cell - 0.5, cell - 0.5); }
        const coop = pd.s.reduce((n, v) => n + v, 0) / pd.s.length;
        setReadout([['GENERATION', pd.gen], ['COOPERATORS', `${(coop * 100).toFixed(1)}%`], ['TEMPTATION b', state.cooperation.temptation.toFixed(2)]]);
      },
    },
  });
})();
