// 52 · Protein folding (HP lattice model)
(() => {
  // [name, sequence, best known 2-D energy]
  const SEQS = [['20-mer benchmark', 'HPHPPHHPHPPHPHHPPHPH', -9], ['24-mer benchmark', 'HHPPHPPHPPHPPHPPHPPHPPHH', -9], ['25-mer benchmark', 'PPHPPHHPPPPHHPPPPHHPPPPHH', -8]];
  const pf = {};
  const key = (x, y) => `${x},${y}`;
  const seq = () => SEQS[state.protein.sequence][1];
  function energy() {
    const s = seq(); let e = 0;
    pf.p.forEach(([x, y], i) => { if (s[i] !== 'H') return; for (const [dx, dy] of [[1, 0], [0, 1]]) { const j = pf.occ.get(key(x + dx, y + dy)); if (j !== undefined && s[j] === 'H' && Math.abs(i - j) > 1) e -= 1; } });
    return e;
  }
  const free = (x, y) => !pf.occ.has(key(x, y));
  const adjacent = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1;
  // local moves on the square lattice: end flips, corner flips, and two-bead crankshafts
  function propose() {
    const n = pf.p.length; const i = Math.floor(Math.random() * n); const { p } = pf;
    if (i === 0 || i === n - 1) {
      const nb = p[i === 0 ? 1 : n - 2]; const opts = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => [nb[0] + dx, nb[1] + dy]).filter(([x, y]) => free(x, y));
      return opts.length ? [[i, opts[Math.floor(Math.random() * opts.length)]]] : null;
    }
    const a = p[i - 1]; const b = p[i + 1];
    if (Math.abs(a[0] - b[0]) === 1 && Math.abs(a[1] - b[1]) === 1) { const q = [a[0] + b[0] - p[i][0], a[1] + b[1] - p[i][1]]; return free(...q) ? [[i, q]] : null; }
    if (i + 2 < n && adjacent(p[i - 1], p[i + 2])) {
      const q1 = [2 * p[i - 1][0] - p[i][0], 2 * p[i - 1][1] - p[i][1]]; const q2 = [2 * p[i + 2][0] - p[i + 1][0], 2 * p[i + 2][1] - p[i + 1][1]];
      if (free(...q1) && free(...q2)) return [[i, q1], [i + 1, q2]];
    }
    return null;
  }
  function apply(moves) { moves.forEach(([i]) => pf.occ.delete(key(...pf.p[i]))); moves.forEach(([i, q]) => { pf.p[i] = q; pf.occ.set(key(...q), i); }); }

  defineTheory('protein', {
    tab: ['Protein folding', 'Energy landscapes'],
    meta: {
      category: 'BIOPHYSICS',
      title: 'How a chain finds its shape',
      glyph: '⌇',
      description: 'A protein is a chain of amino acids that folds into one precise shape. Water-fearing (hydrophobic) residues hide together in the core—and that simple drive goes a long way toward explaining the fold.',
      visualTitle: 'HP lattice model (Dill, 1985) · Monte Carlo annealing',
      frame: 'SQUARE LATTICE',
      caption: 'Orange: hydrophobic (H). Cyan: polar (P). Dashed: H–H contacts, each worth −1 energy. Right: energy over time; dashed line marks the best known fold.',
      equation: '<span class="accent">E = −ε × (number of non-bonded H–H contacts)</span>',
      equationNote: 'Moves are accepted with probability min(1, e^(−ΔE/kT)). Annealing starts hot so the chain can escape traps, then cools so it settles into a low-energy fold.',
      insight: 'Even a 20-residue chain has millions of shapes, yet a hydrophobic core emerges in seconds once cooled. Cool too fast and it freezes in a misfold. Real proteins fold through funnel-shaped energy landscapes—and AlphaFold now predicts real structures from sequence (2024 Nobel Prize in Chemistry).',
      boundary: 'A 2-D lattice caricature with two residue types; real folding is 3-D with twenty amino acids, hydrogen bonds, and water. Benchmarks list the lowest energy known for each sequence.',
    },
    defaults: { sequence: 0, ptemp: 1.2 },
    formats: {
      sequence: (v) => SEQS[v][0],
      ptemp: (v) => `kT = ${v.toFixed(2)}`,
    },
    controls: () => `
      ${rangeControl('sequence', 'Sequence', 0, SEQS.length - 1, 1, '20', '25')}
      ${rangeControl('ptemp', 'Temperature', 0.05, 2.5, 0.05, 'Cold', 'Hot')}
      <div class="readout" id="live-readout"></div>
      <div class="control-actions">
        <button class="action-button" data-action="anneal">❄ ANNEAL (hot → cold)</button>
        <button class="action-button" data-action="pause">${state.paused ? '▶ PLAY' : '❚❚ PAUSE'}</button>
        <button class="action-button secondary" data-action="reset">↺ UNFOLD</button>
      </div>`,
    sim: {
      resetOn: ['sequence'],
      reset() {
        const n = seq().length; pf.p = Array.from({ length: n }, (_, i) => [i - Math.floor(n / 2), 0]);
        pf.occ = new Map(pf.p.map((q, i) => [key(...q), i])); Object.assign(pf, { E: 0, best: 0, steps: 0, hist: [], annealing: 0 });
      },
      anneal() { pf.annealing = 15; state.protein.ptemp = 2.5; },
      tick(dt) {
        if (pf.annealing > 0) {
          pf.annealing = Math.max(0, pf.annealing - dt); state.protein.ptemp = Math.max(0.05, 2.5 * (0.05 / 2.5) ** (1 - pf.annealing / 15));
          const input = document.querySelector('#control-ptemp');
          if (input) { input.value = state.protein.ptemp; input.style.setProperty('--range-progress', `${(state.protein.ptemp - 0.05) / 2.45 * 100}%`); document.querySelector('#value-ptemp').textContent = formats.ptemp(state.protein.ptemp); }
        }
        const T = state.protein.ptemp;
        for (let s = 0; s < 2500; s += 1) {
          const mv = propose(); if (!mv) continue;
          const old = mv.map(([i]) => [i, pf.p[i]]); apply(mv); const E2 = energy();
          if (E2 <= pf.E || Math.random() < Math.exp((pf.E - E2) / T)) { pf.E = E2; pf.best = Math.min(pf.best, E2); } else apply(old);
          pf.steps += 1;
        }
        pf.hist.push([pf.steps, pf.E]); if (pf.hist.length > 900) pf.hist.shift();
      },
      draw() {
        const s = seq(); const xs = pf.p.map(([x]) => x); const ys = pf.p.map(([, y]) => y);
        const cell = Math.min(36, 420 / Math.max(6, Math.max(...xs) - Math.min(...xs) + 1), 400 / Math.max(6, Math.max(...ys) - Math.min(...ys) + 1));
        const mx = (Math.max(...xs) + Math.min(...xs)) / 2; const my = (Math.max(...ys) + Math.min(...ys)) / 2; const toS = ([x, y]) => [270 + (x - mx) * cell, 235 - (y - my) * cell];
        pf.p.forEach(([x, y], i) => { if (s[i] !== 'H') return; for (const [dx, dy] of [[1, 0], [0, 1]]) { const j = pf.occ.get(key(x + dx, y + dy)); if (j !== undefined && s[j] === 'H' && Math.abs(i - j) > 1) polyline([toS([x, y]), toS([x + dx, y + dy])], 'rgba(255, 178, 107, .7)', 2, [3, 3]); } });
        polyline(pf.p.map(toS), 'rgba(169, 182, 192, .8)', 3);
        pf.p.forEach((q, i) => { const [x, y] = toS(q); ctx.fillStyle = s[i] === 'H' ? COLORS[1] : COLORS[0]; ctx.beginPath(); ctx.arc(x, y, cell * 0.32, 0, Math.PI * 2); ctx.fill(); });
        label(`${SEQS[state.protein.sequence][0].toUpperCase()} · ${s}`, 18, 30, '#d4dfe6', 8);
        const [, , target] = SEQS[state.protein.sequence];
        const gx = 600; const gw = 320; const gy = 60; const gh = 260; const lo = target - 1; const toY = (e) => gy + gh * (0 - e) / (0 - lo);
        label('ENERGY', gx, 40, '#d4dfe6'); drawGrid(gx, gy, gw, gh, 4);
        polyline([[gx, toY(target)], [gx + gw, toY(target)]], COLORS[1], 1, [4, 4]); label(`best known ${target}`, gx + gw - 80, toY(target) - 5, COLORS[1], 8);
        polyline(pf.hist.map(([, e], i) => [gx + i / 899 * gw, toY(e)]), COLORS[0], 1.6);
        label('0', gx - 14, gy + 4, '#596a78'); label(String(lo), gx - 20, gy + gh + 3, '#596a78');
        setReadout([['ENERGY', pf.E], ['BEST THIS RUN', `${pf.best} (known ${target})`], ['MOVES TRIED', pf.steps.toLocaleString()], ['MODE', pf.annealing > 0 ? 'annealing…' : 'fixed temperature']]);
      },
    },
  });
})();
