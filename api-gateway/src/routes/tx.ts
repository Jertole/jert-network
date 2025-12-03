
// src/routes/tx.ts
import { Router } from "express";
import { ethers } from "ethers";
import { getProvider, getJertContract, getJertUsdPrice } from "../config";

const router = Router();

/**
 * GET /tx/history?address=0x...
 * Returns last N JERT transfers with direction (IN/OUT) and USD equivalent.
 */
router.get("/history", async (req, res) => {
  try {
    const address = String(req.query.address || "").trim();
    if (!ethers.isAddress(address)) {
      return res.status(400).json({ error: "Invalid address" });
    }

    const provider = getProvider();
    const jert = getJertContract(provider);
    const decimals = await jert.decimals();
    const priceUsd = await getJertUsdPrice();

    const filterTo = jert.filters.Transfer(null, address);
    const filterFrom = jert.filters.Transfer(address, null);

    const [logsIn, logsOut] = await Promise.all([
      jert.queryFilter(filterTo, -5000),
      jert.queryFilter(filterFrom, -5000),
    ]);

    const events = [...logsIn, ...logsOut].sort(
      (a, b) => Number(a.blockNumber) - Number(b.blockNumber)
    );

    const history = await Promise.all(
      events.slice(-50).map(async (ev) => {
        const from = ev.args?.from;
        const to = ev.args?.to;
        const rawAmount = ev.args?.value as bigint;
        const amount = Number(ethers.formatUnits(rawAmount, decimals));
        const type = to?.toLowerCase() === address.toLowerCase() ? "IN" : "OUT";
        const block = await provider.getBlock(ev.blockNumber);
        const ts = block?.timestamp
          ? new Date(block.timestamp * 1000).toISOString()
          : null;

        return {
          hash: ev.transactionHash,
          type,
          from,
          to,
          amountJERT: amount.toFixed(4),
          equivalentUSD: (amount * priceUsd).toFixed(2),
          blockNumber: Number(ev.blockNumber),
          time: ts,
        };
      })
    );

    return res.json(history);
  } catch (err) {
    console.error("tx/history error", err);
    return res.status(500).json({ error: "Internal error" });
  }
});

export default router;
