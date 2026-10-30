import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const artwork = path.join(root, "design/artwork");
const destination = path.join(root, "public/assets");
fs.mkdirSync(destination, { recursive: true });
const fontFiles = fs
  .readdirSync(path.join(root, "design/fonts"))
  .map((f) => path.join(root, "design/fonts", f));
for (const task of JSON.parse(
  fs.readFileSync(path.join(artwork, "tasks.json"), "utf8"),
)) {
  if (process.argv.length > 2 && !process.argv.slice(2).includes(task.output))
    continue;
  if (task.vector) {
    fs.copyFileSync(task.source, path.join(destination, task.output + ".svg"));
  } else {
    const nativePng = path.join(
      root,
      "design/exports/figma-png",
      task.output + ".png",
    );
    const nativeOverlay = path.join(artwork, task.output + "-native.svg");
    const source = fs.existsSync(nativeOverlay)
      ? new Resvg(fs.readFileSync(nativeOverlay), {
          font: { fontFiles, loadSystemFonts: false },
          fitTo: { mode: "zoom", value: 2 },
        })
          .render()
          .asPng()
      : fs.existsSync(nativePng)
        ? fs.readFileSync(nativePng)
        : new Resvg(fs.readFileSync(task.source), {
            font: { fontFiles, loadSystemFonts: false },
            fitTo: { mode: "zoom", value: task.zoom || 1 },
          })
            .render()
            .asPng();
    await sharp(source)
      .webp({ lossless: true, effort: 5 })
      .toFile(path.join(destination, task.output + ".webp"));
  }
  console.log(task.output);
}
