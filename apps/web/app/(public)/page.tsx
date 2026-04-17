import Link from "next/link";
import { createServerClient } from "@/lib/trpc/server";
import { CompareForm } from "./vergleich/CompareForm";

const FUEL_ICONS: Record<string, string> = {
  pellets: "🪵",
  heizoel: "🛢️",
  gas: "🔥",
  waermepumpe: "♻️",
  hackschnitzel: "🌲",
};

const BENEFITS = [
  {
    icon: "📊",
    title: "Kostenloser Vergleich",
    text: "Alle Angebote auf einen Blick — ohne Registrierung.",
  },
  {
    icon: "📍",
    title: "PLZ-genau",
    text: "Nur Händler, die wirklich in deine Region liefern.",
  },
  {
    icon: "⚡",
    title: "kWh-Vergleich",
    text: "Fairer Vergleich aller Energieträger nach Kilowattstunde.",
  },
];

export default async function HomePage() {
  const trpcServer = await createServerClient();
  const fuelTypes = await trpcServer.fuelTypes.list().catch(() => []);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-4 py-20 md:py-28">
          <div className="grid items-center gap-12 md:grid-cols-2">
            {/* Left: Copy */}
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-amber-300">
                🇦🇹 Österreich &amp; 🇩🇪 Deutschland
              </div>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
                Günstig heizen.<br />
                <span className="text-primary">Jetzt vergleichen.</span>
              </h1>
              <p className="mt-5 text-lg text-slate-300 leading-relaxed">
                Holzpellets, Heizöl, Gas & mehr —{" "}
                <strong className="text-white">alle Energieträger, alle Händler</strong> in deiner Region.
                Kostenlos, ohne Anmeldung.
              </p>

              {/* Benefits pills */}
              <div className="mt-6 flex flex-wrap gap-2">
                {["Kostenlos", "Keine Registrierung", "AT + DE", "kWh-Vergleich"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-200"
                  >
                    ✓ {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: Form card */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm md:bg-white/8">
              <p className="mb-4 text-sm font-semibold text-slate-200">
                Energieträger &amp; Menge wählen
              </p>
              <CompareForm fuelTypes={fuelTypes} variant="hero" />
            </div>
          </div>
        </div>
      </section>

      {/* Fuel type quick links */}
      {fuelTypes.length > 0 && (
        <section className="border-b border-border/60 bg-card">
          <div className="mx-auto max-w-6xl px-4 py-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-medium text-muted-foreground">Schnellauswahl:</span>
              {fuelTypes.map((fuel: { id: string; slug: string; label: string }) => (
                <Link
                  key={fuel.id}
                  href={`/vergleich?fuelTypeId=${fuel.id}`}
                  className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-sm font-medium text-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  <span>{FUEL_ICONS[fuel.slug] ?? "⚡"}</span>
                  {fuel.label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Benefits */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
              So funktioniert Heizbua
            </h2>
            <p className="mt-3 text-muted-foreground">
              In 30 Sekunden zum günstigsten Angebot in deiner Region.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="rounded-xl border border-border bg-card p-6 text-center shadow-sm"
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-2xl">
                  {b.icon}
                </div>
                <h3 className="font-semibold text-foreground">{b.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preisindex CTA */}
      <section className="border-t border-border/60 bg-muted/30 py-14">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="text-xl font-bold tracking-tight">
            Wie entwickeln sich die Energiepreise?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Tägliche Marktpreise für alle Energieträger — kostenlos &amp; ohne Anmeldung.
          </p>
          <Link
            href="/preisindex"
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-semibold shadow-sm hover:bg-muted transition-colors"
          >
            Zum Preisindex →
          </Link>
        </div>
      </section>
    </>
  );
}
