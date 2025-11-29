import { Router, Request, Response } from "express";

const router = Router();

/**
 * Placeholder endpoint for submitting signed transactions to the JERT network.
 * Later сюда подключится RPC (ethers.js или web3.js).
 */
router.post("/tx/send", async (req: Request, res: Response) => {
  const { signedTx } = req.body;

  if (!signedTx) {
    return res.status(400).json({ error: "signedTx is required" });
  }

  // TODO: отправлять signedTx в приватную EVM (JERT RPC)
  // сейчас просто отдаём заглушку:
  return res.json({
    status: "accepted",
    txHash: "0xPLACEHOLDER_HASH",
    note: "TX relay not implemented yet"
  });
});

export default router;
