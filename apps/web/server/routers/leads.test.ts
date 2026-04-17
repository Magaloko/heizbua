import { describe, it, expect, vi, beforeEach } from "vitest";
import { createCallerFactory } from "../trpc";
import { leadsRouter } from "./leads";

const createCaller = createCallerFactory(leadsRouter);

const mockPrisma = {
  lead: { create: vi.fn() },
};

const ctx = { prisma: mockPrisma as any, userId: null, role: null };

describe("leads.create", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a lead record and returns dealerWebsite", async () => {
    mockPrisma.lead.create.mockResolvedValue({ id: "lead-1" });

    const caller = createCaller(ctx);
    const result = await caller.create({
      listingId: "listing-1",
      sessionToken: "sess-abc",
      plz: "80331",
      quantity: 1000,
      dealerWebsite: "https://example.com",
    });

    expect(mockPrisma.lead.create).toHaveBeenCalledWith({
      data: {
        listingId: "listing-1",
        sessionToken: "sess-abc",
        plz: "80331",
        quantity: 1000,
      },
    });
    expect(result).toEqual({ redirectUrl: "https://example.com" });
  });

  it("rejects invalid PLZ", async () => {
    const caller = createCaller(ctx);
    await expect(
      caller.create({
        listingId: "listing-1",
        sessionToken: "sess-abc",
        plz: "123",
        quantity: 1000,
        dealerWebsite: "https://example.com",
      })
    ).rejects.toThrow();
  });
});
