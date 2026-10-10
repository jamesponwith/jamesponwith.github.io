// 10 · Quantum tunneling
(() => {
  const TN = 2400; const TDX = 0.1; const TDT = 0.004; const TK0 = 2; const TSIG = 6; const TX0 = 60; const TMID = 120;
  const qt = {};
  function planeWaveT(E, V0, a) {
    if (V0 > E) { const k = Math.sqrt(2 * (V0 - E)); return 1 / (1 + V0 * V0 * Math.sinh(k * a) ** 2 / (4 * E * (V0 - E))); }
    if (V0 < E) { const k = Math.sqrt(2 * (E - V0)); return 1 / (1 + V0 * V0 * Math.sin(k * a) ** 2 / (4 * E * (E - V0))); }
    return 1 / (1 + E * a * a / 2);
  }

  defineTheory('tunneling', {
    wave: 'WAVE 03 · FRONTIERS & FOUNDATIONS',
    tab: ['Quantum tunneling', 'Waves · barriers'],
    meta: {
      category: 'QUANTUM MECHANICS',
      title: 'Quantum tunneling: walking through walls',
      glyph: 'ℏ',
      description: 'Fire a quantum wave packet at a barrier taller than its energy. A classical particle must bounce back. The wave partly leaks through.',
      visualTitle: 'Time-dependent Schrödinger equation · 1-D',
      frame: 'POSITION SPACE',
      caption: 'Filled: probability density |ψ|². Orange dot: a classical particle with the same energy.',
      equation: '<span class="accent">iℏ ∂ψ/∂t = −(ℏ²/2m) ∂²ψ/∂x² + V(x) ψ</span>',
      equationNote: 'Solved live on a 2,400-point grid with the Visscher staggered scheme (ℏ = m = 1). Inside the barrier the wave decays as e^(−κx), κ = √(2m(V−E))/ℏ.',
      insight: 'Transmission falls exponentially with barrier width: a thin wall leaks a lot, a thick one almost nothing. This leak powers fusion in the Sun, alpha decay, flash memory, and the scanning tunneling microscope.',
      boundary: 'One dimension, a rectangular barrier, one Gaussian packet. The prediction averages the plane-wave formula over the packet’s momentum spread. Hard walls at the screen edges are why the run restarts.',
    },
    defaults: { barrier: 1.2, thickness: 1 },
    formats: {
      barrier: (v) => `${v.toFixed(2)} E`,
      thickness: (v) => `${v.toFixed(1)} units`,
    },
    controls: () => `
      ${rangeControl('barrier', 'Barrier height V₀', 0.5, 2, 0.05, 'Below E', 'Above E')}
      ${rangeControl('thickness', 'Barrier width', 0.2, 3, 0.1, 'Thin', 'Thick')}
      <div class="readout" id="live-readout"></div>${playControls()}`,
    sim: {
      resetOn: ['barrier', 'thickness'],
      reset() {
        const E = TK0 * TK0 / 2; const V0 = state.tunneling.barrier * E; const a = state.tunneling.thickness;
        qt.i0 = Math.round((TMID - a / 2) / TDX); qt.i1 = qt.i0 + Math.round(a / TDX);
        qt.R = new Float64Array(TN); qt.I = new Float64Array(TN); qt.V = new Float64Array(TN);
        for (let i = 0; i < TN; i += 1) {
          const x = i * TDX; const env = Math.exp(-((x - TX0) ** 2) / (4 * TSIG * TSIG));
          qt.R[i] = env * Math.cos(TK0 * x); qt.I[i] = env * Math.sin(TK0 * x);
          qt.V[i] = i >= qt.i0 && i < qt.i1 ? V0 : 0;
        }
        let num = 0; let den = 0;
        for (let j = -200; j <= 200; j += 1) { const k = TK0 + j * 0.002; const w = Math.exp(-2 * TSIG * TSIG * (k - TK0) ** 2); num += w * planeWaveT(k * k / 2, V0, a); den += w; }
        qt.predicted = num / den; qt.t = 0;
      },
      tick(dt) {
        const { R, I, V } = qt; const c = 1 / (2 * TDX * TDX);
        for (let s = Math.round(dt * 10 / TDT); s > 0; s -= 1) {
          for (let i = 1; i < TN - 1; i += 1) R[i] += TDT * (-(I[i + 1] - 2 * I[i] + I[i - 1]) * c + V[i] * I[i]);
          for (let i = 1; i < TN - 1; i += 1) I[i] -= TDT * (-(R[i + 1] - 2 * R[i] + R[i - 1]) * c + V[i] * R[i]);
          qt.t += TDT;
        }
        if (qt.t > 56) this.reset();
      },
      draw() {
        const toX = (x) => 30 + x * 3.75; const base = 395; const E = TK0 * TK0 / 2; const eY = base - 170;
        const V0 = state.tunneling.barrier;
        const bx0 = toX(qt.i0 * TDX); const bw = Math.max(3, toX(qt.i1 * TDX) - bx0);
        const bh0 = Math.min(330, V0 * 170);
        ctx.fillStyle = 'rgba(255, 178, 107, .22)'; ctx.fillRect(bx0, base - bh0, bw, bh0);
        ctx.strokeStyle = 'rgba(255, 178, 107, .8)'; ctx.strokeRect(bx0, base - bh0, bw, bh0);
        polyline([[30, eY], [930, eY]], 'rgba(255, 241, 196, .35)', 1, [5, 6]);
        label('packet energy E', 36, eY - 6, '#a9b6c0'); label(`barrier V₀ = ${V0.toFixed(2)} E`, bx0 + bw + 8, base - bh0 + 12, COLORS[1]);
        let total = 0; let right = 0;
        ctx.beginPath(); ctx.moveTo(toX(0), base);
        for (let i = 0; i < TN; i += 2) {
          const p = qt.R[i] ** 2 + qt.I[i] ** 2; ctx.lineTo(toX(i * TDX), base - p * 250);
        }
        ctx.lineTo(toX((TN - 1) * TDX), base); ctx.closePath();
        ctx.fillStyle = 'rgba(101, 224, 208, .28)'; ctx.fill(); ctx.strokeStyle = COLORS[0]; ctx.lineWidth = 1.5; ctx.stroke();
        for (let i = 0; i < TN; i += 1) { const p = qt.R[i] ** 2 + qt.I[i] ** 2; total += p; if (i >= qt.i1) right += p; }
        polyline(Array.from({ length: TN / 2 }, (_, j) => [toX(j * 2 * TDX), base - 60 - qt.R[j * 2] * 50]), 'rgba(188, 155, 255, .35)', 1);
        polyline([[30, base], [930, base]], 'rgba(135, 157, 172, .35)', 1);
        // classical particle: reflects off any barrier taller than its energy
        const edge = qt.i0 * TDX; let xc = TX0 + TK0 * qt.t;
        if (V0 > 1 && xc > edge) xc = 2 * edge - xc;
        drawStar(toX(xc), base + 18, 4.5, COLORS[1]); label('classical', toX(xc) - 22, base + 38, COLORS[1], 8);
        const T = right / total;
        label('|ψ|²  probability density', 36, 36, '#d4dfe6'); label('Re ψ', 36, 52, COLORS[2]);
        label(`TRANSMITTED ${(T * 100).toFixed(1)}%`, 760, 36, COLORS[0]);
        setReadout([['TRANSMITTED', `${(T * 100).toFixed(1)}%`], ['PREDICTED', `${(qt.predicted * 100).toFixed(1)}%`], ['REFLECTED', `${((1 - T) * 100).toFixed(1)}%`], ['CLASSICAL', V0 > 1 ? '0% · bounces' : '100% · passes']]);
      },
    },
  });
})();
