import { createServerClient } from "@/lib/trpc/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PriceChart } from "./PriceChart";

const FUEL_COLORS: Record<string, string> = {
  pellets: "#16a34a",
  heizoel: "#dc2626",
  gas: "#2563eb",
  waermepumpe: "#7c3aed",
  hackschnitzel: "#92400e",
};

type SearchParams = { days?: string };

export default async function PreisindexPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const days = params.days ? parseInt(params.days, 10) : 90;
  const validDays = [30, 90, 365].includes(days) ? days : 90;

  const trpcServer = await createServerClient();
  const fuelTypes = await trpcServer.fuelTypes.list().catch(() => []);

  type FuelType = (typeof fuelTypes)[number];
  type PriceRecord = Awaited<ReturnType<typeof trpcServer.priceIndex.history>>[number];

  const histories = await Promise.all(
    fuelTypes.map(async (fuel: FuelType) => {
      const records = await trpcServer.priceIndex.history({
        fuelTypeId: fuel.id,
        days: validDays,
      });
      return { fuel, records };
    })
  );

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Preisindex</h1>
        <p className="mt-1 text-muted-foreground">
          Durchschnittliche Marktpreise je Energieträger
        </p>
      </div>

      {/* Days filter */}
      <div className="flex gap-2">
        {[30, 90, 365].map((d) => (
          <a
            key={d}
            href={`/preisindex?days=${d}`}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              validDays === d
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:bg-muted"
            }`}
          >
            {d === 365 ? "1 Jahr" : `${d} Tage`}
          </a>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {histories.map(({ fuel, records }: { fuel: FuelType; records: PriceRecord[] }) => {
          const data = records.map((r: PriceRecord) => ({
            date: new Date(r.recordedAt).toLocaleDateString("de-DE", {
              day: "2-digit",
              month: "2-digit",
            }),
            avgPrice: r.avgPrice,
          }));

          const latestPrice = records.at(-1)?.avgPrice;
          const firstPrice = records.at(0)?.avgPrice;
          const changePercent =
            latestPrice && firstPrice && firstPrice !== 0
              ? ((latestPrice - firstPrice) / firstPrice) * 100
              : null;

          return (
            <Card key={fuel.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{fuel.label}</CardTitle>
                  {changePercent !== null && (
                    <span
                      className={`text-sm font-medium ${
                        changePercent >= 0 ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {changePercent >= 0 ? "+" : ""}
                      {changePercent.toFixed(1)} %
                    </span>
                  )}
                </div>
                {latestPrice && (
                  <p className="text-2xl font-bold">
                    {latestPrice.toFixed(3)} €/{fuel.unit}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <PriceChart
                  data={data}
                  unit={fuel.unit}
                  color={FUEL_COLORS[fuel.slug] ?? "#6b7280"}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </main>
  );
}
