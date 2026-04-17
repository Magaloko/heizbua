import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

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
      const existing = await ctx.prisma.dealer.findUnique({ where: { clerkUserId: ctx.userId } });
      if (existing) throw new TRPCError({ code: "CONFLICT", message: "Händler-Profil existiert bereits" });
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
      if (!dealer) throw new TRPCError({ code: "NOT_FOUND", message: "Kein Händler-Profil gefunden" });
      return ctx.prisma.dealer.update({
        where: { id: dealer.id },
        data: {
          ...(input.name !== undefined && { name: input.name }),
          ...(input.website !== undefined && { website: input.website }),
          ...(input.description !== undefined && { description: input.description }),
          ...(input.logo !== undefined && { logo: input.logo }),
        },
      });
    }),

  stats: protectedProcedure.query(async ({ ctx }) => {
    const dealer = await ctx.prisma.dealer.findUnique({
      where: { clerkUserId: ctx.userId },
    });
    if (!dealer) return { listingCount: 0, zoneCount: 0, leadCount: 0 };

    const thirtyDaysAgo = new Date(Date.now() - THIRTY_DAYS_MS);

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
