// src/config/partnership.ts

export type PartnershipLevel = "L0" | "L1" | "L2" | "L3";

export const PARTNERSHIP_LEVELS: Record<
  PartnershipLevel,
  { discount: number }
> = {
  L0: { discount: 0 },
  L1: { discount: 25 },
  L2: { discount: 50 },
  L3: { discount: 75 },
};

export const DEFAULT_PARTNERSHIP_LEVEL: PartnershipLevel = "L0";

