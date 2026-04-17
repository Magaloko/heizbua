"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FuelType = {
  id: string;
  slug: string;
  label: string;
  unit: string;
};

type Props = {
  fuelTypes: FuelType[];
  defaultFuelTypeId?: string;
  defaultPlz?: string;
  defaultQty?: number;
};

export function CompareForm({ fuelTypes, defaultFuelTypeId, defaultPlz, defaultQty }: Props) {
  const router = useRouter();
  const [fuelTypeId, setFuelTypeId] = useState(
    defaultFuelTypeId ?? fuelTypes[0]?.id ?? ""
  );
  const [plz, setPlz] = useState(defaultPlz ?? "");
  const [qty, setQty] = useState(defaultQty?.toString() ?? "1000");
  const [error, setError] = useState<string | null>(null);

  const selectedFuel = fuelTypes.find((f) => f.id === fuelTypeId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{4,5}$/.test(plz)) {
      setError("Bitte gültige PLZ eingeben (z. B. 80331 oder 1100)");
      return;
    }
    const quantity = parseInt(qty, 10);
    if (!quantity || quantity < 1) {
      setError("Bitte gültige Menge eingeben");
      return;
    }
    setError(null);
    router.push(`/vergleich?fuelTypeId=${fuelTypeId}&plz=${plz}&qty=${quantity}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Fuel type selector */}
      <div className="flex flex-wrap gap-2">
        {fuelTypes.map((fuel) => (
          <button
            key={fuel.id}
            type="button"
            onClick={() => setFuelTypeId(fuel.id)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              fuelTypeId === fuel.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:bg-muted"
            }`}
          >
            {fuel.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="plz">PLZ</Label>
          <Input
            id="plz"
            placeholder="z. B. 1100 oder 80331"
            value={plz}
            onChange={(e) => setPlz(e.target.value)}
            maxLength={5}
            pattern="\d{4,5}"
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="qty">
            Menge ({selectedFuel?.unit ?? "Einheit"})
          </Label>
          <Input
            id="qty"
            type="number"
            min={1}
            placeholder="1000"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            required
          />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full">
        Preise vergleichen
      </Button>
    </form>
  );
}
