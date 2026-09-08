# Gallery grid: four portraits then a landscape

**Date:** 2026-09-08

## Goal

Arrange the gallery in repeating groups of five: four regular photos in a two-column grid, followed by one landscape photo spanning both columns.

## Design

- Keep the existing `gallery` array and lightbox behavior unchanged.
- During gallery button creation, assign a `landscape` class to each fifth item, using the zero-based condition `index % 5 === 4`.
- Add one CSS rule for `.gallery-grid button.landscape` to span both grid columns.
- Preserve natural image dimensions via the existing `height: auto` rule. The full-width item is landscape because it occupies both columns.
- Bump `script.js` and `style.css` cache query versions in `index.html` when implementing.

## Error handling and verification

- No new input or runtime error paths are introduced.
- Verify the repeating layout visually in a static server and confirm each image still opens at its correct lightbox index.
