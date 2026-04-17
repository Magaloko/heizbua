import { createServerClient } from "@/lib/trpc/server";
import { CompareForm } from "./CompareForm";
import { DealerCard } from "./DealerCard";

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
  const fuelTypes = await trpcServer.fuelTypes.list().catch(() => []);

  const sessionToken = crypto.randomUUID();

  let results: Awaited<ReturnType<typeof trpcServer.compare.search>> = [];
  let searchError: string | null = null;

  const selectedFuel = fuelTypes.find((f: { id: string }) => f.id === fuelTypeId);

  if (fuelTypeId && plz && quantity && quantity > 0) {
    try {
      results = await trpcServer.compare.search({ fuelTypeId, plz, quantity });
    } catch {
      searchError = "Suche fehlgeschlagen. Bitte überprüfe deine Eingaben.";
    }
  }

  const hasSearch = !!(fuelTypeId && plz && quantity);

  return (
    <>
      {/* Search bar strip */}
      <section className="border-b border-border/60 bg-card shadow-sm">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <h1 className="mb-4 text-xl font-bold tracking-tight">Preise vergleichen</h1>
          <CompareForm
            fuelTypes={fuelTypes}
            defaultFuelTypeId={fuelTypeId}
            defaultPlz={plz}
            defaultQty={quantity}
          />
        </div>
      </section>

      {/* Results */}
      <section className="mx-auto max-w-4xl px-4 py-8">
        {hasSearch && (
          <>
            <div className="mb-5 flex items-center justify-between">
              <div>
                {searchError ? (
                  <p className="font-semibold text-destructive">{searchError}</p>
                ) : results.length === 0 ? (
                  <p className="font-semibold text-foreground">Keine Angebote gefunden</p>
                ) : (
                  <p className="font-semibold text-foreground">
                    {results.length} Angebot{results.length === 1 ? "" : "e"} gefunden
                    {selectedFuel && (
                      <span className="text-muted-foreground font-normal">
                        {" "}— {selectedFuel.label} · PLZ {plz} · {quantity?.toLocaleString("de-AT")} {selectedFuel.unit}
                      </span>
                    )}
                  </p>
                )}
              </div>
              {results.length > 0 && (
                <p className="text-xs text-muted-foreground">Sortiert nach Gesamtpreis</p>
              )}
            </div>

            {!searchError && results.length === 0 && (
              <div className="rounded-xl border border-border bg-card p-8 text-center">
                <p className="text-4xl mb-3">🔍</p>
                <p className="font-semibold">Kein Händler gefunden</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Für PLZ {plz} und diesen Energieträger liegen aktuell keine Angebote vor.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3">
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
            </div>
          </>
        )}

        {!hasSearch && (
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
            <p className="text-4xl mb-3">⚡</p>
            <p className="font-semibold">PLZ &amp; Menge eingeben</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Wähle einen Energieträger und gib deine PLZ ein, um Angebote zu sehen.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
