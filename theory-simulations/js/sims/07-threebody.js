// 07 · Three-body problem
(() => {
  const tb = {};
  const TB_DT = 0.002; const TB_SOFT = 1e-4;
  function tbInit(kick, ghost) {
    const v3 = [-0.93240737, -0.86473146];
    return {
      p: [[-0.97000436, 0.24308753], [0.97000436, -0.24308753], [ghost, kick]],
      v: [[-v3[0] / 2, -v3[1] / 2], [-v3[0] / 2, -v3[1] / 2], [...v3]],
    };
  }
  function tbAcc(p) {
    const a = [[0, 0], [0, 0], [0, 0]];
    for (let i = 0; i < 3; i += 1) for (let j = i + 1; j < 3; j += 1) {
      const dx = p[j][0] - p[i][0]; const dy = p[j][1] - p[i][1];
      const r2 = dx * dx + dy * dy + TB_SOFT; const f = 1 / (r2 * Math.sqrt(r2));
      a[i][0] += dx * f; a[i][1] += dy * f; a[j][0] -= dx * f; a[j][1] -= dy * f;
    }
    return a;
  }
  function tbStep(s) {
    let a = tbAcc(s.p);
    for (let i = 0; i < 3; i += 1) for (let k = 0; k < 2; k += 1) { s.v[i][k] += a[i][k] * TB_DT / 2; s.p[i][k] += s.v[i][k] * TB_DT; }
    a = tbAcc(s.p);
    for (let i = 0; i < 3; i += 1) for (let k = 0; k < 2; k += 1) s.v[i][k] += a[i][k] * TB_DT / 2;
  }
  function tbEnergy(s) {
    let e = 0;
    for (let i = 0; i < 3; i += 1) {
      e += (s.v[i][0] ** 2 + s.v[i][1] ** 2) / 2;
      for (let j = i + 1; j < 3; j += 1) e -= 1 / Math.sqrt((s.p[j][0] - s.p[i][0]) ** 2 + (s.p[j][1] - s.p[i][1]) ** 2 + TB_SOFT);
    }
    return e;
  }
  const tbSeparation = () => tb.a.p.reduce((sum, p, i) => sum + Math.hypot(p[0] - tb.b.p[i][0], p[1] - tb.b.p[i][1]), 0);

  defineTheory('threebody', {
    tab: ['Three-body problem', 'Gravity · chaos'],
    meta: {
      category: 'CELESTIAL MECHANICS',
      title: 'The three-body problem',
      glyph: '⁂',
      description: 'Newton solved two gravitating bodies exactly. Add a third and there is no general formula—only rare special orbits, like this figure-eight, adrift in a sea of chaos.',
      visualTitle: 'Figure-eight choreography · Newtonian gravity',
      frame: 'CENTER-OF-MASS FRAME',
      caption: 'Solid: the system. Hollow rings: a ghost copy started 10⁻⁶ away.',
      equation: '<span class="accent">r̈ᵢ = Σⱼ G mⱼ (rⱼ − rᵢ) / |rⱼ − rᵢ|³</span>',
      equationNote: 'Three equal masses, G = m = 1. Velocity Verlet integration (Δt = 0.002) with slight softening at close approach.',
      insight: 'Unperturbed, the ghost stays glued to the system: the figure-eight (found 1993, proven 2000) is stable. Push δ past ≈ 0.25 and the gap grows exponentially—then one body is flung out. Determinism does not guarantee predictability.',
      boundary: 'Planar point masses with softened gravity; no relativity or tides. Slow linear drift at small δ is ordinary phase drift; chaos shows as steep exponential growth.',
    },
    defaults: { kick: 0, warp: 1 },
    formats: {
      kick: (v) => v.toFixed(2),
      warp: (v) => `${v}×`,
    },
    controls: () => `
      ${rangeControl('kick', 'Perturbation δ', 0, 0.4, 0.01, 'Choreography', 'Disturbed')}
      ${rangeControl('warp', 'Time warp', 0.5, 4, 0.5, 'Slow', 'Fast')}
      <div class="readout" id="live-readout"></div>${playControls()}`,
    sim: {
      resetOn: ['kick'],
      reset() {
        Object.assign(tb, { a: tbInit(state.threebody.kick, 0), b: tbInit(state.threebody.kick, 1e-6), t: 0, trails: [[], [], []], divergence: [] });
        tb.e0 = tbEnergy(tb.a);
      },
      tick(dt) {
        const steps = Math.round(dt * 1.2 * state.threebody.warp / TB_DT);
        for (let n = 0; n < steps; n += 1) { tbStep(tb.a); tbStep(tb.b); tb.t += TB_DT; }
        tb.a.p.forEach((p, i) => { tb.trails[i].push([...p]); if (tb.trails[i].length > 260) tb.trails[i].shift(); });
        if (!tb.divergence.length || tb.t - tb.divergence.at(-1)[0] > 0.1) {
          tb.divergence.push([tb.t, Math.log10(Math.max(1e-9, tbSeparation()))]);
          if (tb.divergence.length > 600) tb.divergence.shift();
        }
      },
      draw() {
        const ox = 370; const oy = 230; const scale = 265;
        const toScreen = ([x, y]) => [ox + x * scale, oy - y * scale];
        label('ORBITS', 18, 30, '#d4dfe6');
        tb.trails.forEach((trail, i) => polyline(trail.map(toScreen), `${COLORS[i]}66`, 1.4));
        tb.b.p.forEach((p, i) => {
          const [x, y] = toScreen(p); ctx.beginPath(); ctx.arc(x, y, 11, 0, Math.PI * 2); ctx.strokeStyle = `${COLORS[i]}99`; ctx.lineWidth = 1; ctx.stroke();
        });
        tb.a.p.forEach((p, i) => { const [x, y] = toScreen(p); drawStar(x, y, 6.5, COLORS[i]); });
        // divergence chart: log10 distance between system and ghost
        const gx = 720; const gw = 205; const gy = 60; const gh = 300; const lo = -7; const hi = 1;
        label('GHOST GAP log₁₀|Δ|', gx, 40, '#d4dfe6');
        drawGrid(gx, gy, gw, gh, 4);
        const t0 = tb.divergence[0]?.[0] ?? 0; const span = Math.max(20, tb.t - t0);
        polyline(tb.divergence.map(([t, d]) => [gx + (t - t0) / span * gw, gy + gh * (1 - (Math.min(hi, d) - lo) / (hi - lo))]), COLORS[1], 1.6);
        label('10¹', gx - 26, gy + 4, '#596a78'); label('10⁻³', gx - 32, gy + gh / 2 + 3, '#596a78'); label('10⁻⁷', gx - 32, gy + gh + 3, '#596a78');
        label('time →', gx + gw - 40, gy + gh + 16, '#798995');
        const gap = tbSeparation(); const ejected = tb.a.p.some(([x, y]) => Math.hypot(x, y) > 3);
        const drift = Math.abs((tbEnergy(tb.a) - tb.e0) / tb.e0);
        label(`energy drift ${(drift * 100).toFixed(3)}%`, gx, gy + gh + 40, '#596a78');
        setReadout([['TIME', tb.t.toFixed(1)], ['GHOST GAP', gap.toExponential(1)], ['STATE', ejected ? 'EJECTION' : gap > 0.1 ? 'CHAOTIC' : 'BOUND · ORDERLY']]);
      },
    },
  });
})();
