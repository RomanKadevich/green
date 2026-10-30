# Prototype Instructions

## GREEN project requirements

- Work in `C:\Work\GlobalProg\2026-Рома-ПромИгры\green`; remote is `https://github.com/RomanKadevich/green.git`.
- Match the supplied Figma file `xyQjX9MoJGpxK1UVIACjQ3`. Desktop: `3745:11534` (1920 × 5419), tablet: `3797:16623` (1024 × 4589), mobile: `3831:4012` (430 × 4639).
- Fidelity of every dimension, margin, image crop and font is a priority. Compare the implementation with the supplied references at their native widths.
- Preserve different dates and copy between the three original layouts until the user explicitly asks to reconcile them.
- Use original Figma artwork. Every served raster asset must be WebP encoded losslessly. Preserve original vectors for logos and small icons.
- Gold snowflakes must fall and fade/melt in the hero and in the prizes block. Respect reduced-motion preferences. `?motion=off` freezes the reference positions for visual QA.
- Keep local previews and do not deploy a hosted Site without a request. Cabinet, official rules, legal documents and store destinations need organizer-provided URLs; do not invent authentication or claim that placeholder documents are official.

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.
