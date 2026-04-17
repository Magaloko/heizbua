export default function ImpressumPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Impressum</h1>

      <div className="prose prose-sm max-w-none space-y-6 text-foreground">
        <section>
          <h2 className="text-lg font-semibold mb-2">Angaben gemäß § 5 ECG (Österreich) / § 5 TMG (Deutschland)</h2>
          <p className="text-muted-foreground">
            Heizbua<br />
            [Dein Name / Firmenname]<br />
            [Straße und Hausnummer]<br />
            [PLZ Ort]<br />
            Österreich / Deutschland
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Kontakt</h2>
          <p className="text-muted-foreground">
            E-Mail: kontakt@heizbua.at<br />
            Web: heizbua.at
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Haftungsausschluss</h2>
          <p className="text-muted-foreground">
            Die auf dieser Plattform angezeigten Preise werden von Händlern bereitgestellt.
            Heizbua übernimmt keine Gewähr für die Aktualität, Richtigkeit oder Vollständigkeit
            der angezeigten Informationen. Für Verbindlichkeiten aus den vermittelten Angeboten
            sind ausschließlich die jeweiligen Händler verantwortlich.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Urheberrecht</h2>
          <p className="text-muted-foreground">
            Die Inhalte dieser Website sind urheberrechtlich geschützt. Die Vervielfältigung,
            Bearbeitung oder Verbreitung bedarf der schriftlichen Zustimmung des Betreibers.
          </p>
        </section>
      </div>
    </main>
  );
}
