
export interface UICorporateTx {
  hash: string;
  type: string;
  amount: string;
  blockNumber: number;
  time: string;
}

const API_BASE = import.meta.env.VITE_JERT_API_URL || "http://localhost:4000/api";

export async function getRecentTransactions(address?: string): Promise<UICorporateTx[]> {
  try {
    const url = new URL(API_BASE + "/tx/history");
    if (address) {
      url.searchParams.set("address", address);
    }

    const resp = await fetch(url.toString());
    if (!resp.ok) {
      return [];
    }

    const data = (await resp.json()) as any[];

    return data.map((item) => ({
      hash: String(item.hash ?? ""),
      type: String(item.type ?? "INFO"),
      amount: String(item.amount ?? "0.0000 JERT"),
      blockNumber: Number(item.blockNumber ?? 0),
      time: String(item.time ?? ""),
    }));
  } catch (_e) {
    return [];
  }
}
