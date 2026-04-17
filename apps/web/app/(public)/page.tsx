import { createServerClient } from "@/lib/trpc/server";
import { CompareForm } from "./vergleich/CompareForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function HomePage() {
  const trpcServer = await createServerClient();
  const fuelTypes = await trpcServer.fuelTypes.list().catch(() => []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tight">Heizbua</h1>
        <p className="mt-2 text-xl text-muted-foreground">
          Energiepreise vergleichen — Pellets, Heizöl, Gas & mehr
        </p>
      </div>
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Jetzt vergleichen</CardTitle>
        </CardHeader>
        <CardContent>
          <CompareForm fuelTypes={fuelTypes} />
        </CardContent>
      </Card>
    </main>
  );
}
