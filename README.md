# jamesponwith.github.io

Portfolio and writing of James Ponwith, Principal Software Engineer (resiliency systems for real-time card payments). Live at **https://jamesponwith.github.io**.

Static HTML on GitHub Pages: no framework, no build step for the home page.

## Layout

| Path | What it is |
|---|---|
| `index.html` | Home page (Editorial design). Renders every project from `variations/data.js`. |
| `variations/data.js` | **The content.** Bio, stats and every project card. Edit this, not the HTML. |
| `variations/sim.js` | The live resiliency-engine simulation, shared by the home page and Control Plane. |
| `variations/` | Alternate home designs: `control-plane/`, `constellation/`, `os/`, plus a chooser at `variations/index.html`. |
| `classic.html` | The previous home page, frozen. It keeps its own copy of the content. |
| `tennis-part{1,2,3}.html`, `llm-router-lessons.html`, `flywheel-writeup.html` | Long-form writeups. |
| `card-auth-saga.html`, `aegis.html`, `rocketlab.html` | Project case studies. |
| `dora.html` | Live DORA metrics, read from each repo's `docs/dora.json`. |
| `SeniorProject.html`, `posenetdemo.html` | Older project pages: Tello drone writeup and the live PoseNet demo. |
| `theory-simulations/` | 53 interactive physics and math simulations; see its own README. |
| `assets/css/article.css` | Shared stylesheet for every writeup, case study and project page (same tokens as the home page). |
| `assets/` | Images, demo videos and GIFs, résumé, Tailwind CSS (`classic.html` only). |
| `scripts/check_site.py` | Link and asset check, run in CI (`.github/workflows/check.yml`). |

## Preview locally

```sh
python3 -m http.server 8000
```

Open **http://127.0.0.1:8000/**, not `localhost`: some browsers force HTTPS for `localhost`, which this server can't answer, and the page loads blank. Opening `index.html` from disk doesn't work either, because `data.js` uses root-absolute paths.

## Add or edit a project

Add an entry to `projects` in `variations/data.js`:

```js
{
  id: 'my-project', title: 'My Project', subtitle: 'One line',
  kind: 'Simulation', tags: ['tech'], year: 2026,        // tags: tech | finance | sport
  blurb: 'Problem, what was built, and a number.',
  stack: ['Go', 'AWS'],
  media: { type: 'video', src: '/assets/demos/x.mp4', poster: '/assets/demos/x-poster.jpg' }, // or { type: 'img', src } or null
  term: ['$ some command', 'output line'],               // shown as a terminal when media is null
  links: [{ label: 'GitHub', href: 'https://github.com/...' }]
}
```

- Paths are root-absolute (`/assets/...`).
- Prefer MP4 with a poster over GIF; keep home-page assets under 5 MB.
- `featured: true` puts a project in the big spread with the simulation. Only Resiliency Engine uses it.

## Checks

```sh
python3 scripts/check_site.py   # every local href/src/poster (root pages, variations/, theory-simulations/) and every path in data.js resolves; home-page assets under 5 MB
```

## Tailwind (`classic.html` only)

Only `classic.html` still uses the prebuilt Tailwind file. After changing its classes:

```sh
npx tailwindcss@3 -c tailwind.config.js -i assets/css/tailwind.src.css -o assets/css/tailwind.css --minify
```

## Credits

Started in 2017 from Hassan Ali's [Studorlio](https://github.com/helfi92/studorlio) template (MIT, see `LICENSE`); since rewritten.
