
import { Router, Request, Response } from "express";
import { ethers } from "ethers";
import { config } from "../config";

const router = Router();

const provider = new ethers.JsonRpcProvider(config.rpcUrl);

const JERT_TOKEN_ADDRESS =
  process.env.JERT_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000";

const ERC20_IFACE = new ethers.Interface([
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "function decimals() view returns (uint8)"
]);

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

router.get("/tx/history", async (req: Request, res: Response) => {
  try {
    const address = (req.query.address as string | undefined) || "";

    // TODO: в будущем подтягивать реальные данные из JERT RPC / indexer.
    // Сейчас — структурированный mock, чтобы фронты могли работать.
    const mockHistory = address
      ? [
          {
            hash: "0xMOCK_TX_HASH_1",
            type: "INFO",
            amount: "0.0000 JERT",
            blockNumber: 0,
            time: new Date().toISOString(),
            address
          }
        ]
      : [];

  return res.json(mockHistory);
  } catch (err: any) {
    console.error("Error in /tx/history:", err.message);
    return res.status(500).json({
      error: "history_fetch_failed",
      message: err.message
    });
  }
});
export default router;
