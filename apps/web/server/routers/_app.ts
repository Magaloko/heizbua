import { router } from "../trpc";
import { healthRouter } from "./health";
import { fuelTypesRouter } from "./fuelTypes";
import { compareRouter } from "./compare";
import { leadsRouter } from "./leads";
import { priceIndexRouter } from "./priceIndex";

export const appRouter = router({
  health: healthRouter,
  fuelTypes: fuelTypesRouter,
  compare: compareRouter,
  leads: leadsRouter,
  priceIndex: priceIndexRouter,
});

export type AppRouter = typeof appRouter;
