# Heizbua — Plan 1: Foundation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turborepo-Monorepo mit Next.js 15, Prisma/Neon DB, Clerk Auth, tRPC v11 und shadcn/ui aufsetzen — alle nachfolgenden Pläne bauen darauf auf.

**Architecture:** Monorepo mit `apps/web` (Next.js 15 App Router) und `packages/db` (Prisma), `packages/ui` (shadcn/ui), `packages/types`. Clerk übernimmt Auth für Dealer/Admin. tRPC liefert typsichere API-Routen. Öffentliche Routen benötigen keinen Login.

**Tech Stack:** Node 20+, pnpm 9+, Turborepo, Next.js 15, TypeScript strict, Clerk, tRPC v11, Prisma 5, Neon Postgres, shadcn/ui, Tailwind CSS 4, Vitest

---

## File Map

```
heizbua/
  package.json                          ← pnpm workspace root
  pnpm-workspace.yaml
  turbo.json
  apps/
    web/
      package.json
      next.config.ts
      tailwind.config.ts
      tsconfig.json
      middleware.ts                      ← Clerk route protection
      app/
        layout.tsx                       ← Root layout (ClerkProvider, tRPC Provider)
        (public)/
          page.tsx                       ← Homepage placeholder
        dealer/
          (auth)/
            register/page.tsx            ← Clerk SignUp
            login/page.tsx               ← Clerk SignIn
          dashboard/
            page.tsx                     ← Role-guarded placeholder
        admin/
          page.tsx                       ← Role-guarded placeholder
        api/
          trpc/
            [trpc]/route.ts              ← tRPC HTTP handler
      lib/
        trpc/
          client.ts                      ← tRPC React client
          provider.tsx                   ← TRPCReactProvider
          server.ts                      ← createCaller for RSC
        db.ts                            ← Prisma singleton
      server/
        routers/
          _app.ts                        ← Root tRPC router
          health.ts                      ← Health check router (test target)
      components/
        ui/                              ← shadcn/ui components (auto-generated)
  packages/
    db/
      package.json
      tsconfig.json
      prisma/
        schema.prisma                    ← Full Prisma schema
        seed.ts                          ← Seed script
      src/
        index.ts                         ← Re-export PrismaClient
    ui/
      package.json
      tsconfig.json
      src/
        index.ts                         ← Re-export shadcn components
    types/
      package.json
      tsconfig.json
      src/
        index.ts                         ← Shared TS types
  .env.example
  .env.local                             ← NICHT committen
```

---

## Task 1: Monorepo Grundstruktur

**Files:**
- Create: `package.json` (root)
- Create: `pnpm-workspace.yaml`
- Create: `turbo.json`
- Create: `apps/web/package.json`
- Create: `packages/db/package.json`
- Create: `packages/ui/package.json`
- Create: `packages/types/package.json`

- [ ] **Step 1: Root initialisieren**

```bash
mkdir heizbua && cd heizbua
git init
pnpm init
```

- [ ] **Step 2: `pnpm-workspace.yaml` erstellen**

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

- [ ] **Step 3: Root `package.json` anpassen**

```json
{
  "name": "heizbua",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "test": "turbo test",
    "lint": "turbo lint",
    "db:generate": "turbo db:generate",
    "db:push": "turbo db:push",
    "db:seed": "turbo db:seed"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.4.0"
  }
}
```

- [ ] **Step 4: `turbo.json` erstellen**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "lint": {},
    "db:generate": {
      "cache": false
    },
    "db:push": {
      "cache": false
    },
    "db:seed": {
      "cache": false
    }
  }
}
```

- [ ] **Step 5: `packages/types` initialisieren**

```bash
mkdir -p packages/types/src
```

`packages/types/package.json`:
```json
{
  "name": "@heizbua/types",
  "version": "0.0.1",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "lint": "tsc --noEmit"
  }
}
```

`packages/types/src/index.ts`:
```typescript
export type FuelSlug =
  | "pellets"
  | "heizoel"
  | "gas"
  | "waermepumpe"
  | "hackschnitzel";

export type DealerStatus = "PENDING" | "ACTIVE" | "REJECTED" | "PAUSED";

export type UserRole = "DEALER" | "ADMIN";
```

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "chore: init turborepo monorepo with pnpm workspaces"
```

---

## Task 2: Next.js App erstellen

