import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/trpc/server";
import { ListingsClient } from "./ListingsClient";

export default async function PreisePage() {
  const { userId } = await auth();
  if (!userId) redirect("/dealer/login");

  const trpc = await createServerClient();
  const [dealer, listings, fuelTypes] = await Promise.all([
    trpc.dealer.me().catch(() => null),
    trpc.dealerListings.list().catch(() => []),
    trpc.fuelTypes.list().catch(() => []),
  ]);

  if (!dealer) redirect("/dealer/onboarding");

  return <ListingsClient initialListings={listings} fuelTypes={fuelTypes} />;
}
