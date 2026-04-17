import { describe, it, expect, vi, beforeEach } from "vitest";
import { createCallerFactory } from "../trpc";
import { dealerRouter } from "./dealer";

const createCaller = createCallerFactory(dealerRouter);

const mockDealer = {
  id: "dealer-1",
  clerkUserId: "clerk-1",
  name: "Test Händler",
  email: "test@example.com",
  role: "DEALER" as const,
  status: "ACTIVE" as const,
  logo: null,
  description: null,
  website: "https://example.com",
  rating: null,
  reviewCount: 0,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

const mockPrisma = {
  dealer: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  priceListing: {
    count: vi.fn(),
  },
  postalZone: {
    count: vi.fn(),
  },
  lead: {
    count: vi.fn(),
  },
};

const ctx = { prisma: mockPrisma as any, userId: "clerk-1", role: null };
const unauthCtx = { prisma: mockPrisma as any, userId: null, role: null };

describe("dealer.me", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns dealer for authenticated user", async () => {
    mockPrisma.dealer.findUnique.mockResolvedValue(mockDealer);
    const caller = createCaller(ctx);
    const result = await caller.me();
    expect(result).toEqual(mockDealer);
    expect(mockPrisma.dealer.findUnique).toHaveBeenCalledWith({
      where: { clerkUserId: "clerk-1" },
    });
  });

  it("returns null when no dealer profile exists", async () => {
    mockPrisma.dealer.findUnique.mockResolvedValue(null);
    const caller = createCaller(ctx);
    const result = await caller.me();
    expect(result).toBeNull();
  });

  it("throws UNAUTHORIZED when not logged in", async () => {
    const caller = createCaller(unauthCtx);
    await expect(caller.me()).rejects.toThrow("UNAUTHORIZED");
  });
});

describe("dealer.create", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates dealer profile", async () => {
    mockPrisma.dealer.findUnique.mockResolvedValue(null);
    mockPrisma.dealer.create.mockResolvedValue(mockDealer);
    const caller = createCaller(ctx);
    const result = await caller.create({
      name: "Test Händler",
      email: "test@example.com",
      website: "https://example.com",
      description: null,
    });
    expect(result.id).toBe("dealer-1");
    expect(mockPrisma.dealer.create).toHaveBeenCalledWith({
      data: {
        clerkUserId: "clerk-1",
        name: "Test Händler",
        email: "test@example.com",
        website: "https://example.com",
        description: null,
      },
    });
  });

  it("throws CONFLICT when dealer already exists", async () => {
    mockPrisma.dealer.findUnique.mockResolvedValue(mockDealer);
    const caller = createCaller(ctx);
    await expect(
      caller.create({ name: "Test Händler", email: "test@example.com", website: "https://example.com", description: null })
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("throws UNAUTHORIZED when not logged in", async () => {
    const caller = createCaller(unauthCtx);
    await expect(
      caller.create({ name: "X", email: "x@x.com", website: null, description: null })
    ).rejects.toThrow("UNAUTHORIZED");
  });
});

describe("dealer.update", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates dealer successfully", async () => {
    const updatedDealer = { ...mockDealer, name: "Updated Händler" };
    mockPrisma.dealer.findUnique.mockResolvedValue(mockDealer);
    mockPrisma.dealer.update.mockResolvedValue(updatedDealer);
    const caller = createCaller(ctx);
    const result = await caller.update({ name: "Updated Händler" });
    expect(result.name).toBe("Updated Händler");
    expect(mockPrisma.dealer.update).toHaveBeenCalledWith({
      where: { id: "dealer-1" },
      data: { name: "Updated Händler" },
    });
  });

  it("throws NOT_FOUND when no dealer exists", async () => {
    mockPrisma.dealer.findUnique.mockResolvedValue(null);
    const caller = createCaller(ctx);
    await expect(caller.update({ name: "Updated" })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("throws UNAUTHORIZED when not logged in", async () => {
    const caller = createCaller(unauthCtx);
    await expect(caller.update({ name: "X" })).rejects.toThrow("UNAUTHORIZED");
  });
});

describe("dealer.stats", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns listing, zone and lead counts", async () => {
    mockPrisma.dealer.findUnique.mockResolvedValue(mockDealer);
    mockPrisma.priceListing.count.mockResolvedValue(3);
    mockPrisma.postalZone.count.mockResolvedValue(2);
    mockPrisma.lead.count.mockResolvedValue(10);
    const caller = createCaller(ctx);
    const result = await caller.stats();
    expect(result).toEqual({ listingCount: 3, zoneCount: 2, leadCount: 10 });
    expect(mockPrisma.lead.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          clickedAt: expect.objectContaining({ gte: expect.any(Date) }),
        }),
      })
    );
  });

  it("returns zeros when no dealer profile", async () => {
    mockPrisma.dealer.findUnique.mockResolvedValue(null);
    const caller = createCaller(ctx);
    const result = await caller.stats();
    expect(result).toEqual({ listingCount: 0, zoneCount: 0, leadCount: 0 });
  });
});
