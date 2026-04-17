"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { ListingForm } from "./ListingForm";

type FuelType = { id: string; label: string; unit: string };
type Listing = {
  id: string;
  fuelTypeId: string;
  pricePerUnit: number | { toString(): string };
  minQuantity: number;
  maxQuantity: number | null;
  deliveryDays: number | null;
  active: boolean;
  fuelType?: { label: string; unit: string };
};

type Props = {
  initialListings: Listing[];
  fuelTypes: FuelType[];
};

export function ListingsClient({ initialListings, fuelTypes }: Props) {
  const [listings, setListings] = useState(initialListings);
  const utils = trpc.useUtils();
  const removeListing = trpc.dealerListings.remove.useMutation({
    onSuccess: () => utils.dealerListings.list.invalidate(),
  });

  function handleSuccess() {
    utils.dealerListings.list.invalidate();
    // Optimistic: re-fetch will update listings via tRPC cache
  }

  async function handleRemove(id: string) {
    if (!confirm("Angebot wirklich löschen?")) return;
    await removeListing.mutateAsync({ id });
    setListings((prev) => prev.filter((l) => l.id !== id));
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Preisangebote</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Füge Preise für deine Energieträger hinzu. Sie erscheinen im öffentlichen Preisvergleich.
        </p>
      </div>

      <div className="mb-8">
        <ListingForm fuelTypes={fuelTypes} onSuccess={handleSuccess} />
      </div>

      {listings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-10 text-center">
          <p className="text-2xl mb-2">💶</p>
          <p className="font-semibold">Noch keine Angebote</p>
          <p className="text-sm text-muted-foreground mt-1">Erstelle dein erstes Preisangebot oben.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {listings.map((listing) => {
            const price = Number(listing.pricePerUnit);
            const fuel = listing.fuelType ?? fuelTypes.find((f) => f.id === listing.fuelTypeId);
            return (
              <div key={listing.id} className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-5 py-4">
                <div>
                  <p className="font-semibold">{fuel?.label ?? listing.fuelTypeId}</p>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">{price.toFixed(3)} €</strong>/{fuel?.unit ?? "Einheit"}
                    {listing.deliveryDays && <span className="ml-3">🚚 {listing.deliveryDays} Werktage</span>}
                    <span className="ml-3">Min: {listing.minQuantity} {fuel?.unit}</span>
                    {listing.maxQuantity && <span className="ml-2">— Max: {listing.maxQuantity}</span>}
                  </p>
                </div>
                <button onClick={() => handleRemove(listing.id)} disabled={removeListing.isPending}
                  className="text-sm text-destructive hover:underline disabled:opacity-50">
                  Löschen
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
