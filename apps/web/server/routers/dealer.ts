import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const dealerRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.dealer.findUnique({
      where: { clerkUserId: ctx.userId },
    });
  }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().min(2),
      email: z.string().email(),
      website: z.string().url().nullable(),
      description: z.string().nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.dealer.create({
        data: {
          clerkUserId: ctx.userId,
          name: input.name,
          email: input.email,
          website: input.website,
          description: input.description,
        },
      });
    }),

  update: protectedProcedure
    .input(z.object({
      name: z.string().min(2).optional(),
      website: z.string().url().nullable().optional(),
      description: z.string().nullable().optional(),
      logo: z.string().url().nullable().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const dealer = await ctx.prisma.dealer.findUnique({
        where: { clerkUserId: ctx.userId },
      });
      if (!dealer) throw new Error("Kein Händler-Profil gefunden");
      return ctx.prisma.dealer.update({
        where: { id: dealer.id },
        data: input,
      });
    }),

  stats: protectedProcedure.query(async ({ ctx }) => {
    const dealer = await ctx.prisma.dealer.findUnique({
      where: { clerkUserId: ctx.userId },
    });
    if (!dealer) return { listingCount: 0, zoneCount: 0, leadCount: 0 };

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [listingCount, zoneCount, leadCount] = await Promise.all([
      ctx.prisma.priceListing.count({ where: { dealerId: dealer.id, active: true } }),
      ctx.prisma.postalZone.count({ where: { dealerId: dealer.id } }),
      ctx.prisma.lead.count({
        where: {
          listing: { dealerId: dealer.id },
          clickedAt: { gte: thirtyDaysAgo },
        },
      }),
    ]);

    return { listingCount, zoneCount, leadCount };
  }),
});
