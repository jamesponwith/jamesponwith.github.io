// 05 · Bell's theorem
(() => {
  const bellRun = {};
  const bellSettings = () => { const t = state.bell.angle * Math.PI / 180; return [[0, t], [0, 3 * t], [2 * t, t], [2 * t, 3 * t]]; };
  const foldAngle = (d) => { const m = Math.abs(d) % (2 * Math.PI); return m > Math.PI ? 2 * Math.PI - m : m; };
  const classicalE = (d) => -(1 - 2 * foldAngle(d) / Math.PI);
  const chsh = (e) => Math.abs(e[0] - e[1] + e[2] + e[3]);

  defineTheory('bell', {
    tab: ['Bell’s theorem', 'Entanglement · reality'],
    meta: {
      category: 'QUANTUM ENTANGLEMENT',
      title: 'Bell’s theorem: nature isn’t locally scripted',
      glyph: '⊗',
      description: 'Entangled pairs are measured far apart. Any theory where outcomes are pre-written locally must keep the CHSH score S ≤ 2. Quantum mechanics predicts up to 2√2—and experiments agree.',
      visualTitle: 'CHSH test · quantum vs local realism',
      frame: 'SPACELIKE SEPARATED',
      caption: 'Per pair, Alice and Bob each pick one of two analyzer settings at random and record ±1.',
      equation: '<span class="accent">S = |E(a,b) − E(a,b′) + E(a′,b) + E(a′,b′)|</span> ≤ 2',
      equationNote: 'E is the average product of outcomes. Quantum singlet: E = −cos Δ. The local model shares a hidden angle λ with both particles; each side answers sign(cos(setting − λ)).',
      insight: 'At θ = 45° quantum correlations reach S ≈ 2.83 while the local model stalls at exactly 2. Loophole-free experiments confirmed the violation in 2015; it earned the 2022 Nobel Prize in Physics.',
      boundary: 'Ideal detectors and perfect singlet states; angles are spin-measurement angles. The local model is one natural hidden-variable strategy—Bell’s theorem proves every local strategy obeys S ≤ 2.',
    },
    defaults: { angle: 45 },
    formats: {
      angle: (v) => `${v}°`,
    },
    controls: () => `
      ${rangeControl('angle', 'Analyzer spacing θ', 0, 90, 1, '0°', '90°')}
      <div class="readout" id="live-readout"></div>${playControls()}`,
    sim: {
      resetOn: ['angle'],
      reset() { Object.assign(bellRun, { n: [0, 0, 0, 0], q: [0, 0, 0, 0], c: [0, 0, 0, 0], trials: 0, pairs: [] }); },
      tick(dt) {
        const settings = bellSettings();
        for (let i = 0; i < 6; i += 1) {
          const k = Math.floor(Math.random() * 4); const [a, b] = settings[k];
          const A = Math.random() < 0.5 ? 1 : -1;
          const B = Math.random() < (1 + Math.cos(a - b)) / 2 ? -A : A;
          const lambda = Math.random() * 2 * Math.PI;
          const cA = Math.cos(a - lambda) >= 0 ? 1 : -1; const cB = Math.cos(b - lambda) >= 0 ? -1 : 1;
          bellRun.n[k] += 1; bellRun.q[k] += A * B; bellRun.c[k] += cA * cB; bellRun.trials += 1;
          if (i === 0 && Math.random() < 0.35) bellRun.pairs.push({ age: 0, k, A, B });
        }
        bellRun.pairs.forEach((p) => { p.age += dt; });
        bellRun.pairs = bellRun.pairs.filter((p) => p.age < 1);
      },
      draw() {
        const settings = bellSettings(); const theta = state.bell.angle * Math.PI / 180;
        const eq = bellRun.q.map((s, k) => (bellRun.n[k] ? s / bellRun.n[k] : 0));
        const ec = bellRun.c.map((s, k) => (bellRun.n[k] ? s / bellRun.n[k] : 0));
        const latest = bellRun.pairs.at(-1);
        // source and detectors
        const cy = 88; const det = [[130, 'ALICE'], [830, 'BOB']];
        drawStar(480, cy, 7, COLORS[1]); label('ENTANGLED SOURCE', 430, cy + 34);
        det.forEach(([x, name], side) => {
          ctx.beginPath(); ctx.arc(x, cy, 30, 0, Math.PI * 2); ctx.strokeStyle = '#2e3b46'; ctx.lineWidth = 1; ctx.stroke();
          const angles = side === 0 ? [settings[0][0], settings[2][0]] : [settings[0][1], settings[1][1]];
          const inUse = latest ? settings[latest.k][side] : null;
          angles.forEach((ang) => {
            polyline([[x - 26 * Math.cos(ang), cy + 26 * Math.sin(ang)], [x + 26 * Math.cos(ang), cy - 26 * Math.sin(ang)]], ang === inUse ? '#d4dfe6' : 'rgba(135, 157, 172, .3)', ang === inUse ? 2 : 1);
          });
          label(name, x - 15, cy - 42, '#d4dfe6');
          label(side === 0 ? 'a = 0°   a′ = 2θ' : 'b = θ   b′ = 3θ', x - 46, cy + 50);
        });
        for (const p of bellRun.pairs) {
          const f = Math.min(1, p.age / 0.7);
          if (f < 1) { drawStar(480 - 350 * f, cy, 3, '#a9d8ff'); drawStar(480 + 350 * f, cy, 3, '#a9d8ff'); continue; }
          const alpha = 1 - (p.age - 0.7) / 0.3;
          [[130, p.A], [830, p.B]].forEach(([x, out]) => {
            ctx.beginPath(); ctx.arc(x, cy, 34, 0, Math.PI * 2);
            ctx.strokeStyle = out > 0 ? `rgba(101, 224, 208, ${alpha})` : `rgba(188, 155, 255, ${alpha})`; ctx.lineWidth = 2; ctx.stroke();
          });
        }
        if (latest && latest.age >= 0.7) { label(latest.A > 0 ? '+1' : '−1', 172, cy + 4, latest.A > 0 ? COLORS[0] : COLORS[2], 11); label(latest.B > 0 ? '+1' : '−1', 768, cy + 4, latest.B > 0 ? COLORS[0] : COLORS[2], 11); }
        polyline([[26, 168], [934, 168]], 'rgba(135, 157, 172, .19)', 1);
        // correlation curves
        const px = 80; const pw = 460; const py = 205; const ph = 195;
        const toX = (d) => px + d / Math.PI * pw; const toY = (e) => py + ph * (1 - e) / 2;
        label('CORRELATION E vs ANGLE Δ', 26, 192, '#d4dfe6');
        drawGrid(px, py, pw, ph, 4);
        polyline(Array.from({ length: 120 }, (_, i) => { const d = i / 119 * Math.PI; return [toX(d), toY(-Math.cos(d))]; }), COLORS[0], 2);
        polyline([[toX(0), toY(-1)], [toX(Math.PI), toY(1)]], COLORS[1], 1.6, [5, 5]);
        [theta, 3 * theta].forEach((d) => polyline([[toX(foldAngle(d)), py], [toX(foldAngle(d)), py + ph]], 'rgba(255, 241, 196, .25)', 1, [2, 4]));
        if (bellRun.trials) {
          const qTheta = (eq[0] + eq[2] + eq[3]) / 3; const cTheta = (ec[0] + ec[2] + ec[3]) / 3;
          drawStar(toX(foldAngle(theta)), toY(qTheta), 4, COLORS[0]); drawStar(toX(foldAngle(3 * theta)), toY(eq[1]), 4, COLORS[0]);
          drawStar(toX(foldAngle(theta)), toY(cTheta), 4, COLORS[1]); drawStar(toX(foldAngle(3 * theta)), toY(ec[1]), 4, COLORS[1]);
        }
        label('+1', px - 22, py + 4, '#596a78'); label('0', px - 14, py + ph / 2 + 3, '#596a78'); label('−1', px - 22, py + ph + 3, '#596a78');
        label('0°', px, py + ph + 16, '#596a78'); label('90°', px + pw / 2 - 8, py + ph + 16, '#596a78'); label('180°', px + pw - 22, py + ph + 16, '#596a78');
        label('— quantum −cos Δ', px + 8, py + 16, COLORS[0]); label('- - local hidden variables', px + 8, py + 30, COLORS[1]);
        // CHSH gauge
        const gx = 640; const gy = 205; const gh = 195; const toG = (s) => gy + gh * (1 - s / 3);
        label('CHSH SCORE S', gx, 192, '#d4dfe6');
        const sq = chsh(eq); const sc = chsh(ec);
        const theoryQ = Math.abs(-3 * Math.cos(theta) + Math.cos(3 * theta)); const theoryC = Math.abs(3 * classicalE(theta) - classicalE(3 * theta));
        [[sq, theoryQ, COLORS[0], 'QUANTUM', 680], [sc, theoryC, COLORS[1], 'LOCAL', 800]].forEach(([s, t, color, name, x]) => {
          ctx.fillStyle = color === COLORS[0] ? 'rgba(101, 224, 208, .55)' : 'rgba(255, 178, 107, .55)';
          ctx.fillRect(x, toG(s), 60, gy + gh - toG(s));
          polyline([[x - 4, toG(t)], [x + 64, toG(t)]], '#fff1c4', 1.5);
          label(name, x + 6, gy + gh + 16, color); label(s.toFixed(3), x + 8, toG(s) - 6, color);
        });
        polyline([[gx, toG(2)], [930, toG(2)]], 'rgba(255, 178, 107, .7)', 1, [4, 4]); label('BELL LIMIT 2', 870, toG(2) - 5, COLORS[1], 8);
        polyline([[gx, toG(2 * Math.SQRT2)], [930, toG(2 * Math.SQRT2)]], 'rgba(101, 224, 208, .7)', 1, [4, 4]); label('2√2', 902, toG(2 * Math.SQRT2) - 5, COLORS[0], 8);
        setReadout([['PAIRS MEASURED', bellRun.trials.toLocaleString()], ['S QUANTUM', sq.toFixed(3)], ['S LOCAL', sc.toFixed(3)], ['VERDICT', bellRun.trials > 400 && sq > 2.05 ? 'BELL VIOLATED' : '—']]);
      },
    },
  });
})();
