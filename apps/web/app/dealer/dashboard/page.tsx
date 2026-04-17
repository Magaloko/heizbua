import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DealerDashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/dealer/login");

  const user = await currentUser();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Händler Dashboard</h1>
      <p className="text-muted-foreground">
        Willkommen, {user?.firstName ?? "Händler"}
      </p>
    </main>
  );
}
