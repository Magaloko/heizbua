import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DealerDashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/dealer/login");

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Händler Dashboard</h1>
    </main>
  );
}
