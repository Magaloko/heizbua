import { describe, it, expect, vi } from "vitest";
import { isValidPlzFormat, fetchPlzInfo, type PlzInfo } from "./plz";

describe("isValidPlzFormat", () => {
  it("accepts 5-digit German PLZ", () => {
    expect(isValidPlzFormat("80331")).toBe(true);
    expect(isValidPlzFormat("01067")).toBe(true);
  });

  it("rejects non-5-digit strings", () => {
    expect(isValidPlzFormat("1234")).toBe(false);
    expect(isValidPlzFormat("123456")).toBe(false);
    expect(isValidPlzFormat("ABCDE")).toBe(false);
    expect(isValidPlzFormat("")).toBe(false);
  });
});

describe("fetchPlzInfo", () => {
  it("returns PlzInfo on valid API response", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ zipCode: "80331", name: "München", federalState: { name: "Bayern" } }],
    });
    global.fetch = mockFetch as unknown as typeof fetch;

    const result = await fetchPlzInfo("80331");
    expect(result).toMatchObject<PlzInfo>({
      plz: "80331",
      district: "München",
      state: "Bayern",
    });
    expect(mockFetch).toHaveBeenCalledWith(
      "https://openplzapi.org/de/Localities?postalCode=80331&page=1&pageSize=1"
    );
  });

  it("returns null when PLZ not found", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    }) as unknown as typeof fetch;

    const result = await fetchPlzInfo("99999");
    expect(result).toBeNull();
  });

  it("returns null on fetch error", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("network error")) as unknown as typeof fetch;
    const result = await fetchPlzInfo("80331");
    expect(result).toBeNull();
  });
});
