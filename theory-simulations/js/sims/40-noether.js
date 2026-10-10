// 40 · Noether's theorem
(() => {
  const DRIVE = 1.7; const SCALE = 150; const CX = 300; const CY = 235;
  const nt = {};
  const k = (t) => 1 + state.noether.pulse * Math.sin(DRIVE * t);
  const force = (x, y, t) => { const e = state.noether.oval; return [-k(t) * (1 + e) * x, -k(t) * (1 - e) * y]; };
  const energy = () => { const e = state.noether.oval; return 0.5 * (nt.vx ** 2 + nt.vy ** 2) + 0.5 * k(nt.t) * ((1 + e) * nt.x ** 2 + (1 - e) * nt.y ** 2); };
  const angular = () => nt.x * nt.vy - nt.y * nt.vx;

  defineTheory('noether', {
    wave: 'WAVE 08 · SYMMETRY, MATTER & NETWORKS',
    tab: ['Noether’s theorem', 'Symmetry · conservation'],
    meta: {
      category: 'SYMMETRY',
      title: 'Symmetry is conservation',
      glyph: '⟲',
      description: 'Emmy Noether (1918) proved that every continuous symmetry of the laws of physics comes with a conserved quantity. Break the symmetry and the conservation law breaks with it.',
      visualTitle: 'Particle in a bowl · symmetry on, symmetry off',
      frame: 'POTENTIAL CONTOURS',
      caption: 'Rings: contours of the potential. Right: angular momentum L and energy E relative to their starting values.',
      equation: '<span class="accent">rotation symmetry ⇒ L conserved</span> · time symmetry ⇒ E conserved',
      equationNote: 'V = ½ k(t) [(1+ε)x² + (1−ε)y²]. ε squashes the bowl (breaking rotation symmetry); k(t) = 1 + τ sin 1.7t makes it pulse (breaking time symmetry).',
      insight: 'With a round, steady bowl both lines stay flat. Squash it and L wanders while E holds; make it pulse and E wanders too. Symmetry under shifts in space gives conservation of momentum the same way. Noether’s theorem is why physicists hunt for symmetries.',
      boundary: 'One particle in two dimensions, integrated with velocity Verlet. The theorem itself applies to any system with a Lagrangian, quantum fields included.',
    },
    defaults: { oval: 0, pulse: 0 },
    formats: {
      oval: (v) => (v ? `ε = ${v.toFixed(2)}` : 'round · symmetric'),
      pulse: (v) => (v ? `τ = ${v.toFixed(2)}` : 'steady · symmetric'),
    },
    controls: () => `
      ${rangeControl('oval', 'Squash the bowl (rotation)', 0, 0.5, 0.01, 'Round', 'Oval')}
      ${rangeControl('pulse', 'Pulse the bowl (time)', 0, 0.5, 0.01, 'Steady', 'Pulsing')}
      <div class="readout" id="live-readout"></div>${playControls()}`,
    sim: {
      resetOn: ['oval', 'pulse'],
      reset() {
        Object.assign(nt, { x: 1, y: 0, vx: 0, vy: 0.7, t: 0, trail: [], hist: [] });
        nt.E0 = energy(); nt.L0 = angular();
      },
      tick(dt) {
        for (let s = 0; s < 20; s += 1) {
          const h = dt * 2 / 20; let [ax, ay] = force(nt.x, nt.y, nt.t);
          nt.vx += ax * h / 2; nt.vy += ay * h / 2; nt.x += nt.vx * h; nt.y += nt.vy * h; nt.t += h;
          [ax, ay] = force(nt.x, nt.y, nt.t); nt.vx += ax * h / 2; nt.vy += ay * h / 2;
        }
        nt.trail.push([nt.x, nt.y]); if (nt.trail.length > 500) nt.trail.shift();
        nt.hist.push([nt.t, angular() / nt.L0, energy() / nt.E0]); while (nt.hist[0][0] < nt.t - 40) nt.hist.shift();
      },
      draw() {
        const e = state.noether.oval; const kk = k(nt.t);
        for (let level = 1; level <= 5; level += 1) {
          const v = level * 0.12; ctx.beginPath();
          ctx.ellipse(CX, CY, SCALE * Math.sqrt(2 * v / (kk * (1 + e))), SCALE * Math.sqrt(2 * v / (kk * (1 - e))), 0, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(119, 169, 255, .18)'; ctx.lineWidth = 1; ctx.stroke();
        }
        polyline(nt.trail.map(([x, y]) => [CX + x * SCALE, CY - y * SCALE]), 'rgba(101, 224, 208, .55)', 1.3);
        drawStar(CX + nt.x * SCALE, CY - nt.y * SCALE, 6, '#fff1c4');
        drawStar(CX, CY, 2.5, 'rgba(169, 182, 192, .6)');
        label('PARTICLE IN A BOWL', 18, 30, '#d4dfe6');
        const gx = 640; const gw = 285; const t0 = nt.t - 40;
        [[60, 'ANGULAR MOMENTUM L / L₀', 1, COLORS[0], 'rotation', -2], [260, 'ENERGY E / E₀', 2, COLORS[1], 'time', 0]].forEach(([gy, title, col, color, sym, lo]) => {
          const gh = 130; label(title, gx, gy - 10, '#d4dfe6'); drawGrid(gx, gy, gw, gh, 2);
          const toY = (v) => gy + gh * (1 - (Math.max(lo, Math.min(2, v)) - lo) / (2 - lo));
          polyline([[gx, toY(1)], [gx + gw, toY(1)]], 'rgba(255, 241, 196, .25)', 1, [3, 4]);
          polyline(nt.hist.map((h) => [gx + (h[0] - t0) / 40 * gw, toY(h[col])]), color, 1.8);
          label('2', gx - 12, gy + 4, '#596a78'); label('1', gx - 12, toY(1) + 3, '#596a78'); label(String(lo), gx - 16, gy + gh + 3, '#596a78');
          const broken = sym === 'rotation' ? state.noether.oval > 0 : state.noether.pulse > 0;
          label(broken ? `${sym} symmetry broken → not conserved` : `${sym} symmetry intact → conserved`, gx, gy + gh + 16, broken ? COLORS[2] : '#798995', 8);
        });
        const last = nt.hist.at(-1) ?? [0, 1, 1];
        setReadout([['L / L₀', last[1].toFixed(4)], ['E / E₀', last[2].toFixed(4)], ['ROTATION', state.noether.oval ? 'broken' : 'symmetric'], ['TIME', state.noether.pulse ? 'broken' : 'symmetric']]);
      },
    },
  });
})();
