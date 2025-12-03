// corporate-wallet/src/services/api.ts

export interface TreasuryTxRequest {
  to: string;
  amount: string; // JERT amount as string
}

export interface TreasuryTxResult {
  txHash?: string;
  error?: string;
}

export interface WalletBalance {
  address: string;
  balanceJERT: string;   // "1234.5678"
  priceUSD: string;      // "0.100000"
  equivalentUSD: string; // "123.45"
}

export interface TxHistoryItem {
  hash: string;
  type: "IN" | "OUT";
  from: string;
  to: string;
  amountJERT: string;
  equivalentUSD: string;
  blockNumber: number;
  time?: string | null;
}

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8080";

/**
 * Send treasury transaction (dev mode).
 * Backend signs and broadcasts tx from treasury wallet.
 */
export async function sendTreasuryTransaction(
  payload: TreasuryTxRequest
): Promise<TreasuryTxResult> {
  try {
    const res = await fetch(`${API_BASE}/tx/treasury`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      return { error: `HTTP ${res.status}: ${text}` };
    }

    const data = await res.json();
    return {
      txHash: data.txHash as string,
      error: data.error as string | undefined,
    };
  } catch (e: any) {
    console.error("sendTreasuryTransaction error", e);
    return { error: e?.message || "Unknown error" };
  }
}

/**
 * Unified balance endpoint: JERT + USD.
 * We используем тот же endpoint, что и для mobile-wallet:
 *   GET /wallet/balance?address=0x...
 */
export async function fetchWalletBalance(
  address: string
): Promise<WalletBalance> {
  const url = `${API_BASE}/wallet/balance?address=${encodeURIComponent(
    address
  )}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch wallet balance (HTTP ${res.status})`);
  }
  const data = await res.json();
  return {
    address: data.address,
    balanceJERT: String(data.balanceJERT ?? data.balanceJERT ?? data.balanceJert ?? data.balance),
    priceUSD: String(data.priceUSD ?? data.priceUsd ?? "0"),
    equivalentUSD: String(data.equivalentUSD ?? data.equivalentUsd ?? "0"),
  };
}

/**
 * Treasury-specific helper: отдаёт баланс JERT и USD для казначейского адреса
