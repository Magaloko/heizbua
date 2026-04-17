import { describe, it, expect, vi, beforeEach } from "vitest";
import { createCallerFactory } from "../trpc";
import { compareRouter } from "./compare";

const createCaller = createCallerFactory(compareRouter);

const now = new Date();
const yesterday = new Date(now.getTime() - 86400000);

const mockPrisma = {
  postalZone: { findMany: vi.fn() },
  priceListing: { findMany: vi.fn() },
};

const ctx = { prisma: mockPrisma as any, userId: null, role: null };

describe("compare.search", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns empty array when no zones match PLZ", async () => {
    mockPrisma.postalZone.findMany.mockResolvedValue([]);

    const caller = createCaller(ctx);
    const result = await caller.search({
      plz: "80331",
      fuelTypeId: "fuel-1",
      quantity: 1000,
    });

    expect(result).toEqual([]);
    expect(mockPrisma.priceListing.findMany).not.toHaveBeenCalled();
  });

  it("returns sorted results by totalPrice", async () => {
    mockPrisma.postalZone.findMany.mockResolvedValue([
      { dealerId: "dealer-1" },
      { dealerId: "dealer-2" },
    ]);
    mockPrisma.priceListing.findMany.mockResolvedValue([
      {
        id: "listing-1",
        dealerId: "dealer-1",
        pricePerUnit: "0.35",
        minQuantity: 500,
        maxQuantity: null,
        deliveryDays: 5,
        validFrom: yesterday,
        validTo: null,
        dealer: { id: "dealer-1", name: "Pellets Süd", logo: null, website: "https://example.com", rating: "4.5", reviewCount: 10 },
        fuelType: { id: "fuel-1", slug: "pellets", label: "Holzpellets", unit: "kg", conversion: { kWhPerUnit: "4.8" } },
      },
      {
        id: "listing-2",
        dealerId: "dealer-2",
        pricePerUnit: "0.32",
        minQuantity: 500,
        maxQuantity: null,
        deliveryDays: 3,
        validFrom: yesterday,
        validTo: null,
        dealer: { id: "dealer-2", name: "Pellets Nord", logo: null, website: "https://north.com", rating: null, reviewCount: 0 },
        fuelType: { id: "fuel-1", slug: "pellets", label: "Holzpellets", unit: "kg", conversion: { kWhPerUnit: "4.8" } },
      },
    ]);

    const caller = createCaller(ctx);
    const result = await caller.search({
      plz: "80331",
      fuelTypeId: "fuel-1",
      quantity: 1000,
    });

    expect(result).toHaveLength(2);
    expect(result[0].dealerId).toBe("dealer-2");
    expect(result[0].totalPrice).toBe(320);
    expect(result[1].totalPrice).toBe(350);
    expect(result[0].pricePerKwh).toBeCloseTo(0.32 / 4.8, 5);
  });

  it("rejects invalid PLZ format", async () => {
    const caller = createCaller(ctx);
    await expect(
      caller.search({ plz: "123", fuelTypeId: "fuel-1", quantity: 1000 })
    ).rejects.toThrow();
  });

  it("rejects quantity below 1", async () => {
    const caller = createCaller(ctx);
    await expect(
      caller.search({ plz: "80331", fuelTypeId: "fuel-1", quantity: 0 })
    ).rejects.toThrow();
  });
});
