// 24 · Neural networks
(() => {
  const DATASETS = ['Circle', 'XOR', 'Spiral']; const nn = {};
  function nnData(kind) {
    const pts = [];
    for (let i = 0; i < 200; i += 1) {
      if (kind === 0) { const inner = i < 100; const r = inner ? Math.random() * 0.45 : 0.6 + Math.random() * 0.35; const a = Math.random() * 2 * Math.PI; pts.push([r * Math.cos(a), r * Math.sin(a), inner ? 1 : 0]); }
      if (kind === 1) { let x; let y; do { x = Math.random() * 2 - 1; y = Math.random() * 2 - 1; } while (Math.abs(x) < 0.08 || Math.abs(y) < 0.08); pts.push([x, y, x * y > 0 ? 1 : 0]); }
      if (kind === 2) { const c = i % 2; const t = Math.floor(i / 2) / 100; const r = 0.08 + 0.85 * t; const a = t * 3 * Math.PI + c * Math.PI; pts.push([r * Math.cos(a) + gauss() * 0.02, r * Math.sin(a) + gauss() * 0.02, c]); }
    }
    return pts;
  }
  function nnForward(x, y) {
    const { p, acts } = nn; acts[0][0] = x; acts[0][1] = y;
    nn.layers.forEach(({ nIn, nOut, w, b }, l) => {
      for (let o = 0; o < nOut; o += 1) {
        let z = p[b + o]; for (let i = 0; i < nIn; i += 1) z += p[w + o * nIn + i] * acts[l][i];
        acts[l + 1][o] = l < 2 ? Math.tanh(z) : 1 / (1 + Math.exp(-z));
      }
    });
    return acts[3][0];
  }
  function nnTrainStep() {
    const { p, g, acts, deltas } = nn; g.fill(0); let loss = 0; let correct = 0;
    for (const [x, y, label] of nn.data) {
      const yh = nnForward(x, y);
      loss -= label ? Math.log(yh + 1e-9) : Math.log(1 - yh + 1e-9); if ((yh > 0.5) === (label === 1)) correct += 1;
      deltas[3][0] = yh - label;
      for (let l = 2; l >= 0; l -= 1) {
        const { nIn, nOut, w, b } = nn.layers[l];
        for (let o = 0; o < nOut; o += 1) { g[b + o] += deltas[l + 1][o]; for (let i = 0; i < nIn; i += 1) g[w + o * nIn + i] += deltas[l + 1][o] * acts[l][i]; }
        if (l > 0) for (let i = 0; i < nIn; i += 1) { let s = 0; for (let o = 0; o < nOut; o += 1) s += p[w + o * nIn + i] * deltas[l + 1][o]; deltas[l][i] = s * (1 - acts[l][i] ** 2); }
      }
    }
    // Adam
    nn.step += 1; const lr = state.neural.rate; const n = nn.data.length;
    for (let k = 0; k < p.length; k += 1) {
      const gk = g[k] / n; nn.m[k] = 0.9 * nn.m[k] + 0.1 * gk; nn.v[k] = 0.999 * nn.v[k] + 0.001 * gk * gk;
      p[k] -= lr * (nn.m[k] / (1 - 0.9 ** nn.step)) / (Math.sqrt(nn.v[k] / (1 - 0.999 ** nn.step)) + 1e-8);
    }
    nn.loss = loss / n; nn.accuracy = correct / n;
  }

  defineTheory('neural', {
    tab: ['Neural networks', 'Learning · backpropagation'],
    meta: {
      category: 'MACHINE LEARNING',
      title: 'A network that learns',
      glyph: '∂',
      description: 'A small neural network starts from random weights. Backpropagation nudges every weight downhill on the error, and a decision boundary takes shape before your eyes.',
      visualTitle: 'Multilayer perceptron · 2 → H → H → 1',
      frame: 'FEATURE SPACE',
      caption: 'Background: the network’s prediction. Dots: training data. Right: weights (cyan +, orange −) and the falling loss.',
      equation: '<span class="accent">w ← w − η ∂L/∂w</span>, L = −Σ [y log ŷ + (1−y) log(1−ŷ)]',
      equationNote: 'Two tanh hidden layers and a sigmoid output, trained by backpropagation with the Adam optimizer on 200 points.',
      insight: 'Each neuron draws one soft line; layers bend and combine them into curves. With enough neurons a network can approximate any boundary (the universal approximation theorem). Too few and the spiral is impossible—try 2.',
      boundary: 'A toy network scored on the same data it trains on. Real models have billions of weights, held-out test sets, and regularization.',
    },
    defaults: { dataset: 2, neurons: 8, rate: 0.03 },
    formats: {
      dataset: (v) => DATASETS[v],
      neurons: (v) => `${v} per layer`,
      rate: (v) => `η = ${v.toFixed(3)}`,
    },
    controls: () => `
      ${rangeControl('dataset', 'Dataset', 0, DATASETS.length - 1, 1, DATASETS[0], DATASETS.at(-1))}
      ${rangeControl('neurons', 'Hidden neurons', 2, 16, 1, '2', '16')}
      ${rangeControl('rate', 'Learning rate', 0.002, 0.1, 0.002, 'Careful', 'Bold')}
      <div class="readout" id="live-readout"></div>${playControls()}`,
    sim: {
      resetOn: ['dataset', 'neurons'],
      reset() {
        const H = state.neural.neurons; const sizes = [2, H, H, 1]; let off = 0;
        nn.layers = [0, 1, 2].map((l) => { const layer = { nIn: sizes[l], nOut: sizes[l + 1], w: off, b: off + sizes[l] * sizes[l + 1] }; off = layer.b + sizes[l + 1]; return layer; });
        nn.p = new Float64Array(off);
        nn.layers.forEach(({ nIn, nOut, w }) => { for (let k = 0; k < nIn * nOut; k += 1) nn.p[w + k] = gauss() / Math.sqrt(nIn); });
        Object.assign(nn, { g: new Float64Array(off), m: new Float64Array(off), v: new Float64Array(off), step: 0, loss: 0, accuracy: 0, history: [] });
        nn.acts = sizes.map((s) => new Float64Array(s)); nn.deltas = sizes.map((s) => new Float64Array(s));
        nn.data = nnData(state.neural.dataset);
      },
      tick() {
        for (let s = 0; s < 3; s += 1) nnTrainStep();
        nn.history.push(nn.loss); if (nn.history.length > 600) nn.history.shift();
      },
      draw() {
        const fx = 20; const fy = 20; const fs = 420; const res = 60; const cell = fs / res;
        for (let gy = 0; gy < res; gy += 1) for (let gx = 0; gx < res; gx += 1) {
          const v = nnForward((gx + 0.5) / res * 2 - 1, 1 - (gy + 0.5) / res * 2);
          ctx.fillStyle = mix([70, 50, 110], [40, 140, 132], v); ctx.fillRect(fx + gx * cell, fy + gy * cell, cell + 0.5, cell + 0.5);
        }
        nn.data.forEach(([x, y, c]) => {
          ctx.beginPath(); ctx.arc(fx + (x + 1) / 2 * fs, fy + (1 - y) / 2 * fs, 3.2, 0, Math.PI * 2);
          ctx.fillStyle = c ? '#b7fff4' : '#d9c6ff'; ctx.fill(); ctx.strokeStyle = '#0b1118'; ctx.lineWidth = 1; ctx.stroke();
        });
        // network diagram
        const cols = [520, 640, 760, 880]; const nodeY = (l, i) => 150 + (i - (nn.layers.map((L) => L.nIn).concat(1)[l] - 1) / 2) * Math.min(26, 200 / Math.max(1, state.neural.neurons));
        label('NETWORK', 480, 30, '#d4dfe6');
        nn.layers.forEach(({ nIn, nOut, w }, l) => {
          for (let o = 0; o < nOut; o += 1) for (let i = 0; i < nIn; i += 1) {
            const wt = nn.p[w + o * nIn + i]; ctx.strokeStyle = wt > 0 ? `rgba(101, 224, 208, ${Math.min(0.9, Math.abs(wt) / 2)})` : `rgba(255, 178, 107, ${Math.min(0.9, Math.abs(wt) / 2)})`;
            ctx.lineWidth = Math.min(3, 0.4 + Math.abs(wt)); ctx.beginPath(); ctx.moveTo(cols[l], nodeY(l, i)); ctx.lineTo(cols[l + 1], nodeY(l + 1, o)); ctx.stroke();
          }
        });
        [2, state.neural.neurons, state.neural.neurons, 1].forEach((n, l) => { for (let i = 0; i < n; i += 1) drawStar(cols[l], nodeY(l, i), 4, '#d4dfe6'); });
        label('x, y', cols[0] - 14, 290, '#798995'); label('output', cols[3] - 18, 290, '#798995');
        // loss chart
        const gx = 500; const gw = 420; const gy = 330; const gh = 100; const maxLoss = Math.max(0.8, ...nn.history);
        label('LOSS', gx, gy - 10, '#d4dfe6'); drawGrid(gx, gy, gw, gh, 2);
        polyline(nn.history.map((l, i) => [gx + i / 599 * gw, gy + gh * (1 - l / maxLoss)]), COLORS[1], 1.6);
        setReadout([['EPOCH', nn.step], ['LOSS', nn.loss.toFixed(4)], ['ACCURACY', `${(nn.accuracy * 100).toFixed(1)}%`], ['WEIGHTS', nn.p.length]]);
      },
    },
  });
})();
