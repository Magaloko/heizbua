export type PlzInfo = {
  plz: string;
  district: string;
  state: string;
};

export function isValidPlzFormat(plz: string): boolean {
  return /^\d{5}$/.test(plz);
}

export async function fetchPlzInfo(plz: string): Promise<PlzInfo | null> {
  try {
    const res = await fetch(
      `https://openplzapi.org/de/Localities?postalCode=${plz}&page=1&pageSize=1`
    );
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{
      zipCode: string;
      name: string;
      federalState: { name: string };
    }>;
    if (!data.length) return null;
    const entry = data[0];
    return {
      plz: entry.zipCode,
      district: entry.name,
      state: entry.federalState.name,
    };
  } catch {
    return null;
  }
}
