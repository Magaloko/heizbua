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
