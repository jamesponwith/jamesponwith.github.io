// 03 · Deterministic chaos
(() => {
  function chaosRegime(r) {
    if (r < 3) return 'stable fixed point';
    if (r < 3.4495) return 'period-2 cycle';
    if (r < 3.5441) return 'period-4 cycle';
    if (r < 3.56995) return 'period-doubling';
    return 'chaos + periodic windows';
  }
  function drawChaos() {
    const left = 72; const right = 930; const width = right - left;
    const topY = 45; const topH = 170; const botY = 279; const botH = 132;
    ctx.fillStyle = '#d4dfe6'; ctx.font = '9px "DM Mono", monospace'; ctx.fillText('LONG-RUN STATE x*', 18, 47); ctx.fillText('ORBIT xₙ', 18, 281);
    ctx.fillStyle = '#798995'; ctx.fillText('r parameter →', right - 88, topY + topH + 23); ctx.fillText('iteration n →', right - 96, botY + botH + 24);
    drawGrid(left, topY, width, topH, 4); drawGrid(left, botY, width, botH, 4);
    ctx.strokeStyle = 'rgba(128, 153, 172, .18)'; ctx.beginPath(); ctx.moveTo(left, topY); ctx.lineTo(left, topY + topH); ctx.lineTo(right, topY + topH); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(left, botY); ctx.lineTo(left, botY + botH); ctx.lineTo(right, botY + botH); ctx.stroke();
    const rMin = 2.5; const rMax = 4; const columns = 450;
    ctx.fillStyle = 'rgba(101, 224, 208, .48)';
    for (let i = 0; i < columns; i += 1) {
      const r = rMin + (rMax - rMin) * i / (columns - 1);
      let x = .381966;
      for (let n = 0; n < 260; n += 1) x = r * x * (1 - x);
      for (let n = 0; n < 70; n += 1) {
        x = r * x * (1 - x);
        const px = left + (r - rMin) / (rMax - rMin) * width;
        const py = topY + topH * (1 - x);
        ctx.fillRect(px, py, 1.2, 1.2);
      }
    }
    const selectedX = left + (state.chaos.r - rMin) / (rMax - rMin) * width;
    ctx.strokeStyle = '#ffb26b'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(selectedX, topY); ctx.lineTo(selectedX, topY + topH); ctx.stroke();
    const values = []; let x = state.chaos.x0;
    for (let n = 0; n < state.chaos.steps; n += 1) { values.push(x); x = state.chaos.r * x * (1 - x); }
    ctx.beginPath();
    values.forEach((value, i) => {
      const px = left + i / Math.max(1, values.length - 1) * width;
      const py = botY + botH * (1 - value);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    });
    ctx.strokeStyle = '#65e0d0'; ctx.lineWidth = 1.8; ctx.shadowColor = 'rgba(101, 224, 208, .34)'; ctx.shadowBlur = 7; ctx.stroke(); ctx.shadowBlur = 0;
    ctx.fillStyle = '#687987'; ctx.font = '8px "DM Mono", monospace';
    ctx.fillText('2.5', left - 5, topY + topH + 17); ctx.fillText('3.0', left + width / 3 - 7, topY + topH + 17); ctx.fillText('3.5', left + 2 * width / 3 - 7, topY + topH + 17); ctx.fillText('4.0', right - 15, topY + topH + 17);
    const regime = chaosRegime(state.chaos.r);
    const readout = document.querySelector('#chaos-readout');
    if (readout) readout.innerHTML = `<div class="readout-row"><span>REGIME</span><strong>${regime}</strong></div><div class="readout-row"><span>r</span><strong>${state.chaos.r.toFixed(3)}</strong></div><div class="readout-row"><span>LAST x</span><strong>${values.at(-1).toFixed(4)}</strong></div>`;
  }

  defineTheory('chaos', {
    tab: ['Deterministic chaos', 'Nonlinearity · sensitivity'],
    meta: {
      category: 'NONLINEAR DYNAMICS',
      title: 'Order can become unpredictable',
      glyph: '↗',
      description: 'A tiny deterministic recurrence can amplify minuscule differences in its starting conditions.',
      visualTitle: 'Logistic map · bifurcation + orbit',
      frame: 'ITERATION SPACE',
      caption: 'Upper: long-run values across r. Lower: one orbit from the selected starting point.',
      equation: '<span class="accent">xₙ₊₁ = r xₙ (1 − xₙ)</span>',
      equationNote: 'A discrete-time population model with normalized state 0 ≤ x ≤ 1.',
      insight: 'As r rises, a stable fixed point splits into cycles of 2, 4, 8… then chaotic bands. The rule stays exact; long-term prediction becomes sensitive to tiny initial errors.',
      boundary: 'This is a mathematical dynamical system, not a complete model of any real population. Chaotic parameter ranges also contain periodic windows.',
    },
    defaults: { r: 3.85, x0: 0.23, steps: 120 },
    formats: {
      r: (v) => v.toFixed(3),
      x0: (v) => v.toFixed(2),
      steps: (v) => `${v} steps`,
    },
    controls: () => `
      ${rangeControl('r', 'Growth parameter r', 2.5, 4, 0.005, '2.5', '4.0')}
      ${rangeControl('x0', 'Initial state x₀', 0.05, 0.95, 0.01, '0.05', '0.95')}
      ${rangeControl('steps', 'Orbit length', 50, 300, 10, '50', '300')}
      <div class="readout" id="chaos-readout"></div>`,
    sim: {
      draw: drawChaos,
    },
  });
})();