**Files:**
- Create: `apps/web/` (Next.js 15 App)
- Create: `apps/web/next.config.ts`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/tailwind.config.ts`

- [ ] **Step 1: Next.js App scaffolden**

```bash
cd apps
pnpm create next-app@latest web \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --no-import-alias
cd web
```

- [ ] **Step 2: `next.config.ts` anpassen**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@heizbua/ui", "@heizbua/db", "@heizbua/types"],
};

export default nextConfig;
```

- [ ] **Step 3: tsconfig.json mit Workspace-Paths anpassen**

In `apps/web/tsconfig.json` unter `compilerOptions` ergänzen:
```json
{
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@heizbua/types": ["../../packages/types/src/index.ts"],
      "@heizbua/db": ["../../packages/db/src/index.ts"],
      "@heizbua/ui": ["../../packages/ui/src/index.ts"]
    }
  }
}
```

- [ ] **Step 4: `.env.example` erstellen (im Root)**

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/dealer/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/dealer/register
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dealer/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dealer/dashboard

# Database
DATABASE_URL=postgresql://...
```

`.env.local` anlegen (NIE committen):
```bash
cp .env.example .env.local
# Werte aus Neon + Clerk Dashboard eintragen
```

- [ ] **Step 5: `.gitignore` Root anpassen**

```
.env.local
.env*.local
node_modules
.next
dist
.turbo
```

- [ ] **Step 6: Commit**

```bash
cd ../..
git add apps/web packages/types
git commit -m "chore: scaffold Next.js 15 app with TypeScript and Tailwind"
```

---

## Task 3: Prisma Schema & Datenbank

**Files:**
- Create: `packages/db/prisma/schema.prisma`
- Create: `packages/db/src/index.ts`
- Create: `packages/db/prisma/seed.ts`
- Create: `packages/db/package.json`

- [ ] **Step 1: `packages/db` aufsetzen**

```bash
mkdir -p packages/db/prisma packages/db/src
cd packages/db
pnpm init
pnpm add prisma @prisma/client
pnpm add -D tsx
```

`packages/db/package.json`:
```json
{
  "name": "@heizbua/db",
  "version": "0.0.1",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio"
  }
}
```

- [ ] **Step 2: `schema.prisma` schreiben**

`packages/db/prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Dealer {
  id          String       @id @default(cuid())
  clerkUserId String?      @unique
  name        String
  email       String       @unique
  role        Role         @default(DEALER)
  status      DealerStatus @default(PENDING)
  logo        String?
  description String?
  website     String?
  rating      Decimal?
  reviewCount Int          @default(0)
  listings    PriceListing[]
  zones       PostalZone[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

model FuelType {
  id          String             @id @default(cuid())
  slug        String             @unique
  label       String
  unit        String
  listings    PriceListing[]
  history     PriceHistory[]
  conversion  EnergyConversion?
}

model PriceListing {
  id           String    @id @default(cuid())
  dealer       Dealer    @relation(fields: [dealerId], references: [id])
  dealerId     String
  fuelType     FuelType  @relation(fields: [fuelTypeId], references: [id])
  fuelTypeId   String
  pricePerUnit Decimal
  minQuantity  Int
  maxQuantity  Int?
  deliveryDays Int?
  validFrom    DateTime
  validTo      DateTime?
  active       Boolean   @default(true)
  leads        Lead[]
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}

model PostalZone {
  id       String @id @default(cuid())
  dealer   Dealer @relation(fields: [dealerId], references: [id])
  dealerId String
  plzFrom  String
  plzTo    String
}

model PostalCache {
  plz       String   @id
  state     String
  district  String
  lat       Decimal
  lng       Decimal
  updatedAt DateTime @updatedAt
}

model Lead {
  id           String       @id @default(cuid())
  listing      PriceListing @relation(fields: [listingId], references: [id])
  listingId    String
  sessionToken String
  ipHash       String?
  plz          String
  quantity     Int
  clickedAt    DateTime     @default(now())
}

model PriceHistory {
  id         String   @id @default(cuid())
  fuelType   FuelType @relation(fields: [fuelTypeId], references: [id])
  fuelTypeId String
  avgPrice   Decimal
  source     String
  recordedAt DateTime @default(now())
}

model EnergyConversion {
  id         String   @id @default(cuid())
  fuelType   FuelType @relation(fields: [fuelTypeId], references: [id])
  fuelTypeId String   @unique
  unit       String
  kWhPerUnit Decimal
  source     String
}

enum Role         { DEALER ADMIN }
enum DealerStatus { PENDING ACTIVE REJECTED PAUSED }
```

- [ ] **Step 3: Prisma Client Singleton erstellen**

`packages/db/src/index.ts`:
```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export * from "@prisma/client";
```

- [ ] **Step 4: Seed-Datei mit FuelTypes + EnergyConversions**

`packages/db/prisma/seed.ts`:
```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const fuelTypes = [
  { slug: "pellets",      label: "Holzpellets",   unit: "kg",    kWhPerUnit: 4.8,  source: "DIN EN ISO 17225-2" },
  { slug: "heizoel",      label: "Heizöl",         unit: "liter", kWhPerUnit: 10.0, source: "BDEW" },
  { slug: "gas",          label: "Erdgas",         unit: "kWh",   kWhPerUnit: 1.0,  source: "BDEW" },
  { slug: "waermepumpe",  label: "Wärmepumpe",     unit: "kWh",   kWhPerUnit: 3.5,  source: "Ø COP Luft-Wasser" },
  { slug: "hackschnitzel",label: "Hackschnitzel",  unit: "srm",   kWhPerUnit: 650,  source: "CARMEN e.V." },
];

async function main() {
  for (const ft of fuelTypes) {
    const fuelType = await prisma.fuelType.upsert({
      where: { slug: ft.slug },
      update: {},
      create: { slug: ft.slug, label: ft.label, unit: ft.unit },
    });
    await prisma.energyConversion.upsert({
      where: { fuelTypeId: fuelType.id },
      update: {},
      create: {
        fuelTypeId: fuelType.id,
        unit: ft.unit,
        kWhPerUnit: ft.kWhPerUnit,
        source: ft.source,
      },
    });
  }
  console.log("Seed complete: FuelTypes + EnergyConversions");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

- [ ] **Step 5: Schema gegen Neon DB pushen**

```bash
cd packages/db
pnpm db:generate
pnpm db:push
pnpm db:seed
```

Erwartete Ausgabe:
```
Seed complete: FuelTypes + EnergyConversions
```

- [ ] **Step 6: Commit**

```bash
cd ../..
git add packages/db
git commit -m "feat: add Prisma schema with all models and seed FuelTypes"
```

---

## Task 4: Clerk Auth Integration

**Files:**
- Modify: `apps/web/app/layout.tsx`
- Create: `apps/web/middleware.ts`
- Create: `apps/web/app/dealer/(auth)/login/page.tsx`
- Create: `apps/web/app/dealer/(auth)/register/page.tsx`

- [ ] **Step 1: Clerk installieren**

```bash
cd apps/web
pnpm add @clerk/nextjs
```

- [ ] **Step 2: Root Layout mit ClerkProvider wrappen**

`apps/web/app/layout.tsx`:
```typescript
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { deDE } from "@clerk/localizations";
import "./globals.css";

export const metadata: Metadata = {
  title: "Heizbua — Energiepreise vergleichen",
  description: "Deutschlands Preisvergleich für alle Heizstoffe",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider localization={deDE}>
      <html lang="de">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

- [ ] **Step 3: Middleware für Route-Protection erstellen**

`apps/web/middleware.ts`:
```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedDealer = createRouteMatcher(["/dealer/dashboard(.*)", "/dealer/preise(.*)", "/dealer/liefergebiet(.*)", "/dealer/profil(.*)"]);
const isProtectedAdmin  = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedDealer(req) || isProtectedAdmin(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)", "/(api|trpc)(.*)"],
};
```

- [ ] **Step 4: Login-Seite**

`apps/web/app/dealer/(auth)/login/page.tsx`:
```typescript
import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn />
    </div>
  );
}
```

- [ ] **Step 5: Register-Seite**

`apps/web/app/dealer/(auth)/register/page.tsx`:
```typescript
import { SignUp } from "@clerk/nextjs";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp />
    </div>
  );
}
```

- [ ] **Step 6: Dashboard Placeholder (Role-guarded)**

`apps/web/app/dealer/dashboard/page.tsx`:
```typescript
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DealerDashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/dealer/login");

  const user = await currentUser();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Händler Dashboard</h1>
      <p className="text-muted-foreground">Willkommen, {user?.firstName}</p>
    </main>
  );
}
```

- [ ] **Step 7: Admin Placeholder**

`apps/web/app/admin/page.tsx`:
```typescript
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/dealer/login");

  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "admin") redirect("/dealer/dashboard");

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Admin Panel</h1>
    </main>
  );
}
```

- [ ] **Step 8: Dev-Server starten und Auth testen**

```bash
cd apps/web
pnpm dev
```

Öffne `http://localhost:3000/dealer/register` — Clerk SignUp sollte erscheinen.
Öffne `http://localhost:3000/dealer/dashboard` ohne Login — sollte zu Login weiterleiten.

