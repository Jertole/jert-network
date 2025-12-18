import { Router } from "express";
import fs from "fs";
import path from "path";

export const configRouter = Router();

/**
 * Read-only: returns docs/contract-addresses.json as-is (no secrets).
 * Source of truth is docs/contract-addresses.json in repo root.
 */
configRouter.get("/contracts", (_req, res) => {
  try {
    // api-gateway/src/routes/config.ts -> repo root -> docs/contract-addresses.json
    const repoRoot = path.resolve(__dirname, "../../..");
    const filePath = path.join(repoRoot, "docs", "contract-addresses.json");

    const raw = fs.readFileSync(filePath, "utf-8");
    const json = JSON.parse(raw);

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json(json);
  } catch (err: any) {
    return res.status(500).json({
      error: "CONFIG_READ_FAILED",
      message: err?.message ?? String(err),
    });
  }
});
