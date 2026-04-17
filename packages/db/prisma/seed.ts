import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const fuelTypes = [
  { slug: "pellets",       label: "Holzpellets",  unit: "kg",    kWhPerUnit: 4.8,  source: "DIN EN ISO 17225-2" },
  { slug: "heizoel",       label: "Heizöl",        unit: "liter", kWhPerUnit: 10.0, source: "BDEW" },
  { slug: "gas",           label: "Erdgas",        unit: "kWh",   kWhPerUnit: 1.0,  source: "BDEW" },
  { slug: "waermepumpe",   label: "Wärmepumpe",    unit: "kWh",   kWhPerUnit: 3.5,  source: "Ø COP Luft-Wasser" },
  { slug: "hackschnitzel", label: "Hackschnitzel", unit: "srm",   kWhPerUnit: 650,  source: "CARMEN e.V." },
];

async function main() {
  for (const ft of fuelTypes) {
    const fuelType = await prisma.fuelType.upsert({
      where: { slug: ft.slug },
      update: {},
      create: { slug: ft.slug, label: ft.label, unit: ft.unit },
    });
    await prisma.energyConversion.upsert({
      where: { fuelTypeId: fuelType.id },
      update: {},
      create: {
        fuelTypeId: fuelType.id,
        unit: ft.unit,
        kWhPerUnit: ft.kWhPerUnit,
        source: ft.source,
      },
    });
  }
  console.log("Seed complete: 5 FuelTypes + EnergyConversions");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
