// 46 · Quantum teleportation
(() => {
  // 3-qubit state vector; basis index bits: q0 = 4, q1 = 2, q2 = 1
  const tp = { re: new Float64Array(8), im: new Float64Array(8), step: 0, timer: 0, bits: null, tally: [0, 0, 0, 0] };
  const STEPS = ['Alice holds |ψ⟩; everything else is |0⟩', 'H on q1', 'CNOT q1→q2 · Bell pair shared', 'CNOT q0→q1', 'H on q0', 'Alice measures q0 and q1', 'Two classical bits travel to Bob', 'Bob applies X if m₁ = 1', 'Bob applies Z if m₀ = 1 · done'];
  const bitOf = (i, q) => (i >> (2 - q)) & 1;
  function gate(q, m) { // m = [[a,b],[c,d]] real 2×2
    const mask = 4 >> q; const re = tp.re.slice(); const im = tp.im.slice();
    for (let i = 0; i < 8; i += 1) { if (i & mask) continue; const j = i | mask;
      tp.re[i] = m[0][0] * re[i] + m[0][1] * re[j]; tp.im[i] = m[0][0] * im[i] + m[0][1] * im[j];
      tp.re[j] = m[1][0] * re[i] + m[1][1] * re[j]; tp.im[j] = m[1][0] * im[i] + m[1][1] * im[j]; }
  }
  const H = [[Math.SQRT1_2, Math.SQRT1_2], [Math.SQRT1_2, -Math.SQRT1_2]]; const X = [[0, 1], [1, 0]]; const Z = [[1, 0], [0, -1]];
  function cnot(c, t) { const re = tp.re.slice(); const im = tp.im.slice(); for (let i = 0; i < 8; i += 1) { const j = bitOf(i, c) ? i ^ (4 >> t) : i; tp.re[j] = re[i]; tp.im[j] = im[i]; } }
  function measure() {
    const p = [0, 0, 0, 0]; for (let i = 0; i < 8; i += 1) p[bitOf(i, 0) * 2 + bitOf(i, 1)] += tp.re[i] ** 2 + tp.im[i] ** 2;
    let r = Math.random(); let o = 0; while (o < 3 && r > p[o]) { r -= p[o]; o += 1; }
    const norm = Math.sqrt(p[o]);
    for (let i = 0; i < 8; i += 1) { if (bitOf(i, 0) * 2 + bitOf(i, 1) === o) { tp.re[i] /= norm; tp.im[i] /= norm; } else { tp.re[i] = 0; tp.im[i] = 0; } }
    return [o >> 1, o & 1];
  }
  const target = () => { const th = state.teleportation.theta * Math.PI / 180; const ph = state.teleportation.phi * Math.PI / 180; return [Math.cos(th / 2), 0, Math.sin(th / 2) * Math.cos(ph), Math.sin(th / 2) * Math.sin(ph)]; };
  function bloch(q) { // reduced density matrix of one qubit → Bloch vector
    let r00 = 0; let r11 = 0; let xr = 0; let xi = 0; const mask = 4 >> q;
    for (let i = 0; i < 8; i += 1) {
      if (i & mask) { r11 += tp.re[i] ** 2 + tp.im[i] ** 2; continue; }
      const j = i | mask; r00 += tp.re[i] ** 2 + tp.im[i] ** 2;
      xr += tp.re[i] * tp.re[j] + tp.im[i] * tp.im[j]; xi += tp.im[i] * tp.re[j] - tp.re[i] * tp.im[j]; // ρ01 = Σ cᵢ conj(cⱼ)
    }
    return [2 * xr, -2 * xi, r00 - r11];
  }
  function fidelity() { const [ar, ai, br, bi] = target(); let re = 0; let im = 0; let norm = 0;
    for (let i = 0; i < 8; i += 1) { if (bitOf(i, 0) * 2 + bitOf(i, 1) !== tp.bits[0] * 2 + tp.bits[1]) continue; const [cr, ci] = (i & 1) ? [br, bi] : [ar, ai]; re += cr * tp.re[i] + ci * tp.im[i]; im += cr * tp.im[i] - ci * tp.re[i]; norm += tp.re[i] ** 2 + tp.im[i] ** 2; }
    return (re * re + im * im) / norm; }
  function advance() {
    tp.step += 1;
    if (tp.step === 1) gate(1, H); if (tp.step === 2) cnot(1, 2); if (tp.step === 3) cnot(0, 1); if (tp.step === 4) gate(0, H);
    if (tp.step === 5) { tp.bits = measure(); tp.tally[tp.bits[0] * 2 + tp.bits[1]] += 1; }
    if (tp.step === 7 && tp.bits[1]) gate(2, X); if (tp.step === 8 && tp.bits[0]) gate(2, Z);
  }
  function drawBloch(cx, cy, R, v, title, color, ghost) {
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(169, 182, 192, .4)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(cx, cy, R, R * 0.3, 0, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(169, 182, 192, .2)'; ctx.stroke();
    const sx = cx + R * (v[1] * 0.95 - v[0] * 0.4); const sy = cy - R * (v[2] * 0.95 - v[0] * 0.25);
    if (ghost) { polyline([[cx, cy], [cx + R * (ghost[1] * 0.95 - ghost[0] * 0.4), cy - R * (ghost[2] * 0.95 - ghost[0] * 0.25)]], 'rgba(101, 224, 208, .3)', 1.5, [3, 3]); label('actual state, unknown to Bob', cx - R, cy - R - 20, '#596a78', 8); }
    polyline([[cx, cy], [sx, sy]], color, 2.5); drawStar(sx, sy, 4.5, color);
    label('|0⟩', cx - 8, cy - R - 6, '#596a78', 8); label('|1⟩', cx - 8, cy + R + 13, '#596a78', 8);
    label(title, cx - R, cy + R + 32, '#d4dfe6', 8);
    const len = Math.hypot(...v); label(len < 0.05 ? 'no information' : `|r| = ${len.toFixed(2)}`, cx - R, cy + R + 46, '#798995', 8);
  }

  defineTheory('teleportation', {
    wave: 'WAVE 09 · HIDDEN WORLDS',
    tab: ['Quantum teleportation', 'Entanglement · information'],
    meta: {
      category: 'QUANTUM INFORMATION',
      title: 'Teleporting a quantum state',
      glyph: '⇝',
      description: 'Alice can send Bob an unknown quantum state without sending the particle—using one shared entangled pair and two ordinary bits. Her original is destroyed in the process, so nothing is ever copied.',
      visualTitle: 'Teleportation circuit (Bennett et al., 1993)',
      frame: 'STATE VECTOR',
      caption: 'Top: the circuit, step by step. Bottom: Bloch spheres for the state to send, Alice’s qubit, and Bob’s qubit. Each run measures randomly.',
      equation: '<span class="accent">|ψ⟩|Φ⁺⟩ = ½ Σₘ |m₀m₁⟩ ⊗ Xᵐ¹Zᵐ⁰|ψ⟩</span>',
      equationNote: 'Rewriting the three-qubit state in Alice’s measurement basis shows Bob already holds |ψ⟩ up to one of four known flips; the two bits say which to undo.',
      insight: 'Until the classical bits arrive, Bob’s qubit is completely random (its Bloch vector has zero length), so nothing travels faster than light. Alice’s qubit collapses, so no copy survives—the no-cloning theorem. Teleportation has been demonstrated over 1,400 km to a satellite (2017).',
      boundary: 'An ideal, noise-free simulation of the full state vector with perfect gates and a perfect Bell pair. Real links lose fidelity to noise and photon loss.',
    },
    defaults: { theta: 70, phi: 40 },
    formats: {
      theta: (v) => `θ = ${v}°`,
      phi: (v) => `φ = ${v}°`,
    },
    controls: () => `
      ${rangeControl('theta', 'State to send · polar θ', 0, 180, 1, '|0⟩', '|1⟩')}
      ${rangeControl('phi', 'State to send · phase φ', 0, 360, 1, '0°', '360°')}
      <div class="readout" id="live-readout"></div>${playControls()}`,
    sim: {
      resetOn: ['theta', 'phi'],
      reset() {
        tp.re.fill(0); tp.im.fill(0); const [ar, ai, br, bi] = target();
        tp.re[0] = ar; tp.im[0] = ai; tp.re[4] = br; tp.im[4] = bi; tp.step = 0; tp.timer = 0; tp.bits = null;
      },
      tick(dt) {
        tp.timer += dt;
        if (tp.step === STEPS.length - 1) { if (tp.timer > 2.5) this.reset(); return; }
        if (tp.timer > 1.1) { tp.timer = 0; advance(); }
      },
      draw() {
        // circuit
        const wires = [[70, 'q0  Alice · |ψ⟩'], [120, 'q1  Alice'], [170, 'q2  Bob']]; const cols = [210, 290, 380, 460, 560, 700, 780];
        wires.forEach(([y, name]) => { polyline([[160, y], [880, y]], 'rgba(169, 182, 192, .45)', 1); label(name, 18, y + 4, '#a9b6c0', 8); });
        const active = (col) => [1, 2, 3, 4, 5, 7, 8][col] === tp.step;
        const box = (x, y, text, col) => { ctx.fillStyle = active(col) ? 'rgba(255, 178, 107, .9)' : '#16202b'; ctx.fillRect(x - 15, y - 13, 30, 26); ctx.strokeStyle = 'rgba(169, 182, 192, .6)'; ctx.strokeRect(x - 15, y - 13, 30, 26); label(text, x - 5, y + 4, active(col) ? '#0c1219' : '#d4dfe6', 10); };
        const cx = (x, c, t, col) => { polyline([[x, c], [x, t]], active(col) ? COLORS[1] : '#a9b6c0', 1.5); drawStar(x, c, 4, active(col) ? COLORS[1] : '#d4dfe6'); ctx.beginPath(); ctx.arc(x, t, 9, 0, Math.PI * 2); ctx.strokeStyle = active(col) ? COLORS[1] : '#d4dfe6'; ctx.stroke(); polyline([[x - 9, t], [x + 9, t]], active(col) ? COLORS[1] : '#d4dfe6', 1); polyline([[x, t - 9], [x, t + 9]], active(col) ? COLORS[1] : '#d4dfe6', 1); };
        box(cols[0], 120, 'H', 0); cx(cols[1], 120, 170, 1); cx(cols[2], 70, 120, 2); box(cols[3], 70, 'H', 3);
        box(cols[4], 70, 'M', 4); box(cols[4], 120, 'M', 4);
        [[70, cols[6]], [120, cols[5]]].forEach(([y, x]) => { polyline([[cols[4] + 15, y - 2], [x, y - 2], [x, 157]], 'rgba(255, 241, 196, .35)', 1); polyline([[cols[4] + 15, y + 2], [x - 4, y + 2], [x - 4, 157]], 'rgba(255, 241, 196, .35)', 1); });
        box(cols[5], 170, 'X', 5); box(cols[6], 170, 'Z', 6);
        if (tp.step === 6) { const f = Math.min(1, tp.timer / 1.1); drawStar(cols[4] + 20 + (cols[5] - cols[4] - 20) * f, 145, 5, '#fff1c4'); label('classical bits (light speed)', cols[4] + 10, 225, '#fff1c4', 8); }
        label(`STEP ${tp.step} · ${STEPS[tp.step]}`, 160, 32, COLORS[1]);
        if (tp.bits) label(`measured m₀ = ${tp.bits[0]}, m₁ = ${tp.bits[1]}`, 600, 32, '#fff1c4');
        // Bloch spheres
        const [ar, , br, bi] = target(); const t = [2 * ar * br, 2 * ar * bi, ar * ar - (br * br + bi * bi)];
        drawBloch(200, 330, 62, t, 'STATE TO SEND |ψ⟩', '#fff1c4');
        drawBloch(480, 330, 62, bloch(0), 'ALICE’S q0 NOW', COLORS[2]);
        // between measurement and the bits arriving, Bob can only average over the four equally likely outcomes
        const waiting = tp.step === 5 || tp.step === 6;
        drawBloch(760, 330, 62, waiting ? [0, 0, 0] : bloch(2), waiting ? 'BOB’S q2 · AS BOB SEES IT' : 'BOB’S q2 NOW', COLORS[0], waiting ? bloch(2) : null);
        const done = tp.step === STEPS.length - 1; const total = tp.tally.reduce((a, b) => a + b, 0);
        setReadout([['STEP', `${tp.step} / ${STEPS.length - 1}`], ['FIDELITY', done ? `${(fidelity() * 100).toFixed(2)}%` : '—'], ['RUNS', total], ['OUTCOMES 00·01·10·11', total ? tp.tally.map((n) => Math.round(n / total * 100)).join('·') + '%' : '—']]);
      },
    },
  });
})();
