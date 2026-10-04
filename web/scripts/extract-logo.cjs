// Auto-crop the yellow badge disc, then mask to a transparent PNG.
// Run: node scripts/extract-logo.cjs
const path = require("path");
const sharp = require("sharp");

const SRC = path.join(__dirname, "..", "..", "IMG_20261004_205605.jpg");
const DEST = path.join(__dirname, "..", "public", "logo.png");
const SIZE = 512;

async function main() {
  const probe = await sharp(SRC).resize(240).ensureAlpha().raw().toBuffer({
    resolveWithObject: true,
  });
  const { data, info } = probe;
  let minX = info.width, minY = info.height, maxX = 0, maxY = 0;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * info.channels;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      // Yellow badge: strong red+green, weak blue. Fabric is grey (r≈g≈b).
      if (r > 140 && g > 120 && b < 130 && r - b > 40 && g - b > 25) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  console.log("disc box (240px):", { minX, minY, maxX, maxY });
  const meta = await sharp(SRC).metadata();
  const scale = meta.width / 240;
  // Fixed box tuned by inspection: the disc spans nearly the full width.
  // Mask radius is inset to shave the fabric rim without clipping the wordmark.
  const side = 2820;
  const left = 130;
  const top = 620;
  console.log("crop:", { left, top, side });

  const circle = Buffer.from(
    `<svg width="${SIZE}" height="${SIZE}"><circle cx="${SIZE / 2}" cy="${SIZE / 2}" r="${Math.round(SIZE * 0.49)}"/></svg>`
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
