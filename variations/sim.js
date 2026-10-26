// Resiliency engine simulation, shared by the home page and the control-plane variation.
// Usage: ResiliencySim(root, { colors, onStatus }) where root contains:
//   <canvas>, <ol data-log>, <button data-cell="0|1|2">, and [data-m="rps|mttr|cells"] metric slots.
// Returns { cells, inject }.
window.ResiliencySim = function (root, opts = {}) {
  const C = Object.assign({ accent: '#5ee6ff', ok: '#3ddc84', warn: '#ffb020', bad: '#ff4d5e', line2: '#263140', muted: '#7f8b9a', dim: '#4f5a68', text: '#dfe6ee', panel: '#0c1016' }, opts.colors);
  const onStatus = opts.onStatus || (() => {});
  const RM = matchMedia('(prefers-reduced-motion: reduce)');
  const cv = root.querySelector('canvas'), ctx = cv.getContext('2d'), logEl = root.querySelector('[data-log]');
  const m = k => root.querySelector(`[data-m="${k}"]`) || {};
  const pad = n => String(n).padStart(2, '0');
  const now = () => { const d = new Date(); return pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()); };
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };

  const cells = ['a', 'b', 'c'].map(z => ({ z: 'us-east-1' + z, s: 'e1' + z, state: 'ok', p99: 40, tgt: 40, hist: [], flash: 0, queue: 0, x: 0, y: 0, w: 0, h: 0 }));
  cells.forEach(c => { for (let i = 0; i < 48; i++) c.hist.push(38 + Math.random() * 8); });
  let W = 0, H = 0, dpr = 1, parts = [], simT = 0, events = [], incident = false, nextAuto = 7, breachAt = 0, spawnAcc = 0, histAcc = 0, rpsShown = 0, arrivals = 0, rpsAcc = 0;
  const injectBtns = [...root.querySelectorAll('[data-cell]')];

  function log(msg, cls) {
    const li = el('li'), t = el('time', '', now()); li.append(t, el('span', cls || '', msg));
    logEl.append(li); while (logEl.children.length > 60) logEl.firstChild.remove();
    logEl.scrollTop = logEl.scrollHeight;
  }
  ['$ tail -f resiliency-engine.log|mut', 'watching 3 cells · us-east-1a 1b 1c|mut', 'health 3/3 · mode=observe|ok'].forEach(l => { const [msg, c] = l.split('|'); log(msg, c); });

  function layout() {
    const r = cv.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1);
    W = r.width; H = r.height; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const cw = Math.max(132, Math.min(240, W * .36)), gap = 12, top = 18, ch = (H - top * 2 - gap * 2) / 3;
    cells.forEach((c, i) => { c.w = cw; c.h = ch; c.x = W - cw - 16; c.y = top + i * (ch + gap); });
    parts = []; draw();
  }
  function route(p, x0, y0, ci, dur) {
    const c = cells[ci], x3 = c.x, y3 = c.y + c.h / 2 + (Math.random() - .5) * c.h * .55;
    const mx = Math.abs(x3 - x0) < 40 ? x0 - 70 - Math.random() * 40 : x0 + (x3 - x0) * (.45 + Math.random() * .2);
    Object.assign(p, { x0, y0, x1: mx, y1: y0, x2: mx, y2: y3, x3, y3, ci, t: 0, dur });
  }
  function pos(p, t) { const u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
    return [a * p.x0 + b * p.x1 + c * p.x2 + d * p.x3, a * p.y0 + b * p.y1 + c * p.y2 + d * p.y3]; }
  function pick() {
    const live = cells.map((c, i) => c.state === 'drained' ? -1 : i).filter(i => i >= 0);
    return live[(Math.random() * live.length) | 0];
  }
  const at = (dt, fn) => events.push({ t: simT + dt, fn });

  function inject(i) {
    if (incident) { log('change freeze: incident in progress — ignored', 'mut'); return; }
    incident = true; breachAt = simT; const c = cells[i]; c.state = 'breach'; c.tgt = 780 + Math.random() * 300;
    injectBtns.forEach(b => b.disabled = true);
    onStatus('warn', c.s + ' degraded · mitigating');
    log(c.s + ' p99 breach — degraded', 'bad');
    at(.9, () => log('quorum 3/3 · mode=action', 'acc'));
    at(1.35, () => {
      c.state = 'drained';
      const others = cells.filter(o => o !== c).map(o => o.s).join(', ');
      log('route53: ' + c.s + ' → ' + others, 'warn');
      // reroute in-flight auths still headed to the bad cell
      parts.forEach(p => { if (p.ci === i) { const [x, y] = pos(p, p.t); route(p, x, y, pick(), .55 + Math.random() * .35); p.rr = true; } });
      // drain queued auths to healthy cells — nothing is dropped
      if (!RM.matches) for (let k = 0; k < Math.min(c.queue, 60); k++) { const p = { rr: true }; route(p, c.x, c.y + c.h / 2 + (Math.random() - .5) * c.h * .5, pick(), .6 + Math.random() * .5); p.t = -k * .012; parts.push(p); }
      c.queue = 0;
      m('mttr').textContent = (simT - breachAt).toFixed(1) + 's';
      m('cells').textContent = '2/3';
      onStatus('warn', 'rerouted · ' + c.s + ' drained');
    });
    at(1.8, () => log('0 auths dropped', 'ok'));
    at(4.6, () => { c.tgt = 42; log(c.s + ' probes passing · half-open', 'mut'); });
    at(7, () => {
      c.state = 'ok'; incident = false; injectBtns.forEach(b => b.disabled = false);
      m('cells').textContent = '3/3'; log(c.s + ' healthy — restored', 'ok'); onStatus('ok');
      nextAuto = simT + 10 + Math.random() * 8;
    });
  }
  injectBtns.forEach(b => b.addEventListener('click', () => inject(+b.dataset.cell)));
  function hit(e) { const r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    return cells.findIndex(c => x >= c.x && x <= c.x + c.w && y >= c.y && y <= c.y + c.h); }
  cv.addEventListener('click', e => { const i = hit(e); if (i >= 0) inject(i); });
  cv.addEventListener('mousemove', e => { cv.style.cursor = hit(e) >= 0 && !incident ? 'pointer' : 'default'; });

  function step(dt) {
    simT += dt;
    events = events.filter(ev => ev.t <= simT ? (ev.fn(), false) : true);
    if (!incident && !RM.matches && simT > nextAuto) inject((Math.random() * 3) | 0);
    // spawn
    if (!RM.matches) {
      spawnAcc += dt * (120 + Math.sin(simT * .7) * 25);
      while (spawnAcc >= 1) { spawnAcc--; const p = { rr: false }; route(p, -4, H * (.08 + Math.random() * .84), pick(), 1.3 + Math.random() * .8); parts.push(p); }
    }
    // advance
    for (let k = parts.length - 1; k >= 0; k--) {
      const p = parts[k]; p.t += dt / p.dur;
      if (p.t >= 1) {
        const c = cells[p.ci];
        if (c.state === 'breach') c.queue++; else { c.flash = Math.min(1, c.flash + .08); arrivals++; }
        parts[k] = parts[parts.length - 1]; parts.pop();
      }
    }
    // cell metrics
    histAcc += dt; rpsAcc += dt;
    cells.forEach(c => {
      c.p99 += (c.tgt + (Math.random() - .5) * (c.tgt > 100 ? 120 : 6) - c.p99) * Math.min(1, dt * 4);
      c.flash *= Math.pow(.02, dt);
    });
    if (histAcc > .12) { histAcc = 0; cells.forEach(c => { c.hist.push(c.p99); c.hist.shift(); }); }
    if (rpsAcc > .5) {
      const base = RM.matches ? 120 : arrivals / rpsAcc; arrivals = 0; rpsAcc = 0;
      rpsShown = rpsShown ? rpsShown * .6 + base * .4 : base;
      m('rps').textContent = Math.round(rpsShown * 211).toLocaleString('en-US');
    }
  }

  function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  const FONT = '500 11px "JetBrains Mono", ui-monospace, monospace', FONTB = '700 13px "JetBrains Mono", ui-monospace, monospace';
  const colorOf = c => c.state === 'breach' ? C.bad : c.state === 'drained' ? C.warn : C.ok;

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    // ingress rail
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'transparent'); g.addColorStop(.5, C.accent); g.addColorStop(1, 'transparent');
    ctx.fillStyle = g; ctx.globalAlpha = .5; ctx.fillRect(0, 0, 2, H); ctx.globalAlpha = 1;
    ctx.font = FONT; ctx.fillStyle = C.dim; ctx.fillText('ingress · card auths', 12, 18);
    ctx.fillText('route53 weighted', 12, H - 10);
    // guide curves (weights)
    cells.forEach(c => {
      const w = c.state === 'drained' ? 0 : 1;
      ctx.strokeStyle = c.state === 'breach' ? C.bad : C.accent; ctx.globalAlpha = RM.matches ? .35 * w : .07 * w; ctx.lineWidth = RM.matches ? 6 : 14;
      if (!w) return;
      const ty = c.y + c.h / 2, mx = c.x * .5;
      ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.bezierCurveTo(mx, H / 2, mx, ty, c.x, ty); ctx.stroke();
    });
    ctx.globalAlpha = 1;
    // particles, batched by color
    if (parts.length) {
      ctx.lineWidth = 1.6; ctx.lineCap = 'round';
      for (const [col, test] of [[C.accent, p => !p.rr && cells[p.ci].state !== 'breach'], [C.bad, p => !p.rr && cells[p.ci].state === 'breach'], [C.ok, p => p.rr]]) {
        ctx.strokeStyle = col; ctx.beginPath();
        for (const p of parts) {
          if (p.t < 0 || !test(p)) continue;
          const [x, y] = pos(p, p.t), [px, py] = pos(p, Math.max(0, p.t - .045));
          ctx.moveTo(px, py); ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }
    // cells
    cells.forEach(c => {
      const col = colorOf(c);
      rr(c.x, c.y, c.w, c.h, 9);
      ctx.fillStyle = C.panel; ctx.fill();
      if (c.flash > .02 || c.state !== 'ok') { ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = c.state !== 'ok' ? 22 : 18 * c.flash; ctx.strokeStyle = col; ctx.globalAlpha = c.state !== 'ok' ? .9 : .25 + c.flash * .5; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore(); }
      else { ctx.strokeStyle = C.line2; ctx.lineWidth = 1; ctx.stroke(); }
      const ix = c.x + 12;
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(ix + 3, c.y + 16, 3.5, 0, 7); ctx.fill();
      ctx.font = FONTB; ctx.fillStyle = C.text; ctx.fillText(c.z, ix + 13, c.y + 20);
      ctx.font = FONT; ctx.fillStyle = col;
      const st = c.state === 'ok' ? 'HEALTHY' : c.state === 'breach' ? 'BREACH' : 'DRAINED';
      if (c.w > 170) { ctx.textAlign = 'right'; ctx.fillText(st, c.x + c.w - 12, c.y + 20); ctx.textAlign = 'left'; }
      ctx.fillStyle = c.p99 > 100 ? C.bad : C.muted;
      ctx.fillText('p99 ' + Math.round(c.p99) + 'ms' + (c.queue ? ' · q ' + c.queue : ''), ix, c.y + 38);
      // sparkline
      const sx = ix, sw = c.w - 24, sy = c.y + c.h - 10, sh = Math.max(10, c.h - 56);
      if (sh > 8) {
        ctx.beginPath();
        c.hist.forEach((v, k) => { const x = sx + k / (c.hist.length - 1) * sw, y = sy - Math.min(1, Math.log10(v / 20) / 1.8) * sh; k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
        ctx.strokeStyle = col; ctx.globalAlpha = .8; ctx.lineWidth = 1.2; ctx.stroke(); ctx.globalAlpha = 1;
      }
    });
  }

  let running = false, last = 0, visible = true;
  function frame(t) {
    if (!running) return;
    const dt = Math.min(.05, (t - (last || t)) / 1000); last = t;
    step(dt); draw();
    requestAnimationFrame(frame);
  }
  function sync() {
    const want = visible && !document.hidden;
    if (want && !running) { running = true; last = 0; requestAnimationFrame(frame); }
    else if (!want) running = false;
  }
  new IntersectionObserver(es => { visible = es[0].isIntersecting; sync(); }).observe(cv);
  document.addEventListener('visibilitychange', sync);
  new ResizeObserver(layout).observe(cv);
  RM.addEventListener?.('change', () => { parts = []; });
  document.fonts?.ready.then(draw);

  return { cells, inject };
};
