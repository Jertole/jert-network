// src/config/pricing.ts

import { JERT_REFERENCE_PRICING } from "../../../api-gateway/src/jert-reference-pricing";

export const DEFAULT_JERT_PRICE_USD = JERT_REFERENCE_PRICING.perJert.USD;
export const DEFAULT_MW_PER_JERT = 0.0; // MW cold energy per JERT (stub)

export function calcUsd(jertAmount: number): number {
  if (!Number.isFinite(jertAmount)) return 0;
  return jertAmount * DEFAULT_JERT_PRICE_USD;
}

export function calcMw(jertAmount: number): number {
  if (!Number.isFinite(jertAmount)) return 0;
  return jertAmount * DEFAULT_MW_PER_JERT;
}
