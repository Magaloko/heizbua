import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";

const plzSchema = z.string().regex(/^\d{4,5}$/, "PLZ muss 4- oder 5-stellig sein");

export const dealerZonesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const dealer = await ctx.prisma.dealer.findUnique({
      where: { clerkUserId: ctx.userId },
    });
    if (!dealer) return [];
    return ctx.prisma.postalZone.findMany({
      where: { dealerId: dealer.id },
      orderBy: { plzFrom: "asc" },
    });
  }),

  create: protectedProcedure
    .input(z.object({ plzFrom: plzSchema, plzTo: plzSchema }))
    .mutation(async ({ ctx, input }) => {
      if (input.plzFrom > input.plzTo) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "PLZ-Von muss kleiner oder gleich PLZ-Bis sein" });
      }
      const dealer = await ctx.prisma.dealer.findUnique({
        where: { clerkUserId: ctx.userId },
      });
      if (!dealer) throw new TRPCError({ code: "PRECONDITION_FAILED" });
      return ctx.prisma.postalZone.create({
        data: { dealerId: dealer.id, plzFrom: input.plzFrom, plzTo: input.plzTo },
      });
    }),

  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const dealer = await ctx.prisma.dealer.findUnique({
        where: { clerkUserId: ctx.userId },
      });
      if (!dealer) throw new TRPCError({ code: "PRECONDITION_FAILED" });
      const zone = await ctx.prisma.postalZone.findFirst({
        where: { id: input.id, dealerId: dealer.id },
      });
      if (!zone) throw new TRPCError({ code: "NOT_FOUND" });
      return ctx.prisma.postalZone.delete({ where: { id: input.id } });
    }),
});
