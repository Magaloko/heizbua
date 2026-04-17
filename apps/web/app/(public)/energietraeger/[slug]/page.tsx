import Link from "next/link";
import { notFound } from "next/navigation";

const FUEL_DATA: Record<string, {
  label: string;
  icon: string;
  unit: string;
  kWhPerUnit: number;
  description: string;
  pros: string[];
  cons: string[];
}> = {
  pellets: {
    label: "Holzpellets",
    icon: "🪵",
    unit: "kg",
    kWhPerUnit: 4.8,
    description:
      "Holzpellets sind gepresste Holzreste aus der Säge- und Holzindustrie. Sie gelten als CO₂-neutral und sind ein beliebter erneuerbarer Energieträger für Zentralheizungen in Österreich und Deutschland.",
    pros: ["Erneuerbar & CO₂-neutral", "Automatische Beschickung möglich", "Stabile Preise", "Hoher Wirkungsgrad (>90 %)"],
    cons: ["Lagerraum erforderlich", "Regelmäßige Lieferung nötig", "Höhere Anschaffungskosten der Anlage"],
  },
  heizoel: {
    label: "Heizöl",
    icon: "🛢️",
    unit: "Liter",
    kWhPerUnit: 10.0,
    description:
      "Heizöl (Extra Leicht) ist der klassische fossile Energieträger für Ölheizungen. Trotz steigender CO₂-Abgaben bleibt es in ländlichen Regionen ohne Gasanschluss verbreitet.",
    pros: ["Hohe Energiedichte", "Unabhängig vom Gasnetz", "Günstige Heizöl-Preise bei Großabnahme", "Bewährte Technik"],
    cons: ["Fossil / CO₂-intensiv", "Preisschwankungen", "Lagerung im Keller erforderlich", "CO₂-Bepreisung steigt"],
  },
  gas: {
    label: "Erdgas",
    icon: "🔥",
    unit: "kWh",
    kWhPerUnit: 1.0,
    description:
      "Erdgas ist in dicht besiedelten Regionen weit verbreitet und gilt als sauberer als Heizöl. Mit der Energiewende verliert reines Erdgas an Bedeutung — Hybrid-Lösungen mit Wärmepumpe gewinnen.",
    pros: ["Kein Lagerraum nötig", "Sauberere Verbrennung als Heizöl", "Breite Verfügbarkeit", "Einfache Abrechnung"],
    cons: ["Fossil / CO₂-intensiv", "Abhängigkeit vom Gasnetz", "Preisvolatilität", "Zukunft ungewiss"],
  },
  waermepumpe: {
    label: "Wärmepumpe",
    icon: "♻️",
    unit: "kWh",
    kWhPerUnit: 3.5,
    description:
      "Wärmepumpen nutzen Umweltwärme (Luft, Erde, Wasser) und wandeln sie mit Strom effizient in Heizwärme. Bei Ökostrom praktisch CO₂-frei — ideal für Neubauten und gut gedämmte Gebäude.",
    pros: ["Erneuerbar (mit Ökostrom)", "Niedrigste Betriebskosten langfristig", "Keine Brennstofflieferung", "Förderfähig (BEG, Klima+)"],
    cons: ["Hohe Anschaffungskosten", "Braucht gute Dämmung", "Stromabhängigkeit", "Weniger geeignet für Altbau"],
  },
  hackschnitzel: {
    label: "Hackschnitzel",
    icon: "🌲",
    unit: "SRM",
    kWhPerUnit: 650,
    description:
      "Hackschnitzel sind grob zerkleinerte Holzstücke — günstiger als Pellets, aber mit höherem Wassergehalt. Besonders wirtschaftlich für größere Anlagen ab 50 kW (Landwirtschaft, Gemeinden).",
    pros: ["Günstigster Holzbrennstoff", "Regional verfügbar", "CO₂-neutral", "Ideal für große Anlagen"],
    cons: ["Großes Lagervolumen nötig", "Feuchtigkeitsmanagement wichtig", "Weniger für Einfamilienhäuser", "Aufwändigere Technik"],
  },
};

export function generateStaticParams() {
  return Object.keys(FUEL_DATA).map((slug) => ({ slug }));
}

export default async function EnergietraegerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const fuel = FUEL_DATA[slug];
  if (!fuel) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-2 text-sm text-muted-foreground">
        <Link href="/vergleich" className="hover:text-foreground">Preisvergleich</Link>
        <span className="mx-2">›</span>
        <span>{fuel.label}</span>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <span className="text-4xl">{fuel.icon}</span>
        <h1 className="text-3xl font-bold tracking-tight">{fuel.label}</h1>
      </div>

      <p className="text-muted-foreground leading-relaxed mb-8">{fuel.description}</p>

      {/* kWh-Info */}
      <div className="rounded-xl border border-border bg-card p-5 mb-8">
        <p className="text-sm font-semibold text-foreground mb-1">Energiegehalt</p>
        <p className="text-2xl font-bold text-primary">{fuel.kWhPerUnit} kWh</p>
        <p className="text-sm text-muted-foreground">pro {fuel.unit}</p>
      </div>

      {/* Pros & Cons */}
      <div className="grid gap-4 sm:grid-cols-2 mb-10">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold text-foreground mb-3">Vorteile</p>
          <ul className="space-y-2">
            {fuel.pros.map((pro) => (
              <li key={pro} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-green-500 mt-0.5">✓</span> {pro}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold text-foreground mb-3">Nachteile</p>
          <ul className="space-y-2">
            {fuel.cons.map((con) => (
              <li key={con} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-red-400 mt-0.5">✗</span> {con}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
        <p className="font-semibold mb-3">Jetzt {fuel.label}-Preise vergleichen</p>
        <Link
          href={`/vergleich?fuelTypeId=&slug=${slug}`}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
        >
          Preise vergleichen →
        </Link>
      </div>
    </main>
  );
}
