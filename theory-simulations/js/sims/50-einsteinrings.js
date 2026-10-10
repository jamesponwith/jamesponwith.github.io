// 50 · Einstein rings
(() => {
  const RES = 200; const FOV = 3; // image plane spans ±FOV Einstein-radius units at θE = 1
  const LENSES = ['Point mass', 'Galaxy (isothermal)', 'Galaxy + tidal shear'];
  const ring = { t: 0, cx: 0.15, cy: 0.05 };
  const rCanvas = document.createElement('canvas'); rCanvas.width = RES; rCanvas.height = RES;
  const rCtx = rCanvas.getContext('2d'); const rImage = rCtx.createImageData(RES, RES);
  const sourcePos = () => [ring.cx + 0.12 * Math.cos(ring.t * 0.5), ring.cy + 0.12 * Math.sin(ring.t * 0.5)];
  // a small spiral galaxy: bright core, two arms, a few star-forming knots
  function brightness(x, y, size) {
    const r = Math.hypot(x, y) / size; const phi = Math.atan2(y, x);
    const core = Math.exp(-r * r * 4); const arms = Math.exp(-r * 1.6) * (0.5 + 0.5 * Math.cos(2 * phi - 4 * r)) * 0.8;
    const knot = Math.exp(-((x - 0.35 * size) ** 2 + (y - 0.2 * size) ** 2) / (0.006 * size * size)) * 0.7;
    return core + arms + knot;
  }
  function deflect(tx, ty) {
    const { lens, thetaE: e } = state.einsteinrings; const r2 = tx * tx + ty * ty + 1e-9; const r = Math.sqrt(r2);
    if (lens === 0) return [tx - e * e * tx / r2, ty - e * e * ty / r2];
    let bx = tx - e * tx / r; let by = ty - e * ty / r;
    if (lens === 2) { const g = 0.18; bx -= g * tx; by += g * ty; }
    return [bx, by];
  }

  defineTheory('einsteinrings', {
    wave: 'WAVE 10 · ECHOES, FOLDS & CODES',
    tab: ['Einstein rings', 'Strong lensing · arcs'],
    meta: {
      category: 'GRAVITATIONAL LENSING',
      title: 'A galaxy turned into a ring',
      glyph: '◯',
      description: 'When a distant galaxy sits almost exactly behind a massive one, gravity smears its light into arcs, multiple images, or a complete Einstein ring. Experiment 02 showed a point of light; here is the whole galaxy.',
      visualTitle: 'Strong lensing by ray tracing · image plane and source plane',
      frame: 'SKY VIEW',
      caption: 'Left: what a telescope sees, every pixel traced back through the lens. Right: the source galaxy as it really is. Click the right panel to move it.',
      equation: '<span class="accent">β = θ − α(θ)</span> · point: α = θE²/θ · isothermal: α = θE',
      equationNote: 'β is the true source position, θ where light appears, α the bending angle. Shear adds the tidal pull of neighboring galaxies and breaks the symmetry.',
      insight: 'Perfect alignment gives a ring; slight offset breaks it into arcs; shear can make four images—an Einstein cross. Lensing magnifies too, letting astronomers study galaxies too faint to see otherwise, and the ring size weighs the lens, dark matter included.',
      boundary: 'Thin-lens ray tracing with idealized lens models; the source drifts on a small loop to show how images respond. Real lenses have extended, lumpy mass and the lens galaxy’s own light.',
    },
    defaults: { lens: 1, thetaE: 1, srcSize: 0.25 },
    formats: {
      lens: (v) => LENSES[v],
      thetaE: (v) => `θE = ${v.toFixed(2)}`,
      srcSize: (v) => `${v.toFixed(2)} θE`,
    },
    controls: () => `
      ${rangeControl('lens', 'Lens model', 0, LENSES.length - 1, 1, 'Point', 'Sheared')}
      ${rangeControl('thetaE', 'Lens mass (θE)', 0.4, 1.4, 0.05, 'Light', 'Heavy')}
      ${rangeControl('srcSize', 'Source galaxy size', 0.08, 0.6, 0.01, 'Compact', 'Large')}
      <div class="readout" id="live-readout"></div>${playControls()}`,
    sim: {
      reset() { ring.t = 0; },
      pick(x, y) { if (x > 600 && x < 920 && y > 70 && y < 390) { ring.cx = (x - 760) / 160 * 1.2; ring.cy = -(y - 230) / 160 * 1.2; ring.t = 0; } },
      tick(dt) { ring.t += dt; },
      draw() {
        const [sx, sy] = sourcePos(); const size = state.einsteinrings.srcSize; const px = rImage.data; let lensed = 0;
        for (let j = 0; j < RES; j += 1) for (let i = 0; i < RES; i += 1) {
          const tx = (i / RES * 2 - 1) * FOV; const ty = (1 - j / RES * 2) * FOV; const [bx, by] = deflect(tx, ty);
          const b = brightness(bx - sx, by - sy, size); lensed += b; const v = Math.min(1, b); const o = (j * RES + i) * 4;
          px[o] = 10 + 150 * v; px[o + 1] = 14 + 200 * v; px[o + 2] = 30 + 225 * v; px[o + 3] = 255;
        }
        rCtx.putImageData(rImage, 0, 0);
        const S = 430; const ox = 30; const oy = 15;
        ctx.imageSmoothingEnabled = true; ctx.drawImage(rCanvas, ox, oy, S, S);
        const glow = ctx.createRadialGradient(ox + S / 2, oy + S / 2, 1, ox + S / 2, oy + S / 2, 26);
        glow.addColorStop(0, 'rgba(255, 220, 160, .95)'); glow.addColorStop(1, 'rgba(255, 178, 107, 0)'); ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(ox + S / 2, oy + S / 2, 26, 0, Math.PI * 2); ctx.fill();
        if (state.einsteinrings.lens) { ctx.beginPath(); ctx.arc(ox + S / 2, oy + S / 2, state.einsteinrings.thetaE / FOV * S / 2, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(255, 178, 107, .25)'; ctx.setLineDash([3, 5]); ctx.stroke(); ctx.setLineDash([]); }
        label('WHAT THE TELESCOPE SEES', ox + 8, oy + 18, '#d4dfe6');
        // unlensed source plane
        const sx0 = 760; const sy0 = 230; const sc = 160 / 1.2;
        ctx.fillStyle = '#0a0f15'; ctx.fillRect(600, 70, 320, 320); ctx.strokeStyle = '#26313d'; ctx.strokeRect(600, 70, 320, 320);
        let unlensed = 0;
        for (let j = 0; j < 80; j += 1) for (let i = 0; i < 80; i += 1) {
          const x = (i / 80 * 2 - 1) * 1.2; const y = (1 - j / 80 * 2) * 1.2; const b = brightness(x - sx, y - sy, size);
          unlensed += b; if (b > 0.03) { const v = Math.min(1, b); ctx.fillStyle = `rgb(${10 + 150 * v}, ${14 + 200 * v}, ${30 + 225 * v})`; ctx.fillRect(600 + i * 4, 70 + j * 4, 4, 4); }
        }
        drawStar(sx0, sy0, 3, COLORS[1]); label('lens position', sx0 + 6, sy0 - 6, COLORS[1], 8);
        label('TRUE SOURCE (click to move)', 600, 60, '#d4dfe6');
        const mag = (lensed * (2 * FOV / RES) ** 2) / (unlensed * (2.4 / 80) ** 2);
        const offset = Math.hypot(sx, sy) / state.einsteinrings.thetaE;
        setReadout([['MAGNIFICATION', `${mag.toFixed(1)}×`], ['OFFSET / θE', offset.toFixed(2)], ['LOOK', offset < size * 0.8 ? 'ring' : offset < 0.6 ? 'arcs' : 'separate images']]);
      },
    },
  });
})();
