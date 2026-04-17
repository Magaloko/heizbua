# Heizbua — Design Spec
**Datum:** 2026-04-17  
**Status:** Genehmigt  

---

## 1. Projektübersicht

**Heizbua** ist ein Energiepreisvergleich-Marktplatz für Deutschland. Nutzer vergleichen Preise aller relevanten Heizstoffe (Holzpellets, Heizöl, Gas, Wärmepumpe, Hackschnitzel u.a.) anhand von PLZ und Menge. Händler/Lieferanten werden über ein eigenes Portal ongeboardet und pflegen ihre Preise selbst. Das Geschäftsmodell basiert auf Provision bei vermittelten Käufen (Lead-Tracking).

**Zielmarkt:** Deutschland  
**Zielgruppe:** Hausbesitzer mit Heizungsanlage, die günstige Energielieferanten suchen  
**Domain:** heizbua.de (Arbeitstitel)

---

## 2. Architektur

### Typ
Eine einzige Next.js 15 App (App Router), eine Domain, eine Vercel-Deployment.

### Monorepo-Struktur
```
apps/
  web/                   → Next.js 15 — gesamte Plattform
packages/
  db/                    → Prisma Schema + Migrations (PostgreSQL)
  ui/                    → Shared shadcn/ui Komponenten
  types/                 → Shared TypeScript Types
```

### Routing
```
app/
  (public)/
    page.tsx             → Homepage: Hero + Schnellrechner
    vergleich/page.tsx   → Vollständige Ergebnisseite
    preisindex/page.tsx  → Preishistorie-Charts je Energieträger
    energietraeger/
      [slug]/page.tsx    → Infoseite je Energieträger
  dealer/
    (auth)/
      register/page.tsx
      login/page.tsx
    dashboard/page.tsx
    preise/page.tsx
    liefergebiet/page.tsx
    profil/page.tsx
  admin/
    haendler/page.tsx
    preise/page.tsx
    preisindex/page.tsx
    leads/page.tsx
api/
  trpc/[trpc]/route.ts
  auth/[...nextauth]/route.ts
```

### Rollen
| Rolle | Zugang |
|---|---|
| Consumer | Alle `(public)` Routen — kein Account |
| Dealer | `/dealer/*` — Email/Passwort Auth |
| Admin | `/admin/*` — Role-Guard via Middleware |

---

## 3. Datenmodell

```prisma
model Dealer {
  id          String    @id @default(cuid())
  name        String
  email       String    @unique
  password    String
  role        Role      @default(DEALER)
  status      DealerStatus @default(PENDING)
  logo        String?
  description String?
  website     String?
  rating      Decimal?           // 0-5, manuell durch Admin; später Trusted Shops
  reviewCount Int       @default(0)
  listings    PriceListing[]
  zones       PostalZone[]
  createdAt   DateTime  @default(now())
}

model FuelType {
  id       String  @id @default(cuid())
  slug     String  @unique  // pellets | heizoel | gas | waermepumpe | hackschnitzel
  label    String
  unit     String           // kg | liter | kWh | m3
  listings PriceListing[]
  history  PriceHistory[]
}

model PriceListing {
  id          String    @id @default(cuid())
  dealer      Dealer    @relation(fields: [dealerId], references: [id])
  dealerId    String
  fuelType    FuelType  @relation(fields: [fuelTypeId], references: [id])
  fuelTypeId  String
  pricePerUnit Decimal
  minQuantity  Int
  maxQuantity  Int?
  validFrom   DateTime
  validTo     DateTime?
  active       Boolean   @default(true)
  deliveryDays Int?               // Lieferzeit in Werktagen
  leads        Lead[]
}

model PostalZone {
  id       String @id @default(cuid())
  dealer   Dealer @relation(fields: [dealerId], references: [id])
  dealerId String
  plzFrom  String
  plzTo    String
}

model Lead {
  id          String   @id @default(cuid())
  listing     PriceListing @relation(fields: [listingId], references: [id])
  listingId   String
  sessionToken String
  plz         String
  quantity    Int
  clickedAt   DateTime @default(now())
}

model PriceHistory {
  id         String   @id @default(cuid())
  fuelType   FuelType @relation(fields: [fuelTypeId], references: [id])
  fuelTypeId String
  avgPrice   Decimal
  source     String   // "carmen" | "manual" | "aggregated"
  recordedAt DateTime @default(now())
}

// Für fairen Energie-Vergleich (kWh-Normierung)
model EnergyConversion {
  id         String   @id @default(cuid())
  fuelTypeId String   @unique
  unit       String   // "kg" | "liter" | "m3" | "kWh"
  kWhPerUnit Decimal  // z.B. Pellets: 4.8, Heizöl: 10, Gas: 10
  source     String   // "DIN" | "BDEW" | "custom"
}

// PLZ-Cache für Performance (befüllt via OpenPLZ API)
model PostalCache {
  plz       String   @id
  state     String
  district  String
  lat       Decimal
  lng       Decimal
  updatedAt DateTime @updatedAt
}

enum Role { DEALER ADMIN }
enum DealerStatus { PENDING ACTIVE REJECTED PAUSED }
```

