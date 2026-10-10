// 02 · Gravitational lensing
(() => {
  function drawImage(x, y, magnification, color) {
    const radius = 3.5 + Math.min(5, magnification * 1.8);
    ctx.save(); ctx.shadowColor = color; ctx.shadowBlur = 17; ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(240, 247, 255, .6)'; ctx.lineWidth = 1; ctx.stroke(); ctx.restore();
  }
  function drawLensing() {
    const e = state.lensing.einstein; const u = state.lensing.source; const beta = u * e;
    const root = Math.sqrt(u * u + 4);
    const plusUnits = (u + root) / 2; const minusUnits = (u - root) / 2;
    const plus = plusUnits * e; const minus = minusUnits * e;
    const muTotal = (u * u + 2) / (u * Math.sqrt(u * u + 4));
    const muPlus = (muTotal + 1) / 2; const muMinus = (muTotal - 1) / 2;
    const scale = 205 / (2.8 * 1.5); const originX = 480;
    const sourceY = 110; const imageY = 319;
    const sourceX = originX + beta * scale;
    const xPlus = originX + plus * scale; const xMinus = originX + minus * scale;
    ctx.fillStyle = '#81919d'; ctx.font = '9px "DM Mono", monospace'; ctx.fillText('SOURCE PLANE', 26, 42); ctx.fillText('IMAGE PLANE · OBSERVER VIEW', 26, 251);
    ctx.strokeStyle = 'rgba(135, 157, 172, .19)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(76, sourceY + 18); ctx.lineTo(900, sourceY + 18); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(76, imageY + 18); ctx.lineTo(900, imageY + 18); ctx.stroke();
    ctx.setLineDash([4, 7]); ctx.strokeStyle = 'rgba(119, 169, 255, .18)';
    ctx.beginPath(); ctx.moveTo(sourceX, sourceY + 20); ctx.lineTo(xPlus, imageY - 34); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sourceX, sourceY + 20); ctx.lineTo(xMinus, imageY - 34); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(originX, imageY + 18, e * scale, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 178, 107, .32)'; ctx.lineWidth = 1.5; ctx.setLineDash([5, 6]); ctx.stroke(); ctx.setLineDash([]);
    const lensGradient = ctx.createRadialGradient(originX - 4, imageY + 10, 1, originX, imageY + 18, 24);
    lensGradient.addColorStop(0, '#fff1c4'); lensGradient.addColorStop(.15, '#ffbd74'); lensGradient.addColorStop(.55, '#b76e50'); lensGradient.addColorStop(1, 'rgba(183, 110, 80, 0)');
    ctx.beginPath(); ctx.arc(originX, imageY + 18, 24, 0, Math.PI * 2); ctx.fillStyle = lensGradient; ctx.fill();
    drawStar(sourceX, sourceY + 18, 8, '#a9d8ff');
    drawImage(xPlus, imageY + 18, Math.min(2.8, muPlus), '#65e0d0');
    drawImage(xMinus, imageY + 18, Math.min(2.8, muMinus), '#bc9bff');
    ctx.fillStyle = '#8695a1'; ctx.font = '9px "DM Mono", monospace';
    ctx.fillText('unlensed source · β', Math.min(805, Math.max(92, sourceX - 43)), sourceY + 43);
    ctx.fillText('foreground mass', originX - 44, imageY + 62);
    ctx.fillStyle = '#65e0d0'; ctx.fillText('image θ+', Math.min(842, xPlus + 13), imageY + 13);
    ctx.fillStyle = '#bc9bff'; ctx.fillText('image θ−', Math.max(80, xMinus - 70), imageY + 13);
    ctx.fillStyle = '#596a78'; ctx.fillText(`θE = ${e.toFixed(2)}″`, originX + e * scale + 8, imageY - e * scale + 14);
    const readout = document.querySelector('#lens-readout');
    if (readout) readout.innerHTML = `<div class="readout-row"><span>θ+ IMAGE</span><strong>${plusUnits.toFixed(2)} θE</strong></div><div class="readout-row"><span>θ− IMAGE</span><strong>${minusUnits.toFixed(2)} θE</strong></div><div class="readout-row"><span>MAGNIFICATION</span><strong>${(muPlus + muMinus).toFixed(2)}× total</strong></div>`;
  }

  defineTheory('lensing', {
    tab: ['Gravitational lensing', 'Spacetime · light'],
    meta: {
      category: 'GENERAL RELATIVITY',
      title: 'Gravity bends the path of light',
      glyph: '◉',
      description: 'A massive foreground object can produce multiple images of one distant source—and, when aligned, an Einstein ring.',
      visualTitle: 'Point-mass lens geometry',
      frame: 'THIN-LENS VIEW',
      caption: 'One source position can map to two apparent image positions.',
      equation: '<span class="accent">β = θ − θE² / θ</span>',
      equationNote: 'β is the unlensed source angle, θ the image angle, and θE the Einstein angle.',
      insight: 'The lens changes where the source appears, not where it is. Stronger lensing (larger θE) separates the images; near-perfect alignment makes them approach a ring.',
      boundary: 'Point mass and thin-lens approximation. Real galaxies have extended mass distributions; this view is angular geometry, not a literal 3-D ray trace.',
    },
    defaults: { einstein: 1, source: 0.7 },
    formats: {
      einstein: (v) => `${v.toFixed(2)}″`,
      source: (v) => `${v.toFixed(2)} θE`,
    },
    controls: () => `
        ${rangeControl('einstein', 'Lens strength θE', 0.45, 1.5, 0.05, 'Lower mass', 'Higher mass')}
        ${rangeControl('source', 'Source offset β', 0.05, 2, 0.05, 'Aligned', 'Offset')}
        <div class="readout" id="lens-readout"></div>
        <div class="readout-row readout-note"><span>Image size is capped for display; the dashed circle marks θE.</span></div>`,
    sim: {
      draw: drawLensing,
    },
  });
})();
