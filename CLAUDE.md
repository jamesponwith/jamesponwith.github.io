# Project Instructions for AI Agents

This file provides instructions and context for AI coding agents working on this project.

<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal hash:7510c1e2 -->
## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` to see full workflow context and commands.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```

### Rules

- Use `bd` for ALL task tracking — do NOT use TodoWrite, TaskCreate, or markdown TODO lists
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files

**Architecture in one line:** issues live in a local Dolt DB; sync uses `refs/dolt/data` on your git remote; `.beads/issues.jsonl` is a passive export. See https://github.com/gastownhall/beads/blob/main/docs/SYNC_CONCEPTS.md for details and anti-patterns.

## Session Completion

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
<!-- END BEADS INTEGRATION -->


## Build & Test

No build step: static HTML on GitHub Pages, deployed from `master`.

```bash
python3 -m http.server 8000      # from the repo root; open http://127.0.0.1:8000/ (not localhost)
python3 scripts/check_site.py    # run before pushing; CI runs it too (.github/workflows/check.yml)
node --check variations/data.js  # after editing the content file
```

Opening pages from disk doesn't work: `variations/data.js` and the writeups use root-absolute paths.

Tailwind is only used by `classic.html`. After changing its classes:

```bash
npx tailwindcss@3 -c tailwind.config.js -i assets/css/tailwind.src.css -o assets/css/tailwind.css --minify
```

## Architecture Overview

- `index.html`: the home page. Renders bio, stats and every project card from `variations/data.js`.
- `variations/data.js`: the single source of content (`window.SITE`). `variations/sim.js` is the live resiliency-engine simulation shared by the home page and `variations/control-plane/`.
- `variations/`: alternate home designs (`control-plane/`, `constellation/`, `os/`) plus a chooser at `variations/index.html`.
- `classic.html`: the previous home page, frozen, with its own copy of the content.
- Writeups and project pages (`tennis-part{1,2,3}.html`, `llm-router-lessons.html`, `flywheel-writeup.html`, `card-auth-saga.html`, `aegis.html`, `rocketlab.html`, `SeniorProject.html`, `posenetdemo.html`) share `assets/css/article.css`. `dora.html` reads each repo's `docs/dora.json`.
- `theory-simulations/`: a self-contained atlas of 53 simulations (plain scripts, no dependencies); see its README.
- `scripts/check_site.py`: stdlib link/asset checker.

## Conventions & Patterns

- Edit content in `variations/data.js`, not in HTML. Paths there are root-absolute (`/assets/...`).
- Don't edit `classic.html` except to remove dead content.
- New writeups: the two `<head>` lines from the top of `assets/css/article.css`, then `<link rel="stylesheet" href="/assets/css/article.css">`, and `<a class="back" href="/">← James Ponwith</a>` as the first thing in `<body>`. Plain semantic HTML with its classes (`.meta`, `.tldr`, `.series`, `.next`, `.foot`); no Tailwind.
- Keep each page's canonical, description and og/twitter metadata.
- Prefer MP4 with a poster over GIF; home-page assets stay under 5 MB (the check enforces it).
- Pin CDN scripts to exact versions with SRI `integrity` hashes.
- No invented numbers: every figure on the site comes from the project's own repo.
