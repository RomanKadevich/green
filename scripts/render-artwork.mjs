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
    const rendered = new Resvg(fs.readFileSync(task.source), {
      font: { fontFiles, loadSystemFonts: false },
      fitTo: { mode: "zoom", value: 1 },
    }).render();
    await sharp(rendered.asPng())
      .webp({ lossless: true, effort: 5 })
      .toFile(path.join(destination, task.output + ".webp"));
  }
  console.log(task.output);
}
