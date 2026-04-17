"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FuelType = { id: string; label: string; unit: string };

type Props = {
  fuelTypes: FuelType[];
  onSuccess: () => void;
};

export function ListingForm({ fuelTypes, onSuccess }: Props) {
  const createListing = trpc.dealerListings.create.useMutation();
  const [fuelTypeId, setFuelTypeId] = useState(fuelTypes[0]?.id ?? "");
  const [price, setPrice] = useState("");
  const [minQty, setMinQty] = useState("500");
  const [maxQty, setMaxQty] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("5");
  const [validFrom, setValidFrom] = useState(new Date().toISOString().split("T")[0]);
  const [error, setError] = useState<string | null>(null);

  const selectedFuel = fuelTypes.find((f) => f.id === fuelTypeId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) { setError("Ungültiger Preis"); return; }
    try {
      await createListing.mutateAsync({
        fuelTypeId,
        pricePerUnit: priceNum,
        minQuantity: parseInt(minQty, 10),
        maxQuantity: maxQty ? parseInt(maxQty, 10) : null,
        deliveryDays: deliveryDays ? parseInt(deliveryDays, 10) : null,
        validFrom: new Date(validFrom),
        validTo: null,
      });
      setPrice("");
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Fehler beim Speichern");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
      <h3 className="font-semibold">Neues Angebot</h3>

      <div className="flex flex-col gap-1.5">
        <Label>Energieträger</Label>
        <div className="flex flex-wrap gap-2">
          {fuelTypes.map((ft) => (
            <button key={ft.id} type="button" onClick={() => setFuelTypeId(ft.id)}
              className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                fuelTypeId === ft.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-muted"
              }`}>
              {ft.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="price">Preis (€/{selectedFuel?.unit ?? "Einheit"}) *</Label>
          <Input id="price" type="number" step="0.001" min="0.001" value={price}
            onChange={(e) => setPrice(e.target.value)} placeholder="0.285" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="delivery">Lieferzeit (Werktage)</Label>
          <Input id="delivery" type="number" min="1" value={deliveryDays}
            onChange={(e) => setDeliveryDays(e.target.value)} placeholder="5" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="minQty">Mindestmenge ({selectedFuel?.unit ?? "Einheit"}) *</Label>
          <Input id="minQty" type="number" min="1" value={minQty}
            onChange={(e) => setMinQty(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="maxQty">Maximalmenge (optional)</Label>
          <Input id="maxQty" type="number" min="1" value={maxQty}
            onChange={(e) => setMaxQty(e.target.value)} placeholder="unbegrenzt" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="validFrom">Gültig ab *</Label>
        <Input id="validFrom" type="date" value={validFrom}
          onChange={(e) => setValidFrom(e.target.value)} required />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={createListing.isPending}>
        {createListing.isPending ? "Wird gespeichert…" : "Angebot speichern"}
      </Button>
    </form>
  );
}
