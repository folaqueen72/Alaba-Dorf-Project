// Builds web/public/logo.png from the clean badge artwork.
// Run: node scripts/extract-logo.cjs
const path = require("path");
const sharp = require("sharp");

const SRC = path.join(__dirname, "..", "..", "logo-source.png");
const DEST = path.join(__dirname, "..", "public", "logo.png");
const SIZE = 512;

async function main() {
  const circle = Buffer.from(
    `<svg width="${SIZE}" height="${SIZE}"><circle cx="${SIZE / 2}" cy="${SIZE / 2}" r="${SIZE / 2}"/></svg>`
  );
  // Trim the white surround, then mask to a clean disc.
  await sharp(SRC)
    .trim()
    .resize(SIZE, SIZE, { fit: "cover" })
    .composite([{ input: circle, blend: "dest-in" }])
    .png()
    .toFile(DEST);
  console.log("wrote", DEST);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
