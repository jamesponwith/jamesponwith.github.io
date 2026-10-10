// 06 · Natural selection
(() => {
  const evo = {};
  const GENERATIONS = 250; const REPLICATES = 20; const P0 = 0.1;

  defineTheory('evolution', {
    tab: ['Natural selection', 'Fitness · genetic drift'],
    meta: {
      category: 'EVOLUTIONARY BIOLOGY',
      title: 'Natural selection versus chance',
      glyph: 'Δp',
      description: 'Twenty populations start with the same rare variant. Selection pushes; random inheritance (genetic drift) jostles. Which force wins depends on population size.',
      visualTitle: 'Wright–Fisher model · 20 replicate populations',
      frame: 'GENERATIONS',
      caption: 'Each line is one population. Dashed: the deterministic prediction with no chance at all.',
      equation: '<span class="accent">p′ = p(1+s) / (1+ps)</span>, next gen ~ Binomial(N, p′) / N',
      equationNote: 'p is the variant’s frequency, s its relative fitness advantage, N the number of individuals per generation.',
      insight: 'When N·|s| ≪ 1 the lines scatter like random walks: harmful variants can take over and helpful ones vanish. When N·s ≫ 1 they march together along the dashed curve. Darwin’s selection and Kimura’s neutral drift are two ends of one dial.',
      boundary: 'Haploid, one locus, no mutation, migration, or dominance. Real genomes add linkage, structure, and changing environments.',
    },
    defaults: { popSize: 200, advantage: 0.02 },
    formats: {
      popSize: (v) => `N = ${v}`,
      advantage: (v) => `${v > 0 ? '+' : ''}${(v * 100).toFixed(1)}%`,
    },
    controls: () => `
      ${rangeControl('popSize', 'Population size', 10, 2000, 10, 'Small', 'Large')}
      ${rangeControl('advantage', 'Selection advantage s', -0.05, 0.1, 0.005, 'Harmful', 'Beneficial')}
      <div class="readout" id="live-readout"></div>${playControls()}`,
    sim: {
      resetOn: ['popSize', 'advantage'],
      reset() {
        const s = state.evolution.advantage;
        Object.assign(evo, { gen: 0, timer: 0, hold: 0, runs: Array.from({ length: REPLICATES }, () => [P0]), expected: [P0] });
        for (let g = 0; g < GENERATIONS; g += 1) { const p = evo.expected[g]; evo.expected.push(p * (1 + s) / (1 + p * s)); }
      },
      tick(dt) {
        if (evo.gen >= GENERATIONS) { evo.hold += dt; if (evo.hold > 2.5) this.reset(); return; }
        const N = state.evolution.popSize; const s = state.evolution.advantage;
        evo.timer += dt;
        while (evo.timer > 1 / 50 && evo.gen < GENERATIONS) {
          evo.timer -= 1 / 50; evo.gen += 1;
          for (const run of evo.runs) {
            const p = run.at(-1); let next = p;
            if (p > 0 && p < 1) {
              const target = p * (1 + s) / (1 + p * s); let k = 0;
              for (let i = 0; i < N; i += 1) if (Math.random() < target) k += 1;
              next = k / N;
            }
            run.push(next);
          }
        }
      },
      draw() {
        const px = 70; const pw = 620; const py = 40; const ph = 360;
        const toX = (g) => px + g / GENERATIONS * pw; const toY = (p) => py + ph * (1 - p);
        label('VARIANT FREQUENCY p', 18, 30, '#d4dfe6');
        drawGrid(px, py, pw, ph, 4);
        label('1.0', px - 28, py + 4, '#596a78'); label('0.5', px - 28, py + ph / 2 + 3, '#596a78'); label('0', px - 16, py + ph + 3, '#596a78');
        label('0', px, py + ph + 16, '#596a78'); label('generation →', px + pw - 80, py + ph + 16, '#798995');
        const finals = evo.runs.map((r) => r.at(-1));
        evo.runs.forEach((run, i) => {
          const f = finals[i];
          const color = f === 1 ? 'rgba(101, 224, 208, .85)' : f === 0 ? 'rgba(188, 155, 255, .35)' : 'rgba(119, 169, 255, .7)';
          polyline(run.map((p, g) => [toX(g), toY(p)]), color, 1.3);
        });
        polyline(evo.expected.map((p, g) => [toX(g), toY(p)]), COLORS[1], 2, [6, 5]);
        // current distribution, aligned with the frequency axis
        const hx = 740; const hw = 180; const bins = Array(10).fill(0);
        finals.forEach((p) => { bins[Math.min(9, Math.floor(p * 10))] += 1; });
        label('NOW · 20 POPULATIONS', hx, 30, '#d4dfe6');
        bins.forEach((count, b) => {
          ctx.fillStyle = b === 9 ? 'rgba(101, 224, 208, .55)' : b === 0 ? 'rgba(188, 155, 255, .45)' : 'rgba(119, 169, 255, .45)';
          ctx.fillRect(hx, toY((b + 1) / 10) + 2, count / REPLICATES * hw, ph / 10 - 4);
        });
        polyline([[hx, py], [hx, py + ph]], 'rgba(128, 153, 172, .3)', 1);
        const fixed = finals.filter((p) => p === 1).length; const lost = finals.filter((p) => p === 0).length;
        const ns = state.evolution.popSize * state.evolution.advantage;
        setReadout([['GENERATION', `${evo.gen} / ${GENERATIONS}`], ['FIXED · LOST', `${fixed} · ${lost}`], ['N·s', ns.toFixed(1)], ['REGIME', Math.abs(ns) < 1 ? 'drift rules' : Math.abs(ns) < 10 ? 'tug of war' : 'selection rules']]);
      },
    },
  });
})();
