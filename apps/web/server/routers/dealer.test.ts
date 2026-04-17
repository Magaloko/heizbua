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
  createdAt: new Date(),
  updatedAt: new Date(),
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
  });

  it("returns zeros when no dealer profile", async () => {
    mockPrisma.dealer.findUnique.mockResolvedValue(null);
    const caller = createCaller(ctx);
    const result = await caller.stats();
    expect(result).toEqual({ listingCount: 0, zoneCount: 0, leadCount: 0 });
  });
});
