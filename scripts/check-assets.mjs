import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const directory = path.resolve("public/assets");
const files = fs
  .readdirSync(directory)
  .filter((file) => file.endsWith(".webp"));
assert(files.length > 20, "Campaign artwork is missing");
for (const file of files) {
  const data = fs.readFileSync(path.join(directory, file));
  assert.equal(
    data.toString("ascii", 0, 4),
    "RIFF",
    `${file}: invalid container`,
  );
  assert.equal(data.toString("ascii", 8, 12), "WEBP", `${file}: invalid WebP`);
  const chunks = [];
  for (let offset = 12; offset + 8 <= data.length; ) {
    chunks.push(data.toString("ascii", offset, offset + 4));
    const size = data.readUInt32LE(offset + 4);
    offset += 8 + size + (size % 2);
  }
  assert(chunks.includes("VP8L"), `${file}: expected lossless WebP`);
  assert(!chunks.includes("VP8 "), `${file}: lossy encoding is not allowed`);
  const metadata = await sharp(data).metadata();
  assert(metadata.width > 0 && metadata.height > 0, `${file}: empty image`);
}
console.log(`Verified ${files.length} lossless WebP assets.`);
