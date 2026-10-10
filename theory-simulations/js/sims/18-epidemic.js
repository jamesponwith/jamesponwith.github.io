// 18 · Epidemics
(() => {
  const ARENA = { x: 20, y: 40, w: 570, h: 380 }; const EPI_N = 600; const EPI_R = 8; const EPI_DAYS = 7;
  const epi = {};

  defineTheory('epidemic', {
    tab: ['Epidemics', 'Contagion · herd immunity'],
    meta: {
      category: 'EPIDEMIOLOGY',
      title: 'How outbreaks grow and stop',
      glyph: 'R₀',
      description: 'Each infection sparks either more than one new case or fewer. That single number, R, decides whether an outbreak explodes or fizzles—and immunity pushes it down.',
      visualTitle: 'Agent-based SIR model · 600 people',
      frame: 'POPULATION',
      caption: 'Blue: susceptible. Orange: infected. Cyan: recovered. Gray: vaccinated. Right: the epidemic curve.',
      equation: '<span class="accent">dS/dt = −βSI/N</span>, dI/dt = βSI/N − γI, dR/dt = γI',
      equationNote: 'R₀ = β/γ in the well-mixed version. An outbreak shrinks once the susceptible fraction falls below 1/R₀.',
      insight: 'Herd immunity: once 1 − 1/R₀ of people are immune, each case replaces itself less than once. Distancing cuts contacts; vaccination removes susceptibles. Both flatten the curve, and enough of either stops it.',
      boundary: 'Random-walk agents in a box, a fixed infectious period, lifelong immunity. Real epidemics add households, networks, incubation, and behavior that shifts as cases rise.',
    },
    defaults: { transmit: 0.6, distancing: 0, vaccinated: 0 },
    formats: {
      transmit: (v) => `${v.toFixed(2)} /s`,
      distancing: (v) => `${Math.round(v * 100)}% stay put`,
      vaccinated: (v) => `${Math.round(v * 100)}%`,
    },
    controls: () => `
      ${rangeControl('transmit', 'Transmission β', 0.1, 2, 0.05, 'Mild', 'Contagious')}
      ${rangeControl('distancing', 'Distancing', 0, 0.9, 0.05, 'None', 'Lockdown')}
      ${rangeControl('vaccinated', 'Vaccinated', 0, 0.9, 0.05, 'None', 'Most')}
      <div class="readout" id="live-readout"></div>${playControls()}`,
    sim: {
      resetOn: ['transmit', 'distancing', 'vaccinated'],
      reset() {
        const { distancing, vaccinated } = state.epidemic;
        Object.assign(epi, { x: [], y: [], vx: [], vy: [], status: [], timer: [], caused: [], t: 0, peak: 0, history: [], sample: 0 });
        for (let i = 0; i < EPI_N; i += 1) {
          const a = Math.random() * 2 * Math.PI; const speed = Math.random() < distancing ? 0 : 45;
          epi.x.push(Math.random() * ARENA.w); epi.y.push(Math.random() * ARENA.h);
          epi.vx.push(speed * Math.cos(a)); epi.vy.push(speed * Math.sin(a));
          epi.status.push(Math.random() < vaccinated ? 3 : 0); epi.timer.push(0); epi.caused.push(0);
        }
        let seeded = 0;
        for (let i = 0; i < EPI_N && seeded < 5; i += 1) if (epi.status[i] === 0) { epi.status[i] = 1; seeded += 1; }
        this.record();
      },
      record() {
        const counts = [0, 0, 0, 0]; epi.status.forEach((s) => { counts[s] += 1; });
        epi.history.push([epi.t, ...counts]); epi.peak = Math.max(epi.peak, counts[1]);
      },
      tick(dt) {
        const infected = epi.status.reduce((n, s) => n + (s === 1 ? 1 : 0), 0);
        if (!infected) return;
        epi.t += dt;
        for (let i = 0; i < EPI_N; i += 1) {
          epi.x[i] += epi.vx[i] * dt; epi.y[i] += epi.vy[i] * dt;
          if (epi.x[i] < 0 || epi.x[i] > ARENA.w) { epi.vx[i] = -epi.vx[i]; epi.x[i] = Math.max(0, Math.min(ARENA.w, epi.x[i])); }
          if (epi.y[i] < 0 || epi.y[i] > ARENA.h) { epi.vy[i] = -epi.vy[i]; epi.y[i] = Math.max(0, Math.min(ARENA.h, epi.y[i])); }
        }
        const p = 1 - Math.exp(-state.epidemic.transmit * dt);
        for (let i = 0; i < EPI_N; i += 1) {
          if (epi.status[i] !== 1) continue;
          for (let j = 0; j < EPI_N; j += 1) {
            if (epi.status[j] !== 0) continue;
            const dx = epi.x[i] - epi.x[j]; const dy = epi.y[i] - epi.y[j];
            if (dx * dx + dy * dy < EPI_R * EPI_R && Math.random() < p) { epi.status[j] = 1; epi.timer[j] = 0; epi.caused[i] += 1; }
          }
          epi.timer[i] += dt; if (epi.timer[i] > EPI_DAYS) epi.status[i] = 2;
        }
        epi.sample += dt; if (epi.sample > 0.2) { epi.sample = 0; this.record(); }
      },
      draw() {
        const colors = ['#77a9ff', COLORS[1], COLORS[0], '#4a5866'];
        ctx.strokeStyle = 'rgba(135, 157, 172, .3)'; ctx.strokeRect(ARENA.x, ARENA.y, ARENA.w, ARENA.h);
        for (let i = 0; i < EPI_N; i += 1) {
          ctx.fillStyle = colors[epi.status[i]];
          ctx.beginPath(); ctx.arc(ARENA.x + epi.x[i], ARENA.y + epi.y[i], epi.status[i] === 1 ? 3.2 : 2.3, 0, Math.PI * 2); ctx.fill();
        }
        label('TOWN · 600 people', ARENA.x, 30, '#d4dfe6');
        // stacked epidemic curve
        const gx = 630; const gw = 290; const gy = 60; const gh = 240; const tMax = Math.max(40, epi.t);
        label('EPIDEMIC CURVE', gx, 40, '#d4dfe6');
        const stack = (rowFn, color) => {
          ctx.beginPath(); ctx.moveTo(gx, gy + gh);
          epi.history.forEach((h) => ctx.lineTo(gx + h[0] / tMax * gw, gy + gh * (1 - rowFn(h) / EPI_N)));
          ctx.lineTo(gx + epi.history.at(-1)[0] / tMax * gw, gy + gh); ctx.closePath(); ctx.fillStyle = color; ctx.fill();
        };
        stack((h) => h[1] + h[2] + h[3] + h[4], 'rgba(74, 88, 102, .6)');
        stack((h) => h[1] + h[2] + h[3], 'rgba(119, 169, 255, .45)');
        stack((h) => h[2] + h[3], 'rgba(101, 224, 208, .55)');
        stack((h) => h[2], 'rgba(255, 178, 107, .9)');
        ctx.strokeStyle = '#26313d'; ctx.strokeRect(gx, gy, gw, gh);
        label('time →', gx + gw - 40, gy + gh + 15, '#798995');
        const last = epi.history.at(-1); const recovered = epi.caused.filter((_, i) => epi.status[i] === 2);
        const rMeasured = recovered.length ? recovered.reduce((s, c) => s + c, 0) / recovered.length : 0;
        const ever = last[2] + last[3];
        label(`ever infected ${(ever / EPI_N * 100).toFixed(0)}%   ·   peak ${epi.peak}`, gx, gy + gh + 42, '#a9b6c0');
        label(last[2] ? 'outbreak ongoing' : 'outbreak over', gx, gy + gh + 62, last[2] ? COLORS[1] : COLORS[0]);
        setReadout([['INFECTED NOW', last[2]], ['PEAK', epi.peak], ['EVER INFECTED', `${(ever / EPI_N * 100).toFixed(0)}%`], ['CASES PER CASE', rMeasured.toFixed(2)]]);
      },
    },
  });
})();
