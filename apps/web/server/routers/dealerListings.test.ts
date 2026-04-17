import { describe, it, expect, vi, beforeEach } from "vitest";
import { createCallerFactory } from "../trpc";
import { dealerListingsRouter } from "./dealerListings";

const createCaller = createCallerFactory(dealerListingsRouter);

const mockDealer = { id: "dealer-1", clerkUserId: "clerk-1" };
const mockListing = {
  id: "listing-1",
  dealerId: "dealer-1",
  fuelTypeId: "ft-1",
  pricePerUnit: 0.285,
  minQuantity: 500,
  maxQuantity: 5000,
  deliveryDays: 5,
  validFrom: new Date("2026-01-01"),
  validTo: null,
  active: true,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

const mockPrisma = {
  dealer: { findUnique: vi.fn() },
  priceListing: {
    findMany: vi.fn(),
    create: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

const ctx = { prisma: mockPrisma as any, userId: "clerk-1", role: null };
const unauthCtx = { prisma: mockPrisma as any, userId: null, role: null };

describe("dealerListings.list", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns listings for current dealer", async () => {
    mockPrisma.dealer.findUnique.mockResolvedValue(mockDealer);
    mockPrisma.priceListing.findMany.mockResolvedValue([mockListing]);
    const caller = createCaller(ctx);
    const result = await caller.list();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("listing-1");
    expect(mockPrisma.priceListing.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { dealerId: "dealer-1" } })
    );
  });

  it("returns empty array when no dealer profile", async () => {
    mockPrisma.dealer.findUnique.mockResolvedValue(null);
    const caller = createCaller(ctx);
    const result = await caller.list();
    expect(result).toEqual([]);
  });

  it("throws UNAUTHORIZED when not logged in", async () => {
    const caller = createCaller(unauthCtx);
    await expect(caller.list()).rejects.toThrow("UNAUTHORIZED");
  });
});

describe("dealerListings.create", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a listing for current dealer", async () => {
    mockPrisma.dealer.findUnique.mockResolvedValue(mockDealer);
    mockPrisma.priceListing.create.mockResolvedValue(mockListing);
    const caller = createCaller(ctx);
    const result = await caller.create({
      fuelTypeId: "ft-1",
      pricePerUnit: 0.285,
      minQuantity: 500,
      maxQuantity: 5000,
      deliveryDays: 5,
      validFrom: new Date("2026-01-01"),
      validTo: null,
    });
    expect(result.id).toBe("listing-1");
    expect(mockPrisma.priceListing.create).toHaveBeenCalledWith({
      data: {
        dealerId: "dealer-1",
        fuelTypeId: "ft-1",
        pricePerUnit: 0.285,
        minQuantity: 500,
        maxQuantity: 5000,
        deliveryDays: 5,
        validFrom: new Date("2026-01-01"),
        validTo: null,
        active: true,
      },
    });
  });

  it("throws PRECONDITION_FAILED when no dealer profile exists", async () => {
    mockPrisma.dealer.findUnique.mockResolvedValue(null);
    const caller = createCaller(ctx);
    await expect(caller.create({
      fuelTypeId: "ft-1",
      pricePerUnit: 0.285,
      minQuantity: 500,
      maxQuantity: null,
      deliveryDays: null,
      validFrom: new Date(),
      validTo: null,
    })).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
  });

  it("throws UNAUTHORIZED when not logged in", async () => {
    const caller = createCaller(unauthCtx);
    await expect(caller.create({
      fuelTypeId: "ft-1", pricePerUnit: 0.285, minQuantity: 500,
      maxQuantity: null, deliveryDays: null, validFrom: new Date(), validTo: null,
    })).rejects.toThrow("UNAUTHORIZED");
  });
});

describe("dealerListings.remove", () => {
  beforeEach(() => vi.clearAllMocks());

  it("deletes listing owned by current dealer", async () => {
    mockPrisma.dealer.findUnique.mockResolvedValue(mockDealer);
    mockPrisma.priceListing.findFirst.mockResolvedValue(mockListing);
    mockPrisma.priceListing.delete.mockResolvedValue(mockListing);
    const caller = createCaller(ctx);
    await caller.remove({ id: "listing-1" });
    expect(mockPrisma.priceListing.delete).toHaveBeenCalledWith({ where: { id: "listing-1" } });
  });

  it("throws NOT_FOUND when listing belongs to different dealer", async () => {
    mockPrisma.dealer.findUnique.mockResolvedValue(mockDealer);
    mockPrisma.priceListing.findFirst.mockResolvedValue(null);
    const caller = createCaller(ctx);
    await expect(caller.remove({ id: "other-listing" })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("throws UNAUTHORIZED when not logged in", async () => {
    const caller = createCaller(unauthCtx);
    await expect(caller.remove({ id: "listing-1" })).rejects.toThrow("UNAUTHORIZED");
  });
});
