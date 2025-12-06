
import { Router, Request, Response } from "express";
import { ethers } from "ethers";
import { getProvider } from "../config"; 

export const txRouter = Router();

const provider: ethers.JsonRpcProvider = getProvider();

/**
 * GET /tx/history?address=0x...
 */
txRouter.get("/history", async (req: Request, res: Response) => {
  try {
    const address = req.query.address as string | undefined;

    if (!address || !ethers.isAddress(address)) {
      return res.status(400).json({ error: "invalid_address" });
    }

    // Placeholder — real history requires DB/indexer
    const history: any[] = [];

    return res.json({ address, history });
  } catch (err) {
    console.error("Error in /tx/history:", err);
    return res.status(500).json({ error: "internal_error" });
  }
});

/**
 * POST /tx/send
 */
txRouter.post("/send", async (req: Request, res: Response) => {
  try {
    const { rawTx } = req.body;

    if (!rawTx || typeof rawTx !== "string") {
      return res.status(400).json({ error: "missing_rawTx" });
    }

    const txResponse = await provider.sendTransaction(rawTx);
    const receipt = await txResponse.wait(1);

    return res.json({
      hash: txResponse.hash,
      blockNumber: receipt?.blockNumber,
      status: receipt?.status,
    });
  } catch (err: any) {
    console.error("Error in /tx/send:", err);
    return res.status(500).json({
      error: "tx_send_failed",
      details: err?.message || String(err),
    });
  }
});
