import { createServerClient } from "@/lib/trpc/server";
import { CompareForm } from "./CompareForm";
import { DealerCard } from "./DealerCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SearchParams = {
  fuelTypeId?: string;
  plz?: string;
  qty?: string;
};

export default async function VergleichPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { fuelTypeId, plz, qty } = params;
  const quantity = qty ? parseInt(qty, 10) : undefined;

  const trpcServer = await createServerClient();
  const fuelTypes = await trpcServer.fuelTypes.list();

  const sessionToken = crypto.randomUUID();

  let results: Awaited<ReturnType<typeof trpcServer.compare.search>> = [];
  let searchError: string | null = null;

  if (fuelTypeId && plz && quantity && quantity > 0) {
    try {
      results = await trpcServer.compare.search({ fuelTypeId, plz, quantity });
    } catch {
      searchError = "Suche fehlgeschlagen. Bitte überprüfe deine Eingaben.";
    }
  }

  const hasSearch = !!(fuelTypeId && plz && quantity);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Preise vergleichen</h1>
        <p className="mt-1 text-muted-foreground">
          Gib deine PLZ und gewünschte Menge ein, um aktuelle Angebote zu sehen.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deine Suche</CardTitle>
        </CardHeader>
        <CardContent>
          <CompareForm
            fuelTypes={fuelTypes}
            defaultFuelTypeId={fuelTypeId}
            defaultPlz={plz}
            defaultQty={quantity}
          />
        </CardContent>
      </Card>

      {hasSearch && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold">
            {searchError
              ? "Fehler"
              : results.length === 0
              ? "Keine Angebote gefunden"
              : `${results.length} Angebot${results.length === 1 ? "" : "e"} gefunden`}
          </h2>

          {searchError && (
            <p className="text-destructive">{searchError}</p>
          )}

          {!searchError && results.length === 0 && (
            <p className="text-muted-foreground">
              Für diese PLZ und diesen Energieträger liegen aktuell keine Angebote vor.
            </p>
          )}

          {results.map((result: (typeof results)[number], i: number) => (
            <DealerCard
              key={result.listingId}
              result={result}
              plz={plz!}
              quantity={quantity!}
              sessionToken={sessionToken}
              rank={i + 1}
            />
          ))}
        </section>
      )}
    </main>
  );
}
