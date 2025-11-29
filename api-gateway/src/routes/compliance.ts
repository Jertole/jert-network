
import { Router, Request, Response } from "express";

const router = Router();

/**
 * Compliance endpoint stub – позже будет стыковаться
 * с kyc-check.ts и aml-check.ts из compliance-middleware.
 */
router.post("/compliance/check", async (req: Request, res: Response) => {
  const { address } = req.body;

  if (!address) {
    return res.status(400).json({ error: "address is required" });
  }

  // TODO: вызвать реальные KYC/AML сервисы
  return res.json({
    address,
    kyc: "unknown",
    aml: "unknown",
    note: "Compliance integration not implemented yet"
  });
});

export default router;
