// Wires the registry from core.js to the page: nav, content panels, controls, and the animation loop.
(() => {
  const controls = document.querySelector('#controls-content');
  const nav = document.querySelector('.theory-nav');
  const keys = Object.keys(theories);
  const number = (key) => String(keys.indexOf(key) + 1).padStart(2, '0');

  nav.innerHTML = keys.map((key) => {
    const { wave, tab: [title, subtitle] } = theories[key];
    return `${wave ? `<div class="nav-wave">${wave}</div>` : ''}<button class="theory-tab" type="button" data-theory="${key}" aria-pressed="false">
      <span class="tab-number">${number(key)}</span>
      <span class="tab-copy"><strong>${title}</strong><small>${subtitle}</small></span>
      <span class="tab-arrow" aria-hidden="true">↗</span>
    </button>`;
  }).join('');
  document.querySelector('#theory-count').textContent = number(keys.at(-1));
  const tabs = [...nav.querySelectorAll('.theory-tab')];

  function renderContent() {
    const t = theories[state.theory].meta;
    document.querySelector('#theory-category').textContent = t.category;
    document.querySelector('#experiment-number').textContent = `EXPERIMENT ${number(state.theory)}`;
    document.querySelector('#theory-title').textContent = t.title;
    document.querySelector('#theory-description').textContent = t.description;
    document.querySelector('#visual-title').textContent = t.visualTitle;
    document.querySelector('#frame-tag').textContent = t.frame;
    document.querySelector('#visual-caption-text').textContent = t.caption;
    document.querySelector('#heading-glyph').textContent = t.glyph;
    document.querySelector('#equation-content').innerHTML = t.equation;
    document.querySelector('#equation-note').textContent = t.equationNote;
    document.querySelector('#insight-content').textContent = t.insight;
    document.querySelector('#boundary-content').textContent = t.boundary;
    controls.innerHTML = theories[state.theory].controls();
    canvas.style.cursor = sims[state.theory].pick ? 'crosshair' : '';
    tabs.forEach((tab) => {
      const selected = tab.dataset.theory === state.theory;
      tab.classList.toggle('active', selected);
      tab.setAttribute('aria-pressed', String(selected));
    });
    resizeCanvas();
    draw();
  }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(320, Math.round(rect.width * ratio));
    const height = Math.round((rect.width * 460 / 960) * ratio);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    ctx.setTransform(width / 960, 0, 0, height / 460, 0, 0);
  }

  function draw() {
    ctx.clearRect(0, 0, 960, 460);
    sims[state.theory].draw();
  }

  function updateControl(input) {
    const value = Number(input.value);
    const key = input.dataset.control;
    state[state.theory][key] = value;
    input.style.setProperty('--range-progress', `${(value - Number(input.min)) / (Number(input.max) - Number(input.min)) * 100}%`);
    const label = document.querySelector(`#value-${key}`);
    if (label) label.textContent = formats[key](value);
    if (sims[state.theory].resetOn?.includes(key)) sims[state.theory].reset();
    draw();
  }

  tabs.forEach((tab) => tab.addEventListener('click', () => {
    state.theory = tab.dataset.theory;
    renderContent();
  }));

  controls.addEventListener('input', (event) => {
    if (event.target.matches('input[type="range"]')) updateControl(event.target);
  });
  controls.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const { action } = button.dataset;
    if (action === 'pause') {
      state.paused = !state.paused;
      button.textContent = state.paused ? '▶ PLAY' : '❚❚ PAUSE';
    } else if (sims[state.theory][action]) { sims[state.theory][action](); draw(); }
  });

  canvas.addEventListener('click', (event) => {
    if (!sims[state.theory].pick) return;
    const rect = canvas.getBoundingClientRect();
    sims[state.theory].pick((event.clientX - rect.left) / rect.width * 960, (event.clientY - rect.top) / rect.height * 460);
    draw();
  });

  let lastFrame = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - lastFrame) / 1000);
    lastFrame = now;
    const sim = sims[state.theory];
    if (sim.tick && !state.paused) { sim.tick(dt); draw(); }
    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', () => { resizeCanvas(); draw(); });
  Object.values(sims).forEach((sim) => sim.reset?.());
  state.theory = keys[0];
  renderContent();
  requestAnimationFrame(frame);
})();
