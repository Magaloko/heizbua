import { z } from "zod";
import { router, publicProcedure } from "../trpc";

export const priceIndexRouter = router({
  history: publicProcedure
    .input(
      z.object({
        fuelTypeId: z.string().min(1),
        days: z.number().int().min(1).max(365),
      })
    )
    .query(async ({ ctx, input }) => {
      const since = new Date();
      since.setDate(since.getDate() - input.days);

      const records = await ctx.prisma.priceHistory.findMany({
        where: {
          fuelTypeId: input.fuelTypeId,
          recordedAt: { gte: since },
        },
        orderBy: { recordedAt: "asc" },
      });

      return records.map((r) => ({
        id: r.id,
        avgPrice: Number(r.avgPrice),
        recordedAt: r.recordedAt,
        source: r.source,
      }));
    }),
});
