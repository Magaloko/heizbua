import { describe, it, expect, vi, beforeEach } from "vitest";
import { createCallerFactory } from "../trpc";
import { priceIndexRouter } from "./priceIndex";

const createCaller = createCallerFactory(priceIndexRouter);

const mockPrisma = {
  priceHistory: { findMany: vi.fn() },
};

const ctx = { prisma: mockPrisma as any, userId: null, role: null };

describe("priceIndex.history", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns price history for a fuel type over 30 days", async () => {
    const records = [
      { id: "1", fuelTypeId: "fuel-1", avgPrice: "0.35", recordedAt: new Date("2026-04-01"), source: "carmen" },
      { id: "2", fuelTypeId: "fuel-1", avgPrice: "0.34", recordedAt: new Date("2026-04-08"), source: "carmen" },
    ];
    mockPrisma.priceHistory.findMany.mockResolvedValue(records);

    const caller = createCaller(ctx);
    const result = await caller.history({ fuelTypeId: "fuel-1", days: 30 });

    expect(result).toHaveLength(2);
    expect(result[0].avgPrice).toBe(0.35);
    expect(result[0].recordedAt).toBeInstanceOf(Date);
    expect(mockPrisma.priceHistory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ fuelTypeId: "fuel-1" }),
        orderBy: { recordedAt: "asc" },
      })
    );
  });

  it("rejects days outside allowed range", async () => {
    const caller = createCaller(ctx);
    await expect(caller.history({ fuelTypeId: "fuel-1", days: 400 })).rejects.toThrow();
    await expect(caller.history({ fuelTypeId: "fuel-1", days: 0 })).rejects.toThrow();
  });
});
