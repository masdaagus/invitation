# AGENTS.md

Static single-page wedding invitation (Indonesian, `lang="id"`). No build, no deps, no tests, not a git repo. Three root files: `index.html`, `style.css`, `script.js`.

## Run / verify

- Serve statically (e.g. `python3 -m http.server`) or open `index.html` directly.
- No lint/test commands exist. Verify by loading the page and checking console errors + animations.

## Repo-specific gotchas

- Cache-busting: `index.html` references `style.css?v=11b` and `script.js?v=10`. **Bump the `?v=` query whenever you edit CSS or JS**, else browsers serve stale assets.
- Images are hotlinked from a public Supabase bucket (`https://xsabqeuxmokwcthokfwz.supabase.co/.../wedding/salindri/NFL*.webp`). No local assets except `fonts/Candlefish.*`. Don't try to "fix" broken local image paths — there are none.
- `script.js` carousel clones 3 real images (duplicated in HTML) and snaps back via `setTimeout` after the 2.25s transition — the duplicate `<img>` tags in `index.html` are intentional, do not dedupe.
- Guest name comes from `?guest=` or `?kepada=` query params, fallback `'Salindri'`.
- Comments in `script.js` reference Elementor/WeddingPress effect parameters (slide durations, ken burns, motion_fx) — preserve those magic numbers; they mirror a reference design.
- Wedding date hardcoded: `2026-10-03T06:30:00+07:00` in `script.js` and "SABTU, 3 OKTOBER 2026" in HTML — update both if it changes.
