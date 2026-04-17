import { describe, it, expect, vi, beforeEach } from "vitest";
import { createCallerFactory } from "../trpc";
import { fuelTypesRouter } from "./fuelTypes";

const createCaller = createCallerFactory(fuelTypesRouter);

const mockPrisma = {
  fuelType: {
    findMany: vi.fn(),
  },
};

const ctx = { prisma: mockPrisma as any, userId: null, role: null };

describe("fuelTypes.list", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns all fuel types ordered by label", async () => {
    mockPrisma.fuelType.findMany.mockResolvedValue([
      { id: "1", slug: "pellets", label: "Holzpellets", unit: "kg" },
      { id: "2", slug: "heizoel", label: "Heizöl", unit: "liter" },
    ]);

    const caller = createCaller(ctx);
    const result = await caller.list();

    expect(result).toHaveLength(2);
    expect(result[0].slug).toBe("pellets");
    expect(mockPrisma.fuelType.findMany).toHaveBeenCalledWith({
      orderBy: { label: "asc" },
    });
  });
});
