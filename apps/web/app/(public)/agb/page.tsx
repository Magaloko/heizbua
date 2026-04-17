export default function AgbPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Allgemeine Geschäftsbedingungen</h1>

      <div className="space-y-8 text-sm text-muted-foreground">
        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">§ 1 Geltungsbereich</h2>
          <p>
            Diese AGB gelten für die Nutzung der Plattform Heizbua (heizbua.at) durch Verbraucher
            und Händler. Mit der Nutzung der Plattform stimmen Sie diesen Bedingungen zu.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">§ 2 Leistungsbeschreibung</h2>
          <p>
            Heizbua ist ein Preisvergleichsdienst für Energieträger (Holzpellets, Heizöl, Gas u. a.)
            in Österreich und Deutschland. Die Plattform vermittelt lediglich zwischen Verbrauchern
            und Händlern. Kaufverträge kommen ausschließlich zwischen dem Verbraucher und dem
            jeweiligen Händler zustande.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">§ 3 Händler-Registrierung</h2>
          <p>
            Händler können sich auf der Plattform registrieren und Preisangebote einstellen.
            Händler sind verpflichtet, nur aktuelle und korrekte Preise anzugeben. Heizbua
            behält sich das Recht vor, Händler bei Verstößen zu sperren.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">§ 4 Haftungsbeschränkung</h2>
          <p>
            Heizbua übernimmt keine Haftung für die Richtigkeit der von Händlern eingestellten
            Preise. Die Plattform haftet nicht für Schäden, die aus der Nutzung vermittelter
            Angebote entstehen. Es gilt österreichisches Recht.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">§ 5 Preisangaben</h2>
          <p>
            Alle angezeigten Preise sind unverbindliche Richtwerte und können sich jederzeit ändern.
            Verbindliche Preise ergeben sich aus dem direkten Angebot des jeweiligen Händlers.
            Preise verstehen sich inklusive MwSt. soweit nicht anders angegeben.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">§ 6 Änderungen</h2>
          <p>
            Heizbua behält sich das Recht vor, diese AGB jederzeit zu ändern. Über wesentliche
            Änderungen werden registrierte Händler per E-Mail informiert.
          </p>
        </section>
      </div>
    </main>
  );
}
