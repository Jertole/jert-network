
// src/routes/wallet.ts
import { Router } from "express";
import { ethers } from "ethers";
import { getProvider, getJertContract, getJertUsdPrice } from "../config";

const router = Router();

/**
 * GET /wallet/balance?address=0x...
 * Returns:
 *  - JERT balance
 *  - USD equivalent (using a single USD price source)
 */
router.get("/balance", async (req, res) => {
  try {
    const address = String(req.query.address || "").trim();
    if (!ethers.isAddress(address)) {
      return res.status(400).json({ error: "Invalid address" });
    }

    const provider = getProvider();
    const jert = getJertContract(provider);

    const rawBalance = await jert.balanceOf(address);
    const decimals = await jert.decimals();
    const balance = Number(ethers.formatUnits(rawBalance, decimals));

    // Single USD price source (from oracle, config, or static)
    const priceUsd = await getJertUsdPrice();
    const equivalentUsd = balance * priceUsd;

    return res.json({
      address,
      balanceJERT: balance.toFixed(4),
      priceUSD: priceUsd.toFixed(6),
      equivalentUSD: equivalentUsd.toFixed(2),
    });
  } catch (err) {
    console.error("wallet/balance error", err);
    return res.status(500).json({ error: "Internal error" });
  }
});

export default router;
