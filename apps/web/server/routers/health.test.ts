import { describe, it, expect } from "vitest";
import { createCallerFactory } from "../trpc";
import { appRouter } from "./_app";

const createCaller = createCallerFactory(appRouter);

describe("health router", () => {
  it("returns ok status with timestamp", async () => {
    const caller = createCaller({
      prisma: {} as never,
      userId: null,
      role: null,
    });
    const result = await caller.health.ping();
    expect(result.status).toBe("ok");
    expect(typeof result.timestamp).toBe("string");
  });
});
