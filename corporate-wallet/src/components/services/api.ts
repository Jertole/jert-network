
export interface UICorporateTx {
  hash: string;
  type: string;
  amount: string;
  blockNumber: number;
  time: string;
}

export interface EnergyRates {
  networkId: number;
  jertPerMWh: number;
  jertPerMWhCold: number;
  usdPerMWh: number;
  usdPerMWhCold: number;
  timestamp: string;
}

export interface EnergyConversion {
  jert: number;
  energyMWhEquivalent: number;
  coldMWhEquivalent: number;
  networkId: number;
}

const API_BASE =
  import.meta.env.VITE_JERT_API_URL || "http://localhost:4000/api";

async function safeFetch(url: string, options?: RequestInit) {
  const resp = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`API error ${resp.status}: ${text}`);
  }

  return resp;
}

// ---------- Energy layer ----------

export async function getEnergyRates(): Promise<EnergyRates> {
  const resp = await safeFetch(`${API_BASE}/energy/rates`);
  const data = (await resp.json()) as any;

  return {
    networkId: Number(data.networkId ?? 0),
    jertPerMWh: Number(data.jertPerMWh ?? 100),
    jertPerMWhCold: Number(data.jertPerMWhCold ?? 1000),
    usdPerMWh: Number(data.usdPerMWh ?? 1),
    usdPerMWhCold: Number(data.usdPerMWhCold ?? 10),
    timestamp: String(data.timestamp ?? new Date().toISOString()),
  };
}

export async function convertJert(
  jertAmount: number
): Promise<EnergyConversion> {
  const resp = await safeFetch(
    `${API_BASE}/energy/convert?jert=${encodeURIComponent(jertAmount)}`
  );
  const data = (await resp.json()) as any;

  return {
    jert: Number(data.jert ?? jertAmount),
    energyMWhEquivalent: Number(data.energyMWhEquivalent ?? 0),
    coldMWhEquivalent: Number(data.coldMWhEquivalent ?? 0),
    networkId: Number(data.networkId ?? 0),
  };
}

// ---------- Transactions ----------

/**
 * Получаем историю транзакций казначейства.
 * API (tx.ts) возвращает объект вида:
 * { address: "0x...", history: [ {...}, {...} ] }
 */
export async function getRecentTransactions(
  address?: string
): Promise<UICorporateTx[]> {
  try {
    const url = new URL(`${API_BASE}/tx/history`);
    if (address) {
      url.searchParams.set("address", address);
    }

    const resp = await safeFetch(url.toString());
    const data = (await resp.json()) as any;

    const rawHistory: any[] = Array.isArray(data.history) ? data.history : [];

    return rawHistory.map((item) => {
      const hash = String(item.hash ?? "");
      const type = String(item.type ?? "INFO");
      const amountRaw = item.value ?? item.amount ?? "0";
      const blockNumber = Number(item.blockNumber ?? 0);
      const ts = item.timestamp ?? item.time ?? "";

      // простое форматирование amount
      const amountStr =
        typeof amountRaw === "number"
          ? `${amountRaw.toFixed(4)} JERT`
          : `${String(amountRaw)} JERT`;

      let timeStr = "";
      if (typeof ts === "number") {
        timeStr = new Date(ts * 1000).toISOString();
      } else if (typeof ts === "string") {
        timeStr = ts;
      }

      return {
        hash,
        type,
        amount: amountStr,
        blockNumber,
        time: timeStr,
      };
    });
  } catch (e) {
    console.error("getRecentTransactions failed:", e);
    return [];
  }
}