- [ ] **Step 9: Commit**

```bash
cd ../..
git add apps/web
git commit -m "feat: integrate Clerk auth with dealer/admin route protection"
```

---

## Task 5: tRPC Setup

**Files:**
- Create: `apps/web/server/routers/_app.ts`
- Create: `apps/web/server/routers/health.ts`
- Create: `apps/web/server/trpc.ts`
- Create: `apps/web/app/api/trpc/[trpc]/route.ts`
- Create: `apps/web/lib/trpc/client.ts`
- Create: `apps/web/lib/trpc/provider.tsx`
- Create: `apps/web/lib/trpc/server.ts`
- Create: `apps/web/vitest.config.ts`
- Create: `apps/web/server/routers/health.test.ts`

- [ ] **Step 1: tRPC und Abhängigkeiten installieren**

```bash
cd apps/web
pnpm add @trpc/server@next @trpc/client@next @trpc/react-query@next @tanstack/react-query zod superjson
```

- [ ] **Step 2: tRPC Initialisierung**

`apps/web/server/trpc.ts`:
```typescript
import { initTRPC, TRPCError } from "@trpc/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@heizbua/db";
import superjson from "superjson";
import { ZodError } from "zod";

export const createTRPCContext = async () => {
  const { userId, sessionClaims } = await auth();
  return {
    prisma,
    userId,
    role: (sessionClaims?.metadata as { role?: string })?.role ?? null,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({ ctx: { ...ctx, userId: ctx.userId } });
});

export const adminProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId || ctx.role !== "admin")
    throw new TRPCError({ code: "FORBIDDEN" });
  return next({ ctx: { ...ctx, userId: ctx.userId } });
});
```

