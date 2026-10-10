// 49 · Evolution of the eye
(() => {
  // Eye as a sphere of diameter 1 with retina covering half-angle α = πc from the back; a lens of focusing power n fills the aperture.
  const GENERATIONS_PER_STEP = 363992 / 1829; // Nilsson & Pelger's pace: 1,829 steps of 1% in ~364,000 generations
  const eye = {};
  function geometry(c, n) {
    const al = Math.PI * c; const a = 0.5 * Math.sin(al); const depth = 0.5 * (1 - Math.cos(al));
    const f = n > 0 ? 0.25 / n : Infinity; const defocus = Number.isFinite(f) ? Math.abs(1 - depth / f) : 1;
    return { al, a, depth, f, defocus };
  }
  // angular blur: geometric blur plus a photon-noise term that punishes small apertures in dim light
  function blur(c, n) { const { a, depth, defocus } = geometry(c, n); const k = state.eye.dimness; return Math.sqrt((2 * Math.atan(a * defocus / Math.max(depth, 1e-6))) ** 2 + (k / Math.max(a, 1e-6)) ** 2); }
  const stage = (c, n) => { const { defocus } = geometry(c, n); return c < 0.15 ? 'light-sensitive patch' : c <= 0.5 ? 'cup eye' : n < 0.05 ? 'pinhole eye' : defocus < 0.1 ? 'focused lens eye' : 'lens eye'; };
  function evolveStep() {
    const cur = blur(eye.c, eye.n); let best = null;
    for (const [dc, dn] of [[0.01, 0], [-0.01, 0], [0, 1], [0, -1]]) {
      const c2 = Math.min(0.98, Math.max(0.02, eye.c * (1 + dc))); const n2 = Math.max(0, dn ? (eye.n === 0 && dn > 0 ? 0.005 : eye.n * (1 + 0.01 * dn)) : eye.n);
      const v = blur(c2, n2); if (v < cur * 0.99999 && (!best || v < best[2])) best = [c2, n2, v];
    }
    if (!best) { eye.done = true; return; }
    [eye.c, eye.n] = best; eye.steps += 1;
    const s = stage(eye.c, eye.n); if (s !== eye.stage) { if (!eye.marks.some(([, name]) => name === s)) eye.marks.push([eye.steps, s]); eye.stage = s; }
    eye.history.push([eye.steps, blur(eye.c, eye.n)]);
  }
  // where a ray from the left at height h (relative to the axis) hits the retina circle
  function traceRay(h, g, cx, cy, R) {
    const apX = cx + R * Math.cos(g.al); let y = h; let slope = 0;
    if (Number.isFinite(g.f)) slope = -h / (g.f * 2 * R);
    let x = apX;
    for (let k = 0; k < 400; k += 1) { x += 2; y += slope * 2; if (Math.hypot(x - cx, y) >= R) break; }
    return [[cx - R - 120, cy + h], [apX, cy + h], [x, cy + y]];
  }

  defineTheory('eye', {
    tab: ['Evolution of the eye', 'Small steps · selection'],
    meta: {
      category: 'EVOLUTIONARY BIOLOGY',
      title: 'An eye, one small step at a time',
      glyph: '◉',
      description: 'Darwin admitted the eye seemed “absurd in the highest degree” to explain by selection. Nilsson and Pelger (1994) showed a flat light-sensitive patch can become a focused camera eye through tiny improvements—fast.',
      visualTitle: 'Selection on eye shape and lens power',
      frame: 'CROSS-SECTION',
      caption: 'Left: the current eye, with rays from a distant point. Right: blur angle over evolutionary steps, with each new stage marked.',
      equation: '<span class="accent">keep any 1% change that sharpens vision</span>',
      equationNote: 'Each step deepens or narrows the cup, or strengthens the lens, by 1%. Blur combines geometric spread with photon noise, which penalizes tiny apertures—more so in dim light.',
      insight: 'Every stage beats the one before: a cup senses direction, a pinhole forms a dim image, and even a weak lens helps by focusing a wider aperture. Nilsson and Pelger estimated about 364,000 generations—a geological instant. Eyes have evolved independently dozens of times.',
      boundary: 'A cartoon of their model: two traits, a smooth fitness landscape, no genetics or drift. Real lenses have graded refractive index; the readout uses their generations-per-step pace.',
    },
    defaults: { dimness: 0.02, evoSpeed: 12 },
    formats: {
      dimness: (v) => (v < 0.01 ? 'bright daylight' : v < 0.03 ? 'shallow water' : 'dim depths'),
      evoSpeed: (v) => `${v} steps/s`,
    },
    controls: () => `
      ${rangeControl('dimness', 'Habitat light', 0.005, 0.06, 0.005, 'Bright', 'Dim')}
      ${rangeControl('evoSpeed', 'Evolution speed', 2, 60, 1, 'Slow', 'Fast')}
      <div class="readout" id="live-readout"></div>${playControls()}`,
    sim: {
      resetOn: ['dimness'],
      reset() { Object.assign(eye, { c: 0.02, n: 0, steps: 0, timer: 0, done: false, marks: [[0, 'light-sensitive patch']], stage: 'light-sensitive patch', history: [] }); eye.history.push([0, blur(eye.c, eye.n)]); },
      tick(dt) { if (eye.done) return; eye.timer += dt; const period = 1 / state.eye.evoSpeed; while (eye.timer >= period && !eye.done) { eye.timer -= period; evolveStep(); } },
      draw() {
        const g = geometry(eye.c, eye.n); const R = 130; const cx = 330; const cy = 230;
        // retina arc centered on the back of the eye
        ctx.lineWidth = 7; ctx.strokeStyle = '#7a4b6e'; ctx.beginPath(); ctx.arc(cx, cy, R, -g.al, g.al); ctx.stroke();
        ctx.lineWidth = 2; ctx.strokeStyle = COLORS[2]; ctx.beginPath(); ctx.arc(cx, cy, R - 4, -g.al, g.al); ctx.stroke();
        if (g.al < Math.PI - 0.02) { ctx.beginPath(); ctx.arc(cx, cy, R, g.al, 2 * Math.PI - g.al); ctx.strokeStyle = 'rgba(169, 182, 192, .15)'; ctx.setLineDash([3, 5]); ctx.lineWidth = 1; ctx.stroke(); ctx.setLineDash([]); }
        if (eye.n > 0) { const lx = cx + R * Math.cos(g.al); const lr = Math.max(4, g.a * 2 * R); ctx.fillStyle = `rgba(169, 216, 255, ${Math.min(0.6, eye.n * 1.5)})`; ctx.beginPath(); ctx.ellipse(lx, cy, Math.min(lr, 30) * 0.6, lr, 0, 0, Math.PI * 2); ctx.fill(); }
        const hits = [];
        for (let k = -2; k <= 2; k += 1) {
          const h = k / 2 * Math.max(2, g.a * 2 * R * 0.9);
          const ray = traceRay(h, g, cx, cy, R); polyline(ray, 'rgba(255, 241, 196, .55)', 1); hits.push(ray[2][1]); drawStar(...ray[2], 2.5, '#fff1c4');
        }
        const spread = Math.max(...hits) - Math.min(...hits);
        label('light from a distant point →', cx - R - 120, cy - 60, '#a9b6c0', 8);
        label(stage(eye.c, eye.n).toUpperCase(), 18, 30, COLORS[1]);
        label(`image spot on retina: ${spread.toFixed(0)} px`, 18, 440, '#798995', 8);
        // blur vs steps
        const gx = 640; const gw = 285; const gy = 60; const gh = 260; const toX = (s) => gx + s / Math.max(900, eye.steps) * gw; const toY = (b) => gy + gh * (1 - (Math.log10(b * 180 / Math.PI) + 0.3) / 2.6);
        label('BLUR ANGLE (log) vs STEPS', gx, 40, '#d4dfe6'); drawGrid(gx, gy, gw, gh, 4);
        polyline(eye.history.map(([st, b]) => [toX(st), toY(b)]), COLORS[0], 2);
        eye.marks.forEach(([st, name], i) => { polyline([[toX(st), gy], [toX(st), gy + gh]], 'rgba(255, 178, 107, .35)', 1, [2, 4]); label(name.split(' ')[0], toX(st) + 3, gy + 12 + (i % 3) * 12, COLORS[1], 8); });
        label('180°', gx - 30, toY(Math.PI) + 3, '#596a78'); label('1°', gx - 20, toY(Math.PI / 180) + 3, '#596a78');
        const blurDeg = blur(eye.c, eye.n) * 180 / Math.PI;
        setReadout([['STAGE', stage(eye.c, eye.n)], ['1% STEPS', eye.steps.toLocaleString()], ['≈ GENERATIONS', Math.round(eye.steps * GENERATIONS_PER_STEP).toLocaleString()], ['BLUR', `${blurDeg.toFixed(blurDeg < 10 ? 2 : 0)}°`]]);
      },
    },
  });
})();
