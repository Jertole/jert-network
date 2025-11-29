
import { Router, Request, Response } from "express";
import { ethers } from "ethers";
import { config } from "../config";

const router = Router();

const provider = new ethers.JsonRpcProvider(config.rpcUrl);

router.post("/tx/send", async (req: Request, res: Response) => {
  try {
    const { signedTx } = req.body;

    if (!signedTx) {
      return res.status(400).json({ error: "signedTx is required" });
    }

    // Broadcast TX to JERT private EVM
    const txResponse = await provider.broadcastTransaction(signedTx);
    const receipt = await txResponse.wait();

    return res.json({
      status: "confirmed",
      txHash: receipt?.hash,
      blockNumber: receipt?.blockNumber
    });

  } catch (err: any) {
    console.error("TX relay error:", err.message);

    return res.status(500).json({
      error: "Transaction relay failed",
      message: err.message
    });
  }
});

export default router;
