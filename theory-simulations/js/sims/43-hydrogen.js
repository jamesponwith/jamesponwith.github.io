// 43 · Hydrogen orbitals
(() => {
  const RES = 150; const SHAPES = 'spdfg';
  const hCanvas = document.createElement('canvas'); hCanvas.width = RES; hCanvas.height = RES;
  const hCtx = hCanvas.getContext('2d'); const hImage = hCtx.createImageData(RES, RES);
  const orb = { psi: new Float32Array(RES * RES), sparks: [], key: '' };
  const quantum = () => { const n = state.hydrogen.n; const l = Math.min(state.hydrogen.l, n - 1); const m = Math.min(state.hydrogen.m, l); return { n, l, m }; };
  function laguerre(k, a, x) { let l0 = 1; if (k === 0) return l0; let l1 = 1 + a - x; for (let j = 1; j < k; j += 1) { const l2 = ((2 * j + 1 + a - x) * l1 - (j + a) * l0) / (j + 1); l0 = l1; l1 = l2; } return l1; }
  function legendre(l, m, x) {
    let pmm = 1; const s = Math.sqrt(Math.max(0, 1 - x * x)); for (let i = 1; i <= m; i += 1) pmm *= (2 * i - 1) * s;
    if (l === m) return pmm; let pm1 = x * (2 * m + 1) * pmm; if (l === m + 1) return pm1;
    for (let ll = m + 2; ll <= l; ll += 1) { const p = (x * (2 * ll - 1) * pm1 - (ll + m - 1) * pmm) / (ll - m); pmm = pm1; pm1 = p; }
    return pm1;
  }
  const radial = (n, l, r) => { const rho = 2 * r / n; return Math.exp(-rho / 2) * rho ** l * laguerre(n - l - 1, 2 * l + 1, rho); };
  const extent = (n) => 2.2 * n * n + 4;
  function build() {
    const { n, l, m } = quantum(); const key = `${n}${l}${m}`; if (key === orb.key) return; orb.key = key;
    const E = extent(n); let max = 0;
    for (let j = 0; j < RES; j += 1) for (let i = 0; i < RES; i += 1) {
      const x = (i / (RES - 1) * 2 - 1) * E; const z = (1 - j / (RES - 1) * 2) * E; const r = Math.hypot(x, z) + 1e-9;
      let v = radial(n, l, r) * legendre(l, m, z / r); if (x < 0 && m % 2) v = -v;
      orb.psi[j * RES + i] = v; max = Math.max(max, v * v);
    }
    orb.max = max; orb.sparks = [];
  }

  defineTheory('hydrogen', {
    tab: ['Hydrogen atom', 'Orbitals · quantum numbers'],
    meta: {
      category: 'ATOMIC PHYSICS',
      title: 'The shapes of an atom',
      glyph: 'ψₙₗₘ',
      description: 'Solve the Schrödinger equation for one electron around one proton and you get exact standing waves—orbitals. Their shapes, fixed by three quantum numbers, are the foundation of chemistry.',
      visualTitle: 'Hydrogen orbital · slice through the nucleus',
      frame: 'xz-PLANE',
      caption: 'Color: the wavefunction’s sign (cyan +, violet −); brightness: probability. Sparks: simulated position measurements.',
      equation: '<span class="accent">ψₙₗₘ = Rₙₗ(r) Yₗᵐ(θ, φ)</span>, Eₙ = −13.6 eV / n²',
      equationNote: 'n sets energy and size, ℓ the shape (s, p, d, f, g), m the orientation. ℓ ≤ n − 1 and m ≤ ℓ are enforced automatically.',
      insight: 'Dark lines and rings are nodes where the electron is never found: n − 1 in all, ℓ of them angular. Each measurement lands at random, yet thousands trace out the orbital—the double slit’s probabilistic picture again. Electrons filling these shapes give chemistry its bonds.',
      boundary: 'Non-relativistic hydrogen with a fixed proton; no spin or fine structure. Orbitals with m > 0 are shown as real combinations, and each image is normalized to its own peak.',
    },
    defaults: { n: 3, l: 2, m: 0 },
    formats: {
      n: (v) => `n = ${v}`,
      l: (v) => `ℓ = ${v} (${SHAPES[v]})`,
      m: (v) => `m = ${v}`,
    },
    controls: () => `
      ${rangeControl('n', 'Energy level n', 1, 5, 1, '1', '5')}
      ${rangeControl('l', 'Shape ℓ', 0, 4, 1, 's', 'g')}
      ${rangeControl('m', 'Orientation m', 0, 4, 1, '0', '4')}
      <div class="readout" id="live-readout"></div>${playControls()}`,
    sim: {
      reset() { orb.key = ''; build(); },
      tick(dt) {
        build();
        for (let k = 0; k < 400 && orb.sparks.length < 300; k += 1) {
          const i = Math.floor(Math.random() * RES * RES);
          if (Math.random() * orb.max < orb.psi[i] ** 2) { orb.sparks.push({ i, life: 1 }); if (orb.sparks.length % 8 === 0) break; }
        }
        orb.sparks.forEach((s) => { s.life -= dt * 0.6; }); orb.sparks = orb.sparks.filter((s) => s.life > 0);
      },
      draw() {
        build();
        const px = hImage.data;
        for (let i = 0; i < RES * RES; i += 1) {
          const v = orb.psi[i]; const a = Math.sqrt(v * v / orb.max) ** 0.8; const o = i * 4;
          if (v >= 0) { px[o] = 12 + 89 * a; px[o + 1] = 17 + 207 * a; px[o + 2] = 24 + 184 * a; } else { px[o] = 12 + 176 * a; px[o + 1] = 17 + 138 * a; px[o + 2] = 24 + 231 * a; }
          px[o + 3] = 255;
        }
        hCtx.putImageData(hImage, 0, 0);
        const S = 440; const ox = 20; const oy = 10;
        ctx.imageSmoothingEnabled = true; ctx.drawImage(hCanvas, ox, oy, S, S);
        orb.sparks.forEach(({ i, life }) => { ctx.fillStyle = `rgba(255, 241, 196, ${life})`; ctx.fillRect(ox + (i % RES) / RES * S, oy + Math.floor(i / RES) / RES * S, 2, 2); });
        const { n, l, m } = quantum();
        label(`${n}${SHAPES[l]}  ·  n=${n} ℓ=${l} m=${m}`, ox + 8, oy + 20, '#fff1c4', 11);
        label(`±${extent(n).toFixed(0)} Bohr radii`, ox + 8, oy + S - 10, '#798995', 8);
        // energy ladder
        const lx = 520; const ly = 50; const lh = 340; const toY = (E) => ly + lh * (E / -13.6);
        label('ENERGY', lx, 36, '#d4dfe6');
        for (let k = 1; k <= 6; k += 1) { polyline([[lx, toY(-13.6 / k / k)], [lx + 90, toY(-13.6 / k / k)]], k === n ? COLORS[1] : 'rgba(169, 182, 192, .4)', k === n ? 2.5 : 1); label(`n=${k}  ${(-13.6 / k / k).toFixed(2)} eV`, lx + 96, toY(-13.6 / k / k) + 3, k === n ? COLORS[1] : '#798995', 8); }
        // radial probability r² R²
        const gx = 720; const gw = 205; const gy = 60; const gh = 200; const E = extent(n);
        const pr = Array.from({ length: 200 }, (_, i) => { const r = i / 199 * E; return r * r * radial(n, l, r) ** 2; }); const top = Math.max(...pr);
        label('RADIAL PROBABILITY r²|R|²', gx, 40, '#d4dfe6'); drawGrid(gx, gy, gw, gh, 2);
        polyline(pr.map((p, i) => [gx + i / 199 * gw, gy + gh * (1 - p / top)]), COLORS[0], 1.8);
        label('r →', gx + gw - 20, gy + gh + 15, '#798995');
        setReadout([['ORBITAL', `${n}${SHAPES[l]}`], ['ENERGY', `${(-13.6 / n / n).toFixed(2)} eV`], ['RADIAL NODES', n - l - 1], ['ANGULAR NODES', l]]);
      },
    },
  });
})();
