// 37 · Genetic algorithms
(() => {
  const ga = {};
  const tourLength = (route) => { let d = 0; for (let i = 0; i < route.length; i += 1) { const a = ga.cities[route[i]]; const b = ga.cities[route[(i + 1) % route.length]]; d += Math.hypot(a[0] - b[0], a[1] - b[1]); } return d; };
  const shuffled = (n) => { const r = [...Array(n).keys()]; for (let i = n - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
  function orderCrossover(p1, p2) {
    const n = p1.length; const a = Math.floor(Math.random() * n); const b = a + Math.floor(Math.random() * (n - a));
    const child = Array(n).fill(-1); const used = new Set();
    for (let i = a; i <= b; i += 1) { child[i] = p1[i]; used.add(p1[i]); }
    let k = (b + 1) % n;
    for (let j = 0; j < n; j += 1) { const c = p2[(b + 1 + j) % n]; if (!used.has(c)) { child[k] = c; k = (k + 1) % n; } }
    return child;
  }
  function invert(route) { const n = route.length; const a = Math.floor(Math.random() * n); const b = Math.floor(Math.random() * n); const [i, j] = a < b ? [a, b] : [b, a]; const seg = route.slice(i, j + 1).reverse(); route.splice(i, seg.length, ...seg); }
  function greedyLength() {
    const n = ga.cities.length; const seen = new Set([0]); const route = [0];
    while (route.length < n) { const last = ga.cities[route.at(-1)]; let best = -1; let bd = Infinity; for (let i = 0; i < n; i += 1) if (!seen.has(i)) { const d = Math.hypot(ga.cities[i][0] - last[0], ga.cities[i][1] - last[1]); if (d < bd) { bd = d; best = i; } } route.push(best); seen.add(best); }
    return tourLength(route);
  }
  function generation() {
    const scored = ga.pop.map((r) => [r, tourLength(r)]).sort((a, b) => a[1] - b[1]);
    const pick = () => { let best = null; for (let k = 0; k < 3; k += 1) { const c = scored[Math.floor(Math.random() * scored.length)]; if (!best || c[1] < best[1]) best = c; } return best[0]; };
    const next = [scored[0][0], scored[1][0]];
    while (next.length < state.genetic.popSize) { const child = orderCrossover(pick(), pick()); if (Math.random() < state.genetic.mutation) invert(child); next.push(child); }
    ga.pop = next; ga.gen += 1; ga.best = scored[0][0];
    ga.history.push([scored[0][1], scored.reduce((s, [, d]) => s + d, 0) / scored.length]);
    // keep the whole run visible: when full, thin to every other point
    if (ga.history.length > 600) ga.history = ga.history.filter((_, i) => i % 2 === 0);
  }

  defineTheory('genetic', {
    tab: ['Genetic algorithms', 'Evolution as search'],
    meta: {
      category: 'COMPUTATION',
      title: 'Evolution as a problem solver',
      glyph: '⧉',
      description: 'Variation, selection, inheritance—nothing more. Applied to candidate solutions instead of organisms, Darwin’s recipe finds short routes through cities faster than you could check them all.',
      visualTitle: 'Genetic algorithm · travelling salesperson',
      frame: 'ROUTE MAP',
      caption: 'Cyan: the best route so far. Faint: other members of the population. Right: best and average route length per generation.',
      equation: '<span class="accent">select → recombine → mutate → repeat</span>',
      equationNote: 'Routes compete in tournaments of three; winners mate by order crossover, and mutation reverses a random stretch. The two best survive unchanged (elitism).',
      insight: '40 cities allow about 10⁴⁶ distinct round trips—no computer can check them all. Selection keeps what works, crossover combines good partial routes, and mutation escapes dead ends. Too little mutation and the population converges early; too much and it forgets.',
      boundary: 'A heuristic: no guarantee of the true shortest route. The dashed line is a simple nearest-neighbor tour for comparison; specialized solvers do far better on large instances.',
    },
    defaults: { cityCount: 40, popSize: 120, mutation: 0.3 },
    formats: {
      cityCount: (v) => `${v} cities`,
      popSize: (v) => `${v} routes`,
      mutation: (v) => `${Math.round(v * 100)}%`,
    },
    controls: () => `
      ${rangeControl('cityCount', 'Cities', 10, 80, 1, '10', '80')}
      ${rangeControl('popSize', 'Population', 20, 300, 10, 'Small', 'Large')}
      ${rangeControl('mutation', 'Mutation rate', 0, 0.9, 0.05, 'None', 'Wild')}
      <div class="readout" id="live-readout"></div>${playControls()}`,
    sim: {
      resetOn: ['cityCount', 'popSize'],
      reset() {
        ga.cities = Array.from({ length: state.genetic.cityCount }, () => [40 + Math.random() * 560, 50 + Math.random() * 370]);
        ga.pop = Array.from({ length: state.genetic.popSize }, () => shuffled(ga.cities.length));
        Object.assign(ga, { gen: 0, history: [], best: ga.pop[0], greedy: greedyLength() });
      },
      tick() { for (let g = 0; g < 2; g += 1) generation(); },
      draw() {
        const routeLine = (route, color, width) => polyline([...route, route[0]].map((i) => ga.cities[i]), color, width);
        ga.pop.slice(2, 10).forEach((r) => routeLine(r, 'rgba(188, 155, 255, .12)', 1));
        routeLine(ga.best, COLORS[0], 2);
        ga.cities.forEach(([x, y]) => drawStar(x, y, 3.2, '#fff1c4'));
        label('ROUTE', 40, 34, '#d4dfe6');
        const gx = 650; const gw = 270; const gy = 60; const gh = 260; const hi = Math.max(ga.greedy * 1.2, ga.history[0]?.[0] ?? 0) * 1.05; const lo = Math.min(ga.greedy, ...ga.history.map(([b]) => b)) * 0.9;
        const toY = (d) => gy + gh * (1 - (d - lo) / (hi - lo));
        label('ROUTE LENGTH', gx, 40, '#d4dfe6'); drawGrid(gx, gy, gw, gh, 4);
        polyline(ga.history.map(([, m], i) => [gx + i / Math.max(1, ga.history.length - 1) * gw, toY(Math.min(hi, m))]), 'rgba(169, 182, 192, .5)', 1.2);
        polyline(ga.history.map(([b], i) => [gx + i / Math.max(1, ga.history.length - 1) * gw, toY(b)]), COLORS[0], 2);
        polyline([[gx, toY(ga.greedy)], [gx + gw, toY(ga.greedy)]], COLORS[1], 1, [4, 4]);
        label('nearest-neighbor', gx + gw - 92, toY(ga.greedy) - 5, COLORS[1], 8);
        label('— best   — average   (whole run)', gx, gy + gh + 16, '#798995');
        const bestLen = ga.history.at(-1)?.[0] ?? tourLength(ga.best);
        setReadout([['GENERATION', ga.gen], ['BEST LENGTH', bestLen.toFixed(0)], ['VS GREEDY', `${((bestLen / ga.greedy - 1) * 100).toFixed(1)}%`], ['ROUTES TRIED', (ga.gen * state.genetic.popSize).toLocaleString()]]);
      },
    },
  });
})();
