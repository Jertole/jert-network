

import { Router, Request, Response } from "express";

export const complianceRouter = Router();

/**
 * POST /compliance/kyc-check
 */
complianceRouter.post("/kyc-check", async (req: Request, res: Response) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ error: "missing_address" });
    }

    // TODO: integrate real KYC provider
    return res.json({
      address,
      allowed: true,
      provider: "mock-kyc",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Error in /compliance/kyc-check:", err);
    return res.status(500).json({ error: "internal_error" });
  }
});

/**
 * POST /compliance/aml-check
 */
complianceRouter.post("/aml-check", async (req: Request, res: Response) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ error: "missing_address" });
    }

    // Mock AML score
    const riskScore = 0.02;

    return res.json({
      address,
      riskScore,
      allowed: riskScore < 0.5,
      provider: "mock-aml",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Error in /compliance/aml-check:", err);
    return res.status(500).json({ error: "internal_error" });
  }
});
