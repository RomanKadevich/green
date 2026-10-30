# GREEN — visual QA

final result: passed

## Reference and capture setup

Source of truth: Figma file `xyQjX9MoJGpxK1UVIACjQ3`, desktop `3745:11534`, tablet `3797:16623`, mobile `3831:4012`.

| Layout | Reference | Implementation | CSS viewport / compared pixels |
| --- | --- | --- | --- |
| Desktop | `design/references/desktop.jpg` | `design/qa/desktop.jpg` | 1920 × 5419 |
| Tablet | `design/references/tablet.jpg` | `design/qa/tablet.jpg` | 1024 × 4589 |
| Mobile | `design/references/mobile.jpg` | `design/qa/mobile.jpg` | 430 × 4639 |

Captures came from the in-app browser, using a same-origin iframe at each exact reference width. The surrounding browser viewport was wider for tablet/mobile; screenshots were cropped to the iframe's bounds without resizing. One CSS pixel corresponds to one pixel in the compared files. These are real browser renders, not screenshots generated from application code.

State: first prize/product slide, first FAQ item expanded, menu closed, `?motion=off`. Gold snowflakes are frozen at their starting positions for static comparison. The additional falling snow in the prizes block is an explicitly requested extension beyond the static mobile/tablet references.

Full comparisons place source on the left and implementation on the right:

- `design/qa/desktop-comparison.jpg`
- `design/qa/tablet-comparison.jpg`
- `design/qa/mobile-comparison.jpg`

Focused comparisons: `desktop-rules-comparison.png`, `desktop-cards-comparison.png`, `tablet-rules-comparison.png`, `mobile-faq-comparison.png`, all under `design/qa/`. Local capture files are intentionally excluded from Git.

## Iteration history

1. **[P1, fixed] Incorrect font-family alias.** Fontsource exposes `Roboto Variable`, `Manrope Variable` and `Montserrat Variable`. Initial positioned copy used unregistered family names. Mapped source typography to the actual locally loaded families, then captured again.
2. **[P2, fixed] Browser scrollbar reduced the usable frame width.** Hidden scrollbars preserve the full 1920/1024/430 CSS width without disabling scrolling. Final desktop/tablet/mobile images use the intended frame widths.
3. **[P2, fixed] FAQ rows and panel offsets.** Matched the mobile panel to 828 px, corrected the expanded row padding and the tablet panel's 10 px horizontal offset. Tablet footer begins at y=4037; mobile at y=3701; desktop at y=4848.
4. **[P2, fixed] Prize counts and labels.** Repositioned each count using its original exported baseline; used separate dimensions for Milka and the two certificates. See the final desktop card comparison.
5. **[P2, fixed] Section and winners spacing.** Corrected section heights and the desktop winners button's 21 px horizontal offset. Matched tablet heading baselines and preserved the tablet hero's additional 10 px source background strip.
6. **[P2, fixed] Reference mobile outline and menu icon.** Preserved the source 4 px outline/40 px radius and used the original exported menu icon. Mobile menu opening, closing and navigation were verified in the visible browser.
7. **[P2, fixed] Preview did not consistently refresh edits on this Windows path.** Enabled polling for the development watcher, restarted the preview and confirmed updated computed styles before taking final captures.

## Required fidelity surfaces

- **Typography:** source font families, sizes, source baselines, line breaks and spacing are retained for positioned campaign/footer copy. HTML headings, labels, counts and FAQ match the compared layouts. The Roboto FAQ weight was optically adjusted to the supplied render; minor rasterization differences between Figma exports and the Windows browser remain P3.
- **Spacing:** reference image dimensions, hero composition, rule box, card sizes, section positions, FAQ borders and footer positions were compared at 1:1. No remaining layout overflow was observed at the three reference widths.
- **Colors/tokens:** background `#19643B`, footer `#134F2E`, gold `#FFE19B`, FAQ border `#F7CD97`, active FAQ/button `#18944C` are taken from the source. Artwork retains its original gradients and colors.
- **Image quality:** original Figma raster/vector layers were used. All 24 served raster assets have a `VP8L` lossless WebP bitstream; there are no lossy `VP8 ` assets. Logos/icons use original exported SVG. No generated replacement artwork is used.
- **Copy:** the user explicitly requested preserving differences between breakpoint dates/copy. This includes the inconsistent footer dates and mobile loyalty-card wording. Only the first FAQ answer is source copy; remaining answers and unavailable service/document states are preliminary interface content, not official rules.

## Browser and functional checks

- Desktop navigation and carousel next/previous: passed.
- Mobile menu open/close, navigation to products and product slide next/previous: passed.
- FAQ expand/collapse and answer visibility: passed.
- Winners modal open/close: passed.
- Browser image completion check: no missing or undecoded images.
- Browser console error check: no errors returned.
- Snowfall: changing CSS transforms and opacity were observed over time; both hero and prizes use falling/fading original gold artwork. Reduced-motion CSS disables movement. Precise Figma transition durations were not available from the read-only prototype; current durations are 8–12.2 seconds per particle.
- `npm run check:assets`: 24 lossless WebP files passed.
- `npm run build`: passed.
- `npm run test:sites`: 4 checks passed.

## Remaining follow-up polish / integration inputs

- **P3:** Figma export vs browser font antialiasing and subtle decorative text effects can differ at individual pixels. This report does not claim a zero-difference pixel comparison.
- **P3:** Snowfall timing can be tuned further against an approved recording or explicit timing specification.
- Cabinet URL, official rules/legal files, direct mobile-app URLs and real draw results must be supplied by the organizer. The current frontend does not implement authentication or a participation backend.

No actionable P0/P1/P2 visual findings remain in the compared initial states. The remaining notes above are explicitly outside that visual pass or minor refinement items.
