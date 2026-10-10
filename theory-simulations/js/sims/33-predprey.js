// 33 · Predator–prey
(() => {
  const LV_DT = 0.01; const SPOTS = Array.from({ length: 600 }, () => [Math.random(), Math.random(), Math.random() * 6.28]);
  const lv = {};
  const params = () => { const { alpha, gamma, hunting: beta } = state.predprey; return { alpha, beta, gamma, delta: beta / 2 }; };
  const equilibrium = () => { const { alpha, beta, gamma, delta } = params(); return [gamma / delta, alpha / beta]; };
  function deriv(x, y) { const { alpha, beta, gamma, delta } = params(); return [alpha * x - beta * x * y, delta * x * y - gamma * y]; }
  function rk4() {
    const [k1x, k1y] = deriv(lv.x, lv.y);
    const [k2x, k2y] = deriv(lv.x + LV_DT / 2 * k1x, lv.y + LV_DT / 2 * k1y);
    const [k3x, k3y] = deriv(lv.x + LV_DT / 2 * k2x, lv.y + LV_DT / 2 * k2y);
    const [k4x, k4y] = deriv(lv.x + LV_DT * k3x, lv.y + LV_DT * k3y);
    lv.x += LV_DT / 6 * (k1x + 2 * k2x + 2 * k3x + k4x); lv.y += LV_DT / 6 * (k1y + 2 * k2y + 2 * k3y + k4y); lv.t += LV_DT;
  }
  const conserved = () => { const { alpha, beta, gamma, delta } = params(); return delta * lv.x - gamma * Math.log(lv.x) + beta * lv.y - alpha * Math.log(lv.y); };
  const PH = { x: 690, y: 60, w: 235, h: 260 };
  const phaseScale = () => { const [xs, ys] = equilibrium(); return [xs * 4, ys * 4]; };

  defineTheory('predprey', {
    tab: ['Predator–prey cycles', 'Ecology · feedback'],
    meta: {
      category: 'ECOLOGY',
      title: 'Boom and bust',
      glyph: '⇌',
      description: 'More rabbits feed more foxes; more foxes eat more rabbits. Lotka (1925) and Volterra (1926) showed this feedback alone makes both populations cycle forever.',
      visualTitle: 'Lotka–Volterra model · prey and predators',
      frame: 'POPULATION',
      caption: 'Cyan: prey. Orange: predators. Right: the cycle in time and in the phase plane—click the phase plane to start from a new point.',
      equation: '<span class="accent">dx/dt = αx − βxy</span> · dy/dt = δxy − γy',
      equationNote: 'x is prey, y predators. Prey breed at α and are eaten at βxy; predators turn meals into offspring at δ = β/2 and die at γ.',
      insight: 'Predator peaks lag prey peaks by about a quarter cycle. Each starting point traces its own closed loop around the equilibrium (γ/δ, α/β) because a hidden quantity V never changes. Hudson’s Bay Company fur records of lynx and hare show cycles like these.',
      boundary: 'Deterministic and well-mixed: no carrying capacity, randomness, or space. Real populations can die out at a trough; this model never does.',
    },
    defaults: { alpha: 1, gamma: 0.6, hunting: 0.02 },
    formats: {
      alpha: (v) => `α = ${v.toFixed(2)}`,
      gamma: (v) => `γ = ${v.toFixed(2)}`,
      hunting: (v) => `β = ${v.toFixed(3)}`,
    },
    controls: () => `
      ${rangeControl('alpha', 'Prey birth rate', 0.4, 1.6, 0.05, 'Slow', 'Fast')}
      ${rangeControl('gamma', 'Predator death rate', 0.2, 1.2, 0.05, 'Hardy', 'Fragile')}
      ${rangeControl('hunting', 'Hunting success', 0.01, 0.05, 0.001, 'Poor', 'Deadly')}
      <div class="readout" id="live-readout"></div>${playControls()}`,
    sim: {
      reset() { const [xs, ys] = equilibrium(); this.start(xs * 0.5, ys * 0.4); },
      start(x, y) { Object.assign(lv, { x, y, t: 0, hist: [[0, x, y]], v0: null }); lv.v0 = conserved(); },
      pick(px, py) {
        if (px < PH.x || px > PH.x + PH.w || py < PH.y || py > PH.y + PH.h) return;
        const [mx, my] = phaseScale();
        this.start(Math.max(0.5, (px - PH.x) / PH.w * mx), Math.max(0.5, (1 - (py - PH.y) / PH.h) * my));
      },
      tick(dt) {
        for (let s = Math.round(dt * 2 / LV_DT); s > 0; s -= 1) rk4();
        lv.hist.push([lv.t, lv.x, lv.y]); if (lv.hist.length > 3000) lv.hist.shift();
      },
      draw() {
        const [xs, ys] = equilibrium(); const [mx, my] = phaseScale();
        // field: one dot per animal, capped for display
        ctx.strokeStyle = 'rgba(135, 157, 172, .25)'; ctx.strokeRect(20, 40, 290, 380);
        label('MEADOW', 20, 30, '#d4dfe6');
        const prey = Math.min(450, Math.round(lv.x * 3)); const pred = Math.min(150, Math.round(lv.y * 1.5));
        SPOTS.slice(0, prey).forEach(([u, v, ph]) => { ctx.fillStyle = COLORS[0]; ctx.fillRect(24 + u * 282 + Math.sin(lv.t * 3 + ph) * 2, 44 + v * 372, 2.4, 2.4); });
        SPOTS.slice(450, 450 + pred).forEach(([u, v, ph]) => drawStar(26 + u * 278 + Math.cos(lv.t * 2 + ph) * 3, 46 + v * 368, 2.6, COLORS[1]));
        // time series, last 30 time units
        const tx = 345; const tw = 300; const ty = 60; const th = 340; const t0 = lv.t - 30; const top = Math.max(mx, my) * 0.75;
        label('POPULATIONS OVER TIME', tx, 40, '#d4dfe6'); drawGrid(tx, ty, tw, th, 4);
        const recent = lv.hist.filter(([t]) => t >= t0);
        polyline(recent.map(([t, x]) => [tx + (t - t0) / 30 * tw, ty + th * (1 - Math.min(1, x / top))]), COLORS[0], 1.8);
        polyline(recent.map(([t, , y]) => [tx + (t - t0) / 30 * tw, ty + th * (1 - Math.min(1, y / top))]), COLORS[1], 1.8);
        label('time →', tx + tw - 40, ty + th + 15, '#798995');
        // phase plane
        label('PHASE PLANE · click to restart', PH.x, 40, '#d4dfe6'); drawGrid(PH.x, PH.y, PH.w, PH.h, 4);
        polyline([[PH.x, PH.y], [PH.x, PH.y + PH.h], [PH.x + PH.w, PH.y + PH.h]], 'rgba(128, 153, 172, .35)', 1);
        const toP = (x, y) => [PH.x + Math.min(1, x / mx) * PH.w, PH.y + PH.h * (1 - Math.min(1, y / my))];
        polyline(lv.hist.map(([, x, y]) => toP(x, y)), 'rgba(255, 241, 196, .6)', 1.4);
        drawStar(...toP(xs, ys), 3.5, '#d4dfe6'); label('equilibrium', toP(xs, ys)[0] + 6, toP(xs, ys)[1] - 6, '#798995', 8);
        drawStar(...toP(lv.x, lv.y), 4.5, COLORS[1]);
        label('prey →', PH.x + PH.w - 40, PH.y + PH.h + 15, COLORS[0]); label('predators ↑', PH.x, PH.y + PH.h + 15, COLORS[1]);
        const { alpha, gamma } = params();
        label(`small-cycle period 2π/√(αγ) ≈ ${(2 * Math.PI / Math.sqrt(alpha * gamma)).toFixed(1)}`, PH.x, PH.y + PH.h + 40, '#798995');
        setReadout([['PREY', lv.x.toFixed(1)], ['PREDATORS', lv.y.toFixed(1)], ['EQUILIBRIUM', `${xs.toFixed(0)} · ${ys.toFixed(0)}`], ['V DRIFT', `${Math.abs((conserved() - lv.v0) / lv.v0 * 100).toExponential(1)}%`]]);
      },
    },
  });
})();
