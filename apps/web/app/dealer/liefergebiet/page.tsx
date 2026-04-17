"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LiefergebietPage() {
  const { data: zones = [], refetch } = trpc.dealerZones.list.useQuery();
  const createZone = trpc.dealerZones.create.useMutation({ onSuccess: () => refetch() });
  const removeZone = trpc.dealerZones.remove.useMutation({ onSuccess: () => refetch() });

  const [plzFrom, setPlzFrom] = useState("");
  const [plzTo, setPlzTo] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^\d{4,5}$/.test(plzFrom) || !/^\d{4,5}$/.test(plzTo)) {
      setError("PLZ müssen 4- oder 5-stellig sein");
      return;
    }
    if (plzFrom > plzTo) {
      setError("PLZ-Von muss kleiner oder gleich PLZ-Bis sein");
      return;
    }
    try {
      await createZone.mutateAsync({ plzFrom, plzTo });
      setPlzFrom("");
      setPlzTo("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Fehler");
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Liefergebiet</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Definiere PLZ-Bereiche, in die du lieferst. Kunden in diesen Bereichen sehen deine Angebote.
        </p>
      </div>

      <form onSubmit={handleAdd} className="mb-8 rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
        <h3 className="font-semibold">Neuen Bereich hinzufügen</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="plzFrom">PLZ von</Label>
            <Input id="plzFrom" value={plzFrom}
              onChange={(e) => setPlzFrom(e.target.value.replace(/\D/g, "").slice(0, 5))}
              placeholder="z. B. 1100 oder 80000" maxLength={5} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="plzTo">PLZ bis</Label>
            <Input id="plzTo" value={plzTo}
              onChange={(e) => setPlzTo(e.target.value.replace(/\D/g, "").slice(0, 5))}
              placeholder="z. B. 1230 oder 80999" maxLength={5} required />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Beispiel: Von 1100 bis 1230 deckt alle Wiener Postleitzahlen in diesem Bereich ab.
          Für eine einzelne PLZ trage dieselbe Zahl in beide Felder ein.
        </p>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={createZone.isPending} className="self-start">
          {createZone.isPending ? "Wird gespeichert…" : "Bereich hinzufügen"}
        </Button>
      </form>

      {zones.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-10 text-center">
          <p className="text-2xl mb-2">📍</p>
          <p className="font-semibold">Kein Liefergebiet</p>
          <p className="text-sm text-muted-foreground mt-1">Füge PLZ-Bereiche hinzu, um in Suchergebnissen zu erscheinen.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {zones.length} PLZ-Bereich{zones.length === 1 ? "" : "e"}
          </p>
          {zones.map((zone) => (
            <div key={zone.id} className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-3">
              <div className="flex items-center gap-3">
                <span className="text-sm">📍</span>
                <p className="font-mono text-sm font-semibold">{zone.plzFrom}</p>
                <span className="text-muted-foreground text-xs">—</span>
                <p className="font-mono text-sm font-semibold">{zone.plzTo}</p>
              </div>
              <button onClick={() => removeZone.mutate({ id: zone.id })} disabled={removeZone.isPending}
                className="text-sm text-destructive hover:underline disabled:opacity-50">
                Entfernen
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
