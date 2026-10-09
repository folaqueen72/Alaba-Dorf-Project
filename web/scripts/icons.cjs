// Rebuilds PWA icons + logo from logo-source.png. Run: node scripts/icons.cjs
const path = require("path");
const sharp = require("sharp");

const SRC = path.join(__dirname, "..", "..", "logo-source.png");
const PUB = path.join(__dirname, "..", "public");

async function main() {
  const circle = (s) =>
    Buffer.from(
      `<svg width="${s}" height="${s}"><circle cx="${s / 2}" cy="${s / 2}" r="${s / 2}"/></svg>`
    );
  // Standard icons: trimmed disc on transparency.
  for (const [name, size] of [
    ["logo.png", 512],
    ["icon-192.png", 192],
    ["icon-512.png", 512],
    ["apple-touch-icon.png", 180],
  ]) {
    await sharp(SRC)
      .trim()
      .resize(size, size, { fit: "cover" })
      .composite([{ input: circle(size), blend: "dest-in" }])
      .png()
      .toFile(path.join(PUB, name));
    console.log("wrote", name);
  }
  // Maskable: full-bleed lemon background, badge at 80% (safe zone).
  const S = 410;
  const badge = await sharp(SRC)
    .trim()
    .resize(S, S, { fit: "cover" })
    .composite([
      {
        input: Buffer.from(
          `<svg width="${S}" height="${S}"><circle cx="${S / 2}" cy="${S / 2}" r="${S / 2}"/></svg>`
        ),
        blend: "dest-in",
      },
    ])
    .png()
    .toBuffer();
  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 0x6b, g: 0x9e, b: 0x0e, alpha: 1 },
    },
  })
    .composite([{ input: badge, left: 51, top: 51 }])
    .png()
    .toFile(path.join(PUB, "maskable-512.png"));
  console.log("wrote maskable-512.png");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
