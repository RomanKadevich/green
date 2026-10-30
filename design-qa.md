# GREEN — visual QA

final result: pass

Current revision: semantic HTML, CSS and vanilla JavaScript. React has been removed from source and dependencies. Campaign start is **20.11.2026** at all breakpoints, per the user's latest instruction.

## Source and comparison setup

Figma file `xyQjX9MoJGpxK1UVIACjQ3`: desktop `3745:11534`, tablet `3797:16623`, mobile `3831:4012`.

| Layout | Reference | Current browser capture | Compared pixels |
| --- | --- | --- | --- |
| Desktop | `design/references/desktop.jpg` | `design/qa/desktop.jpg` | 1920 × 5419 |
| Tablet | `design/references/tablet.jpg` | `design/qa/tablet.jpg` | 1024 × 4589 |
| Mobile | `design/references/mobile.jpg` | `design/qa/mobile.jpg` | 430 × 4639 |

Real in-app-browser renders were captured in same-origin iframes at the exact source widths. Only surrounding whitespace was cropped; content was not resized. State: `?motion=off`, first prize/product card, first FAQ open, menu closed. Side-by-side files under `design/qa/` place source on the left and implementation on the right. Captures and large working exports are local, intentionally excluded from Git.

## Measured geometry and typography

All three source-sized pages have the intended height and no horizontal overflow. DOM measurements are recorded in `design/measurements/browser-layout-validation.json`.

| Surface | Desktop | Tablet | Mobile |
| --- | --- | --- | --- |
| Page height | 5419 | 4589 | 4639 |
| Header height | 110 | 100 | 100 |
| Hero height | 1418 | 1016 | 971 |
| Prizes height | 1170 | 982 | 846 |
| Products height | 714 | 691 | 650 |
| FAQ panel x/y/width/height | 220 / 3640 / 1480 / 828 | 15 / 2949 / 974 / 833 | 15 / 2643 / 400 / 828 |
| Footer y / height | 4848 / 571 | 4037 / 552 | 3701 / 938 |

The Figma browser inspector was used to verify header, hero, rules, prizes, products, FAQ, winners and footer dimensions. Evidence: `figma-blocks-ui.json`. The source header shadow is x=0, y=3, blur=20, spread=0, color `#062D18`; it is reproduced in CSS. Desktop winners retain their source 21 px center offset; tablet FAQ retains its 10 px left offset. The mobile source outline and radius are preserved.

Digits 1/2/3 were selected individually in Figma: Roboto Bold 700, 70 px, 100% line-height, cap-height trim, 44.83 × 55.17 layer bounds. Step containers use 30 px internal gaps and widths 439 / 266 / 395. Inspector evidence is saved in `figma-steps-typography-ui.json` and `figma-steps-spacing-ui.json`. Source glyph baselines and line breaks were preserved rather than substituting the trimmed Figma layer box for a browser line box.

Artwork, card dimensions, counts, heading positions, FAQ padding, colors and footer copy were compared side by side at native sizes. Font families use the actual local Fontsource Variable names. FAQ weights follow the source; earlier optical weight overrides were removed. No actionable P0/P1/P2 visual discrepancy remains in the compared initial states.

## Motion

`figma-motion-ui.json` records all authored transitions read from the Figma browser inspector: linear Smart Animate, 1 ms after-delays, 2000/1000/100 ms transition durations. Original exported storyboard geometry and opacity are compiled into `src/motion-data.json`:

- Intro: **5003 ms** (frames 1 → 2 → 2.1 → 2.2).
- Loop: **12107 ms** (2.2 → 3 → 4 → 5 → 6 → 7 → 8 → 2.2).
- Four falling flakes and four sparkle tracks, with original per-frame geometry/opacity. No invented rotation or shrink effect.
- Missing flakes fade out, reset while transparent and reappear. Web Animations API uses one shared clock and linear interpolation.
- The same sequence is adapted to the prizes area and responsive layouts, as requested. Tablet/mobile prize snowfall is an intentional addition beyond the static reference.

Presentation and inline preview were opened through the in-app browser. The supplied presentation flow starts at a large wrapper containing the layouts/storyboard; it did not play the nested-frame chain as an isolated full-screen animation. Timing/geometry fidelity therefore comes from the inspected authored transition chain and original exported frames, not an assumed playback speed. No source file edits were needed.

Browser validation checked source-time 5003 ms and 13007 ms: expected translations and opacity (including 0, 0.5 and 1) were present in both hero and prizes. Live movement and recurring reappearance were observed beyond the introduction. Reduced-motion handling is enforced before creating animations and reacts to preference changes. `?motion=off` and `?motion-time=<ms>` support repeatable visual inspection.

## Functional and build checks

- Mobile menu opens, closes and navigates to products; its expanded state updates correctly.
- Logo navigation returns to the page start with sticky-header clearance, keeping the campaign date visible.
- Both carousels rotate forward/backward in mobile and desktop browser tests.
- Native FAQ opens/closes; opening another answer closes the previous one.
- Winners, account and legal dialogs open/close with the intended current placeholder content.
- All 47 image elements in the production page loaded successfully. No missing images in any reference-size render.
- Fresh production-preview browser console: no errors.
- `node --check src/main.js`: passed.
- `npm run check:assets`: **28 lossless VP8L WebP assets**, passed.
- `npm run build`: passed. Output is static HTML/CSS/JS, with a 14.35 kB JS bundle before gzip.
- `npm run test:sites`: **4 passed**. Existing packaging compatibility is retained; no hosted deployment was made.

## Explicit differences and integration inputs

Start date 20.11.2026 intentionally replaces 16.11 in tablet/mobile source frames. Other source end-date and footer-copy inconsistencies remain at the user's request. Minor P3 differences from Figma/browser font antialiasing may remain; this is not a zero-difference pixel claim.

Cabinet URL, official legal/rules documents, direct app-store destinations and draw results require organizer input. These are visible placeholders/search destinations, not working organizer services. Only the first FAQ answer is supplied source copy; other answers are preliminary interface text. Authentication and participation backend are outside the current landing implementation.
