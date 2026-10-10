// 12 · Turing patterns
(() => {
  const RECIPES = [['Mitosis', 0.0367, 0.0649], ['Coral', 0.0545, 0.062], ['Labyrinth', 0.029, 0.057], ['Solitons', 0.03, 0.062]];
  const rd = { A: new Float32Array(FIELD_W * FIELD_H), B: new Float32Array(FIELD_W * FIELD_H), A2: new Float32Array(FIELD_W * FIELD_H), B2: new Float32Array(FIELD_W * FIELD_H) };
  function rdSeed(cx, cy, size = 4) {
    for (let y = cy - size; y <= cy + size; y += 1) for (let x = cx - size; x <= cx + size; x += 1) {
      rd.B[((y + FIELD_H) % FIELD_H) * FIELD_W + ((x + FIELD_W) % FIELD_W)] = 1;
    }
  }

  defineTheory('turing', {
    tab: ['Turing patterns', 'Chemistry · biology'],
    meta: {
      category: 'MORPHOGENESIS',
      title: 'How the leopard gets its spots',
      glyph: '⁘',
      description: 'Turing (1952): two chemicals that react and spread at different speeds can turn a uniform mixture into spots, stripes, and mazes—with no blueprint.',
      visualTitle: 'Gray–Scott reaction–diffusion',
      frame: '240 × 115 CELLS',
      caption: 'Brightness shows chemical B. Click anywhere to drop in more; switch recipes to watch patterns morph.',
      equation: '<span class="accent">∂A/∂t = D_A∇²A − AB² + f(1−A)</span> · ∂B/∂t = D_B∇²B + AB² − (k+f)B',
      equationNote: 'A is fuel fed in at rate f; B consumes it to copy itself and is removed at rate k. A diffuses twice as fast as B.',
      insight: 'Local self-amplification plus faster-spreading depletion is Turing’s recipe. Nudging f and k switches between dividing spots, coral, and labyrinths. Versions of this mechanism are linked to zebrafish stripes, digit spacing in limbs, and hair-follicle layout.',
      boundary: 'Gray–Scott is a chemical caricature, not any organism’s biochemistry. The grid wraps at its edges and advances by explicit Euler steps.',
    },
    defaults: { recipe: 0 },
    formats: {
      recipe: (v) => RECIPES[v][0],
    },
    controls: () => `
      ${rangeControl('recipe', 'Recipe (f, k)', 0, RECIPES.length - 1, 1, RECIPES[0][0], RECIPES.at(-1)[0])}
      <div class="readout" id="live-readout"></div>${playControls()}`,
    sim: {
      reset() {
        rd.A.fill(1); rd.B.fill(0);
        for (let i = 0; i < 18; i += 1) rdSeed(Math.floor(Math.random() * FIELD_W), Math.floor(Math.random() * FIELD_H), 3);
      },
      pick(x, y) { rdSeed(Math.floor(x / 960 * FIELD_W), Math.floor(y / 460 * FIELD_H), 4); },
      tick() {
        const [, f, k] = RECIPES[state.turing.recipe];
        for (let s = 0; s < 14; s += 1) {
          const { A, B, A2, B2 } = rd;
          for (let y = 0; y < FIELD_H; y += 1) {
            const up = ((y + FIELD_H - 1) % FIELD_H) * FIELD_W; const row = y * FIELD_W; const dn = ((y + 1) % FIELD_H) * FIELD_W;
            for (let x = 0; x < FIELD_W; x += 1) {
              const l = (x + FIELD_W - 1) % FIELD_W; const r = (x + 1) % FIELD_W; const i = row + x;
              const lapA = 0.2 * (A[row + l] + A[row + r] + A[up + x] + A[dn + x]) + 0.05 * (A[up + l] + A[up + r] + A[dn + l] + A[dn + r]) - A[i];
              const lapB = 0.2 * (B[row + l] + B[row + r] + B[up + x] + B[dn + x]) + 0.05 * (B[up + l] + B[up + r] + B[dn + l] + B[dn + r]) - B[i];
              const abb = A[i] * B[i] * B[i];
              A2[i] = A[i] + lapA - abb + f * (1 - A[i]);
              B2[i] = B[i] + 0.5 * lapB + abb - (k + f) * B[i];
            }
          }
          [rd.A, rd.A2, rd.B, rd.B2] = [rd.A2, rd.A, rd.B2, rd.B];
        }
      },
      draw() {
        const px = fieldImage.data;
        for (let i = 0; i < FIELD_W * FIELD_H; i += 1) {
          const v = Math.min(1, Math.max(0, rd.B[i] * 2.8));
          const lo = Math.min(1, v * 1.6); const hi = Math.max(0, v * 1.6 - 0.6);
          px[i * 4] = 12 + 89 * lo + 120 * hi; px[i * 4 + 1] = 17 + 207 * lo + 20 * hi; px[i * 4 + 2] = 24 + 184 * lo + 30 * hi; px[i * 4 + 3] = 255;
        }
        fieldCtx.putImageData(fieldImage, 0, 0);
        ctx.imageSmoothingEnabled = true; ctx.drawImage(fieldCanvas, 0, 0, 960, 460);
        const [name, f, k] = RECIPES[state.turing.recipe];
        const total = rd.B.reduce((s, v) => s + v, 0) / rd.B.length;
        setReadout([['RECIPE', name], ['FEED f', f.toFixed(4)], ['KILL k', k.toFixed(4)], ['MEAN B', total.toFixed(3)]]);
      },
    },
  });
})();
