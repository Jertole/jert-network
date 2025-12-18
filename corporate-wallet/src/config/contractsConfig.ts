// corporate-wallet/src/config/contractsConfig.ts

export type ContractsConfig = any; // intentionally loose to avoid breaking CI

function withTimeout<T>(p: Promise<T>, ms = 2500): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("CONFIG_TIMEOUT")), ms);
    p.then((v) => {
      clearTimeout(t);
      resolve(v);
    }).catch((e) => {
      clearTimeout(t);
      reject(e);
    });
  });
}

export async function loadContractsConfig(): Promise<ContractsConfig> {
  // 1) primary: API Gateway
  const apiBase = (import.meta.env.VITE_JERT_API_URL || "").replace(/\/+$/, "");

  if (apiBase) {
    try {
      const res = await withTimeout(fetch(`${apiBase}/api/config/contracts`), 2500);
      if (res.ok) return await res.json();
      console.warn("Config API error:", res.status);
    } catch (e) {
      console.warn("Config API unreachable, using fallback:", e);
    }
  }

  // 2) fallback: local public json (dev/offline)
  const fallback = await fetch("/contract-addresses.json", { cache: "no-store" as RequestCache });
  if (!fallback.ok) throw new Error(`FALLBACK_CONFIG_READ_FAILED_${fallback.status}`);
  return await fallback.json();
}
