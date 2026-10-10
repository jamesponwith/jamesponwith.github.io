// 14 · Fourier series
(() => {
  const SHAPES = ['Heart', 'Star', 'Square'];
  const four = {};
  function shapePoints(shape, n = 256) {
    let pts;
    const alongPolygon = (verts) => Array.from({ length: n }, (_, i) => {
      const f = i / n * verts.length; const k = Math.floor(f); const [a, b] = [verts[k], verts[(k + 1) % verts.length]];
      return [a[0] + (b[0] - a[0]) * (f - k), a[1] + (b[1] - a[1]) * (f - k)];
    });
    if (shape === 0) pts = Array.from({ length: n }, (_, i) => { const t = i / n * 2 * Math.PI; return [16 * Math.sin(t) ** 3, 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)]; });
    else if (shape === 1) pts = alongPolygon(Array.from({ length: 10 }, (_, k) => { const r = k % 2 ? 0.42 : 1; const a = Math.PI / 2 + k * Math.PI / 5; return [r * Math.cos(a), r * Math.sin(a)]; }));
    else pts = alongPolygon([[-1, 1], [1, 1], [1, -1], [-1, -1]]);
    const mx = pts.reduce((s, p) => s + p[0], 0) / n; const my = pts.reduce((s, p) => s + p[1], 0) / n;
    const r = Math.max(...pts.map(([x, y]) => Math.hypot(x - mx, y - my)));
    return pts.map(([x, y]) => [(x - mx) / r, (y - my) / r]);
  }
  function epicycle(t, count) {
    const chain = [[0, 0]]; let x = 0; let y = 0;
    for (let i = 0; i < count; i += 1) {
      const { freq, amp, phase } = four.coeffs[i]; const a = 2 * Math.PI * freq * t + phase;
      x += amp * Math.cos(a); y += amp * Math.sin(a); chain.push([x, y]);
    }
    return chain;
  }

  defineTheory('fourier', {
    tab: ['Fourier series', 'Circles · frequencies'],
    meta: {
      category: 'MATHEMATICS',
      title: 'Everything is circles',
      glyph: '∮',
      description: 'Fourier: any closed curve can be traced by a chain of spinning circles, each turning at a whole-number speed. Add circles and the drawing sharpens.',
      visualTitle: 'Discrete Fourier series · epicycles',
      frame: 'COMPLEX PLANE',
      caption: 'Circles ordered largest first. Faint dashes: the target shape. Right: the size of every frequency.',
      equation: '<span class="accent">z(t) = Σₖ cₖ e^(2πikt)</span>, cₖ = (1/N) Σₙ zₙ e^(−2πikn/N)',
      equationNote: 'The shape is 256 points in the complex plane; each coefficient cₖ is a circle of radius |cₖ| spinning k times per loop.',
      insight: 'Smooth shapes need few circles; sharp corners need many. On the square, an overshoot near each corner never fully vanishes—the Gibbs phenomenon. The same decomposition underlies JPEG, MP3, MRI, and momentum in quantum mechanics.',
      boundary: 'A discrete transform of sampled points, so 256 circles reproduce the samples exactly. Ptolemy’s planetary epicycles were a geometric cousin of the same idea.',
    },
    defaults: { shape: 0, circles: 12 },
    formats: {
      shape: (v) => SHAPES[v],
      circles: (v) => `${v}`,
    },
    controls: () => `
      ${rangeControl('shape', 'Shape', 0, SHAPES.length - 1, 1, SHAPES[0], SHAPES.at(-1))}
      ${rangeControl('circles', 'Circles', 1, 200, 1, '1', '200')}
      <div class="readout" id="live-readout"></div>${playControls()}`,
    sim: {
      resetOn: ['shape', 'circles'],
      reset() {
        const pts = shapePoints(state.fourier.shape); const n = pts.length;
        four.points = pts;
        four.coeffs = Array.from({ length: n }, (_, k) => {
          const freq = k <= n / 2 ? k : k - n; let re = 0; let im = 0;
          pts.forEach(([x, y], j) => { const a = -2 * Math.PI * freq * j / n; re += x * Math.cos(a) - y * Math.sin(a); im += x * Math.sin(a) + y * Math.cos(a); });
          return { freq, amp: Math.hypot(re, im) / n, phase: Math.atan2(im, re) };
        }).sort((a, b) => b.amp - a.amp);
        four.recon = Array.from({ length: 401 }, (_, i) => epicycle(i / 400, state.fourier.circles).at(-1));
        four.t = 0; four.trace = [];
      },
      tick(dt) {
        four.t += dt / 10;
        if (four.t >= 1) { four.t -= 1; four.trace = []; }
        four.trace.push(epicycle(four.t, state.fourier.circles).at(-1));
      },
      draw() {
        const S = 165; const toS = ([x, y]) => [340 + x * S, 230 - y * S];
        const pts = four.points.map(toS);
        polyline([...pts, pts[0]], 'rgba(255, 241, 196, .22)', 1, [3, 5]);
        polyline(four.recon.map(toS), 'rgba(101, 224, 208, .16)', 1);
        const chain = epicycle(four.t, state.fourier.circles).map(toS);
        ctx.lineWidth = 1;
        for (let i = 0; i < chain.length - 1; i += 1) {
          const r = four.coeffs[i].amp * S; if (r < 0.6) continue;
          ctx.strokeStyle = 'rgba(119, 169, 255, .22)'; ctx.beginPath(); ctx.arc(chain[i][0], chain[i][1], r, 0, Math.PI * 2); ctx.stroke();
        }
        polyline(chain, 'rgba(220, 232, 255, .55)', 1);
        polyline(four.trace.map(toS), COLORS[0], 2.2);
        drawStar(...chain.at(-1), 3.5, '#fff1c4');
        // amplitude spectrum, largest first
        const gx = 680; const gw = 245; const gy = 60; const gh = 330; const shown = 60; const maxAmp = four.coeffs[0].amp;
        label(`AMPLITUDES · largest ${shown}`, gx, 40, '#d4dfe6');
        for (let i = 0; i < shown; i += 1) {
          const h = Math.sqrt(four.coeffs[i].amp / maxAmp) * gh;
          ctx.fillStyle = i < state.fourier.circles ? 'rgba(101, 224, 208, .75)' : 'rgba(135, 157, 172, .25)';
          ctx.fillRect(gx + i * gw / shown, gy + gh - h, gw / shown - 1, h);
        }
        label('√|cₖ| (scaled)', gx, gy + gh + 16, '#798995');
        const err = four.points.reduce((s, p, i) => s + Math.hypot(p[0] - four.recon[Math.round(i / four.points.length * 400)][0], p[1] - four.recon[Math.round(i / four.points.length * 400)][1]), 0) / four.points.length;
        setReadout([['SHAPE', SHAPES[state.fourier.shape]], ['CIRCLES', state.fourier.circles], ['MEAN ERROR', `${(err * 100).toFixed(2)}%`]]);
      },
    },
  });
})();