---

## 4. Consumer-Seite (Public)

### Vergleichsrechner (Kern-Feature)
1. **Input:** Energieträger (Tabs/Chips) + PLZ + Menge
2. **Verarbeitung:** PLZ gegen `PostalZone` aller aktiven Händler prüfen, passende `PriceListing` laden, nach Gesamtpreis sortieren
3. **Output:** Händlerliste — Preis/Einheit, Gesamtpreis, Lieferzeit, Bewertung, CTA "Zum Angebot"
4. **Lead-Tracking:** Beim Klick auf CTA wird ein `Lead`-Eintrag angelegt, dann Redirect zur Händler-URL

### Preisindex
- Line-Chart (Recharts) je Energieträger — letzte 30/90/365 Tage
- Daten aus `PriceHistory`
- Wöchentliche Änderung in % angezeigt

### Chicken-Egg-Lösung
Admin legt manuelle Seed-Händler mit Beispielpreisen an. Diese erscheinen sofort in Suchergebnissen, bis echte Händler ongeboardet sind.

---

## 5. Händler-Dashboard

### Onboarding-Flow
```
Registrierung → Status: PENDING → Admin prüft → Status: ACTIVE → sichtbar in Suche
```

### Features
| Seite | Funktion |
|---|---|
| `/dealer/dashboard` | Übersicht: Leads heute, aktive Angebote |
| `/dealer/preise` | Preise je Energieträger anlegen/bearbeiten (Preis, Menge, Gültigkeit) |
| `/dealer/liefergebiet` | PLZ-Ranges definieren, Leaflet-Karte zur Visualisierung |
| `/dealer/profil` | Logo, Beschreibung, Zertifikate, Zahlungsarten, Website |

---

## 6. Admin-Bereich

| Seite | Funktion |
|---|---|
| `/admin/haendler` | Händler freischalten, sperren, ablehnen |
| `/admin/preise` | Manuelle Seed-Preisdaten pflegen |
| `/admin/preisindex` | CARMEN-Import manuell auslösen, PriceHistory verwalten |
| `/admin/leads` | Aggregierte Lead-Statistiken |

---

## 7. API-Integrationen

