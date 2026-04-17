import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { deDE } from "@clerk/localizations";
import { TRPCReactProvider } from "@/lib/trpc/provider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Heizbua — Energiepreise vergleichen",
  description: "Preisvergleich für Holzpellets, Heizöl, Gas & mehr in Österreich und Deutschland.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider localization={deDE}>
      <html lang="de" className={cn(geist.variable, geistMono.variable)}>
        <body className="flex min-h-screen flex-col font-sans">
          <TRPCReactProvider>
            <Navbar />
            <div className="flex-1">{children}</div>
            <Footer />
          </TRPCReactProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