- [ ] **Step 3: Health Router schreiben (Test zuerst!)**

`apps/web/vitest.config.ts`:
```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
  },
  resolve: {
    alias: {
      "@heizbua/types": path.resolve(__dirname, "../../packages/types/src/index.ts"),
      "@heizbua/db": path.resolve(__dirname, "../../packages/db/src/index.ts"),
    },
  },
});
```

`apps/web/server/routers/health.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { createCallerFactory } from "@trpc/server";
import { appRouter } from "./_app";

const createCaller = createCallerFactory(appRouter);

describe("health router", () => {
  it("returns ok status", async () => {
    const caller = createCaller({
      prisma: {} as any,
      userId: null,
      role: null,
    });
    const result = await caller.health.ping();
    expect(result).toEqual({ status: "ok", timestamp: expect.any(String) });
  });
});
```

- [ ] **Step 4: Test ausführen — MUSS FEHLSCHLAGEN**

```bash
cd apps/web
pnpm add -D vitest @vitest/ui
pnpm vitest run server/routers/health.test.ts
```

Erwartete Ausgabe: `FAIL — Cannot find module './_app'`

- [ ] **Step 5: Health Router implementieren**

`apps/web/server/routers/health.ts`:
```typescript
import { router, publicProcedure } from "../trpc";

export const healthRouter = router({
  ping: publicProcedure.query(() => ({
    status: "ok" as const,
    timestamp: new Date().toISOString(),
  })),
});
```

`apps/web/server/routers/_app.ts`:
```typescript
import { router } from "../trpc";
import { healthRouter } from "./health";

export const appRouter = router({
  health: healthRouter,
});

export type AppRouter = typeof appRouter;
```

- [ ] **Step 6: Test erneut ausführen — MUSS BESTEHEN**

```bash
pnpm vitest run server/routers/health.test.ts
```

Erwartete Ausgabe: `PASS — health router > returns ok status`

- [ ] **Step 7: tRPC HTTP Handler**

`apps/web/app/api/trpc/[trpc]/route.ts`:
```typescript
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/routers/_app";
import { createTRPCContext } from "@/server/trpc";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: createTRPCContext,
    onError:
      process.env.NODE_ENV === "development"
        ? ({ path, error }) =>
            console.error(`tRPC error on ${path ?? "<no-path>"}:`, error)
        : undefined,
  });

export { handler as GET, handler as POST };
```

