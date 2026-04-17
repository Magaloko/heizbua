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
  variant?: "hero" | "default";
};

const FUEL_ICONS: Record<string, string> = {
  pellets: "🪵",
  heizoel: "🛢️",
  gas: "🔥",
  waermepumpe: "♻️",
  hackschnitzel: "🌲",
};

export function CompareForm({
  fuelTypes,
  defaultFuelTypeId,
  defaultPlz,
  defaultQty,
  variant = "default",
}: Props) {
  const router = useRouter();
  const [fuelTypeId, setFuelTypeId] = useState(
    defaultFuelTypeId ?? fuelTypes[0]?.id ?? ""
  );
  const [plz, setPlz] = useState(defaultPlz ?? "");
  const [qty, setQty] = useState(defaultQty?.toString() ?? "1000");
  const [error, setError] = useState<string | null>(null);

  const selectedFuel = fuelTypes.find((f) => f.id === fuelTypeId);
  const isHero = variant === "hero";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{4,5}$/.test(plz)) {
      setError("Bitte gültige PLZ eingeben (z. B. 1100 oder 80331)");
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
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              fuelTypeId === fuel.id
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : isHero
                  ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
                  : "border-border bg-background text-foreground hover:bg-muted"
            }`}
          >
            <span className="text-base leading-none">{FUEL_ICONS[fuel.slug] ?? "⚡"}</span>
            {fuel.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="plz"
            className={isHero ? "text-slate-300" : undefined}
          >
            PLZ
          </Label>
          <Input
            id="plz"
            placeholder="z. B. 1100 oder 80331"
            value={plz}
            onChange={(e) => setPlz(e.target.value.replace(/\D/g, "").slice(0, 5))}
            maxLength={5}
            pattern="\d{4,5}"
            required
            className={isHero ? "border-white/20 bg-white/10 text-white placeholder:text-slate-400 focus:border-primary" : undefined}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="qty"
            className={isHero ? "text-slate-300" : undefined}
          >
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
            className={isHero ? "border-white/20 bg-white/10 text-white placeholder:text-slate-400 focus:border-primary" : undefined}
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button type="submit" className="w-full font-semibold" size="lg">
        Preise vergleichen →
      </Button>
    </form>
  );
}
