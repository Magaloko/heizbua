export default function DatenschutzPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Datenschutzerklärung</h1>

      <div className="space-y-8 text-sm text-muted-foreground">
        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">1. Verantwortlicher</h2>
          <p>
            Verantwortlich für die Datenverarbeitung auf dieser Website ist der Betreiber von Heizbua
            (siehe Impressum).
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">2. Erhobene Daten</h2>
          <p>
            Beim Besuch dieser Website werden folgende Daten verarbeitet:
          </p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>IP-Adresse (anonymisiert, für Serverlog und Sicherheit)</li>
            <li>PLZ und Suchanfragen (zur Anzeige von Preisangeboten, nicht personenbezogen)</li>
            <li>Authentifizierungsdaten für Händler-Accounts (via Clerk)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">3. Zweck der Verarbeitung</h2>
          <p>
            Daten werden ausschließlich zur Bereitstellung des Preisvergleichsdienstes und
            zur Abwicklung von Händler-Registrierungen verarbeitet. Es findet keine Weitergabe
            an Dritte zu Werbezwecken statt.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">4. Weiterleitungen zu Händlern</h2>
          <p>
            Wenn du auf ein Angebot klickst, wirst du auf die Website des jeweiligen Händlers
            weitergeleitet. Ab diesem Zeitpunkt gilt die Datenschutzerklärung des Händlers.
            Heizbua protokolliert Klicks ausschließlich zur Abrechnungsgrundlage (ohne Personenbezug).
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">5. Hosting & Infrastruktur</h2>
          <p>
            Diese Website wird auf Vercel (USA) gehostet. Die Datenbank läuft bei Neon (EU-Central).
            Beide Anbieter sind DSGVO-konform und haben entsprechende Auftragsverarbeitungsverträge.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">6. Deine Rechte</h2>
          <p>
            Du hast das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung
            deiner personenbezogenen Daten. Kontakt: kontakt@heizbua.at
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">7. Cookies</h2>
          <p>
            Diese Website verwendet ausschließlich technisch notwendige Cookies (Session-Management
            für eingeloggte Händler). Es werden keine Tracking- oder Werbe-Cookies eingesetzt.
          </p>
        </section>
      </div>
    </main>
  );
}
