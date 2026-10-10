// 39 · Fermat's principle
(() => {
  const IY = 230; const X0 = 20; const X1 = 600;
  const fm = { A: [130, 80], B: [500, 410], t: 0 };
  const n1 = 1;
  const pathTime = (x) => n1 * Math.hypot(x - fm.A[0], IY - fm.A[1]) + state.fermat.index * Math.hypot(fm.B[0] - x, fm.B[1] - IY);
  function fastest() { let lo = X0; let hi = X1; for (let k = 0; k < 80; k += 1) { const m1 = lo + (hi - lo) / 3; const m2 = hi - (hi - lo) / 3; if (pathTime(m1) < pathTime(m2)) hi = m2; else lo = m1; } return (lo + hi) / 2; }

  defineTheory('fermat', {
    tab: ['Fermat’s principle', 'Least time · refraction'],
    meta: {
      category: 'OPTICS',
      title: 'Light takes the quickest path',
      glyph: 'δt',
      description: 'Fermat (1662): of all the routes light could take between two points, it follows the one that takes the least time. Since light is slower in water and glass, the quickest route bends—and that bend is Snell’s law.',
      visualTitle: 'Least-time path across an interface',
      frame: 'AIR / WATER',
      caption: 'Faint fan: candidate paths through different crossing points. Orange: a probe path sweeping across. Cyan: the fastest path. Click above or below the surface to move A or B.',
      equation: '<span class="accent">n₁ sin θ₁ = n₂ sin θ₂</span> ⇔ minimize t = (n₁ L₁ + n₂ L₂) / c',
      equationNote: 'n is the refractive index: light travels at c/n. Setting dt/dx = 0 at the crossing point gives Snell’s law exactly.',
      insight: 'It is the lifeguard’s problem: run farther on sand to swim less in water. Fermat’s idea grew into the principle of least action that underlies all of classical mechanics—and, through Feynman’s sum over paths, quantum mechanics.',
      boundary: 'Geometric optics with a flat interface; strictly the path is stationary, which here is a minimum. Reflections and wave effects (experiment 35) are not shown.',
    },
    defaults: { index: 1.33 },
    formats: {
      index: (v) => `n₂ = ${v.toFixed(2)}${Math.abs(v - 1.33) < 0.006 ? ' · water' : Math.abs(v - 1.5) < 0.006 ? ' · glass' : Math.abs(v - 2.42) < 0.006 ? ' · diamond' : ''}`,
    },
    controls: () => `
      ${rangeControl('index', 'Lower medium index n₂', 1, 2.5, 0.01, 'Air', 'Diamond')}
      <div class="readout" id="live-readout"></div>${playControls()}`,
    sim: {
      reset() { fm.t = 0; },
      pick(x, y) { if (x < X0 || x > X1) return; if (y < IY - 6) fm.A = [x, y]; else if (y > IY + 6) fm.B = [x, y]; },
      tick(dt) { fm.t += dt; },
      draw() {
        const n2 = state.fermat.index;
        ctx.fillStyle = `rgba(119, 169, 255, ${0.06 + 0.08 * (n2 - 1)})`; ctx.fillRect(X0, IY, X1 - X0, 460 - IY);
        polyline([[X0, IY], [X1, IY]], 'rgba(169, 182, 192, .6)', 1);
        label('air  n₁ = 1.00', X0 + 6, IY - 8, '#798995'); label(`n₂ = ${n2.toFixed(2)}`, X0 + 6, IY + 18, '#798995');
        const best = fastest(); const tBest = pathTime(best);
        for (let x = X0; x <= X1; x += 20) { const extra = pathTime(x) / tBest - 1; polyline([fm.A, [x, IY], fm.B], `rgba(169, 182, 192, ${Math.max(0.04, 0.3 - extra * 1.5)})`, 1); }
        const probe = X0 + (X1 - X0) * (0.5 + 0.5 * Math.sin(fm.t * 0.6));
        polyline([fm.A, [probe, IY], fm.B], COLORS[1], 1.6);
        polyline([fm.A, [best, IY], fm.B], COLORS[0], 2.5);
        polyline([[best, IY - 70], [best, IY + 70]], 'rgba(255, 241, 196, .35)', 1, [3, 4]);
        drawStar(...fm.A, 5, '#fff1c4'); label('A', fm.A[0] - 4, fm.A[1] - 10, '#fff1c4');
        drawStar(...fm.B, 5, '#fff1c4'); label('B', fm.B[0] - 4, fm.B[1] + 20, '#fff1c4');
        // travel time vs crossing point
        const gx = 650; const gw = 270; const gy = 60; const gh = 230; const ts = Array.from({ length: 200 }, (_, i) => pathTime(X0 + (X1 - X0) * i / 199)); const hi = Math.max(...ts);
        const toX = (x) => gx + (x - X0) / (X1 - X0) * gw; const toY = (t) => gy + gh * (1 - (t - tBest * 0.98) / (hi - tBest * 0.98));
        label('TRAVEL TIME vs CROSSING POINT', gx, 40, '#d4dfe6'); drawGrid(gx, gy, gw, gh, 4);
        polyline(ts.map((t, i) => [gx + i / 199 * gw, toY(t)]), '#a9b6c0', 1.6);
        drawStar(toX(best), toY(tBest), 5, COLORS[0]); drawStar(toX(probe), toY(pathTime(probe)), 4, COLORS[1]);
        label('minimum', toX(best) - 20, toY(tBest) + 18, COLORS[0], 8);
        const s1 = Math.abs(best - fm.A[0]) / Math.hypot(best - fm.A[0], IY - fm.A[1]); const s2 = Math.abs(fm.B[0] - best) / Math.hypot(fm.B[0] - best, fm.B[1] - IY);
        const deg = (s) => (Math.asin(s) * 180 / Math.PI).toFixed(1);
        label(`θ₁ = ${deg(s1)}°   θ₂ = ${deg(s2)}°`, gx, gy + gh + 30, '#a9b6c0');
        label(`sin θ₁ / sin θ₂ = ${(s1 / s2).toFixed(3)}   (n₂/n₁ = ${n2.toFixed(3)})`, gx, gy + gh + 50, COLORS[0]);
        label(`probe is ${((pathTime(probe) / tBest - 1) * 100).toFixed(1)}% slower`, gx, gy + gh + 70, COLORS[1]);
        setReadout([['θ₁ (air)', `${deg(s1)}°`], ['θ₂ (lower)', `${deg(s2)}°`], ['SNELL RATIO', (s1 / s2).toFixed(3)]]);
      },
    },
  });
})();
