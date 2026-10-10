// 34 · Doppler effect
(() => {
  const C = 120; const F0 = 2.5; const LAMBDA0 = 550; const Y = 230; const OBS = [[50, 'behind'], [910, 'ahead']];
  const dop = {};
  const sourceX = () => 80 + ((state.doppler.mach * C * dop.t) % 800);
  const lightSwatch = (nm) => (nm >= 380 && nm <= 750 ? `rgb(${wavelengthRGB(nm).join(', ')})` : '#3a4350');

  defineTheory('doppler', {
    wave: 'WAVE 07 · WAVES, ORBITS & OPTIMIZATION',
    tab: ['Doppler effect', 'Pitch · redshift'],
    meta: {
      category: 'WAVES',
      title: 'Why the siren changes pitch',
      glyph: 'f′',
      description: 'A moving source crowds the waves ahead of it and stretches those behind. Past the speed of sound the waves pile into a shock cone—a sonic boom. With light, the same effect reveals how fast stars and galaxies move.',
      visualTitle: 'Moving source · wavefronts and Mach cone',
      frame: 'SOUND',
      caption: 'Each ring is one wave crest, expanding from where it was emitted. Observers flash when a crest arrives.',
      equation: '<span class="accent">f′ = f / (1 ∓ v/c)</span> · light: f′ = f √((1 ± β) / (1 ∓ β))',
      equationNote: 'Upper signs for an approaching source. Sound needs a medium, so the formula depends on who moves; light does not, so the relativistic version depends only on relative speed β = v/c.',
      insight: 'Ahead, crests bunch up and the pitch rises; behind, they spread and it falls. At Mach 1 the crests pile into a wall; beyond it they form a cone with sin θ = 1/M. Redshifted galaxy light is how Hubble found the universe expanding (experiment 09).',
      boundary: 'A point source moving in a straight line through still air, in 2-D. The light swatches show what a 550 nm source would look like at the same fraction of light speed—real speeds of sound and light differ by a factor of a million.',
    },
    defaults: { mach: 0.6 },
    formats: {
      mach: (v) => `Mach ${v.toFixed(2)}`,
    },
    controls: () => `
      ${rangeControl('mach', 'Source speed v / c', 0, 1.6, 0.05, 'At rest', 'Supersonic')}
      <div class="readout" id="live-readout"></div>${playControls()}`,
    sim: {
      resetOn: ['mach'],
      reset() { Object.assign(dop, { t: 0, emissions: [], nextEmit: 0, hits: [[], []], flash: [0, 0] }); },
      tick(dt) {
        const before = dop.t; dop.t += dt;
        while (dop.nextEmit <= dop.t) {
          const t0 = dop.nextEmit; const saved = dop.t; dop.t = t0;
          dop.emissions.push({ x: sourceX(), t0 }); dop.t = saved; dop.nextEmit += 1 / F0;
        }
        dop.emissions = dop.emissions.filter((e) => C * (dop.t - e.t0) < 1100);
        OBS.forEach(([ox], k) => {
          dop.flash[k] = Math.max(0, dop.flash[k] - dt * 4);
          for (const e of dop.emissions) {
            const d = Math.abs(ox - e.x);
            if (C * (before - e.t0) < d && C * (dop.t - e.t0) >= d) { dop.flash[k] = 1; dop.hits[k].push(dop.t); if (dop.hits[k].length > 6) dop.hits[k].shift(); }
          }
        });
      },
      draw() {
        const M = state.doppler.mach; const sx = sourceX();
        polyline([[20, Y], [940, Y]], 'rgba(135, 157, 172, .15)', 1, [3, 6]);
        for (const e of dop.emissions) {
          const r = C * (dop.t - e.t0); const fade = Math.max(0, 1 - r / 1100);
          ctx.beginPath(); ctx.arc(e.x, Y, r, 0, Math.PI * 2); ctx.strokeStyle = `rgba(101, 224, 208, ${0.75 * fade})`; ctx.lineWidth = 1.4; ctx.stroke();
        }
        if (M > 1) {
          const th = Math.asin(1 / M);
          [-1, 1].forEach((s) => polyline([[sx, Y], [sx - 700 * Math.cos(th), Y + s * 700 * Math.sin(th)]], 'rgba(255, 178, 107, .8)', 2));
          label('shock cone · sonic boom', Math.max(20, sx - 190), Y - 120, COLORS[1]);
        }
        drawStar(sx, Y, 7, COLORS[1]);
        // what each observer measures, from the interval between arriving crests
        const heard = dop.hits.map((h) => (h.length > 2 ? (h.length - 1) / (h.at(-1) - h[0]) : null));
        OBS.forEach(([ox, name], k) => {
          ctx.beginPath(); ctx.arc(ox, Y, 9 + 6 * dop.flash[k], 0, Math.PI * 2); ctx.fillStyle = `rgba(255, 241, 196, ${0.25 + 0.75 * dop.flash[k]})`; ctx.fill();
          label(name, ox - 18, Y + 34, '#d4dfe6'); label(heard[k] ? `${heard[k].toFixed(2)} Hz` : '…', ox - 22, Y + 50, COLORS[0]);
        });
        label(`source emits ${F0} Hz`, sx - 40, Y - 16, COLORS[1], 8);
        // the same speed as a fraction of light speed
        if (M < 1) {
          const ahead = LAMBDA0 * Math.sqrt((1 - M) / (1 + M)); const behind = LAMBDA0 * Math.sqrt((1 + M) / (1 - M));
          label('IF THIS WERE LIGHT (β = v/c):', 20, 400, '#d4dfe6');
          [[20, behind, 'behind'], [200, LAMBDA0, 'emitted'], [380, ahead, 'ahead']].forEach(([x, nm, name]) => {
            ctx.fillStyle = lightSwatch(nm); ctx.fillRect(x, 410, 28, 28);
            label(`${name} ${nm > 2000 ? '>2 μm' : `${nm.toFixed(0)} nm`}${nm < 380 ? ' UV' : nm > 750 ? ' IR' : ''}`, x + 36, 428, '#a9b6c0');
          });
        }
        const front = M < 1 ? `${(F0 / (1 - M)).toFixed(2)} Hz` : 'cone (all at once)';
        setReadout([['SPEED', `Mach ${M.toFixed(2)}`], ['AHEAD (theory)', front], ['BEHIND (theory)', `${(F0 / (1 + M)).toFixed(2)} Hz`], ['MACH ANGLE', M > 1 ? `${(Math.asin(1 / M) * 180 / Math.PI).toFixed(1)}°` : '—']]);
      },
    },
  });
})();
