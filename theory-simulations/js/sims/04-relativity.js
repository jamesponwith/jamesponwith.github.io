// 04 · Special relativity
(() => {
  const rel = { t: 0 };

  defineTheory('relativity', {
    wave: 'WAVE 02 · THE BIG IDEAS',
    tab: ['Special relativity', 'Time · the speed of light'],
    meta: {
      category: 'SPECIAL RELATIVITY',
      title: 'Moving clocks run slow',
      glyph: 'γ',
      description: 'Einstein’s light clock: if light moves at the same speed for every observer, a moving clock’s light has farther to travel—so its ticks stretch out.',
      visualTitle: 'Light clocks · rest vs moving',
      frame: 'YOUR FRAME',
      caption: 'One tick = one round trip of light between mirrors. Same clock, same light, different elapsed time.',
      equation: '<span class="accent">Δt = γ Δτ</span>, γ = 1 / √(1 − v²/c²)',
      equationNote: 'Δτ is the proper time read on the moving clock; Δt is the time you measure; c is identical for both observers.',
      insight: 'Below 0.3c the effect is a few percent. Past 0.9c it dominates: at 0.99c the moving clock ticks once for every seven of yours. GPS satellites correct for this (and for gravity’s opposite effect) every day.',
      boundary: 'Special relativity only: flat spacetime, constant velocity. The moving clock wraps across the screen for display; acceleration and gravitational time dilation are not modeled.',
    },
    defaults: { beta: 0.8 },
    formats: {
      beta: (v) => `${v.toFixed(2)} c`,
    },
    controls: () => `
      ${rangeControl('beta', 'Clock speed v', 0, 0.99, 0.01, 'At rest', 'Near c')}
      <div class="readout" id="live-readout"></div>${playControls()}`,
    sim: {
      reset() { rel.t = 0; },
      tick(dt) { rel.t += dt; },
      draw() {
        const C = 240; const L = 110; const beta = state.relativity.beta; const gamma = 1 / Math.sqrt(1 - beta * beta);
        const tri = (d) => { const m = ((d % (2 * L)) + 2 * L) % (2 * L); return m < L ? m : 2 * L - m; };
        const restTicks = Math.floor(C * rel.t / (2 * L)); const movingTicks = Math.floor(C * rel.t / gamma / (2 * L));
        const clock = (cx, top, h, color) => {
          ctx.fillStyle = '#9fb3c2'; ctx.fillRect(cx - 28, top - 3, 56, 3); ctx.fillRect(cx - 28, top + L, 56, 3);
          ctx.strokeStyle = 'rgba(128, 153, 172, .2)'; ctx.lineWidth = 1; ctx.strokeRect(cx - 28, top - 3, 56, L + 6);
          drawStar(cx, top + L - h, 5, color);
        };
        // rest clock + gamma curve
        label('CLOCK AT REST · BESIDE YOU', 26, 36, '#d4dfe6');
        label(`TICKS ${restTicks}`, 26, 56, COLORS[0]);
        polyline([[200, 62], [200, 172]], 'rgba(101, 224, 208, .25)');
        clock(200, 62, tri(C * rel.t), COLORS[0]);
        const gx = 560; const gw = 350; const gy = 44; const gh = 150; const gMax = 7.2;
        drawGrid(gx, gy, gw, gh, 3);
        label('γ  vs  v/c', gx, gy - 8);
        polyline(Array.from({ length: 100 }, (_, i) => { const b = i / 99 * 0.99; return [gx + b * gw, gy + gh * (1 - (1 / Math.sqrt(1 - b * b) - 1) / (gMax - 1))]; }), COLORS[1], 1.6);
        drawStar(gx + beta * gw, gy + gh * (1 - (gamma - 1) / (gMax - 1)), 4.5, '#fff1c4');
        label('0', gx, gy + gh + 14, '#596a78'); label('c', gx + gw - 4, gy + gh + 14, '#596a78');
        label('γ=1', gx - 30, gy + gh + 3, '#596a78'); label('7', gx - 14, gy + 6, '#596a78');
        polyline([[26, 214], [934, 214]], 'rgba(135, 157, 172, .19)', 1);
        // moving clock with its zigzag light path
        const top = 262; const v = beta * C; const offset = (v * rel.t + 380) % 760; const cx = 100 + offset;
        label('SAME CLOCK MOVING AT v · AS YOU SEE IT', 26, 240, '#d4dfe6');
        label(`TICKS ${movingTicks}`, 26, 258, COLORS[2]);
        if (v > 0) {
          const span = offset / v;
          polyline(Array.from({ length: 220 }, (_, i) => { const s = rel.t - span * (1 - i / 219); return [cx - v * (rel.t - s), top + L - tri(C * s / gamma)]; }), 'rgba(188, 155, 255, .45)', 1.3);
        }
        clock(cx, top, tri(C * rel.t / gamma), COLORS[2]);
        polyline([[100, 410], [860, 410]], 'rgba(135, 157, 172, .19)', 1);
        label(`v = ${beta.toFixed(2)}c →`, 790, 428);
        setReadout([['LORENTZ γ', gamma.toFixed(3)], ['YOUR TICKS', restTicks], ['MOVING TICKS', movingTicks], ['MOVING RATE', `${(100 / gamma).toFixed(1)}%`]]);
      },
    },
  });
})();
