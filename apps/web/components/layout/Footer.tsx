import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <p className="text-lg font-bold">
              Heiz<span className="text-primary">bua</span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Energiepreise vergleichen für Österreich & Deutschland.
            </p>
          </div>

          {/* Verbraucher */}
          <div>
            <p className="text-sm font-semibold text-foreground">Verbraucher</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/vergleich" className="hover:text-foreground transition-colors">Preise vergleichen</Link></li>
              <li><Link href="/preisindex" className="hover:text-foreground transition-colors">Preisindex</Link></li>
              <li><Link href="/energietraeger/pellets" className="hover:text-foreground transition-colors">Holzpellets</Link></li>
              <li><Link href="/energietraeger/heizoel" className="hover:text-foreground transition-colors">Heizöl</Link></li>
            </ul>
          </div>

          {/* Händler */}
          <div>
            <p className="text-sm font-semibold text-foreground">Händler</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/dealer/register" className="hover:text-foreground transition-colors">Registrieren</Link></li>
              <li><Link href="/dealer/login" className="hover:text-foreground transition-colors">Login</Link></li>
              <li><Link href="/dealer/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          {/* Rechtliches */}
          <div>
            <p className="text-sm font-semibold text-foreground">Rechtliches</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/impressum" className="hover:text-foreground transition-colors">Impressum</Link></li>
              <li><Link href="/datenschutz" className="hover:text-foreground transition-colors">Datenschutz</Link></li>
              <li><Link href="/agb" className="hover:text-foreground transition-colors">AGB</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Heizbua. Alle Preise inkl. MwSt.</p>
          <p>Kein Gewähr für Preisrichtigkeit. Angebote der Händler.</p>
        </div>
      </div>
    </footer>
  );
}
