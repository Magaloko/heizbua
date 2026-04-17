import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/dealer/login");

  if (sessionClaims?.metadata?.role !== "admin") {
    redirect("/dealer/dashboard");
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Admin Panel</h1>
    </main>
  );
}
