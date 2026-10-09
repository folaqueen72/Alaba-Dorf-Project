// Processes photos-new/ into web-ready public/gallery/ files.
// Run: node scripts/photos.cjs
const path = require("path");
const sharp = require("C:\\Users\\USER\\Documents\\Docs for project build\\Alaba Dorf Project\\web\\node_modules\\sharp");

const SRC = "C:\\Users\\USER\\Documents\\Docs for project build\\Alaba Dorf Project\\photos-new";
const DEST = "C:\\Users\\USER\\Documents\\Docs for project build\\Alaba Dorf Project\\web\\public\\gallery";

async function photo(src, dest, width = 1200) {
  await sharp(path.join(SRC, src)).resize(width, null, { withoutEnlargement: true }).jpeg({ quality: 72 }).toFile(path.join(DEST, dest));
  console.log("wrote", dest);
}

async function main() {
  // Farm
  await photo("beaf4cee-a501-4195-ace2-00b1bd74c13d.JPG", "eggs-crates.jpg");
  await photo("20191207_215930-COLLAGE-scale-1.PNG", "turkeys.jpg");
  await photo("IMG-20221202-WA0019.JPG", "hen.jpg");
  await photo("IMG_1974.JPG", "dressed-1.jpg");
  await photo("IMG_1975.JPG", "dressed-2.jpg");
  await photo("IMG_20221227_121033.JPG", "dressed-3.jpg");
  // Studio gallery
  await photo("IMG_2215.JPG", "studio-room.jpg");
  await photo("IMG-20250205-WA0012.jpg", "portrait-1.jpg");
  await photo("IMG-20250205-WA0015.jpg", "portrait-2.jpg");
  await photo("IMG-20250205-WA0019.jpg", "portrait-3.jpg");
  await photo("IMG-20260917-WA0011.jpg", "portrait-4.jpg");
  await photo("IMG-20260917-WA0012.jpg", "portrait-5.jpg");
  // Eatery (rice = left half, chicken = right half of the chafing photo)
  const chaf = sharp(path.join(SRC, "IMG_2244.JPG"));
  const meta = await chaf.metadata();
  const half = Math.floor((meta.width || 1600) / 2);
  await sharp(path.join(SRC, "IMG_2244.JPG"))
    .extract({ left: 0, top: 0, width: half, height: meta.height || 1200 })
    .resize(800, null).jpeg({ quality: 72 })
    .toFile(path.join(DEST, "fried-rice.jpg"));
  console.log("wrote fried-rice.jpg");
  await sharp(path.join(SRC, "IMG_2244.JPG"))
    .extract({ left: half, top: 0, width: (meta.width || 1600) - half, height: meta.height || 1200 })
    .resize(800, null).jpeg({ quality: 72 })
    .toFile(path.join(DEST, "grilled-chicken.jpg"));
  console.log("wrote grilled-chicken.jpg");
  await photo("IMG_2246.JPG", "jollof-plate.jpg");
  await photo("IMG_2248.JPG", "plate-2.jpg");
  await photo("IMG_2276.JPG", "burgers.jpg");
  // Grilled turkey GIF -> first frame still
  await sharp(path.join(SRC, "20191208_185101-ANIMATION.GIF"), { pages: 1 })
    .resize(1000, null).jpeg({ quality: 72 })
    .toFile(path.join(DEST, "grilled-turkey.jpg"));
  console.log("wrote grilled-turkey.jpg");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
