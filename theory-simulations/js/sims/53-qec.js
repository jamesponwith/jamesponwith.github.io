// 53 · Quantum error correction
(() => {
  const qe = { timer: 0 };
  const choose = (n, k) => { let c = 1; for (let i = 0; i < k; i += 1) c = c * (n - i) / (i + 1); return c; };
  const logicalError = (p, d) => { let s = 0; for (let k = Math.floor(d / 2) + 1; k <= d; k += 1) s += choose(d, k) * p ** k * (1 - p) ** (d - k); return s; };

  function round() {
    const { distance: d, physError: p } = state.qec;
    qe.flips = Array.from({ length: d }, () => Math.random() < p);
    qe.syndrome = Array.from({ length: d - 1 }, (_, i) => qe.flips[i] !== qe.flips[i + 1]);
    // repetition-code decoding = flip the smaller side of the syndrome boundaries, i.e. majority vote
    const flipped = qe.flips.filter(Boolean).length; qe.corrections = qe.flips.map((f) => (flipped > d / 2 ? !f : f));
    qe.failed = flipped > d / 2; qe.bare = Math.random() < p;
    qe.rounds += 1; qe.logical += qe.failed ? 1 : 0; qe.unprotected += qe.bare ? 1 : 0;
  }

  defineTheory('qec', {
    tab: ['Quantum error correction', 'Redundancy · threshold'],
    meta: {
      category: 'QUANTUM COMPUTING',
      title: 'Protecting fragile qubits',
      glyph: '⊕',
      description: 'Qubits are easily disturbed, and you cannot copy an unknown quantum state. Yet spreading one logical qubit across many physical ones, and checking only their parities, lets errors be found and undone without ever looking at the data.',
      visualTitle: 'Bit-flip repetition code · syndrome measurement and decoding',
      frame: 'ERROR ROUNDS',
      caption: 'Top: data qubits (red ✕ = a flip this round) and the parity checks between them (lit = mismatch). Right: logical vs physical error rate for each code size.',
      equation: '<span class="accent">|ψ⟩_L = α|00…0⟩ + β|11…1⟩</span> · p_L = Σ_{k > d/2} C(d,k) pᵏ(1−p)^(d−k)',
      equationNote: 'Parity checks Zᵢ Zᵢ₊₁ reveal where flips are without revealing α or β. Decoding picks the smallest set of flips consistent with the syndrome.',
      insight: 'Below a threshold error rate, bigger codes win—each added qubit pair multiplies protection. Above it, more qubits only add more ways to fail. Real devices need codes that catch phase flips too (Shor’s 9-qubit code, surface codes); Google showed surface-code errors shrinking with size in 2024.',
      boundary: 'Only bit flips, independent errors, and perfect parity measurements, so the threshold is 50%. With phase errors and noisy measurements, surface-code thresholds are near 1%.',
    },
    defaults: { distance: 3, physError: 0.1 },
    formats: {
      distance: (v) => `${v} qubits`,
      physError: (v) => `p = ${(v * 100).toFixed(1)}%`,
    },
    controls: () => `
      ${rangeControl('distance', 'Code size d', 1, 9, 2, '1 (none)', '9')}
      ${rangeControl('physError', 'Physical error rate', 0.005, 0.6, 0.005, 'Quiet', 'Noisy')}
      <div class="readout" id="live-readout"></div>${playControls()}`,
    sim: {
      resetOn: ['distance', 'physError'],
      reset() { Object.assign(qe, { rounds: 0, logical: 0, unprotected: 0, timer: 0, flips: Array(state.qec.distance).fill(false), syndrome: Array(state.qec.distance - 1).fill(false), corrections: Array(state.qec.distance).fill(false), failed: false, bare: false, fast: 0 }); },
      tick(dt) {
        qe.timer += dt;
        if (qe.timer > 0.6) { qe.timer = 0; round(); for (let k = 0; k < 199; k += 1) round(); } // show one round, tally 200
      },
      draw() {
        const { distance: d, physError: p } = state.qec; const span = 520; const x0 = 40 + (span - (d - 1) * 60) / 2; const y = 110;
        label('DATA QUBITS AND PARITY CHECKS (latest round)', 18, 30, '#d4dfe6');
        for (let i = 0; i < d - 1; i += 1) {
          const x = x0 + i * 60 + 30; const lit = qe.syndrome[i];
          ctx.fillStyle = lit ? 'rgba(255, 178, 107, .9)' : '#16202b'; ctx.fillRect(x - 10, y + 40, 20, 20); ctx.strokeStyle = '#596a78'; ctx.strokeRect(x - 10, y + 40, 20, 20);
          polyline([[x - 30, y + 18], [x, y + 40]], 'rgba(169, 182, 192, .3)', 1); polyline([[x + 30, y + 18], [x, y + 40]], 'rgba(169, 182, 192, .3)', 1);
        }
        for (let i = 0; i < d; i += 1) {
          const x = x0 + i * 60; ctx.beginPath(); ctx.arc(x, y, 16, 0, Math.PI * 2); ctx.fillStyle = '#0f161d'; ctx.fill(); ctx.strokeStyle = COLORS[0]; ctx.lineWidth = 1.5; ctx.stroke();
          label('ψ', x - 4, y + 4, COLORS[0], 11);
          if (qe.flips[i]) label('✕', x - 6, y - 22, '#ff6b6b', 13);
        }
        label(qe.flips.some(Boolean) ? (qe.failed ? 'decoder fooled: majority flipped → logical error' : 'syndrome located the flips → corrected') : 'no errors this round', 40, y + 100, qe.failed ? '#ff6b6b' : qe.flips.some(Boolean) ? COLORS[0] : '#798995', 10);
        label('unprotected single qubit this round:', 40, y + 124, '#798995', 8); label(qe.bare ? 'error ✕' : 'fine', 250, y + 124, qe.bare ? '#ff6b6b' : COLORS[0], 8);
        // tallies
        const meas = qe.rounds ? qe.logical / qe.rounds : 0; const bareRate = qe.rounds ? qe.unprotected / qe.rounds : 0;
        label(`rounds ${qe.rounds.toLocaleString()}`, 40, 300, '#a9b6c0');
        label(`logical error  measured ${(meas * 100).toFixed(2)}%   theory ${(logicalError(p, d) * 100).toFixed(2)}%`, 40, 322, COLORS[0]);
        label(`single qubit   measured ${(bareRate * 100).toFixed(2)}%   theory ${(p * 100).toFixed(2)}%`, 40, 344, COLORS[1]);
        // p_L vs p for each code size (log–log)
        const gx = 620; const gw = 300; const gy = 60; const gh = 300; const toX = (q) => gx + (Math.log10(q) + 2.5) / 2.5 * gw; const toY = (v) => gy + gh * (1 - (Math.log10(Math.max(v, 1e-8)) + 8) / 8);
        label('LOGICAL vs PHYSICAL ERROR (log–log)', gx, 40, '#d4dfe6'); drawGrid(gx, gy, gw, gh, 4);
        [1, 3, 5, 7, 9].forEach((dd) => polyline(Array.from({ length: 80 }, (_, i) => { const q = 10 ** (-2.5 + i / 79 * 2.5); return [toX(q), toY(logicalError(q, dd))]; }), dd === d ? '#fff1c4' : dd === 1 ? COLORS[1] : 'rgba(101, 224, 208, .4)', dd === d ? 2.2 : 1.2));
        polyline([[toX(0.5), gy], [toX(0.5), gy + gh]], 'rgba(255, 107, 107, .5)', 1, [3, 4]); label('threshold', toX(0.5) - 52, gy + 12, '#ff6b6b', 8);
        drawStar(toX(p), toY(logicalError(p, d)), 4.5, '#fff1c4'); if (meas > 0) drawStar(toX(p), toY(meas), 3, COLORS[1]);
        label('0.3%', gx - 6, gy + gh + 15, '#596a78', 8); label('3%', toX(0.03) - 6, gy + gh + 15, '#596a78', 8); label('100%', gx + gw - 14, gy + gh + 15, '#596a78', 8);
        label('10⁻⁸', gx - 28, gy + gh + 3, '#596a78', 8); label('1', gx - 12, gy + 4, '#596a78', 8);
        const gain = logicalError(p, d) > 0 ? p / logicalError(p, d) : Infinity;
        setReadout([['CODE', d === 1 ? 'none' : `${d}-qubit repetition`], ['THEORY p_L', `${(logicalError(p, d) * 100).toPrecision(3)}%`], ['PROTECTION', gain >= 1 ? `${gain.toPrecision(3)}× better` : `${(1 / gain).toPrecision(3)}× worse`]]);
      },
    },
  });
})();
