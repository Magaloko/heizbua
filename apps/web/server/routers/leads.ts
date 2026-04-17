import { z } from "zod";
import { router, publicProcedure } from "../trpc";

export const leadsRouter = router({
  create: publicProcedure
    .input(
      z.object({
        listingId: z.string().min(1),
        sessionToken: z.string().min(1),
        plz: z.string().regex(/^\d{5}$/),
        quantity: z.number().int().min(1),
        dealerWebsite: z.string().url(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.lead.create({
        data: {
          listingId: input.listingId,
          sessionToken: input.sessionToken,
          plz: input.plz,
          quantity: input.quantity,
        },
      });
      return { redirectUrl: input.dealerWebsite };
    }),
});
