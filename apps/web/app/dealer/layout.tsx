import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

const NAV_ITEMS = [
  { href: "/dealer/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/dealer/preise", label: "Preisangebote", icon: "💶" },
  { href: "/dealer/liefergebiet", label: "Liefergebiet", icon: "📍" },
  { href: "/dealer/profil", label: "Mein Profil", icon: "🏢" },
];

export default async function DealerLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/dealer/login");

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-border bg-card px-4 py-6 gap-1">
        <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Händler-Portal
        </p>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </aside>

      {/* Mobile nav strip */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden border-t border-border bg-card">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-1 flex-col items-center gap-0.5 py-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <span className="text-base">{item.icon}</span>
            <span className="truncate">{item.label.split(" ")[0]}</span>
          </Link>
        ))}
      </div>

      {/* Main content */}
      <main className="flex-1 px-4 py-6 md:px-8 md:py-8 pb-20 md:pb-8">
        {children}
      </main>
    </div>
  );
}
