// Builds PWA icons from the badge artwork. Run: node scripts/make-icons.cjs
const path = require("path");
const sharp = require("sharp");

const PUB = path.join(__dirname, "..", "public");
const LOGO = path.join(PUB, "logo.png");

async function main() {
  // Standard icons (transparent disc).
  await sharp(LOGO).resize(192, 192).png().toFile(path.join(PUB, "icon-192.png"));
  await sharp(LOGO).resize(512, 512).png().toFile(path.join(PUB, "icon-512.png"));
  await sharp(LOGO).resize(180, 180).flatten({ background: "#ffffff" }).png().toFile(path.join(PUB, "apple-touch-icon.png"));

  // Maskable icon: badge inset on solid lemon (safe zone respected).
  const inner = await sharp(LOGO).resize(410, 410).toBuffer();
  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 0x6b, g: 0x9e, b: 0x0e, alpha: 1 },
    },
  })
    .composite([{ input: inner, left: 51, top: 51 }])
    .png()
    .toFile(path.join(PUB, "maskable-512.png"));

  console.log("icons written to", PUB);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
