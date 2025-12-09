
// Тип одной строки истории транзакций мультисига
export interface TxHistoryItem {
  id: number;
  hash?: string;
  direction: "IN" | "OUT";
  to: string;
  amountEth: string;
  blockNumber?: number;
  time?: string;
  executed?: boolean;
  confirmations?: number;
  required?: number;
}

// Энергетические параметры (placeholder до API gateway)
export interface EnergyRates {
  networkId: number;
  jertPerMWh: number;
  jertPerMWhCold: number;
  usdPerMWh: number;
  usdPerMWhCold: number;
  timestamp: string;
}

// ---------- Заглушка для истории транзакций ----------

// На этом шаге UI строит историю сам из on-chain данных мультисига,
// поэтому REST-API возвращает пустой массив.
export async function getRecentTransactionsForTreasury(
  _treasuryAddress: string
): Promise<TxHistoryItem[]> {
  return [];
}

// ---------- Заглушка для energy-rates ----------

export async function getEnergyRates(): Promise<EnergyRates> {
  return {
    networkId: 0,
    jertPerMWh: 0,
    jertPerMWhCold: 0,
    usdPerMWh: 0,
    usdPerMWhCold: 0,
    timestamp: new Date().toISOString(),
  };
}
