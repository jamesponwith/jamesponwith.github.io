// 13 · Information theory
(() => {
  const SH_W = 120; const SH_H = 30; const sh = {};
  const binaryEntropy = (p) => (p <= 0 || p >= 1 ? 0 : -p * Math.log2(p) - (1 - p) * Math.log2(1 - p));
  function majorityError(p, n) {
    let e = 0; let c = 1;
    for (let j = 0; j <= n; j += 1) { if (j > n / 2) e += c * p ** j * (1 - p) ** (n - j); c = c * (n - j) / (j + 1); }
    return e;
  }

  defineTheory('shannon', {
    tab: ['Information theory', 'Noise · capacity'],
    meta: {
      category: 'INFORMATION THEORY',
      title: 'Perfect messages over noisy wires',
      glyph: 'H',
      description: 'Shannon (1948): every noisy channel has a capacity C. Send slower than C and errors can be made as rare as you like; faster, and they cannot.',
      visualTitle: 'Binary symmetric channel · repetition code',
      frame: 'BIT STREAM',
      caption: 'Each square is one bit, retransmitted live. Orange marks bits that arrived wrong.',
      equation: '<span class="accent">C = 1 − H(p)</span>, H(p) = −p log₂p − (1−p) log₂(1−p)',
      equationNote: 'p is the chance the channel flips a bit; C is information bits per transmitted bit.',
      insight: 'Repeating each bit n times and voting crushes errors, but the rate 1/n sinks toward zero. Shannon proved something stranger: clever codes reach near-zero error at any rate below C. LDPC and polar codes in Wi-Fi, 5G, and deep-space links come close to that limit.',
      boundary: 'Independent bit flips with known p. Repetition is deliberately the simplest code, shown to contrast with the capacity bound rather than reach it.',
    },
    defaults: { noise: 0.1, repeat: 3 },
    formats: {
      noise: (v) => `${Math.round(v * 100)}%`,
      repeat: (v) => `×${v}`,
    },
    controls: () => `
      ${rangeControl('noise', 'Channel noise p', 0, 0.5, 0.01, 'Clean', 'Coin flip')}
      ${rangeControl('repeat', 'Repetitions n', 1, 9, 2, '×1', '×9')}
      <div class="readout" id="live-readout"></div>${playControls()}`,
    sim: {
      reset() {
        const c = document.createElement('canvas'); c.width = SH_W; c.height = SH_H; const g = c.getContext('2d');
        g.fillStyle = '#fff'; g.font = 'bold 23px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('SHANNON', SH_W / 2, SH_H / 2 + 1);
        const data = g.getImageData(0, 0, SH_W, SH_H).data;
        sh.bits = Uint8Array.from({ length: SH_W * SH_H }, (_, i) => (data[i * 4 + 3] > 110 ? 1 : 0));
        sh.timer = 1; this.tick(0);
      },
      tick(dt) {
        sh.timer += dt; if (sh.timer < 0.25) return; sh.timer = 0;
        const p = state.shannon.noise; const n = state.shannon.repeat;
        sh.raw = sh.bits.map((b) => (Math.random() < p ? 1 - b : b));
        sh.decoded = sh.bits.map((b) => { let flips = 0; for (let j = 0; j < n; j += 1) if (Math.random() < p) flips += 1; return flips > n / 2 ? 1 - b : b; });
      },
      draw() {
        const p = state.shannon.noise; const n = state.shannon.repeat; const cell = 4;
        const panel = (bits, y, title) => {
          label(title, 30, y - 8, '#d4dfe6');
          ctx.fillStyle = '#0b1118'; ctx.fillRect(30, y, SH_W * cell, SH_H * cell);
          let errors = 0;
          for (let i = 0; i < bits.length; i += 1) {
            const wrong = bits[i] !== sh.bits[i]; if (wrong) errors += 1;
            if (!bits[i] && !wrong) continue;
            ctx.fillStyle = wrong ? 'rgba(255, 178, 107, .9)' : COLORS[0];
            ctx.fillRect(30 + (i % SH_W) * cell, y + Math.floor(i / SH_W) * cell, cell - 0.6, cell - 0.6);
          }
          return errors / bits.length;
        };
        panel(sh.bits, 46, 'SENT');
        const rawErr = panel(sh.raw, 186, 'RECEIVED · UNCODED');
        const decErr = panel(sh.decoded, 326, `RECEIVED · EACH BIT SENT ×${n}, MAJORITY VOTE`);
        // capacity curve
        const gx = 600; const gw = 320; const gy = 60; const gh = 230;
        const toX = (q) => gx + q / 0.5 * gw; const toY = (r) => gy + gh * (1 - r);
        label('RATE vs NOISE', gx, 38, '#d4dfe6');
        drawGrid(gx, gy, gw, gh, 4);
        const curve = Array.from({ length: 101 }, (_, i) => [toX(i / 200), toY(1 - binaryEntropy(i / 200))]);
        ctx.beginPath(); curve.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.lineTo(toX(0.5), toY(0)); ctx.lineTo(toX(0), toY(0)); ctx.closePath();
        ctx.fillStyle = 'rgba(101, 224, 208, .1)'; ctx.fill();
        polyline(curve, COLORS[0], 2);
        label('capacity C(p)', toX(0.05), toY(0.62), COLORS[0]); label('reliable codes exist below', toX(0.12), toY(0.12), 'rgba(101, 224, 208, .6)', 8);
        drawStar(toX(p), toY(1 / n), 5, COLORS[1]); label(`you: rate 1/${n}`, toX(p) + 9, toY(1 / n) - 6, COLORS[1]);
        label('0', gx, gy + gh + 14, '#596a78'); label('noise p = 0.5', gx + gw - 70, gy + gh + 14, '#596a78');
        label('1', gx - 12, gy + 4, '#596a78'); label('0', gx - 12, gy + gh + 3, '#596a78');
        const C = 1 - binaryEntropy(p);
        label(`capacity C = ${C.toFixed(3)} bits per bit`, gx, 345, '#a9b6c0');
        label(`uncoded error ${(rawErr * 100).toFixed(1)}%  ·  coded ${(decErr * 100).toFixed(2)}%`, gx, 368, '#a9b6c0');
        label(`theory after vote: ${(majorityError(p, n) * 100).toFixed(2)}%`, gx, 391, '#798995');
        setReadout([['NOISE p', `${(p * 100).toFixed(0)}%`], ['CAPACITY C', C.toFixed(3)], ['CODE RATE', (1 / n).toFixed(3)], ['BIT ERRORS', `${(decErr * 100).toFixed(2)}%`]]);
      },
    },
  });
})();
