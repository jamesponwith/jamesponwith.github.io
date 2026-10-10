// 26 · Self-organized criticality
(() => {
  const SP_W = 78; const SP_H = 57; const SP_MODES = ['Random drops', 'Center drops'];
  const sp = { h: new Uint8Array(SP_W * SP_H), glow: new Float32Array(SP_W * SP_H), stack: [] };
  function spDrop(i) {
    sp.h[i] += 1; let size = 0; sp.stack.push(i);
    while (sp.stack.length) {
      const j = sp.stack.pop(); if (sp.h[j] < 4) continue;
      sp.h[j] -= 4; size += 1; sp.glow[j] = 1; if (sp.h[j] >= 4) sp.stack.push(j);
      const x = j % SP_W; const y = Math.floor(j / SP_W);
      [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]].forEach(([nx, ny]) => {
        if (nx < 0 || ny < 0 || nx >= SP_W || ny >= SP_H) return;
        const k = ny * SP_W + nx; sp.h[k] += 1; if (sp.h[k] === 4) sp.stack.push(k);
      });
    }
    return size;
  }

  defineTheory('sandpile', {
    tab: ['Self-organized criticality', 'Avalanches · power laws'],
    meta: {
      category: 'COMPLEX SYSTEMS',
      title: 'Self-organized criticality',
      glyph: '△',
      description: 'Drop sand one grain at a time; any site with four grains topples onto its neighbors. With no tuning, the pile drives itself to a critical state where avalanches of every size occur.',
      visualTitle: 'Bak–Tang–Wiesenfeld sandpile',
      frame: 'GRAINS 0–3',
      caption: 'Dark to bright: 0 to 3 grains. Orange: sites that just toppled. Right: avalanche sizes on log–log axes.',
      equation: '<span class="accent">P(s) ∝ s^(−τ)</span>',
      equationNote: 'A power law has no typical size: one rule yields tiny slides and system-spanning collapses. τ is estimated live from the histogram.',
      insight: 'Bak, Tang, and Wiesenfeld (1987) offered this as why power laws are everywhere—earthquakes, forest fires, solar flares, extinctions. Drop at the center instead and the pile grows into an intricate exact fractal.',
      boundary: 'An abelian cellular automaton on a 78 × 57 grid; grains falling off the edge are lost, and finite size cuts off the largest avalanches. Whether real systems are truly self-organized critical is still debated.',
    },
    defaults: { dropMode: 0, grainRate: 300 },
    formats: {
      dropMode: (v) => SP_MODES[v],
      grainRate: (v) => `${v} / s`,
    },
    controls: () => `
      ${rangeControl('dropMode', 'Where grains land', 0, 1, 1, SP_MODES[0], SP_MODES[1])}
      ${rangeControl('grainRate', 'Grains per second', 10, 2000, 10, 'Trickle', 'Pour')}
      <div class="readout" id="live-readout"></div>${playControls()}`,
    sim: {
      resetOn: ['dropMode'],
      reset() { sp.h.fill(0); sp.glow.fill(0); Object.assign(sp, { hist: new Array(16).fill(0), drops: 0, carry: 0, biggest: 0 }); },
      tick(dt) {
        sp.carry += dt * state.sandpile.grainRate; const center = Math.floor(SP_H / 2) * SP_W + Math.floor(SP_W / 2);
        for (let i = 0; i < sp.glow.length; i += 1) sp.glow[i] *= 0.6;
        while (sp.carry >= 1) {
          sp.carry -= 1; sp.drops += 1;
          const size = spDrop(state.sandpile.dropMode ? center : Math.floor(Math.random() * SP_W * SP_H));
          if (size) { sp.hist[Math.min(15, Math.floor(Math.log2(size)))] += 1; sp.biggest = Math.max(sp.biggest, size); }
        }
      },
      draw() {
        const cell = 8; const shades = ['#0d141b', '#1d3a4c', '#2f7183', '#65e0d0'];
        for (let i = 0; i < sp.h.length; i += 1) {
          const x = (i % SP_W) * cell; const y = Math.floor(i / SP_W) * cell + 2;
          ctx.fillStyle = shades[Math.min(3, sp.h[i])]; ctx.fillRect(x, y, cell - 0.5, cell - 0.5);
          if (sp.glow[i] > 0.05) { ctx.fillStyle = `rgba(255, 178, 107, ${sp.glow[i] * 0.45})`; ctx.fillRect(x, y, cell - 0.5, cell - 0.5); }
        }
        // avalanche size distribution, log2 bins on log-log axes
        const gx = 665; const gw = 260; const gy = 60; const gh = 240; const maxLog = Math.log10(Math.max(10, ...sp.hist));
        label('AVALANCHE SIZES', gx, 40, '#d4dfe6'); drawGrid(gx, gy, gw, gh, 4);
        const pts = sp.hist.map((c, k) => (c ? [k, Math.log10(c)] : null)).filter(Boolean);
        pts.forEach(([k, lc]) => drawStar(gx + (k + 0.5) / 16 * gw, gy + gh * (1 - lc / maxLog), 3.5, COLORS[1]));
        label('1', gx, gy + gh + 14, '#596a78'); label('size (log) → 2¹⁵', gx + gw - 92, gy + gh + 14, '#596a78');
        // least-squares slope over well-populated bins → τ
        const fit = sp.hist.map((c, k) => [k, c]).filter(([, c]) => c >= 5).map(([k, c]) => [k, Math.log2(c)]);
        let tau = null;
        if (fit.length >= 4) {
          const n = fit.length; const mx = fit.reduce((s, [x]) => s + x, 0) / n; const my = fit.reduce((s, [, y]) => s + y, 0) / n;
          const slope = fit.reduce((s, [x, y]) => s + (x - mx) * (y - my), 0) / fit.reduce((s, [x]) => s + (x - mx) ** 2, 0);
          tau = 1 - slope;
        }
        label(tau ? `fitted τ ≈ ${tau.toFixed(2)}` : 'collecting avalanches…', gx, gy + gh + 40, COLORS[1]);
        setReadout([['GRAINS DROPPED', sp.drops.toLocaleString()], ['AVALANCHES', sp.hist.reduce((s, c) => s + c, 0).toLocaleString()], ['LARGEST', `${sp.biggest} topples`], ['EXPONENT τ', tau ? tau.toFixed(2) : '—']]);
      },
    },
  });
})();
