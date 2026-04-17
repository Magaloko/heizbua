"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProfilPage() {
  const router = useRouter();
  const { data: dealer, isLoading, refetch } = trpc.dealer.me.useQuery();
  const updateDealer = trpc.dealer.update.useMutation({ onSuccess: () => refetch() });

  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (dealer) {
      setName(dealer.name ?? "");
      setWebsite(dealer.website ?? "");
      setDescription(dealer.description ?? "");
      setLogo(dealer.logo ?? "");
    }
  }, [dealer]);

  useEffect(() => {
    if (!isLoading && !dealer) {
      router.push("/dealer/onboarding");
    }
  }, [isLoading, dealer, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    try {
      await updateDealer.mutateAsync({
        name,
        website: website || null,
        description: description || null,
        logo: logo || null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Fehler beim Speichern");
    }
  }

  if (isLoading) return <div className="text-sm text-muted-foreground">Lade Profil…</div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Mein Profil</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Diese Daten werden Kunden angezeigt, die auf dein Angebot klicken.
        </p>
      </div>

      {dealer?.status && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4">
          <div>
            <p className="text-sm font-semibold">Account-Status</p>
            <p className="text-sm text-muted-foreground">
              {dealer.status === "ACTIVE" && "✅ Aktiv — deine Angebote sind öffentlich sichtbar"}
              {dealer.status === "PENDING" && "⏳ Wird geprüft — dein Account wartet auf Freigabe"}
              {dealer.status === "PAUSED" && "⏸ Pausiert — deine Angebote sind nicht sichtbar"}
              {dealer.status === "REJECTED" && "❌ Abgelehnt — bitte kontaktiere den Support"}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-lg flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Firmenname *</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="website">Website</Label>
          <Input id="website" type="url" value={website} onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://ihrefirma.at" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="description">Kurzbeschreibung</Label>
          <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="z. B. Regionales Heizöl & Pelletsunternehmen seit 1985" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="logo">Logo-URL</Label>
          <Input id="logo" type="url" value={logo} onChange={(e) => setLogo(e.target.value)}
            placeholder="https://ihrefirma.at/logo.png" />
          <p className="text-xs text-muted-foreground">Direkter Link zu deinem Logo-Bild (PNG oder SVG)</p>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {saved && <p className="text-sm text-green-600">✅ Profil gespeichert</p>}

        <Button type="submit" disabled={updateDealer.isPending} className="self-start">
          {updateDealer.isPending ? "Wird gespeichert…" : "Änderungen speichern"}
        </Button>
      </form>
    </div>
  );
}
