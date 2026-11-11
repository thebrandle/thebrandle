# Project pages: data and media

One file per project: `<slug>.json`. `src/ext/projects.py` turns each into `/projects/<slug>/` (its docstring lists the block types).
The list, order and card settings live in `src/data/projects.json`.

Every file carries a `sources` list: each entry names the claims it covers and where they come from (a repo doc, a live page,
a memory note). Nothing goes on a project page that is not covered there. The build stops if a project has no sources.

`type` is one of `own`, `template` or `client`. Only `template` is shown to visitors ("Our template"); the owner asked
(2026-11-11) never to label work as "own product" or "client work", since it is all our work.

## Media (all in `assets/work/` and `assets/mock/`, made by the scripts in `tools/`)

| File | What | Made by |
|---|---|---|
| `assets/mock/cover-<tag>.webp`, `xdr-<tag>-portrait.webp`, `covers.json` | display scenes for the covers and where the screen sits in each | `tools/covers.py` (from the four renders in the vault's `display-mockups/`) |
| `<slug>-w0..wN.webp` | 960x540 screen frames shown on the displays | page captures: `tools/cap.mjs --wide`, then `tools/assets.py` |
| `<slug>-s1..s5.webp` | 16:9 stills, 1440x810 | same |
| `<slug>-p1..p4.webp` | phone captures, 390x844 at 2x, saved 585x1266 | `tools/cap2.mjs`, then `tools/assets.py` |
| `<slug>-wide.mp4/.webp` | MacBook videos for SameTicket and Soznikar | ffmpeg from the vault's `*-macbook-wide.mp4` (1280x720, crf 31, no sound) |
| `og-<slug>.jpg` | 1200x630 share image | `tools/assets.py` |

The tools were run from a scratch folder on 2026-11-11: the folder paths at the top of `assets.py` and the output folders
passed to the capture scripts need pointing at wherever the captures are kept before a re-run. Captures block analytics and
ad scripts, so a capture run never counts as a visit.
