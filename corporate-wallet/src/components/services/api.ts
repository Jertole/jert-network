
export interface UICorporateTx {
  hash: string;
  type: string;
  amount: string;
  blockNumber: number;
  time: string;
}

const API_BASE = import.meta.env.VITE_JERT_API_URL || "http://localhost:4000/api";

export async function getRecentTransactions(): Promise<UICorporateTx[]> {
  // TODO: заменить на реальный запрос к /api/tx/history
  // пока вернем пустой массив
  return [];
}
