// 01 · Quantum interference
(() => {
  let photons = [];
  function fringeSpacing() {
    return (state.quantum.wavelength * 1e-9 * 1.5 / (state.quantum.separation * 1e-3)) * 1000;
  }
  function addPhotons(count) {
    const lambda = state.quantum.wavelength * 1e-9;
    const separation = state.quantum.separation * 1e-3;
    const width = .12e-3; const screenDistance = 1.5; const yLimit = .006;
    const visibility = state.quantum.visibility / 100;
    const samples = 1400; const cumulative = []; let sum = 0;
    for (let i = 0; i <= samples; i += 1) {
      const y = (i / samples * 2 - 1) * yLimit;
      const s = y / Math.sqrt(screenDistance * screenDistance + y * y);
      const z = Math.PI * width * s / lambda;
      const envelope = z === 0 ? 1 : (Math.sin(z) / z) ** 2;
      const p = Math.max(0, envelope * (1 + visibility * Math.cos(2 * Math.PI * separation * s / lambda)) / (1 + visibility));
      sum += p; cumulative.push(sum);
    }
    for (let n = 0; n < count; n += 1) {
      const target = Math.random() * sum;
      let lo = 0; let hi = cumulative.length - 1;
      while (lo < hi) { const mid = (lo + hi) >> 1; if (cumulative[mid] < target) lo = mid + 1; else hi = mid; }
      photons.push((lo / samples * 2 - 1) * yLimit);
    }
  }
  function drawQuantum() {
    const left = 72; const right = 930; const width = right - left;
    const top = 42; const plotHeight = 242; const detectorTop = 331; const detectorBottom = 420;
    const bins = 170;
    const counts = Array(bins).fill(0);
    const lambda = state.quantum.wavelength * 1e-9;
    const separation = state.quantum.separation * 1e-3;
    const slitWidth = 0.12e-3;
    const visibility = state.quantum.visibility / 100;
    const screenDistance = 1.5;
    const yLimit = 6e-3;
    const intensityAt = (y) => {
      const sinTheta = y / Math.sqrt(screenDistance * screenDistance + y * y);
      const envelopeArg = Math.PI * slitWidth * sinTheta / lambda;
      const envelope = envelopeArg === 0 ? 1 : (Math.sin(envelopeArg) / envelopeArg) ** 2;
      const phase = 2 * Math.PI * separation * sinTheta / lambda;
      return Math.max(0, envelope * (1 + visibility * Math.cos(phase)) / (1 + visibility));
    };
    for (const photon of photons) {
      const index = Math.max(0, Math.min(bins - 1, Math.floor((photon + yLimit) / (2 * yLimit) * bins)));
      counts[index] += 1;
    }

    ctx.fillStyle = '#d7e2e9'; ctx.font = '10px "DM Mono", monospace'; ctx.fillText('RELATIVE PROBABILITY', 17, 46);
    ctx.fillStyle = '#687986'; ctx.font = '9px "DM Mono", monospace'; ctx.fillText('1.0', 42, top + 4); ctx.fillText('0.5', 42, top + plotHeight / 2 + 4); ctx.fillText('0', 53, top + plotHeight + 3);
    drawGrid(left, top, width, plotHeight, 4);
    ctx.fillStyle = 'rgba(101, 224, 208, .11)';
    const maxCount = Math.max(1, ...counts);
    counts.forEach((count, i) => {
      if (!count) return;
      const x = left + i * width / bins;
      const barHeight = Math.min(plotHeight * .8, count / maxCount * plotHeight * .45);
      ctx.fillRect(x, top + plotHeight - barHeight, width / bins + .5, barHeight);
    });
    ctx.beginPath();
    for (let i = 0; i <= 800; i += 1) {
      const fraction = i / 800;
      const y = (fraction * 2 - 1) * yLimit;
      const px = left + fraction * width;
      const py = top + plotHeight * (1 - intensityAt(y));
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = '#65e0d0'; ctx.lineWidth = 2; ctx.shadowColor = 'rgba(101, 224, 208, .45)'; ctx.shadowBlur = 9; ctx.stroke(); ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(139, 159, 174, .24)'; ctx.beginPath(); ctx.moveTo(left, detectorTop - 15); ctx.lineTo(right, detectorTop - 15); ctx.stroke();
    ctx.fillStyle = '#71818d'; ctx.font = '9px "DM Mono", monospace'; ctx.fillText('DETECTOR HITS', 17, detectorTop + 2);
    ctx.fillStyle = '#566572'; ctx.fillText('−6 mm', left, top + plotHeight + 22); ctx.fillText('0', left + width / 2 - 3, top + plotHeight + 22); ctx.fillText('+6 mm', right - 35, top + plotHeight + 22);
    ctx.fillStyle = '#0b1118'; ctx.fillRect(left, detectorTop + 9, width, detectorBottom - detectorTop - 9);
    ctx.strokeStyle = 'rgba(101, 224, 208, .22)'; ctx.strokeRect(left, detectorTop + 9, width, detectorBottom - detectorTop - 9);
    for (const photon of photons) {
      const fraction = (photon + yLimit) / (2 * yLimit);
      ctx.beginPath(); ctx.arc(left + fraction * width, detectorTop + 17 + Math.random() * (detectorBottom - detectorTop - 25), 1.65, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(119, 169, 255, .78)'; ctx.fill();
    }
    if (photons.length === 0) {
      ctx.fillStyle = '#52616d'; ctx.font = '10px "DM Mono", monospace'; ctx.fillText('FIRE PHOTONS TO BUILD THE PATTERN', left + width / 2 - 128, detectorTop + 58);
    }
    const countLabel = document.querySelector('#photon-count');
    if (countLabel) countLabel.textContent = photons.length.toLocaleString();
    const spacing = document.querySelector('#fringe-spacing');
    if (spacing) spacing.textContent = `${fringeSpacing().toFixed(2)} mm`;
  }

  defineTheory('quantum', {
    wave: 'WAVE 01 · FIRST LIGHT',
    tab: ['Quantum interference', 'Probability · measurement'],
    meta: {
      category: 'QUANTUM PHYSICS',
      title: 'The double-slit experiment',
      glyph: 'Ψ',
      description: 'Send individual photons toward two openings. A wave-like probability pattern emerges from particle-like detections.',
      visualTitle: 'Single-particle detections',
      frame: 'SCREEN A',
      caption: 'Each dot is one detected photon. The pattern emerges statistically.',
      equation: '<span class="accent">I(y)</span> ∝ sinc²(πa sinθ / λ) · [1 + V cos(2πd sinθ / λ)]',
      equationNote: 'θ is the observation angle; a is slit width; d is slit separation; V is path visibility; sinc(u) = sin(u) / u.',
      insight: 'With no path information, the probability amplitudes interfere. As path information becomes available, fringe contrast fades—detections remain localized, while the distribution changes.',
      boundary: 'Scalar-wave, far-field approximation. The visibility control represents loss of coherence; it is not a detailed model of a detector.',
    },
    defaults: { wavelength: 550, separation: 1.2, visibility: 100 },
    formats: {
      wavelength: (v) => `${v} nm`,
      separation: (v) => `${v.toFixed(2)} mm`,
      visibility: (v) => `${v}%`,
    },
    controls: () => `
        ${rangeControl('wavelength', 'Wavelength λ', 420, 680, 10, 'Violet', 'Red')}
        ${rangeControl('separation', 'Slit separation d', 0.5, 2, 0.05, 'Close', 'Wide')}
        ${rangeControl('visibility', 'Path visibility V', 0, 100, 5, 'Known', 'Unknown')}
        <div class="readout">
          <div class="readout-row"><span>FRINGE SPACING</span><strong id="fringe-spacing">${fringeSpacing().toFixed(2)} mm</strong></div>
          <div class="readout-row"><span>DETECTIONS</span><strong id="photon-count">${photons.length}</strong></div>
        </div>
        <div class="control-actions">
          <button class="action-button" data-action="fire">＋ FIRE 250 PHOTONS</button>
          <button class="action-button secondary" data-action="clear">↺ RESET DETECTOR</button>
        </div>`,
    sim: {
      resetOn: ['wavelength', 'separation', 'visibility'],
      reset() { photons = []; },
      fire() { addPhotons(250); },
      clear() { photons = []; },
      draw: drawQuantum,
    },
  });
})();
