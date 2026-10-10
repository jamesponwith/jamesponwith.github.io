// 29 · Game of Life
(() => {
  const LIFE_SEEDS = ['Random soup', 'Glider gun', 'Acorn', 'R-pentomino'];
  const PATTERNS = [null,
    ['........................O', '......................O.O', '............OO......OO............OO', '...........O...O....OO............OO', 'OO........O.....O...OO', 'OO........O...O.OO....O.O', '..........O.....O.......O', '...........O...O', '............OO'],
    ['.O', '...O', 'OO..OOO'],
    ['.OO', 'OO', '.O']];
  const GLIDER = ['.O', '..O', 'OOO'];
  const N = FIELD_W * FIELD_H;
  const life = { cells: new Uint8Array(N), next: new Uint8Array(N), age: new Uint16Array(N), ghost: new Float32Array(N) };
  const stamp = (rows, ox, oy) => rows.forEach((row, y) => [...row].forEach((c, x) => {
    const gx = ox + x; const gy = oy + y;
    if (c === 'O' && gx > 1 && gy > 1 && gx < FIELD_W - 2 && gy < FIELD_H - 2) life.cells[gy * FIELD_W + gx] = 1;
  }));

  function step() {
    const { cells, next, age, ghost } = life; let pop = 0;
    for (let y = 0; y < FIELD_H; y += 1) for (let x = 0; x < FIELD_W; x += 1) {
      const i = y * FIELD_W + x;
      // edges absorb: anything reaching the outer two rows or columns dies
      if (x < 2 || y < 2 || x >= FIELD_W - 2 || y >= FIELD_H - 2) { next[i] = 0; continue; }
      const n = cells[i - FIELD_W - 1] + cells[i - FIELD_W] + cells[i - FIELD_W + 1] + cells[i - 1] + cells[i + 1] + cells[i + FIELD_W - 1] + cells[i + FIELD_W] + cells[i + FIELD_W + 1];
      next[i] = n === 3 || (cells[i] && n === 2) ? 1 : 0;
    }
    for (let i = 0; i < N; i += 1) {
      if (next[i]) { age[i] = cells[i] ? Math.min(60000, age[i] + 1) : 0; pop += 1; } else { if (cells[i]) ghost[i] = 1; else ghost[i] *= 0.82; }
    }
    [life.cells, life.next] = [life.next, life.cells];
    life.gen += 1; life.pop = pop;
  }

  defineTheory('life', {
    tab: ['Game of Life', 'Emergence · computation'],
    meta: {
      category: 'CELLULAR AUTOMATA',
      title: 'Life from four rules',
      glyph: '⊞',
      description: 'Conway’s Game of Life (1970): each cell lives or dies by counting its eight neighbors. From that come gliders, guns, and machines—Life can compute anything a computer can.',
      visualTitle: 'Conway’s Game of Life · B3/S23',
      frame: '240 × 115 CELLS',
      caption: 'White: newborn. Cyan: survivors. Violet: recently dead. Click to launch a glider.',
      equation: '<span class="accent">birth on exactly 3 neighbors · survival on 2 or 3</span>',
      equationNote: 'Every cell updates at once from its 8 neighbors. Nothing else: no randomness, no goals, no designer.',
      insight: 'Seven cells of the acorn churn for 5,206 generations. Gosper’s glider gun fires a glider every 30 generations, proving patterns can grow forever. Gliders can be wired into logic gates, so Life is Turing-complete: complexity needs only simple local rules.',
      boundary: 'A finite board whose edges absorb whatever touches them, so escaping gliders vanish instead of wrapping around and colliding.',
    },
    defaults: { lifeSeed: 1, lifeSpeed: 15 },
    formats: {
      lifeSeed: (v) => LIFE_SEEDS[v],
      lifeSpeed: (v) => `${v} gen/s`,
    },
    controls: () => `
      ${rangeControl('lifeSeed', 'Starting pattern', 0, LIFE_SEEDS.length - 1, 1, LIFE_SEEDS[0], LIFE_SEEDS.at(-1))}
      ${rangeControl('lifeSpeed', 'Speed', 2, 60, 1, 'Slow', 'Fast')}
      <div class="readout" id="live-readout"></div>${playControls()}`,
    sim: {
      resetOn: ['lifeSeed'],
      reset() {
        life.cells.fill(0); life.age.fill(0); life.ghost.fill(0); life.gen = 0; life.timer = 0;
        const seed = state.life.lifeSeed;
        if (seed === 0) { for (let i = 0; i < N; i += 1) life.cells[i] = Math.random() < 0.28 ? 1 : 0; }
        else if (seed === 1) stamp(PATTERNS[1], 12, 12);
        else stamp(PATTERNS[seed], Math.floor(FIELD_W / 2) - 3, Math.floor(FIELD_H / 2) - 2);
        life.pop = life.cells.reduce((s, c) => s + c, 0);
      },
      pick(x, y) { stamp(GLIDER, Math.floor(x / 960 * FIELD_W) - 1, Math.floor(y / 460 * FIELD_H) - 1); },
      tick(dt) {
        life.timer += dt; const period = 1 / state.life.lifeSpeed;
        while (life.timer >= period) { life.timer -= period; step(); }
      },
      draw() {
        const px = fieldImage.data;
        for (let i = 0; i < N; i += 1) {
          const o = i * 4;
          if (life.cells[i]) { const f = Math.min(1, life.age[i] / 12); px[o] = 235 - 134 * f; px[o + 1] = 250 - 26 * f; px[o + 2] = 245 - 37 * f; }
          else { const g = life.ghost[i] * 0.55; px[o] = 12 + 176 * g; px[o + 1] = 17 + 138 * g; px[o + 2] = 24 + 231 * g; }
          px[o + 3] = 255;
        }
        fieldCtx.putImageData(fieldImage, 0, 0);
        ctx.imageSmoothingEnabled = false; ctx.drawImage(fieldCanvas, 0, 0, 960, 460); ctx.imageSmoothingEnabled = true;
        setReadout([['GENERATION', life.gen.toLocaleString()], ['POPULATION', life.pop.toLocaleString()], ['PATTERN', LIFE_SEEDS[state.life.lifeSeed]]]);
      },
    },
  });
})();
