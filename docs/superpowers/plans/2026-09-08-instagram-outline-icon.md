# Instagram Outline Icon Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the solid Instagram icons on both wedding-profile links with outline icons.

**Architecture:** Change only the inline SVG markup in `index.html`. Both existing `.social-link` elements retain their URLs, accessible labels, and handles; the shared CSS size rule remains unchanged.

**Tech Stack:** HTML, inline SVG, CSS already present in the static page.

## Global Constraints

- Do not add dependencies, files, JavaScript, or CSS.
- Keep both Instagram links, `aria-label` values, and handle text unchanged.
- Use `currentColor` so the existing link color controls the SVG stroke.
- No cache-key bump is required because `style.css` and `script.js` are unchanged.
- Verify manually by loading `index.html` and checking browser console errors.

---

### Task 1: Replace profile Instagram SVGs

**Files:**
- Modify: `index.html:79-81`
- Modify: `index.html:98-100`
- Test: Manual browser verification of `index.html`

**Interfaces:**
- Consumes: `.social-link svg { width: 13px; height: 13px; }` from `style.css:293`.
- Produces: Two inline outline Instagram SVGs using `viewBox="0 0 24 24"`, `stroke="currentColor"`, `fill="none"`, and `stroke-width="2"`.

- [ ] **Step 1: Replace the first SVG**

Replace the SVG inside `a[aria-label="Instagram Masda"]` with:

```html
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
  <rect x="3" y="3" width="18" height="18" rx="5"></rect>
  <circle cx="12" cy="12" r="4"></circle>
  <circle cx="17.5" cy="6.5" r=".75" fill="currentColor" stroke="none"></circle>
</svg>
```

- [ ] **Step 2: Replace the second SVG**

Replace the SVG inside `a[aria-label="Instagram Salindri"]` with the identical SVG:

```html
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
  <rect x="3" y="3" width="18" height="18" rx="5"></rect>
  <circle cx="12" cy="12" r="4"></circle>
  <circle cx="17.5" cy="6.5" r=".75" fill="currentColor" stroke="none"></circle>
</svg>
```

- [ ] **Step 3: Verify static markup**

Run:

```bash
rg -n 'fill="currentColor"|stroke="currentColor"|aria-label="Instagram' index.html
```

Expected: both profile SVGs have `stroke="currentColor"`; their existing `aria-label` values remain; no old full-path social icon remains.

- [ ] **Step 4: Verify in browser**

Run a static server:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`, confirm both Instagram marks are outlined, open their intended profiles in a new tab, and confirm no browser-console errors. Stop the server after verification.
