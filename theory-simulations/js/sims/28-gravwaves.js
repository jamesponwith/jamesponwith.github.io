// 28 · Gravitational waves
(() => {
  const GW_DT = 1 / 120; const GW_C = 60; const HIST = 512; const A0 = 26; const A_MERGE = 3.2; const OMEGA0 = 2 * Math.PI * 0.35;
  const gw = { phase: new Float64Array(HIST), amp: new Float64Array(HIST), trace: [] };
  // per-pixel geometry of the field grid is fixed, so precompute radius, angle, and retardation delay
  const cx = FIELD_W / 2; const cy = FIELD_H / 2;
  const geo = Array.from({ length: FIELD_W * FIELD_H }, (_, i) => {
    const dx = (i % FIELD_W) + 0.5 - cx; const dy = Math.floor(i / FIELD_W) + 0.5 - cy; const r = Math.hypot(dx, dy);
    return { r, theta: Math.atan2(dy, dx), lag: Math.round(r / GW_C / GW_DT) };
  });

  function step() {
    const { massRatio: q, chirp } = state.gravwaves;
    if (gw.merged === null) {
      gw.t += GW_DT;
      gw.a = A0 * Math.max(0, 1 - gw.t / chirp) ** 0.25;
      if (gw.a < A_MERGE) { gw.merged = 0; gw.a = A_MERGE; }
      gw.omega = OMEGA0 * (A0 / gw.a) ** 1.5;
      gw.h = (A0 / gw.a) * 4 * q / (1 + q) ** 2;
    } else {
      gw.merged += GW_DT; gw.h *= Math.exp(-GW_DT / 0.18);
    }
    gw.phi += gw.omega * GW_DT; gw.count += 1;
    gw.head = (gw.head + 1) % HIST; gw.phase[gw.head] = gw.phi; gw.amp[gw.head] = gw.h;
    gw.trace.push(gw.h * Math.cos(2 * gw.phi)); if (gw.trace.length > 700) gw.trace.shift();
  }

  defineTheory('gravwaves', {
    wave: 'WAVE 06 · FROM SPACETIME TO ECOSYSTEMS',
    tab: ['Gravitational waves', 'Spacetime · LIGO'],
    meta: {
      category: 'GRAVITATIONAL WAVES',
      title: 'Spacetime has ripples',
      glyph: 'h₊',
      description: 'Einstein predicted (1916) that orbiting masses shake spacetime itself. In 2015 LIGO heard two black holes spiral together—a chirp lasting a fifth of a second, after a 1.3-billion-year journey.',
      visualTitle: 'Binary inspiral · plus-polarized strain',
      frame: 'FACE-ON VIEW',
      caption: 'Color: the stretch and squeeze of space (h₊). Bottom: the signal a distant detector records—the chirp.',
      equation: '<span class="accent">f_GW = 2 f_orb</span>, da/dt = −(64/5) G³m₁m₂(m₁+m₂) / c⁵a³',
      equationNote: 'The waves carry energy away, so the orbit shrinks and speeds up; the signal rises in pitch and strength until the bodies merge and ring down.',
      insight: 'The spiral arms are waves leaving at light speed, two per orbit. LIGO measured a strain near 10⁻²¹—its 4 km arms changed length by about 1/400 of a proton’s width. The 2017 Nobel Prize in Physics followed.',
      boundary: 'Leading-order (quadrupole) inspiral with a schematic merger and ringdown. Time is compressed, the 1/r falloff is softened so distant waves stay visible, and color shows one polarization seen face-on.',
    },
    defaults: { massRatio: 1, chirp: 10 },
    formats: {
      massRatio: (v) => `q = ${v.toFixed(2)}`,
      chirp: (v) => `${v} s to merger`,
    },
    controls: () => `
      ${rangeControl('massRatio', 'Mass ratio m₂/m₁', 0.2, 1, 0.05, 'Unequal', 'Equal')}
      ${rangeControl('chirp', 'Inspiral time', 6, 20, 1, 'Fast', 'Slow')}
      <div class="readout" id="live-readout"></div>${playControls()}`,
    sim: {
      resetOn: ['massRatio', 'chirp'],
      reset() {
        Object.assign(gw, { t: 0, phi: 0, a: A0, omega: OMEGA0, h: 0, merged: null, head: 0, count: 0, carry: 0, trace: [] });
        gw.phase.fill(0); gw.amp.fill(0);
      },
      tick(dt) {
        gw.carry += dt;
        while (gw.carry >= GW_DT) { gw.carry -= GW_DT; step(); }
        if (gw.merged !== null && gw.merged > 3) this.reset();
      },
      draw() {
        const px = fieldImage.data;
        for (let i = 0; i < geo.length; i += 1) {
          const { r, theta, lag } = geo[i]; const o = i * 4; let v = 0;
          if (lag < gw.count && lag < HIST) {
            const k = (gw.head - lag + HIST) % HIST;
            v = Math.tanh(gw.amp[k] * Math.cos(2 * (gw.phase[k] - theta)) * 6 / Math.sqrt(Math.max(r, 3)));
          }
          const a = Math.abs(v);
          if (v > 0) { px[o] = 12 + 89 * a; px[o + 1] = 17 + 207 * a; px[o + 2] = 24 + 184 * a; } else { px[o] = 12 + 176 * a; px[o + 1] = 17 + 138 * a; px[o + 2] = 24 + 231 * a; }
          px[o + 3] = 255;
        }
        fieldCtx.putImageData(fieldImage, 0, 0);
        ctx.imageSmoothingEnabled = true; ctx.drawImage(fieldCanvas, 0, 0, 960, 460);
        const q = state.gravwaves.massRatio; const scale = 4;
        if (gw.merged === null) {
          [[gw.a * q / (1 + q), 0, 9], [gw.a / (1 + q), Math.PI, 9 * Math.sqrt(q)]].forEach(([r, off, size]) => {
            ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(480 + r * scale * Math.cos(gw.phi + off), 230 + r * scale * Math.sin(gw.phi + off), size, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = 'rgba(255, 178, 107, .8)'; ctx.lineWidth = 1.5; ctx.stroke();
          });
        } else {
          ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(480, 230, 13, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = `rgba(255, 241, 196, ${0.4 + 0.6 * Math.exp(-gw.merged * 2)})`; ctx.lineWidth = 2; ctx.stroke();
        }
        // detector strip: the chirp
        ctx.fillStyle = 'rgba(9, 13, 18, .82)'; ctx.fillRect(0, 386, 960, 74);
        label('DETECTOR STRAIN h(t)', 18, 402, '#d4dfe6');
        const peak = Math.max(1, ...gw.trace.map(Math.abs));
        polyline(gw.trace.map((h, i) => [180 + i / 700 * 760, 424 - h / peak * 26]), COLORS[1], 1.4);
        const fGw = gw.omega / Math.PI;
        setReadout([['SEPARATION', `${gw.a.toFixed(1)} units`], ['WAVE FREQUENCY', `${fGw.toFixed(2)} Hz (sim)`], ['TO MERGER', gw.merged === null ? `${Math.max(0, state.gravwaves.chirp - gw.t).toFixed(1)} s` : '—'], ['STAGE', gw.merged === null ? (gw.a > 10 ? 'inspiral' : 'late inspiral · chirp') : 'merged · ringdown']]);
      },
    },
  });
})();