### Tier 1 — MVP
| API | Zweck | Kosten |
|---|---|---|
| [OpenPLZ API](https://www.openplzapi.org/en/) | PLZ-Validierung, Bundesland, Region | Kostenlos |
| [Nominatim (OSM)](https://nominatim.org/) | Adress-Geocoding | Kostenlos |
| [C.A.R.M.E.N. e.V.](https://www.carmen-ev.de/infothek/preisindizes/holzpellets) | Pellet + Hackschnitzel Preisindex | Kostenlos (Scraping/Import) |
| [SMARD Bundesnetzagentur](https://www.smard.de/en) | Gas + Strom Großhandelspreise | Kostenlos, offiziell |
| [Bright Sky / DWD](https://brightsky.dev/) | Wetterdaten (Heizbedarf-Indikator) | Kostenlos |
| [Leaflet + OpenStreetMap](https://leafletjs.com/) | Liefergebiets-Karte | Kostenlos |
| [Resend](https://resend.com/) | Transaktions-E-Mails | Freemium |

### Tier 2 — Phase 2
| API | Zweck |
|---|---|
| [Trusted Shops API](https://api.trustedshops.com/) | Händler-Bewertungen & Trust-Badge |
| [Destatis GENESIS](https://www.destatis.de/) | Offizielle Energiepreis-Statistiken |
| [Energy-Charts API](https://www.energy-charts.info/) | Gas/Strom Marktdaten |
| [hplib (FZ Jülich)](https://github.com/FZJ-IEK3-VSA/hplib) | Wärmepumpen-Effizienz (COP) |
| [Mollie](https://www.mollie.com/) | Zahlungsabwicklung für Händler-Abo |

### Datenstrategie Preisindex
Täglicher Vercel Cron Job importiert C.A.R.M.E.N.-Daten in `PriceHistory`. So wächst der eigene Index kontinuierlich.

---

## 8. Tech-Stack

| Schicht | Technologie |
|---|---|
| Framework | Next.js 15 (App Router) |
| Sprache | TypeScript strict |
| API-Layer | tRPC v11 |
| Auth | **Clerk** (stabil, Role-Management out-of-the-box) |
| ORM | Prisma |
| Datenbank | Neon Postgres (serverless) |
| UI-Basis | shadcn/ui + Tailwind CSS |
| Design | /ui-ux-pro-max |
| Charts | Recharts |
| Karten | Leaflet + react-leaflet |
| Email | Resend |
| Cron | Vercel Cron Jobs |
| Hosting | Vercel |
| Repo | GitHub Monorepo (Turborepo) |

---

## 9. MVP-Meilensteine

| Woche | Ziel |
|---|---|
| 1–2 | Projektsetup, DB-Schema, Auth, Händler-Registrierung |
| 3–4 | Vergleichsrechner (PLZ + Energieträger → Ergebnisse) |
| 5–6 | Händler-Dashboard (Preise + Liefergebiet) |
| 7 | Admin-Panel + Seed-Daten + CARMEN-Import |
| 8 | Preisindex-Charts, OpenPLZ, Bright Sky Integration |
| 9–10 | Design-Pass mit /ui-ux-pro-max, Polish, Launch |

---

## 10. Rechtliches & DSGVO (Pflichten)

| Pflicht | Details |
|---|---|
| **Impressum** | § 5 TMG — vollständige Angaben, Pflicht für DE |
| **AGB** | Separate AGB für Händler + für Nutzer |
| **Datenschutzerklärung** | DSGVO-konform, professionell (ca. 500–1.000 € Anwalt) |
| **Cookie-Banner** | Pflicht für Lead-Tracking via Session-Token |
| **PAngV** | Alle Preise inkl. MwSt. + Lieferkosten anzeigen |
| **Lead-Daten** | Max. 30 Tage speichern, IP nur als anonymisierter Hash |
| **Haftungsausschluss** | Plattform haftet nicht für Preisfehler der Händler |
| **Berufshaftpflicht** | Empfohlen vor Launch |

---

## 11. Bewusst ausgeschlossen (Phase 2)

- Direkte Bestellabwicklung / Warenkorb
- Consumer-Accounts / gespeicherte Suchen
- Mobile App / Preisalarm
- Bewertungssystem für Händler
- Händler-Abo-Modell (Mollie)
- Multi-Language (DE-only im MVP)
