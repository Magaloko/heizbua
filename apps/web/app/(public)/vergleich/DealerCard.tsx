"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";

type DealerResult = {
  listingId: string;
  dealerId: string;
  dealerName: string;
  dealerLogo: string | null;
  dealerWebsite: string | null;
  dealerRating: number | null;
  dealerReviewCount: number;
  pricePerUnit: number;
  unit: string;
  totalPrice: number;
  pricePerKwh: number | null;
  deliveryDays: number | null;
  fuelLabel: string;
};

type Props = {
  result: DealerResult;
  plz: string;
  quantity: number;
  sessionToken: string;
  rank: number;
};

export function DealerCard({ result, plz, quantity, sessionToken, rank }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const createLead = trpc.leads.create.useMutation();

  async function handleCta() {
    if (!result.dealerWebsite) return;
    setLoading(true);
    try {
      const res = await createLead.mutateAsync({
        listingId: result.listingId,
        sessionToken,
        plz,
        quantity,
        dealerWebsite: result.dealerWebsite,
      });
      router.push(res.redirectUrl);
    } catch {
      setLoading(false);
    }
  }

  const isBest = rank === 1;

  return (
    <div
      className={`relative rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md ${
        isBest ? "border-primary/30 ring-1 ring-primary/20" : "border-border"
      }`}
    >
      {isBest && (
        <div className="absolute -top-2.5 left-4">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground shadow-sm">
            🏆 Bestes Angebot
          </span>
        </div>
      )}

      <div className="flex items-center justify-between gap-4 p-5 pt-6">
        {/* Left: dealer info */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-lg font-bold text-muted-foreground">
            {result.dealerName.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <p className="font-semibold text-foreground truncate">{result.dealerName}</p>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-muted-foreground">
              <span>
                <strong className="text-foreground">{result.pricePerUnit.toFixed(3)} €</strong>
                /{result.unit}
              </span>
              {result.pricePerKwh && (
                <span className="text-xs">· {result.pricePerKwh.toFixed(4)} €/kWh</span>
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
              {result.deliveryDays && <span>🚚 ca. {result.deliveryDays} Werktage</span>}
              {result.dealerRating && (
                <span>
                  ⭐ {result.dealerRating.toFixed(1)}
                  {result.dealerReviewCount > 0 && (
                    <span className="opacity-60"> ({result.dealerReviewCount})</span>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: price + CTA */}
        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">
              {result.totalPrice.toFixed(2)} €
            </p>
            <p className="text-xs text-muted-foreground">Gesamtpreis</p>
          </div>
          <button
            disabled={!result.dealerWebsite || loading}
            onClick={handleCta}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Weiterleiten…" : "Zum Angebot →"}
          </button>
        </div>
      </div>
    </div>
  );
}
