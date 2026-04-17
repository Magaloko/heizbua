import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";

const listingInput = z.object({
  fuelTypeId: z.string().min(1),
  pricePerUnit: z.number().positive(),
  minQuantity: z.number().int().min(1),
  maxQuantity: z.number().int().positive().nullable(),
  deliveryDays: z.number().int().min(1).nullable(),
  validFrom: z.date(),
  validTo: z.date().nullable(),
});

export const dealerListingsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const dealer = await ctx.prisma.dealer.findUnique({
      where: { clerkUserId: ctx.userId },
    });
    if (!dealer) return [];
    return ctx.prisma.priceListing.findMany({
      where: { dealerId: dealer.id },
      include: { fuelType: { select: { label: true, unit: true } } },
      orderBy: { createdAt: "desc" },
    });
  }),

  create: protectedProcedure
    .input(listingInput)
    .mutation(async ({ ctx, input }) => {
      const dealer = await ctx.prisma.dealer.findUnique({
        where: { clerkUserId: ctx.userId },
      });
      if (!dealer) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Kein Händler-Profil" });
      return ctx.prisma.priceListing.create({
        data: {
          dealerId: dealer.id,
          fuelTypeId: input.fuelTypeId,
          pricePerUnit: input.pricePerUnit,
          minQuantity: input.minQuantity,
          maxQuantity: input.maxQuantity,
          deliveryDays: input.deliveryDays,
          validFrom: input.validFrom,
          validTo: input.validTo,
          active: true,
        },
      });
    }),

  update: protectedProcedure
    .input(z.object({ id: z.string() }).merge(listingInput.partial()).extend({ active: z.boolean().optional() }))
    .mutation(async ({ ctx, input }) => {
      const dealer = await ctx.prisma.dealer.findUnique({
        where: { clerkUserId: ctx.userId },
      });
      if (!dealer) throw new TRPCError({ code: "PRECONDITION_FAILED" });
      const { id, ...data } = input;
      const listing = await ctx.prisma.priceListing.findFirst({
        where: { id, dealerId: dealer.id },
      });
      if (!listing) throw new TRPCError({ code: "NOT_FOUND" });
      return ctx.prisma.priceListing.update({ where: { id }, data });
    }),

  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const dealer = await ctx.prisma.dealer.findUnique({
        where: { clerkUserId: ctx.userId },
      });
      if (!dealer) throw new TRPCError({ code: "PRECONDITION_FAILED" });
      const listing = await ctx.prisma.priceListing.findFirst({
        where: { id: input.id, dealerId: dealer.id },
      });
      if (!listing) throw new TRPCError({ code: "NOT_FOUND" });
      return ctx.prisma.priceListing.delete({ where: { id: input.id } });
    }),
});
