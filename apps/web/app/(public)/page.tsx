import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tight">Heizbua</h1>
        <p className="mt-2 text-xl text-muted-foreground">
          Energiepreise vergleichen — Pellets, Heizöl, Gas & mehr
        </p>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Jetzt vergleichen</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Vergleichsrechner kommt in Plan 2.
          </p>
          <Button className="mt-4 w-full" disabled>
            Preise vergleichen (bald verfügbar)
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
