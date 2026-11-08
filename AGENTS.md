# GREEN project requirements

- Latest user correction: keep markup and positioning easy to understand. Use normal flow, Flex/Grid and named CSS component classes. No per-letter coordinates, generated CSS polygons, repeated breakpoint copies of entire blocks, or inline position styles. Only overlapping banner art and decorative particles need absolute positioning. Decorative campaign badges may be small standalone original SVGs, like logos; structural cards and rules panels stay HTML/CSS. The user permits complete prize-card images if needed to fix mobile counters; prefer simple HTML/CSS when reliable.

- Repository: `https://github.com/RomanKadevich/green.git`.
- Stack: plain static HTML, CSS and vanilla JavaScript. No React, UI frameworks, npm dependencies, bundlers or generated deployment wrappers. The user explicitly requested a minimal, clean project.
- Runtime files: `index.html`, `css/style.css`, `js/main.js`, `assets/`. Keep fonts self-hosted with their licences.
- Source Figma file: `xyQjX9MoJGpxK1UVIACjQ3`. Desktop `3745:11534` (1920 × 5419), tablet `3797:16623` (1024 × 4589), mobile `3831:4012` (430 × 4639).
- Match dimensions, spacing, typography and image crops. After visual changes, make two fresh complete browser-to-Figma passes at all three reference widths before declaring the visual audit complete.
- Campaign start: **20.11.2026** everywhere. Preserve the other differing source dates/copy until instructed otherwise.
- Use original Figma artwork. Raster assets must be lossless WebP; original logos and icons remain SVG. Circe Bold is unavailable: keep original mobile-menu SVG word outlines inside accessible HTML controls.
- Snow in hero and prizes follows the supplied 2026-10-31 Figma recording: straight falls, overlapping staggered entrances, fading while still moving; repeat each flake independently without a group pause (latest user correction). No rotation or shrinking. Respect reduced motion. `?motion=off` freezes reference positions; `?motion-time=ms` freezes the revised animation.
- Keep exports, reports, temporary screenshots and asset-preparation tools outside the project. The local reference archive is the sibling directory `../green-reference/`.
- Run a static local preview when checking changes. Do not deploy to hosting without a request.
- Header/footer logos and both cabinet controls temporarily link to https://www.green-market.by/ (latest user instruction). The three footer legal links are removed. Official rules and app-store destinations require organizer-provided URLs. Do not invent authentication or present placeholder documents as official.

- User correction: never flatten complete sections, panels, cards, frames, circles, gradients or other CSS UI into raster/SVG exports. Build structure in HTML/CSS; export only individual photo/brand/decorative assets at appropriate sizes and reuse them across breakpoints. Minimize delivered image weight. Remove the mobile device-like outer border and rounded page corners, including the menu.

- FAQ expands/collapses smoothly in 220 ms; whole question is a pointer button. Carousels slide horizontally in 320 ms and loop in both directions. Respect reduced motion. Fit all six original menu flakes within short portrait viewports without phone borders.
- The user has requested GitHub Pages publication and reports it configured. Push the verified completed changes to main to trigger the existing deployment.

- 2026-11-08: use the name «Сладкий сезон больших призов» throughout page text and metadata. Both cabinet anchors point to https://www.green-market.by/login; header/footer logos keep the GREEN homepage URL.
- Canonical and social URLs use https://igra.green-market.by/. Provided OG artwork is assets/og-cover-prizes.webp (lossless, 1280×910).
- Include all 8 source prizes and all 6 source brands in the looping carousels; keep photos separate from HTML/CSS frames.
- Production uses Hoster ISPmanager at vh167.hoster.by, account h219396, site root /www/igra.green-market.by. production.yml uses FTPS with a pinned CA certificate; a dedicated jailed account h219396_green_actions and GitHub secret GREEN_FTP_PASSWORD are required. Gate deployment on repository variable GREEN_DEPLOY_ENABLED=true. Credential creation/transfer and first production publication still await the owner confirmation. Do not report production published until verified on that domain.

- 2026-11-08 motion correction: the newer supplied MOV and archived Figma intro transitions take precedence over the old recording offset. Title/glints fade in over 2000 ms; date/win badge fade from 2001–3001 ms; falling tracks enter at 3002/5003/7004 ms. Start the shared clock after hero images decode, preserve independent continuous snow repeats and reduced motion.
- Product FAQ answer links to the exact organizer PDF at assets/spisok-tovarov.pdf, opening in a new tab.

- Smooth snow velocity across keyframes using monotone cubic interpolation. Keep the source positions/times and independent linear opacity animation unchanged; no new stops or overshoot.

- Latest user adjustment: shorten banner intro opacity transitions by 20%: title/glints 1–1601 ms, date/win badge 1601–2401 ms. Snow entrance, fall and fade timings remain unchanged.

- FAQ source is now the organizer file «Вопрос-ответ.docx», with 7 complete entries in document order. Replace old draft questions/answers; remove editorial «(ссылка)» markers. Product list remains the provided PDF. Official rules PDF is still pending organizer path/URL.
- OG preview uses og-cover-prizes.webp with the updated campaign name in the large heading and fine print. Preserve original QR, logos, packaging, car and contact details.
