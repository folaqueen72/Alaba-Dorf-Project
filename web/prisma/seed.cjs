// Seed business data (prices in kobo). Run: npm run db:seed
// Admins are created via the Phase 4 setup script, not here.
require("dotenv").config();
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
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
      pricePerKg: 0,
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
      pricePerKg: 0,
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
      price: 0,
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
      price: 0,
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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
