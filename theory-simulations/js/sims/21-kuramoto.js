// 21 · Synchronization
(() => {
  const KUR_N = 150; const kur = {};

  defineTheory('kuramoto', {
    tab: ['Synchronization', 'Fireflies · phase transitions'],
    meta: {
      category: 'NONLINEAR DYNAMICS',
      title: 'Spontaneous synchronization',
      glyph: '∿',
      description: 'Fireflies with their own rhythms end up flashing in unison, with no leader. Kuramoto (1975) showed that sync switches on suddenly once coupling crosses a threshold.',
      visualTitle: 'Kuramoto model · 150 coupled oscillators',
      frame: 'PHASE SPACE',
      caption: 'Left: each firefly flashes as its phase passes the top. Circle: every phase; the arrow’s length is the order parameter r.',
      equation: '<span class="accent">dθᵢ/dt = ωᵢ + (K/N) Σⱼ sin(θⱼ − θᵢ)</span>',
      equationNote: 'ωᵢ are natural frequencies with spread σ. r = |⟨e^{iθ}⟩| runs from 0 (scattered) to 1 (lockstep). Critical coupling K_c = 2/πg(0) ≈ 1.6σ.',
      insight: 'Below K_c phases stay scattered and r hovers near zero. Above it a synchronized core forms and grows—a phase transition, like water freezing. The same math describes pacemaker cells, power grids, applause, and the Millennium Bridge wobble.',
      boundary: 'All-to-all coupling and fixed natural frequencies. Real fireflies see only neighbors and nudge their timing in pulses; with N = 150, r carries finite-size noise.',
    },
    defaults: { coupling: 1.2, spread: 0.5 },
    formats: {
      coupling: (v) => `K = ${v.toFixed(2)}`,
      spread: (v) => `σ = ${v.toFixed(2)}`,
    },
    controls: () => `
      ${rangeControl('coupling', 'Coupling', 0, 3, 0.05, 'None', 'Strong')}
      ${rangeControl('spread', 'Frequency spread', 0.1, 1.2, 0.05, 'Similar', 'Diverse')}
      <div class="readout" id="live-readout"></div>${playControls()}`,
    sim: {
      resetOn: ['spread'],
      reset() {
        Object.assign(kur, {
          theta: Float64Array.from({ length: KUR_N }, () => Math.random() * 2 * Math.PI),
          omega: Float64Array.from({ length: KUR_N }, () => Math.PI + state.kuramoto.spread * gauss()),
          pos: Array.from({ length: KUR_N }, () => [30 + Math.random() * 400, 50 + Math.random() * 360]),
          t: 0, history: [], r: 0, psi: 0,
        });
      },
      order() {
        let c = 0; let s = 0; kur.theta.forEach((t) => { c += Math.cos(t); s += Math.sin(t); });
        kur.r = Math.hypot(c, s) / KUR_N; kur.psi = Math.atan2(s, c);
      },
      tick(dt) {
        const K = state.kuramoto.coupling;
        for (let s = 0; s < 4; s += 1) {
          this.order();
          for (let i = 0; i < KUR_N; i += 1) kur.theta[i] += (kur.omega[i] + K * kur.r * Math.sin(kur.psi - kur.theta[i])) * dt / 4;
        }
        kur.t += dt; kur.history.push([kur.t, kur.r]);
        while (kur.history[0][0] < kur.t - 20) kur.history.shift();
      },
      draw() {
        this.order();
        kur.pos.forEach(([x, y], i) => {
          const b = Math.max(0, Math.cos(kur.theta[i])) ** 12;
          ctx.fillStyle = 'rgba(120, 140, 110, .5)'; ctx.fillRect(x - 1, y - 1, 2, 2);
          if (b > 0.02) { ctx.save(); ctx.globalAlpha = b; drawStar(x, y, 2 + 4 * b, '#d8ff8a'); ctx.restore(); }
        });
        label('FIREFLIES', 18, 30, '#d4dfe6');
        const cx = 600; const cy = 200; const R = 115;
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(135, 157, 172, .35)'; ctx.lineWidth = 1; ctx.stroke();
        kur.theta.forEach((t) => { ctx.fillStyle = 'rgba(216, 255, 138, .8)'; ctx.fillRect(cx + R * Math.sin(t) - 2, cy - R * Math.cos(t) - 2, 4, 4); });
        polyline([[cx, cy], [cx + R * kur.r * Math.sin(kur.psi), cy - R * kur.r * Math.cos(kur.psi)]], COLORS[1], 2.5);
        drawStar(cx + R * kur.r * Math.sin(kur.psi), cy - R * kur.r * Math.cos(kur.psi), 4, COLORS[1]);
        label('flash ↑', cx - 18, cy - R - 10, '#798995'); label('PHASES', cx - R, 30, '#d4dfe6');
        const gx = 755; const gw = 170; const gy = 60; const gh = 280;
        label('ORDER r · last 20 s', gx, 40, '#d4dfe6'); drawGrid(gx, gy, gw, gh, 4);
        const t0 = kur.t - 20; polyline(kur.history.map(([t, r]) => [gx + (t - t0) / 20 * gw, gy + gh * (1 - r)]), COLORS[1], 1.8);
        label('1', gx - 12, gy + 4, '#596a78'); label('0', gx - 12, gy + gh + 3, '#596a78');
        const kc = 2 * state.kuramoto.spread * Math.sqrt(2 * Math.PI) / Math.PI; const ratio = state.kuramoto.coupling / kc;
        setReadout([['ORDER r', kur.r.toFixed(3)], ['K / K_c', ratio.toFixed(2)], ['REGIME', ratio < 0.9 ? 'incoherent' : ratio < 1.6 ? 'partial sync' : 'locked']]);
      },
    },
  });
})();
