// Shared state, registry, and drawing helpers. Loaded first; each file in js/sims/ calls defineTheory().
const canvas = document.querySelector('#simulation-canvas');
const ctx = canvas.getContext('2d');
const state = { theory: null, paused: window.matchMedia('(prefers-reduced-motion: reduce)').matches };
const theories = {}; // key → { wave, tab, meta, controls }
const sims = {};     // key → { draw, tick?, reset?, resetOn?, pick?, ...actions }
const formats = {};  // control id → value formatter

function defineTheory(key, { wave, tab, meta, defaults, formats: f, controls, sim }) {
  theories[key] = { wave, tab, meta, controls };
  state[key] = defaults;
  Object.assign(formats, f);
  sims[key] = sim;
}

// Offscreen grid shared by the field simulations (Turing, Maxwell, Ising); each redraws it fully per frame.
const FIELD_W = 240; const FIELD_H = 115;
const fieldCanvas = document.createElement('canvas'); fieldCanvas.width = FIELD_W; fieldCanvas.height = FIELD_H;
const fieldCtx = fieldCanvas.getContext('2d'); const fieldImage = fieldCtx.createImageData(FIELD_W, FIELD_H);

const COLORS = ['#65e0d0', '#ffb26b', '#bc9bff'];
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const sci = (v) => { const e = Math.floor(Math.log10(v)); return `${(v / 10 ** e).toFixed(1)} × 10${String(e).replace(/./g, (c) => SUP[c])}`; };
const mix = (c1, c2, f) => `rgb(${c1.map((c, i) => Math.round(c + (c2[i] - c) * f)).join(', ')})`;
const gauss = () => Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());

// approximate visible color for a wavelength in nm (Bruton)
function wavelengthRGB(nm) {
  let r = 0; let g = 0; let b = 0;
  if (nm < 440) { r = (440 - nm) / 60; b = 1; } else if (nm < 490) { g = (nm - 440) / 50; b = 1; } else if (nm < 510) { g = 1; b = (510 - nm) / 20; } else if (nm < 580) { r = (nm - 510) / 70; g = 1; } else if (nm < 645) { r = 1; g = (645 - nm) / 65; } else r = 1;
  const fade = nm < 420 ? 0.3 + 0.7 * (nm - 380) / 40 : nm > 700 ? 0.3 + 0.7 * (750 - nm) / 50 : 1;
  return [r, g, b].map((v) => Math.round(255 * (v * fade) ** 0.8));
}

function label(text, x, y, color = '#81919d', size = 9) {
  ctx.fillStyle = color; ctx.font = `${size}px "DM Mono", monospace`; ctx.fillText(text, x, y);
}
function polyline(points, color, width = 1.5, dash = []) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.setLineDash(dash);
  ctx.beginPath(); points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); ctx.restore();
}
function drawGrid(x, y, width, height, rows = 4) {
  ctx.save();
  ctx.strokeStyle = 'rgba(128, 153, 172, .12)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= rows; i += 1) {
    const gy = y + height * i / rows;
    ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x + width, gy); ctx.stroke();
  }
  ctx.restore();
}
function drawStar(x, y, radius, color) {
  ctx.save(); ctx.shadowColor = color; ctx.shadowBlur = 16; ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}

function rangeControl(id, label, min, max, step, left, right) {
  const value = state[state.theory][id];
  const formatted = formats[id](value);
  const progress = ((Number(value) - Number(min)) / (Number(max) - Number(min))) * 100;
  return `<label class="control-group" for="control-${id}">
    <span class="control-label"><span>${label}</span><span class="control-value" id="value-${id}">${formatted}</span></span>
    <input id="control-${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}" data-control="${id}" style="--range-progress:${progress}%" />
    <span class="range-ends"><span>${left}</span><span>${right}</span></span>
  </label>`;
}
function playControls(extra = '') {
  return `<div class="control-actions">
    <button class="action-button" data-action="pause">${state.paused ? '▶ PLAY' : '❚❚ PAUSE'}</button>${extra}
    <button class="action-button secondary" data-action="reset">↺ RESET</button>
  </div>`;
}
function setReadout(rows) {
  const el = document.querySelector('#live-readout');
  if (el) el.innerHTML = rows.map(([k, v]) => `<div class="readout-row"><span>${k}</span><strong>${v}</strong></div>`).join('');
}
