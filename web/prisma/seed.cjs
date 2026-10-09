// Seed business data (prices in kobo). Run: npm run db:seed
// Admins are created via the Phase 4 setup script, not here.
require("dotenv").config();
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ?? process.env.NETLIFY_DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.counter.upsert({
    where: { id: "order" },
    update: {},
    create: { id: "order", next: 1042 },
  });

  await prisma.eggInventory.upsert({
    where: { id: "eggs" },
    update: {},
    create: {
      id: "eggs",
      totalCrates: 85,
      reservedCrates: 0,
      soldCrates: 0,
      pricePerCrate: 750000,
      status: "AVAILABLE",
    },
  });

  const cow = await prisma.animal.upsert({
    where: { tag: "Cow #024" },
    update: {},
    create: {
      type: "COW",
      tag: "Cow #024",
      totalKg: "420.00",
      availableKg: "420.00",
      pricePerKg: 850000,
      status: "AVAILABLE",
    },
  });
  await prisma.animal.upsert({
    where: { tag: "Pig #011" },
    update: {},
    create: {
      type: "PIG",
      tag: "Pig #011",
      totalKg: "95.00",
      availableKg: "95.00",
      pricePerKg: 700000,
      status: "AVAILABLE",
    },
  });

  const basic = await prisma.sessionType.upsert({
    where: { id: "seed-basic" },
    update: {},
    create: {
      id: "seed-basic",
      name: "Basic Session",
      durationMin: 30,
      price: 1500000,
      active: true,
    },
  });
  const premium = await prisma.sessionType.upsert({
    where: { id: "seed-premium" },
    update: {},
    create: {
      id: "seed-premium",
      name: "Premium Session",
      durationMin: 60,
      price: 3000000,
      active: true,
    },
  });
  void basic;
  void premium;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Rolling 14-day studio calendar (admins extend/block in the calendar UI).
  for (let d = 0; d < 14; d++) {
    const day = new Date(today);
    day.setDate(today.getDate() + d);
    for (const [start, end] of [
      ["10:00", "11:00"],
      ["11:00", "12:00"],
      ["12:00", "13:00"],
      ["13:00", "14:00"],
      ["14:00", "15:00"],
      ["15:00", "16:00"],
    ]) {
      await prisma.studioSlot.upsert({
        where: { date_startTime: { date: day, startTime: start } },
        update: {},
        create: { date: day, startTime: start, endTime: end },
      });
    }
  }

  for (const item of [
    { name: "Jollof Rice", price: 300000, description: "Party style" },
    { name: "Fried Rice", price: 350000, description: "With mixed veg" },
    { name: "Grilled Chicken", price: 250000, description: "Full portion" },
  ]) {
    await prisma.menuItem.upsert({
      where: { id: `seed-${item.name.toLowerCase().replace(/[^a-z]+/g, "-")}` },
      update: {},
      create: {
        id: `seed-${item.name.toLowerCase().replace(/[^a-z]+/g, "-")}`,
        ...item,
      },
    });
  }

  console.log("Seed OK:", { cow: cow.tag });

  // Poultry batches (placeholder prices/stock — change in Admin anytime).
  await prisma.animal.upsert({
    where: { tag: "Turkey Batch A" },
    update: {},
    create: {
      type: "TURKEY",
      tag: "Turkey Batch A",
      totalKg: "120.00",
      availableKg: "120.00",
      pricePerKg: 900000,
      livePrice: 4500000,
      liveStock: 40,
      status: "AVAILABLE",
      description: "Live turkeys or per-kilo portions.",
    },
  });
  await prisma.animal.upsert({
    where: { tag: "Broiler Batch A" },
    update: {},
    create: {
      type: "BROILER",
      tag: "Broiler Batch A",
      totalKg: "200.00",
      availableKg: "200.00",
      pricePerKg: 550000,
      livePrice: 1800000,
      liveStock: 100,
      status: "AVAILABLE",
      description: "Live broilers or per-kilo portions.",
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
