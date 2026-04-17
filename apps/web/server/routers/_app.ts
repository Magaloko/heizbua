import { router } from "../trpc";
import { healthRouter } from "./health";
import { fuelTypesRouter } from "./fuelTypes";
import { compareRouter } from "./compare";
import { leadsRouter } from "./leads";
import { priceIndexRouter } from "./priceIndex";
import { dealerRouter } from "./dealer";
import { dealerListingsRouter } from "./dealerListings";
import { dealerZonesRouter } from "./dealerZones";

export const appRouter = router({
  health: healthRouter,
  fuelTypes: fuelTypesRouter,
  compare: compareRouter,
  leads: leadsRouter,
  priceIndex: priceIndexRouter,
  dealer: dealerRouter,
  dealerListings: dealerListingsRouter,
  dealerZones: dealerZonesRouter,
});

export type AppRouter = typeof appRouter;
