import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerClient } from "@/lib/trpc/server";
import { StatsCard } from "./StatsCard";

export default async function DealerDashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/dealer/login");

  const trpc = await createServerClient();
  const [dealer, stats] = await Promise.all([
    trpc.dealer.me().catch(() => null),
    trpc.dealer.stats().catch(() => ({ listingCount: 0, zoneCount: 0, leadCount: 0 })),
  ]);

  if (!dealer) redirect("/dealer/onboarding");

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-800",
    PENDING: "bg-amber-100 text-amber-800",
    PAUSED: "bg-slate-100 text-slate-600",
    REJECTED: "bg-red-100 text-red-800",
  };
  const statusLabels: Record<string, string> = {
    ACTIVE: "Aktiv",
    PENDING: "Ausstehend",
    PAUSED: "Pausiert",
    REJECTED: "Abgelehnt",
  };

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">{dealer.name}</p>
        </div>
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[dealer.status] ?? "bg-muted text-muted-foreground"}`}>
          {statusLabels[dealer.status] ?? dealer.status}
        </span>
      </div>

      {dealer.status === "PENDING" && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          <strong>Account wird geprüft.</strong> Sobald dein Account freigegeben ist, sind deine Angebote sichtbar.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
        <StatsCard label="Aktive Angebote" value={stats.listingCount} icon="💶" description="Aktive Preislistings" />
        <StatsCard label="Lieferzonen" value={stats.zoneCount} icon="📍" description="PLZ-Bereiche" />
        <StatsCard label="Klicks (30 Tage)" value={stats.leadCount} icon="👆" description="Weiterleitungen zu deiner Website" />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link href="/dealer/preise"
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-5 hover:shadow-sm transition-shadow">
          <span className="text-2xl">💶</span>
          <div>
            <p className="font-semibold">Preisangebote verwalten</p>
            <p className="text-sm text-muted-foreground">Preise hinzufügen oder bearbeiten</p>
          </div>
        </Link>
        <Link href="/dealer/liefergebiet"
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-5 hover:shadow-sm transition-shadow">
          <span className="text-2xl">📍</span>
          <div>
            <p className="font-semibold">Liefergebiete</p>
            <p className="text-sm text-muted-foreground">PLZ-Bereiche verwalten</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
