// 08 · Second law
(() => {
  const gas = {};
  const BOX = { x: 30, y: 40, w: 560, h: 380 }; const GRID_X = 16; const GRID_Y = 10;
  function gasEntropy() {
    const cells = new Float64Array(GRID_X * GRID_Y); const n = gas.x.length;
    for (let i = 0; i < n; i += 1) {
      cells[Math.min(GRID_X - 1, Math.floor(gas.x[i] / BOX.w * GRID_X)) * GRID_Y + Math.min(GRID_Y - 1, Math.floor(gas.y[i] / BOX.h * GRID_Y))] += 1 / n;
    }
    let s = 0; for (const p of cells) if (p > 0) s -= p * Math.log(p);
    return s / Math.log(GRID_X * GRID_Y);
  }

  defineTheory('entropy', {
    tab: ['Second law', 'Entropy · arrow of time'],
    meta: {
      category: 'THERMODYNAMICS',
      title: 'The arrow of time',
      glyph: 'S',
      description: 'Release a gas from one side of a box. Every motion obeys time-reversible laws, yet the gas never gathers itself back. Why does time have a direction?',
      visualTitle: 'Free expansion · coarse-grained entropy',
      frame: 'MICROSTATES',
      caption: 'Color marks where each molecule started. Entropy measures how evenly molecules fill a 16 × 10 grid.',
      equation: '<span class="accent">S = −k Σ pᵢ ln pᵢ</span> ≤ k ln W',
      equationNote: 'pᵢ is the fraction of molecules in grid cell i; W = 160 cells. Shown normalized by its maximum, ln 160.',
      insight: 'Spread-out arrangements vastly outnumber clustered ones, so entropy rises. Press reverse: the exact laws run backward and the gas un-mixes—the second law is statistical, not absolute. Real reversals fail because nobody can flip every velocity perfectly.',
      boundary: 'An ideal gas: molecules pass through each other and bounce elastically off walls. Collisions would speed mixing but not change the conclusion.',
    },
    defaults: { particles: 700, confine: 0.25 },
    formats: {
      particles: (v) => `${v}`,
      confine: (v) => `${Math.round(v * 100)}% of box`,
    },
    controls: () => `
      ${rangeControl('particles', 'Molecules', 100, 2000, 50, 'Few', 'Many')}
      ${rangeControl('confine', 'Initial confinement', 0.05, 1, 0.05, 'Tight', 'None')}
      <div class="readout" id="live-readout"></div>${playControls('<button class="action-button secondary" data-action="reverse">⇆ REVERSE EVERY VELOCITY</button>')}`,
    sim: {
      resetOn: ['particles', 'confine'],
      reset() {
        const n = state.entropy.particles; const w = BOX.w * state.entropy.confine;
        gas.x = Float64Array.from({ length: n }, () => Math.random() * w);
        gas.y = Float64Array.from({ length: n }, () => Math.random() * BOX.h);
        gas.vx = Float64Array.from({ length: n }, () => gauss() * 70);
        gas.vy = Float64Array.from({ length: n }, () => gauss() * 70);
        gas.color = Array.from(gas.x, (x) => { const f = x / w; return `rgb(${101 + 87 * f}, ${224 - 69 * f}, ${208 + 47 * f})`; });
        gas.t = 0; gas.reversed = 0; gas.history = [[0, gasEntropy()]];
      },
      tick(dt) {
        const n = gas.x.length;
        for (let i = 0; i < n; i += 1) {
          gas.x[i] += gas.vx[i] * dt; gas.y[i] += gas.vy[i] * dt;
          if (gas.x[i] < 0) { gas.x[i] = -gas.x[i]; gas.vx[i] = -gas.vx[i]; }
          if (gas.x[i] > BOX.w) { gas.x[i] = 2 * BOX.w - gas.x[i]; gas.vx[i] = -gas.vx[i]; }
          if (gas.y[i] < 0) { gas.y[i] = -gas.y[i]; gas.vy[i] = -gas.vy[i]; }
          if (gas.y[i] > BOX.h) { gas.y[i] = 2 * BOX.h - gas.y[i]; gas.vy[i] = -gas.vy[i]; }
        }
        gas.t += dt;
        gas.history.push([gas.t, gasEntropy()]);
        while (gas.history[0][0] < gas.t - 30) gas.history.shift();
      },
      reverse() {
        for (let i = 0; i < gas.x.length; i += 1) { gas.vx[i] = -gas.vx[i]; gas.vy[i] = -gas.vy[i]; }
        gas.reversed += 1;
      },
      draw() {
        ctx.strokeStyle = 'rgba(135, 157, 172, .4)'; ctx.lineWidth = 1; ctx.strokeRect(BOX.x, BOX.y, BOX.w, BOX.h);
        if (state.entropy.confine < 1) polyline([[BOX.x + BOX.w * state.entropy.confine, BOX.y], [BOX.x + BOX.w * state.entropy.confine, BOX.y + BOX.h]], 'rgba(255, 178, 107, .3)', 1, [4, 6]);
        label('GAS · partition removed at t = 0', BOX.x, 30, '#d4dfe6');
        for (let i = 0; i < gas.x.length; i += 1) { ctx.fillStyle = gas.color[i]; ctx.fillRect(BOX.x + gas.x[i] - 1.2, BOX.y + gas.y[i] - 1.2, 2.4, 2.4); }
        const gx = 650; const gw = 270; const gy = 60; const gh = 220;
        label('ENTROPY S / S_max · last 30 s', gx, 40, '#d4dfe6');
        drawGrid(gx, gy, gw, gh, 4);
        const t0 = Math.max(0, gas.t - 30);
        polyline(gas.history.map(([t, s]) => [gx + (t - t0) / 30 * gw, gy + gh * (1 - s)]), COLORS[0], 2);
        label('1', gx - 14, gy + 4, '#596a78'); label('0.5', gx - 24, gy + gh / 2 + 3, '#596a78'); label('0', gx - 14, gy + gh + 3, '#596a78');
        label('time →', gx + gw - 40, gy + gh + 16, '#798995');
        const s = gas.history.at(-1)[1];
        const home = gas.x.reduce((n, x) => n + (x <= BOX.w * state.entropy.confine ? 1 : 0), 0) / gas.x.length;
        label(`${(home * 100).toFixed(0)}% of molecules in the starting region`, gx, gy + gh + 52, COLORS[1]);
        label(`chance all ${gas.x.length} return by luck ≈ 10^${Math.round(gas.x.length * Math.log10(state.entropy.confine))}`, gx, gy + gh + 72, '#798995');
        setReadout([['TIME', `${gas.t.toFixed(1)} s`], ['ENTROPY', `${(s * 100).toFixed(1)}%`], ['REVERSALS', gas.reversed]]);
      },
    },
  });
})();
