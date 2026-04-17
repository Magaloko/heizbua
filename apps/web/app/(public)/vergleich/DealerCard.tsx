"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  return (
    <Card className="w-full">
      <CardContent className="flex items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-4">
          {rank === 1 && (
            <Badge className="shrink-0 bg-amber-500 text-white">Bestes Angebot</Badge>
          )}
          <div>
            <p className="font-semibold">{result.dealerName}</p>
            <p className="text-sm text-muted-foreground">
              {result.pricePerUnit.toFixed(3)} €/{result.unit}
              {result.pricePerKwh && (
                <span className="ml-2">
                  · {result.pricePerKwh.toFixed(4)} €/kWh
                </span>
              )}
            </p>
            {result.deliveryDays && (
              <p className="text-xs text-muted-foreground">
                Lieferzeit ca. {result.deliveryDays} Werktage
              </p>
            )}
            {result.dealerRating && (
              <p className="text-xs text-muted-foreground">
                ★ {result.dealerRating.toFixed(1)} ({result.dealerReviewCount} Bewertungen)
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <p className="text-xl font-bold">
            {result.totalPrice.toFixed(2)} €
          </p>
          <p className="text-xs text-muted-foreground">Gesamtpreis</p>
          <Button
            size="sm"
            disabled={!result.dealerWebsite || loading}
            onClick={handleCta}
          >
            {loading ? "Weiterleiten…" : "Zum Angebot →"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
