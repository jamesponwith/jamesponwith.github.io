// 45 · Small-world networks
(() => {
  const NODES = 80; const K = 4; const CX = 260; const CY = 232; const R = 185;
  // fixed random numbers per lattice edge, so moving the slider rewires one network smoothly
  const EDGES = []; for (let i = 0; i < NODES; i += 1) for (let j = 1; j <= K / 2; j += 1) EDGES.push({ a: i, b: (i + j) % NODES, u: Math.random(), to: Math.floor(Math.random() * NODES) });
  const sw = { t: 0, source: 0 };
  function build(p, edges = EDGES) {
    const adj = Array.from({ length: NODES }, () => new Set()); const shortcuts = [];
    for (const e of edges) {
      let b = e.b;
      if (e.u < p && e.to !== e.a && !adj[e.a].has(e.to)) { b = e.to; shortcuts.push([e.a, b]); }
      if (b !== e.a) { adj[e.a].add(b); adj[b].add(e.a); }
    }
    return { adj, shortcuts };
  }
  function bfs(adj, s) { const d = Array(NODES).fill(-1); d[s] = 0; const q = [s]; for (let h = 0; h < q.length; h += 1) for (const v of adj[q[h]]) if (d[v] < 0) { d[v] = d[q[h]] + 1; q.push(v); } return d; }
  function pathLength(adj) { let sum = 0; let n = 0; for (let s = 0; s < NODES; s += 1) for (const d of bfs(adj, s)) if (d > 0) { sum += d; n += 1; } return sum / n; }
  function clustering(adj) {
    let c = 0;
    adj.forEach((nb) => { const list = [...nb]; const k = list.length; if (k < 2) return; let links = 0; for (let i = 0; i < k; i += 1) for (let j = i + 1; j < k; j += 1) if (adj[list[i]].has(list[j])) links += 1; c += links / (k * (k - 1) / 2); });
    return c / NODES;
  }
  // reference curves averaged over a few independent networks, computed once
  const P_GRID = Array.from({ length: 17 }, (_, i) => 10 ** (-4 + i * 0.25));
  const base = build(0).adj; const L0 = pathLength(base); const C0 = clustering(base);
  const CURVES = P_GRID.map((p) => {
    let l = 0; let c = 0;
    for (let r = 0; r < 12; r += 1) { const edges = EDGES.map((e) => ({ ...e, u: Math.random(), to: Math.floor(Math.random() * NODES) })); const { adj } = build(p, edges); l += pathLength(adj); c += clustering(adj); }
    return [p, l / 12 / L0, c / 12 / C0];
  });
  const pos = (i) => [CX + R * Math.cos(i / NODES * 2 * Math.PI - Math.PI / 2), CY + R * Math.sin(i / NODES * 2 * Math.PI - Math.PI / 2)];

  defineTheory('smallworld', {
    tab: ['Small-world networks', 'Six degrees · shortcuts'],
    meta: {
      category: 'NETWORK SCIENCE',
      title: 'Six degrees of separation',
      glyph: '⋈',
      description: 'Start with a ring where everyone knows only their neighbors. Rewire a handful of links at random and anyone can suddenly reach anyone in a few steps—while friend groups stay just as tight.',
      visualTitle: 'Watts–Strogatz small-world network · 80 people',
      frame: 'SOCIAL RING',
      caption: 'Lines: acquaintances (orange = rewired shortcuts). Pulses: a message spreading one handshake per step. Right: path length and clustering versus rewiring.',
      equation: '<span class="accent">L(p)/L(0)</span> collapses long before <span class="accent">C(p)/C(0)</span>',
      equationNote: 'L is the average number of steps between two people; C is the chance that two of your friends know each other; p is the fraction of links rewired.',
      insight: 'A few percent of random shortcuts slash path lengths while clustering barely moves—the “small world.” Watts and Strogatz (1998) found it in film-actor networks, the power grid, and a worm’s nervous system. It is why rumors and epidemics travel so fast.',
      boundary: 'An idealized ring of 80 people with 4 links each; the curves average a few random networks. Real social networks also have hubs and communities.',
    },
    defaults: { rewire: -1.5 },
    formats: {
      rewire: (v) => `p = ${(10 ** v).toPrecision(2)}`,
    },
    controls: () => `
      ${rangeControl('rewire', 'Rewiring probability (log)', -4, 0, 0.05, '0.0001', '1')}
      <div class="readout" id="live-readout"></div>${playControls()}`,
    sim: {
      reset() { sw.t = 0; sw.source = Math.floor(Math.random() * NODES); },
      tick(dt) { sw.t += dt; },
      draw() {
        const p = 10 ** state.smallworld.rewire; const { adj, shortcuts } = build(p);
        const dist = bfs(adj, sw.source); const reach = Math.max(...dist); const hop = Math.floor(sw.t / 0.45);
        if (hop > reach + 3) { sw.t = 0; sw.source = Math.floor(Math.random() * NODES); }
        const shortcutSet = new Set(shortcuts.map(([a, b]) => `${a}-${b}`));
        adj.forEach((nb, a) => nb.forEach((b) => {
          if (b < a) return; const sc = shortcutSet.has(`${a}-${b}`) || shortcutSet.has(`${b}-${a}`);
          const lit = dist[a] >= 0 && dist[b] >= 0 && Math.max(dist[a], dist[b]) <= hop && Math.abs(dist[a] - dist[b]) === 1;
          polyline([pos(a), pos(b)], lit ? 'rgba(255, 241, 196, .7)' : sc ? 'rgba(255, 178, 107, .45)' : 'rgba(119, 169, 255, .25)', lit ? 1.6 : 1);
        }));
        for (let i = 0; i < NODES; i += 1) { const reached = dist[i] >= 0 && dist[i] <= hop; drawStar(...pos(i), i === sw.source ? 6 : 3.2, i === sw.source ? COLORS[1] : reached ? '#fff1c4' : '#4f6070'); }
        label(`message from person ${sw.source}: step ${Math.min(hop, reach)} of ${reach}`, 18, 30, '#d4dfe6');
        // L and C vs p
        const gx = 600; const gw = 320; const gy = 60; const gh = 260; const toX = (q) => gx + (Math.log10(q) + 4) / 4 * gw; const toY = (v) => gy + gh * (1 - v);
        label('NORMALIZED L AND C vs REWIRING', gx, 40, '#d4dfe6'); drawGrid(gx, gy, gw, gh, 4);
        polyline(CURVES.map(([q, l]) => [toX(q), toY(l)]), COLORS[0], 2); polyline(CURVES.map(([q, , c]) => [toX(q), toY(c)]), COLORS[1], 2);
        const L = pathLength(adj) / L0; const C = clustering(adj) / C0;
        drawStar(toX(p), toY(L), 4.5, COLORS[0]); drawStar(toX(p), toY(C), 4.5, COLORS[1]);
        polyline([[toX(p), gy], [toX(p), gy + gh]], 'rgba(255, 241, 196, .3)', 1, [3, 4]);
        label('path length L', gx + 6, toY(0.15), COLORS[0]); label('clustering C', gx + 6, toY(0.92) + 14, COLORS[1]);
        label('10⁻⁴', gx - 6, gy + gh + 15, '#596a78'); label('10⁻²', gx + gw / 2 - 10, gy + gh + 15, '#596a78'); label('p = 1', gx + gw - 26, gy + gh + 15, '#596a78');
        setReadout([['AVG SEPARATION', `${(L * L0).toFixed(2)} steps`], ['CLUSTERING', (C * C0).toFixed(3)], ['SHORTCUTS', shortcuts.length]]);
      },
    },
  });
})();
