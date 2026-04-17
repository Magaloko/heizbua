import { describe, it, expect, vi, beforeEach } from "vitest";
import { createCallerFactory } from "../trpc";
import { dealerZonesRouter } from "./dealerZones";

const createCaller = createCallerFactory(dealerZonesRouter);

const mockDealer = { id: "dealer-1", clerkUserId: "clerk-1" };
const mockZone = { id: "zone-1", dealerId: "dealer-1", plzFrom: "1100", plzTo: "1230" };

const mockPrisma = {
  dealer: { findUnique: vi.fn() },
  postalZone: {
    findMany: vi.fn(),
    create: vi.fn(),
    findFirst: vi.fn(),
    delete: vi.fn(),
  },
};

const ctx = { prisma: mockPrisma as any, userId: "clerk-1", role: null };
const unauthCtx = { prisma: mockPrisma as any, userId: null, role: null };

describe("dealerZones.list", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns zones for current dealer", async () => {
    mockPrisma.dealer.findUnique.mockResolvedValue(mockDealer);
    mockPrisma.postalZone.findMany.mockResolvedValue([mockZone]);
    const caller = createCaller(ctx);
    const result = await caller.list();
    expect(result).toHaveLength(1);
    expect(result[0].plzFrom).toBe("1100");
    expect(mockPrisma.postalZone.findMany).toHaveBeenCalledWith(
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

describe("dealerZones.create", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a postal zone for current dealer", async () => {
    mockPrisma.dealer.findUnique.mockResolvedValue(mockDealer);
    mockPrisma.postalZone.create.mockResolvedValue(mockZone);
    const caller = createCaller(ctx);
    const result = await caller.create({ plzFrom: "1100", plzTo: "1230" });
    expect(result.id).toBe("zone-1");
    expect(mockPrisma.postalZone.create).toHaveBeenCalledWith({
      data: { dealerId: "dealer-1", plzFrom: "1100", plzTo: "1230" },
    });
  });

  it("throws BAD_REQUEST when plzFrom > plzTo", async () => {
    mockPrisma.dealer.findUnique.mockResolvedValue(mockDealer);
    const caller = createCaller(ctx);
    await expect(caller.create({ plzFrom: "9999", plzTo: "1000" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("throws PRECONDITION_FAILED when no dealer profile", async () => {
    mockPrisma.dealer.findUnique.mockResolvedValue(null);
    const caller = createCaller(ctx);
    await expect(caller.create({ plzFrom: "1100", plzTo: "1230" })).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
  });

  it("throws UNAUTHORIZED when not logged in", async () => {
    const caller = createCaller(unauthCtx);
    await expect(caller.create({ plzFrom: "1100", plzTo: "1230" })).rejects.toThrow("UNAUTHORIZED");
  });
});

describe("dealerZones.remove", () => {
  beforeEach(() => vi.clearAllMocks());

  it("deletes zone owned by current dealer", async () => {
    mockPrisma.dealer.findUnique.mockResolvedValue(mockDealer);
    mockPrisma.postalZone.findFirst.mockResolvedValue(mockZone);
    mockPrisma.postalZone.delete.mockResolvedValue(mockZone);
    const caller = createCaller(ctx);
    await caller.remove({ id: "zone-1" });
    expect(mockPrisma.postalZone.delete).toHaveBeenCalledWith({ where: { id: "zone-1" } });
  });

  it("throws NOT_FOUND when zone belongs to different dealer", async () => {
    mockPrisma.dealer.findUnique.mockResolvedValue(mockDealer);
    mockPrisma.postalZone.findFirst.mockResolvedValue(null);
    const caller = createCaller(ctx);
    await expect(caller.remove({ id: "other-zone" })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("throws UNAUTHORIZED when not logged in", async () => {
    const caller = createCaller(unauthCtx);
    await expect(caller.remove({ id: "zone-1" })).rejects.toThrow("UNAUTHORIZED");
  });
});
