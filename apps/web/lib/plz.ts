export type PlzInfo = {
  plz: string;
  district: string;
  state: string;
  country: "DE" | "AT";
};

// DE = 5 digits, AT = 4 digits
export function isValidPlzFormat(plz: string): boolean {
  return /^\d{4,5}$/.test(plz);
}

export function detectCountry(plz: string): "DE" | "AT" {
  return plz.length === 4 ? "AT" : "DE";
}

type OpenPlzLocality = {
  zipCode?: string;
  key?: string;
  postalCode?: string;
  name: string;
  federalState?: { name: string };
  federalProvince?: { name: string };
};

export async function fetchPlzInfo(plz: string): Promise<PlzInfo | null> {
  if (!isValidPlzFormat(plz)) return null;
  const country = detectCountry(plz);
  const countryCode = country.toLowerCase();
  try {
    const res = await fetch(
      `https://openplzapi.org/${countryCode}/Localities?postalCode=${plz}&page=1&pageSize=1`
    );
    if (!res.ok) return null;
    const data = (await res.json()) as OpenPlzLocality[];
    if (!data.length) return null;
    const entry = data[0];
    return {
      plz: entry.zipCode ?? entry.key ?? entry.postalCode ?? plz,
      district: entry.name,
      state: entry.federalState?.name ?? entry.federalProvince?.name ?? "",
      country,
    };
  } catch {
    return null;
  }
}
