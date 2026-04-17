import { router, publicProcedure } from "../trpc";

export const fuelTypesRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.fuelType.findMany({
      orderBy: { label: "asc" },
    });
  }),
});
