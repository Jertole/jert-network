import { Router, Request, Response } from "express";
import { OracleHandler } from "../../middle-corridor-oracle/oracle-handler";
import { config } from "../config";

const router = Router();
const oracle = new OracleHandler(config.rpcUrl);

router.post("/oracle/update", async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const txHash = await oracle.processOraclePayload(payload);

    return res.json({
      status: "submitted",
      txHash,
      note: "Oracle data accepted",
    });
  } catch (err: any) {
    console.error("Oracle update error:", err.message);
    return res.status(400).json({
      error: err.message,
    });
  }
});

export default router;
