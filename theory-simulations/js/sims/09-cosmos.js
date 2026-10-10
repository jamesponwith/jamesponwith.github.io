// 09 · Cosmic expansion
(() => {
  const universe = {};
  const COSMO_P = [1920, 960]; const COSMO_STEP = 48;
  const wrap = (d, period) => d - period * Math.round(d / period);

  defineTheory('cosmos', {
    tab: ['Cosmic expansion', 'Hubble · the Big Bang'],
    meta: {
      category: 'COSMOLOGY',
      title: 'The expanding universe',
      glyph: 'H₀',
      description: 'Space itself stretches. Every galaxy sees every other galaxy receding—faster the farther away. There is no center. Click any galaxy to stand on it.',
      visualTitle: 'Hubble–Lemaître law · comoving galaxies',
      frame: 'ANY OBSERVER',
      caption: 'Arrows show recession velocity. Inset: speed vs distance is a straight line from every vantage point.',
      equation: '<span class="accent">v = H d</span>, H = ȧ / a',
      equationNote: 'a(t) is the cosmic scale factor. Galaxies keep fixed comoving coordinates while physical distances grow as a(t).',
      insight: 'Switch observers and the picture is identical: uniform expansion has no privileged center. Run the film backward and everything converges—the reasoning that led to the Big Bang.',
      boundary: 'Constant-H exponential expansion in a flat, periodic 2-D universe; the scale factor loops from 1 to 3. Real H evolves as matter and dark energy trade dominance, and galaxies have local motions.',
    },
    defaults: { hubble: 0.12 },
    formats: {
      hubble: (v) => `${v.toFixed(2)} /s`,
    },
    controls: () => `
      ${rangeControl('hubble', 'Expansion rate H', 0.02, 0.4, 0.01, 'Slow', 'Fast')}
      <div class="readout" id="live-readout"></div>${playControls()}`,
    sim: {
      reset() {
        universe.galaxies = [];
        for (let x = 0; x < COSMO_P[0]; x += COSMO_STEP) for (let y = 0; y < COSMO_P[1]; y += COSMO_STEP) {
          universe.galaxies.push([x + (Math.random() - 0.5) * 36, y + (Math.random() - 0.5) * 36, 0.6 + Math.random() * 1.4]);
        }
        universe.obs = 0; universe.a = 1;
      },
      tick(dt) { universe.a *= Math.exp(state.cosmos.hubble * dt); if (universe.a > 3) universe.a = 1; },
      relative(g) { const o = universe.galaxies[universe.obs]; return [wrap(g[0] - o[0], COSMO_P[0]), wrap(g[1] - o[1], COSMO_P[1])]; },
      pick(x, y) {
        let best = universe.obs; let bestD = Infinity;
        universe.galaxies.forEach((g, i) => { const [dx, dy] = this.relative(g); const d = Math.hypot(480 + universe.a * dx - x, 230 + universe.a * dy - y); if (d < bestD) { bestD = d; best = i; } });
        universe.obs = best;
      },
      draw() {
        const { a } = universe; const H = state.cosmos.hubble; const o = universe.galaxies[universe.obs];
        // comoving grid stretching with space
        ctx.strokeStyle = 'rgba(119, 169, 255, .08)'; ctx.lineWidth = 1;
        for (let k = -6; k <= 6; k += 1) {
          const x = 480 + a * (k * 160 - (o[0] % 160)); const y = 230 + a * (k * 160 - (o[1] % 160));
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 460); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(960, y); ctx.stroke();
        }
        const hubblePts = [];
        universe.galaxies.forEach((g, i) => {
          if (i === universe.obs) return;
          const [dx, dy] = this.relative(g); const x = 480 + a * dx; const y = 230 + a * dy;
          if (x < -10 || x > 970 || y < -10 || y > 470) return;
          const d = Math.hypot(a * dx, a * dy);
          if (d > 30) polyline([[x, y], [x + a * dx * H * 1.8, y + a * dy * H * 1.8]], 'rgba(119, 169, 255, .28)', 1);
          ctx.fillStyle = `rgba(220, 232, 255, ${0.45 + g[2] * 0.3})`; ctx.beginPath(); ctx.arc(x, y, g[2], 0, Math.PI * 2); ctx.fill();
          hubblePts.push([d, H * d]);
        });
        drawStar(480, 230, 6, COLORS[1]);
        ctx.beginPath(); ctx.arc(480, 230, 14, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(255, 178, 107, .6)'; ctx.stroke();
        label('YOU', 470, 258, COLORS[1]);
        label(`SCALE FACTOR a = ${a.toFixed(2)}`, 18, 30, '#d4dfe6');
        // Hubble diagram inset
        const ix = 700; const iy = 300; const iw = 230; const ih = 135; const dMax = 540; const vMax = 0.4 * dMax;
        ctx.fillStyle = '#0c1219'; ctx.fillRect(ix - 30, iy - 26, iw + 44, ih + 50);
        ctx.strokeStyle = '#26313d'; ctx.strokeRect(ix - 30, iy - 26, iw + 44, ih + 50);
        label('HUBBLE DIAGRAM', ix - 20, iy - 10, '#d4dfe6', 8);
        polyline([[ix, iy], [ix, iy + ih], [ix + iw, iy + ih]], 'rgba(128, 153, 172, .35)', 1);
        ctx.fillStyle = 'rgba(101, 224, 208, .7)';
        hubblePts.forEach(([d, v]) => { if (d < dMax) ctx.fillRect(ix + d / dMax * iw - 1, iy + ih * (1 - v / vMax) - 1, 2, 2); });
        label('distance →', ix + iw - 60, iy + ih + 14, '#798995', 8); label('speed', ix - 26, iy + 10, '#798995', 8);
        setReadout([['SCALE FACTOR', a.toFixed(3)], ['H', `${H.toFixed(2)} per s`], ['OBSERVER', `galaxy #${universe.obs}`], ['RECEDING', `${hubblePts.length} of ${hubblePts.length}`]]);
      },
    },
  });
})();
