// 30 · Bayes' theorem
(() => {
  const PEOPLE = 1000; const MAX_ROUNDS = 4;
  const bayes = { u: null, rounds: 1, t: 0 };
  const home = (i) => [30 + (i % 40) * 11.2, 52 + Math.floor(i / 40) * 14.6];
  const slot = (j) => [534 + (j % 30) * 13.2, 70 + Math.floor(j / 30) * 13.2];

  function groups() {
    const { prevalence, sensitivity, falsePositive } = state.bayes;
    const sick = bayes.u.map((u) => u[0] < prevalence);
    const positive = bayes.u.map((u, i) => {
      for (let k = 1; k <= bayes.rounds; k += 1) if (!(u[k] < (sick[i] ? sensitivity : falsePositive))) return false;
      return true;
    });
    return { sick, positive };
  }

  defineTheory('bayes', {
    tab: ['Bayes’ theorem', 'Evidence · belief'],
    meta: {
      category: 'PROBABILITY',
      title: 'Why a positive test can still mean you’re fine',
      glyph: '∝',
      description: 'A test catches 90% of cases and false-alarms only 5% of the time. You test positive. If the disease is rare you are still most likely healthy, because healthy people vastly outnumber sick ones.',
      visualTitle: 'Bayes’ theorem · natural frequencies',
      frame: '1,000 PEOPLE',
      caption: 'Orange: actually sick. Blue: healthy. Everyone who tests positive moves right. Retest the positives to watch belief update.',
      equation: '<span class="accent">P(sick | +) = P(+ | sick) · P(sick) / P(+)</span>',
      equationNote: 'P(+) = sensitivity · prevalence + false-positive rate · (1 − prevalence). Each further positive multiplies the odds of being sick by sensitivity ÷ false-positive rate.',
      insight: 'The base rate dominates: at 1% prevalence most positives are false alarms. A second independent positive changes everything—yesterday’s posterior becomes today’s prior. The same arithmetic runs spam filters, diagnosis, and science.',
      boundary: 'Tests are independent given each person’s true state, with fixed sensitivity and false-positive rates. Real repeat tests are often correlated, which weakens the second update.',
    },
    defaults: { prevalence: 0.01, sensitivity: 0.9, falsePositive: 0.05 },
    formats: {
      prevalence: (v) => `${(v * 100).toFixed(1)}% sick`,
      sensitivity: (v) => `${Math.round(v * 100)}% caught`,
      falsePositive: (v) => `${(v * 100).toFixed(1)}% false +`,
    },
    controls: () => `
      ${rangeControl('prevalence', 'How common the disease is', 0.001, 0.2, 0.001, 'Rare', 'Common')}
      ${rangeControl('sensitivity', 'Sensitivity', 0.5, 1, 0.01, '50%', '100%')}
      ${rangeControl('falsePositive', 'False-positive rate', 0.005, 0.2, 0.005, '0.5%', '20%')}
      <div class="readout" id="live-readout"></div>
      <div class="control-actions">
        <button class="action-button" data-action="retest">↻ TEST THE POSITIVES AGAIN</button>
        <button class="action-button secondary" data-action="reroll">⟳ NEW TOWN</button>
        <button class="action-button secondary" data-action="reset">↺ BACK TO ONE TEST</button>
      </div>`,
    sim: {
      resetOn: ['prevalence', 'sensitivity', 'falsePositive'],
      reset() {
        if (!bayes.u) bayes.u = Array.from({ length: PEOPLE }, () => Array.from({ length: MAX_ROUNDS + 1 }, Math.random));
        bayes.rounds = 1; bayes.t = 0;
      },
      reroll() { bayes.u = null; this.reset(); },
      retest() { if (bayes.rounds < MAX_ROUNDS) { bayes.rounds += 1; bayes.t = 0; } },
      tick(dt) { bayes.t = Math.min(1, bayes.t + dt / 1.6); },
      draw() {
        const { sick, positive } = groups(); const e = 1 - (1 - bayes.t) ** 3;
        const order = [...positive.keys()].filter((i) => positive[i]).sort((a, b) => sick[b] - sick[a]);
        const slotOf = new Map(order.map((i, j) => [i, j]));
        label('TOWN OF 1,000', 30, 34, '#d4dfe6');
        label(`TESTED POSITIVE ${bayes.rounds > 1 ? `${bayes.rounds} TIMES IN A ROW` : ''}`, 534, 50, '#d4dfe6');
        for (let i = 0; i < PEOPLE; i += 1) {
          const [hx, hy] = home(i); let x = hx; let y = hy; let alpha = 1 - 0.65 * e;
          if (positive[i]) { const [sx, sy] = slot(slotOf.get(i)); x = hx + (sx - hx) * e; y = hy + (sy - hy) * e; alpha = 1; }
          ctx.globalAlpha = alpha; ctx.fillStyle = sick[i] ? COLORS[1] : '#77a9ff';
          ctx.beginPath(); ctx.arc(x, y, positive[i] ? 3.6 : 3, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1;
        const tp = order.filter((i) => sick[i]).length; const fp = order.length - tp;
        const { prevalence: p, sensitivity: s, falsePositive: f } = state.bayes;
        const odds = p / (1 - p) * (s / f) ** bayes.rounds; const exact = odds / (1 + odds);
        const y0 = 370;
        label(`${order.length} positives: ${tp} sick, ${fp} healthy`, 534, y0, '#a9b6c0', 10);
        label(`counted   P(sick | +) = ${tp} / ${order.length || 1} = ${order.length ? (tp / order.length * 100).toFixed(1) : '0.0'}%`, 534, y0 + 22, COLORS[1], 10);
        label(`Bayes     P(sick | +) = ${(exact * 100).toFixed(1)}%`, 534, y0 + 42, COLORS[0], 10);
        label(`before testing: ${(p * 100).toFixed(1)}%`, 534, y0 + 62, '#798995');
        setReadout([['TESTS IN A ROW', bayes.rounds], ['POSITIVES', order.length], ['ACTUALLY SICK', tp], ['P(SICK | +)', `${(exact * 100).toFixed(1)}%`]]);
      },
    },
  });
})();
