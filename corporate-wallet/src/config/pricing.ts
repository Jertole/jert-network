// src/config/pricing.ts

// Fixed stub values (NO ETH price, ETH = gas only)
export const DEFAULT_JERT_PRICE_USD = 0.01; // $0.01 per JERT (stub)
export const DEFAULT_MW_PER_JERT = 0.0;    // MW cold energy per JERT (stub)

export function calcUsd(jertAmount: number): number {
  if (!Number.isFinite(jertAmount)) return 0;
  return jertAmount * DEFAULT_JERT_PRICE_USD;
}

export function calcMw(jertAmount: number): number {
  if (!Number.isFinite(jertAmount)) return 0;
  return jertAmount * DEFAULT_MW_PER_JERT;
}
