
import { Router, Request, Response } from "express";
import { ethers } from "ethers";
import { getProvider } from "../config";
import { kycCheck } from "../../compliance-middleware/kyc-check";
import { amlCheck } from "../../compliance-middleware/aml-check";

export const txRouter = Router();

const provider = getProvider();

/**
 * GET /api/tx/history?address=0x...
 * Пока заглушка: возвращает пустой список, но формат уже фиксированный.
 */
txRouter.get("/history", async (req: Request, res: Response) => {
  try {
    const address = (req.query.address as string | undefined)?.trim();

    if (!address || !ethers.isAddress(address)) {
      return res.status(400).json({ error: "invalid_address" });
    }

    // TODO: здесь позже можно построить реальный поиск по блокам / логам
    // Сейчас просто возвращаем пустой массив.
    return res.json({
      address,
      items: [] as any[],
    });
  } catch (err: any) {
    console.error("Error in /tx/history:", err);
    return res.status(500).json({
      error: "history_failed",
      details: err?.message || String(err),
    });
  }
});

/**
 * POST /api/tx/send
 * На шлюзе отправку держим выключенной — подпись должна быть в кошельке.
 */
txRouter.post("/send", kycCheck, amlCheck, async (_req: Request, res: Response) => {
  return res.status(501).json({
    error: "tx_send_disabled",
    message: "Signing must be done in client wallet (JERT Wallet / Corporate Wallet).",
  });
});
