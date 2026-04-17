import { describe, it, expect, vi, afterEach } from "vitest";
import { isValidPlzFormat, detectCountry, fetchPlzInfo, type PlzInfo } from "./plz";

describe("isValidPlzFormat", () => {
  it("accepts 5-digit German PLZ", () => {
    expect(isValidPlzFormat("80331")).toBe(true);
    expect(isValidPlzFormat("01067")).toBe(true);
  });

  it("accepts 4-digit Austrian PLZ", () => {
    expect(isValidPlzFormat("1100")).toBe(true);
    expect(isValidPlzFormat("6020")).toBe(true);
  });

  it("rejects invalid strings", () => {
    expect(isValidPlzFormat("123")).toBe(false);
    expect(isValidPlzFormat("123456")).toBe(false);
    expect(isValidPlzFormat("ABCDE")).toBe(false);
    expect(isValidPlzFormat("")).toBe(false);
  });
});

describe("detectCountry", () => {
  it("returns AT for 4-digit PLZ", () => {
    expect(detectCountry("1100")).toBe("AT");
    expect(detectCountry("6020")).toBe("AT");
  });

  it("returns DE for 5-digit PLZ", () => {
    expect(detectCountry("80331")).toBe("DE");
    expect(detectCountry("10115")).toBe("DE");
  });
});

describe("fetchPlzInfo", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("calls /de/ endpoint for German PLZ", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ zipCode: "80331", name: "München", federalState: { name: "Bayern" } }],
    });
    vi.stubGlobal("fetch", mockFetch);

    const result = await fetchPlzInfo("80331");
    expect(result).toMatchObject<PlzInfo>({
      plz: "80331",
      district: "München",
      state: "Bayern",
      country: "DE",
    });
    expect(mockFetch).toHaveBeenCalledWith(
      "https://openplzapi.org/de/Localities?postalCode=80331&page=1&pageSize=1"
    );
  });

  it("calls /at/ endpoint for Austrian PLZ", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ key: "1100", name: "Wien, 10. Bezirk", federalProvince: { name: "Wien" } }],
    });
    vi.stubGlobal("fetch", mockFetch);

    const result = await fetchPlzInfo("1100");
    expect(result).toMatchObject<PlzInfo>({
      plz: "1100",
      district: "Wien, 10. Bezirk",
      state: "Wien",
      country: "AT",
    });
    expect(mockFetch).toHaveBeenCalledWith(
      "https://openplzapi.org/at/Localities?postalCode=1100&page=1&pageSize=1"
    );
  });

  it("returns null when PLZ not found", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    }));
    expect(await fetchPlzInfo("9999")).toBeNull();
  });

  it("returns null on fetch error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network error")));
    expect(await fetchPlzInfo("80331")).toBeNull();
  });

  it("returns null on non-ok HTTP response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    expect(await fetchPlzInfo("80331")).toBeNull();
  });

  it("returns null for invalid format", async () => {
    expect(await fetchPlzInfo("123")).toBeNull();
    expect(await fetchPlzInfo("")).toBeNull();
  });
});
