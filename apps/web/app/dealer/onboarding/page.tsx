"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function OnboardingPage() {
  const router = useRouter();
  const createDealer = trpc.dealer.create.useMutation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createDealer.mutateAsync({
        name,
        email,
        website: website || null,
        description: description || null,
      });
      router.push("/dealer/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Fehler beim Speichern");
    }
  }

  return (
    <div className="flex min-h-screen items-start justify-center pt-16 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Händler-Profil einrichten</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Einmalige Einrichtung — danach kannst du Preisangebote & Liefergebiete verwalten.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Firmenname *</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="z. B. Pellets Maier GmbH" required />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">E-Mail *</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="kontakt@ihrefirma.at" required />
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

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full font-semibold" size="lg" disabled={createDealer.isPending}>
            {createDealer.isPending ? "Wird gespeichert…" : "Profil erstellen →"}
          </Button>
        </form>
      </div>
    </div>
  );
}
