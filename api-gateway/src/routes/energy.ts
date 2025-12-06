
import { Router, Request, Response } from "express";

export const energyRouter = Router();

// Читаем базовые настройки из ENV (с дефолтами)
const NETWORK_ID = parseInt(process.env.NETWORK_ID || "13371337", 10);
const JERT_PER_MWH = parseFloat(process.env.JERT_PER_MWH || "100");
const JERT_PER_MWH_COLD = parseFloat(process.env.JERT_PER_MWH_COLD || "1000");
const ENERGY_USD_MWH = parseFloat(process.env.ENERGY_USD_MWH || "1.0");
const ENERGY_USD_MWH_COLD = parseFloat(process.env.ENERGY_USD_MWH_COLD || "10.0");

// GET /energy/rates
energyRouter.get("/rates", async (_req: Request, res: Response) => {
  try {
    return res.json({
      networkId: NETWORK_ID,
      jertPerMWh: JERT_PER_MWH,
      jertPerMWhCold: JERT_PER_MWH_COLD,
      usdPerMWh: ENERGY_USD_MWH,
      usdPerMWhCold: ENERGY_USD_MWH_COLD,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Error in /energy/rates:", err);
    return res.status(500).json({ error: "internal_error" });
  }
});

// GET /energy/convert?jert=X
energyRouter.get("/convert", async (req: Request, res: Response) => {
  try {
    const jertRaw = req.query.jert as string | undefined;

    if (!jertRaw) {
      return res.status(400).json({ error: "missing_jert_param" });
    }

    const jert = parseFloat(jertRaw);
    if (!Number.isFinite(jert) || jert < 0) {
      return res.status(400).json({ error: "invalid_jert_param" });
    }

    const energyMWhEquivalent = jert / JERT_PER_MWH;
    const coldMWhEquivalent = jert / JERT_PER_MWH_COLD;

    return res.json({
      jert,
      energyMWhEquivalent,
      coldMWhEquivalent,
      networkId: NETWORK_ID,
    });
  } catch (err) {
    console.error("Error in /energy/convert:", err);
    return res.status(500).json({ error: "internal_error" });
  }
});

