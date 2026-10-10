// 25 · Quantum search
(() => {
  const gv = {};
  const groverTheta = () => Math.asin(1 / Math.sqrt(gv.amp.length));

  defineTheory('grover', {
    tab: ['Quantum search', 'Grover · interference'],
    meta: {
      category: 'QUANTUM COMPUTING',
      title: 'Searching faster than possible',
      glyph: '|ψ⟩',
      description: 'Find one marked item among N. A classical search checks about N/2 on average. Grover’s algorithm uses interference to find it in about √N steps.',
      visualTitle: 'Grover’s algorithm · amplitudes and rotation',
      frame: 'HILBERT SPACE',
      caption: 'Bars: the amplitude of every basis state (orange = marked). Each step flips the marked sign, then inverts everything about the mean.',
      equation: '<span class="accent">G = (2|s⟩⟨s| − I) · O</span>, P(k) = sin²((2k+1)θ), sin θ = 1/√N',
      equationNote: 'O flips the sign of the marked state; the diffusion step reflects about the uniform superposition |s⟩. Two reflections make a rotation by 2θ.',
      insight: 'Each iteration rotates the state toward the answer by 2θ. Stop near π/4 · √N steps for near-certainty; keep going and you overshoot. For a million items that is ~785 steps instead of ~500,000.',
      boundary: 'A noise-free state-vector simulation with one marked item. Real quantum hardware fights decoherence and gate errors.',
    },
    defaults: { qubits: 6 },
    formats: {
      qubits: (v) => `${v} qubits · N = ${2 ** v}`,
    },
    controls: () => `
      ${rangeControl('qubits', 'Qubits', 3, 8, 1, '8 items', '256 items')}
      <div class="readout" id="live-readout"></div>${playControls()}`,
    sim: {
      resetOn: ['qubits'],
      reset() {
        const N = 2 ** state.grover.qubits;
        Object.assign(gv, { amp: new Float64Array(N).fill(1 / Math.sqrt(N)), marked: Math.floor(Math.random() * N), k: 0, phase: 0, timer: 0, hold: 0 });
        gv.prev = gv.amp.slice(); gv.hist = [[0, 1 / N]];
        gv.kOpt = Math.round(Math.PI / (4 * groverTheta()) - 0.5); gv.kMax = Math.ceil(gv.kOpt * 2.2) + 1;
      },
      tick(dt) {
        if (gv.k >= gv.kMax) { gv.hold += dt; if (gv.hold > 2) this.reset(); return; }
        gv.timer += dt; if (gv.timer < 0.6) return; gv.timer = 0;
        gv.prev = gv.amp.slice();
        if (gv.phase === 0) { gv.amp[gv.marked] *= -1; gv.phase = 1; return; }
        const mean = gv.amp.reduce((s, a) => s + a, 0) / gv.amp.length;
        for (let i = 0; i < gv.amp.length; i += 1) gv.amp[i] = 2 * mean - gv.amp[i];
        gv.phase = 0; gv.k += 1; gv.hist.push([gv.k, gv.amp[gv.marked] ** 2]);
      },
      draw() {
        const N = gv.amp.length; const f = Math.min(1, gv.timer / 0.3); const shown = gv.amp.map((a, i) => gv.prev[i] + (a - gv.prev[i]) * f);
        const bx = 30; const bw = 570; const base = 170; const scale = 125;
        label('AMPLITUDES', 18, 30, '#d4dfe6');
        polyline([[bx, base], [bx + bw, base]], 'rgba(135, 157, 172, .4)', 1);
        shown.forEach((a, i) => { ctx.fillStyle = i === gv.marked ? COLORS[1] : 'rgba(101, 224, 208, .7)'; const h = a * scale; ctx.fillRect(bx + i * bw / N, Math.min(base, base - h), Math.max(1, bw / N - (N > 64 ? 0 : 1)), Math.abs(h)); });
        const mean = shown.reduce((s, a) => s + a, 0) / N;
        polyline([[bx, base - mean * scale], [bx + bw, base - mean * scale]], 'rgba(255, 241, 196, .55)', 1, [4, 4]); label('mean', bx + bw + 4, base - mean * scale + 3, '#fff1c4', 8);
        label(gv.phase === 1 ? 'oracle flipped the marked sign → next: invert about the mean' : 'inverted about the mean → next: oracle', bx, 312, '#798995');
        // success probability vs iteration
        const theta = groverTheta(); const px = 30; const pw = 570; const py = 330; const ph = 100; const toX = (k) => px + k / gv.kMax * pw;
        drawGrid(px, py, pw, ph, 2);
        polyline(Array.from({ length: 200 }, (_, i) => { const k = i / 199 * gv.kMax; return [toX(k), py + ph * (1 - Math.sin((2 * k + 1) * theta) ** 2)]; }), 'rgba(255, 178, 107, .5)', 1.2, [4, 4]);
        gv.hist.forEach(([k, p]) => drawStar(toX(k), py + ph * (1 - p), 3, COLORS[1]));
        polyline([[toX(gv.kOpt), py], [toX(gv.kOpt), py + ph]], 'rgba(101, 224, 208, .4)', 1, [2, 4]); label('optimal', toX(gv.kOpt) + 4, py + 10, COLORS[0], 8);
        label('P(marked) per iteration', px, py + ph + 14, '#798995');
        // geometric picture: a 2-D rotation
        const cx = 790; const cy = 200; const R = 130; const rest = shown.reduce((s, a, i) => s + (i === gv.marked ? 0 : a * a), 0);
        const restAmp = Math.sign(shown[(gv.marked + 1) % N]) * Math.sqrt(rest);
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(135, 157, 172, .3)'; ctx.lineWidth = 1; ctx.stroke();
        polyline([[cx - R - 10, cy], [cx + R + 10, cy]], 'rgba(135, 157, 172, .3)', 1); polyline([[cx, cy + R + 10], [cx, cy - R - 10]], 'rgba(135, 157, 172, .3)', 1);
        label('|marked⟩', cx - 24, cy - R - 16, COLORS[1]); label('|rest⟩', cx + R - 40, cy + 16, COLORS[0]);
        polyline([[cx, cy], [cx + R * Math.cos(theta) * 1.05, cy - R * Math.sin(theta) * 1.05]], 'rgba(255, 241, 196, .35)', 1, [3, 4]); label('|s⟩', cx + R * 1.08, cy - R * Math.sin(theta) - 4, '#fff1c4', 8);
        polyline([[cx, cy], [cx + R * restAmp, cy - R * shown[gv.marked]]], COLORS[1], 2.5); drawStar(cx + R * restAmp, cy - R * shown[gv.marked], 4, '#fff1c4');
        label('STATE VECTOR', cx - R, 30, '#d4dfe6');
        setReadout([['ITEMS N', N], ['ITERATION', `${gv.k} (best ${gv.kOpt})`], ['P(MARKED)', `${(gv.amp[gv.marked] ** 2 * 100).toFixed(1)}%`], ['CLASSICAL AVG', `${(N + 1) / 2} lookups`]]);
      },
    },
  });
})();
