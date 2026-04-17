import { z } from "zod";
import { Prisma } from "@heizbua/db";
import { router, publicProcedure } from "../trpc";

export const compareRouter = router({
  search: publicProcedure
    .input(
      z.object({
        plz: z.string().regex(/^\d{5}$/, "PLZ muss 5-stellig sein"),
        fuelTypeId: z.string().min(1),
        quantity: z.number().int().min(1),
      })
    )
    .query(async ({ ctx, input }) => {
      const { plz, fuelTypeId, quantity } = input;
      const now = new Date();

      const zones = await ctx.prisma.postalZone.findMany({
        where: {
          plzFrom: { lte: plz },
          plzTo: { gte: plz },
        },
        select: { dealerId: true },
      });

      if (zones.length === 0) return [];

      const dealerIds = [...new Set(zones.map((zone: { dealerId: string }) => zone.dealerId))];

      const listings = await ctx.prisma.priceListing.findMany({
        where: {
          dealerId: { in: dealerIds },
          fuelTypeId,
          active: true,
          validFrom: { lte: now },
          minQuantity: { lte: quantity },
          AND: [
            { OR: [{ validTo: null }, { validTo: { gte: now } }] },
            { OR: [{ maxQuantity: null }, { maxQuantity: { gte: quantity } }] },
          ],
        },
        include: {
          dealer: {
            select: {
              id: true,
              name: true,
              logo: true,
              website: true,
              rating: true,
              reviewCount: true,
            },
          },
          fuelType: {
            select: {
              id: true,
              slug: true,
              label: true,
              unit: true,
              conversion: { select: { kWhPerUnit: true } },
            },
          },
        },
        take: 50,
      });

      type ListingWithRelations = Prisma.PriceListingGetPayload<{
        include: {
          dealer: { select: { id: true; name: true; logo: true; website: true; rating: true; reviewCount: true } };
          fuelType: { select: { id: true; slug: true; label: true; unit: true; conversion: { select: { kWhPerUnit: true } } } };
        };
      }>;

      const results = listings.map((listing: ListingWithRelations) => {
        const price = Number(listing.pricePerUnit);
        const totalPrice = price * quantity;
        const kWhPerUnit = listing.fuelType.conversion
          ? Number(listing.fuelType.conversion.kWhPerUnit)
          : null;
        const pricePerKwh = kWhPerUnit ? price / kWhPerUnit : null;

        return {
          listingId: listing.id,
          dealerId: listing.dealerId,
          dealerName: listing.dealer.name,
          dealerLogo: listing.dealer.logo,
          dealerWebsite: listing.dealer.website,
          dealerRating: listing.dealer.rating
            ? Number(listing.dealer.rating)
            : null,
          dealerReviewCount: listing.dealer.reviewCount,
          pricePerUnit: price,
          unit: listing.fuelType.unit,
          totalPrice,
          pricePerKwh,
          deliveryDays: listing.deliveryDays,
          fuelLabel: listing.fuelType.label,
        };
      });

      return results.sort((a: { totalPrice: number }, b: { totalPrice: number }) => a.totalPrice - b.totalPrice).slice(0, 20);
    }),
});
