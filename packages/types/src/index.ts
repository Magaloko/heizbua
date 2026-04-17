export type FuelSlug =
  | "pellets"
  | "heizoel"
  | "gas"
  | "waermepumpe"
  | "hackschnitzel";

export type DealerStatus = "PENDING" | "ACTIVE" | "REJECTED" | "PAUSED";

export type UserRole = "DEALER" | "ADMIN";
