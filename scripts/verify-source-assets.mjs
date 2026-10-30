// Optional provenance audit: requires the original, local Figma working exports.
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import sharp from "sharp";
import { Resvg } from "@resvg/resvg-js";

const fonts = fs
  .readdirSync("design/fonts")
  .map((f) => path.resolve("design/fonts", f));
const tasks = JSON.parse(fs.readFileSync("design/artwork/tasks.json", "utf8"));
if (!tasks.some((t) => t.output === "mobile-menu-snow"))
  tasks.push({
    output: "mobile-menu-snow",
    source: "design/artwork/mobile-menu-snow.svg",
    zoom: 2,
  });
const results = [];
for (const task of tasks.filter((t) => !t.vector)) {
  const native = `design/exports/figma-png/${task.output}.png`;
  const overlay = `design/artwork/${task.output}-native.svg`;
  const source = fs.existsSync(overlay)
    ? overlay
    : fs.existsSync(native)
      ? native
      : task.source;
  const png = source.endsWith(".png")
    ? fs.readFileSync(source)
    : new Resvg(fs.readFileSync(source), {
        font: { fontFiles: fonts, loadSystemFonts: false },
        fitTo: { mode: "zoom", value: source === overlay ? 2 : task.zoom || 1 },
      })
        .render()
        .asPng();
  const asset = `public/assets/${task.output}.webp`;
  const expected = await sharp(png)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const actual = await sharp(asset)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  assert.deepEqual(actual.info, expected.info, `${task.output}: dimensions`);
  for (let i = 0; i < actual.data.length; i += 4) {
    assert.equal(
      actual.data[i + 3],
      expected.data[i + 3],
      `${task.output}: alpha at ${i / 4}`,
    );
    if (expected.data[i + 3])
      for (let c = 0; c < 3; c++)
        assert.equal(
          actual.data[i + c],
          expected.data[i + c],
          `${task.output}: colour at ${i / 4}`,
        );
  }
  results.push({
    asset,
    method:
      source === native
        ? "Figma native PNG → lossless WebP"
        : source === overlay
          ? "Figma native photo/background + original vector decoration → lossless WebP"
          : "Original Figma SVG fragment → lossless WebP",
    width: actual.info.width,
    height: actual.info.height,
    sha256: crypto
      .createHash("sha256")
      .update(fs.readFileSync(asset))
      .digest("hex"),
    decodedPixelCheck: "exact for alpha and all nontransparent RGB pixels",
  });
}
fs.writeFileSync(
  "design/measurements/asset-provenance.json",
  JSON.stringify(results, null, 2) + "\n",
);
console.log(
  `Verified source pixels for ${results.length} lossless WebP assets.`,
);
