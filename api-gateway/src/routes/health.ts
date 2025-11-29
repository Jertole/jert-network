import { Router, Request, Response } from "express";

const router = Router();

/**
 * Simple health check for uptime monitoring.
 */
router.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "jert-api-gateway",
    timestamp: new Date().toISOString()
  });
});

export default router;
