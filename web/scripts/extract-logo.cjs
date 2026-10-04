// Extracts the circular Alaba Dorf badge from the outlet photo
// into a transparent 512px PNG logo. Run: node scripts/extract-logo.mjs
const path = require("path");
const sharp = require("sharp");

const SRC = path.join(__dirname, "..", "..", "IMG_20261004_205605.jpg");
const DEST = path.join(__dirname, "..", "public", "logo.png");

async function main() {
  const img = sharp(SRC);
  const meta = await img.metadata();
  console.log("source:", meta.width, "x", meta.height);

  // The badge fills most of the frame; crop inside the grey fabric rim.
  const side = 2700;
  const left = 190;
  const top = 695;
  console.log("crop:", { left, top, side });

  const SIZE = 512;
  const circle = Buffer.from(
    `<svg width="${SIZE}" height="${SIZE}"><circle cx="${SIZE / 2}" cy="${SIZE / 2}" r="${SIZE / 2}"/></svg>`
  );

  await sharp(SRC)
    .extract({ left, top, width: side, height: side })
    .resize(SIZE, SIZE)
    .composite([{ input: circle, blend: "dest-in" }])
    .png()
    .toFile(DEST);
  console.log("wrote", DEST);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
