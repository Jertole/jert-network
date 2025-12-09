
// src/routes/wallet.ts
import { Router, Request, Response } from "express";
import { ethers } from "ethers";
import { getProvider, getJertContract, getJertUsdPrice } from "../config";

const router = Router();

/**
 * GET /api/wallet/balance?address=0x...
 * Возвращает:
 *  - баланс JERT
 *  - баланс ETH
 *  - цену JERT в USD и эквивалент
 */
router.get("/balance", async (req: Request, res: Response) => {
  try {
    const address = (req.query.address as string | undefined)?.trim();

    if (!address || !ethers.isAddress(address)) {
      return res.status(400).json({ error: "invalid_address" });
    }

    const provider = getProvider();

    // ETH баланс
    const ethBalanceRaw = await provider.getBalance(address);
    const ethBalance = Number(ethers.formatEther(ethBalanceRaw));

    // JERT баланс (если указан адрес токена)
    let jertBalance = 0;
    try {
      const jert = getJertContract(provider);
      const rawBalance = await jert.balanceOf(address);
      const decimals = await jert.decimals();
      jertBalance = Number(ethers.formatUnits(rawBalance, decimals));
    } catch (err) {
      console.warn("JERT contract not configured or error:", err);
    }

    const priceUsd = await getJertUsdPrice();
    const equivalentUsd = jertBalance * priceUsd;

    return res.json({
      address,
      balanceJERT: jertBalance.toFixed(4),
      balanceETH: ethBalance.toFixed(6),
      priceUSD: priceUsd.toFixed(6),
      equivalentUSD: equivalentUsd.toFixed(2),
      networkChainId: (await provider.getNetwork()).chainId,
    });
  } catch (err) {
    console.error("wallet/balance error", err);
    return res.status(500).json({ error: "internal_error" });
  }
});

export default router;
