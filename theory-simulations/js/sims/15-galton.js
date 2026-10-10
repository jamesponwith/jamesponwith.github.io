// 15 · Central limit theorem
(() => {
  const gb = {};
  const GB_STEP = 0.07;

  defineTheory('galton', {
    tab: ['Central limit theorem', 'Chance · the bell curve'],
    meta: {
      category: 'PROBABILITY',
      title: 'Order out of randomness',
      glyph: '∩',
      description: 'Each ball makes a string of coin-flip bounces. No single path is predictable, yet the pile always forms the same bell curve: the central limit theorem.',
      visualTitle: 'Galton board · binomial → normal',
      frame: 'PEG FIELD',
      caption: 'Bars: balls landed. Dots: exact binomial prediction. Curve: the normal approximation.',
      equation: '<span class="accent">(Sₙ − nμ) / (σ√n) → 𝒩(0, 1)</span>',
      equationNote: 'Each bounce goes right with probability p, so the landing bin has mean np and variance np(1−p).',
      insight: 'Sums of many small independent effects become normal whatever the individual steps look like. That is why measurement errors and polling margins follow the bell curve. Bias the bounces and the curve shifts—but keeps its shape.',
      boundary: 'Ideal pegs with independent bounces. With few rows the discrete binomial is visible; the normal fit improves as rows increase.',
    },
    defaults: { rows: 12, bias: 0.5 },
    formats: {
      rows: (v) => `${v} rows`,
      bias: (v) => v.toFixed(2),
    },
    controls: () => `
      ${rangeControl('rows', 'Peg rows', 4, 16, 1, '4', '16')}
      ${rangeControl('bias', 'Right-bounce chance p', 0.2, 0.8, 0.05, 'Left', 'Right')}
      <div class="readout" id="live-readout"></div>${playControls('<button class="action-button secondary" data-action="burst">＋ DROP 1,000 INSTANTLY</button>')}`,
    sim: {
      resetOn: ['rows', 'bias'],
      reset() { Object.assign(gb, { balls: [], bins: Array(state.galton.rows + 1).fill(0), spawn: 0, total: 0, sum: 0, sumSq: 0 }); },
      land(j) { gb.bins[j] += 1; gb.total += 1; gb.sum += j; gb.sumSq += j * j; },
      burst() {
        const { rows, bias } = state.galton;
        for (let n = 0; n < 1000; n += 1) { let j = 0; for (let r = 0; r < rows; r += 1) if (Math.random() < bias) j += 1; this.land(j); }
      },
      tick(dt) {
        const { rows, bias } = state.galton;
        gb.spawn += dt * 14;
        while (gb.spawn >= 1) { gb.spawn -= 1; gb.balls.push({ age: 0, steps: Array.from({ length: rows }, () => (Math.random() < bias ? 1 : 0)) }); }
        gb.balls.forEach((b) => { b.age += dt; });
        gb.balls = gb.balls.filter((b) => {
          if (b.age < (rows + 1) * GB_STEP + 0.25) return true;
          this.land(b.steps.reduce((s, v) => s + v, 0)); return false;
        });
      },
      draw() {
        const { rows, bias } = state.galton; const w = Math.min(56, 840 / (rows + 1)); const top = 36; const rowH = 205 / rows; const binTop = 268; const binH = 168;
        const xAt = (r, j) => 480 + (j - r / 2) * w;
        ctx.fillStyle = 'rgba(169, 182, 192, .55)';
        for (let r = 0; r < rows; r += 1) for (let j = 0; j <= r; j += 1) { ctx.beginPath(); ctx.arc(xAt(r, j), top + r * rowH, 2.2, 0, Math.PI * 2); ctx.fill(); }
        for (const b of gb.balls) {
          const s = Math.min(rows, Math.floor(b.age / GB_STEP)); const frac = Math.min(1, b.age / GB_STEP - s);
          const j0 = b.steps.slice(0, s).reduce((a, v) => a + v, 0);
          let x; let y;
          if (s < rows) { const j1 = j0 + b.steps[s]; x = xAt(s, j0) + (xAt(s + 1, j1) - xAt(s, j0)) * frac; y = top + (s + frac) * rowH - 5 - Math.sin(frac * Math.PI) * 5; }
          else { x = xAt(rows, j0); y = Math.min(binTop + binH - 4, top + rows * rowH + (b.age - rows * GB_STEP) * 600); }
          drawStar(x, y, 3, '#a9d8ff');
        }
        const pmf = []; let c = 1;
        for (let j = 0; j <= rows; j += 1) { pmf.push(c * bias ** j * (1 - bias) ** (rows - j)); c = c * (rows - j) / (j + 1); }
        const peak = Math.max(Math.max(...gb.bins), gb.total * Math.max(...pmf), 1);
        const toY = (count) => binTop + binH - count / peak * binH;
        polyline([[xAt(rows, -0.5), binTop + binH], [xAt(rows, rows + 0.5), binTop + binH]], 'rgba(135, 157, 172, .4)', 1);
        gb.bins.forEach((count, j) => { ctx.fillStyle = 'rgba(101, 224, 208, .45)'; ctx.fillRect(xAt(rows, j) - w / 2 + 1, toY(count), w - 2, binTop + binH - toY(count)); });
        if (gb.total) {
          pmf.forEach((p, j) => drawStar(xAt(rows, j), toY(gb.total * p), 2.5, '#fff1c4'));
          const mean = rows * bias; const sd = Math.sqrt(rows * bias * (1 - bias));
          polyline(Array.from({ length: 200 }, (_, i) => { const j = -0.5 + i / 199 * (rows + 1); return [xAt(rows, j), toY(gb.total * Math.exp(-((j - mean) ** 2) / (2 * sd * sd)) / (sd * Math.sqrt(2 * Math.PI)))]; }), COLORS[1], 1.8);
        }
        const mean = gb.total ? gb.sum / gb.total : 0; const sd = gb.total ? Math.sqrt(Math.max(0, gb.sumSq / gb.total - mean * mean)) : 0;
        setReadout([['BALLS', gb.total.toLocaleString()], ['MEAN', `${mean.toFixed(2)} · np ${(rows * bias).toFixed(2)}`], ['SPREAD σ', `${sd.toFixed(2)} · ${Math.sqrt(rows * bias * (1 - bias)).toFixed(2)}`]]);
      },
    },
  });
})();