- [ ] **Step 8: tRPC Client Setup**

`apps/web/lib/trpc/client.ts`:
```typescript
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/server/routers/_app";

export const trpc = createTRPCReact<AppRouter>();
```

`apps/web/lib/trpc/provider.tsx`:
```typescript
"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { trpc } from "./client";
import superjson from "superjson";

function getBaseUrl() {
  if (typeof window !== "undefined") return "";
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export function TRPCReactProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          transformer: superjson,
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
```

`apps/web/lib/trpc/server.ts`:
```typescript
import { createCallerFactory } from "@trpc/server";
import { appRouter } from "@/server/routers/_app";
import { createTRPCContext } from "@/server/trpc";

const createCaller = createCallerFactory(appRouter);

export const api = async () => {
  const ctx = await createTRPCContext();
  return createCaller(ctx);
};
```

- [ ] **Step 9: TRPCReactProvider in Layout einbinden**

`apps/web/app/layout.tsx` (update):
```typescript
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { deDE } from "@clerk/localizations";
import { TRPCReactProvider } from "@/lib/trpc/provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Heizbua — Energiepreise vergleichen",
  description: "Deutschlands Preisvergleich für alle Heizstoffe",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider localization={deDE}>
      <html lang="de">
        <body>
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
```

- [ ] **Step 10: Manuell testen — API Route**

Dev-Server starten:
```bash
pnpm dev
```

```bash
curl http://localhost:3000/api/trpc/health.ping
```

Erwartete Ausgabe:
```json
{"result":{"data":{"json":{"status":"ok","timestamp":"2026-..."}}}}
```

- [ ] **Step 11: Commit**

```bash
cd ../..
git add apps/web
git commit -m "feat: add tRPC v11 with health router and Vitest setup"
```

---

## Task 6: shadcn/ui Setup + Homepage Placeholder

**Files:**
- Modify: `apps/web/app/(public)/page.tsx`
- Create: `apps/web/components/ui/` (auto-generated via shadcn CLI)

- [ ] **Step 1: shadcn/ui initialisieren**

```bash
cd apps/web
pnpm dlx shadcn@latest init
```

Antworten:
- Style: `Default`
- Base color: `Neutral`
- CSS variables: `Yes`

- [ ] **Step 2: Basis-Komponenten installieren**

```bash
pnpm dlx shadcn@latest add button card input label badge separator
```

- [ ] **Step 3: Homepage Placeholder erstellen**

`apps/web/app/(public)/page.tsx`:
```typescript
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tight">Heizbua</h1>
        <p className="mt-2 text-xl text-muted-foreground">
          Energiepreise vergleichen — Pellets, Heizöl, Gas & mehr
        </p>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Jetzt vergleichen</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Vergleichsrechner kommt in Plan 2.
          </p>
          <Button className="mt-4 w-full" disabled>
            Preise vergleichen (bald verfügbar)
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
```

- [ ] **Step 4: Visuell prüfen**

```bash
pnpm dev
```

Öffne `http://localhost:3000` — Heizbua Landing mit Card sollte erscheinen.

- [ ] **Step 5: Alle Tests laufen lassen**

```bash
cd ../..
pnpm test
```

Erwartete Ausgabe: `PASS — health router > returns ok status`

- [ ] **Step 6: Final Commit**

```bash
git add .
git commit -m "feat: add shadcn/ui and homepage placeholder — Plan 1 complete"
```

---

## Checkliste: Plan 1 abgeschlossen wenn

- [ ] `pnpm dev` startet ohne Fehler
- [ ] `http://localhost:3000` zeigt Heizbua Homepage
- [ ] `http://localhost:3000/dealer/register` zeigt Clerk SignUp
- [ ] `http://localhost:3000/dealer/dashboard` ohne Login → Redirect zu SignIn
- [ ] `curl http://localhost:3000/api/trpc/health.ping` liefert `{"status":"ok",...}`
- [ ] `pnpm test` → alle Tests grün
- [ ] `pnpm db:push` → Prisma Schema in Neon DB
- [ ] `pnpm db:seed` → FuelTypes + EnergyConversions in DB

---

*Nächster Plan: [Plan 2 — Comparison Engine](2026-04-17-plan-2-comparison-engine.md)*
