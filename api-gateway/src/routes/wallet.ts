import { Router, Request, Response } from "express";
import { ethers } from "ethers";
import { config } from "../config";

const router = Router();

const provider = new ethers.JsonRpcProvider(config.rpcUrl);

// адрес JERT токена в сети JERT (позже подставим реальный)
const JERT_TOKEN_ADDRESS =
  process.env.JERT_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000";

const JERT_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

router.get("/wallet/balance", async (req: Request, res: Response) => {
  try {
    const address = req.query.address as string | undefined;

    if (!address) {
      return res.status(400).json({ error: "address is required" });
    }

    // если токен ещё не задали, возвращаем безопасный ноль
    if (
      !JERT_TOKEN_ADDRESS ||
      JERT_TOKEN_ADDRESS ===
        "0x0000000000000000000000000000000000000000"
    ) {
      return res.json({
        address,
        rawBalance: "0",
        formatted: "0.0000 JERT"
      });
    }

    const token = new ethers.Contract(JERT_TOKEN_ADDRESS, JERT_ABI, provider);

    const [rawBal, decimals]: [bigint, number] = await Promise.all([
      token.balanceOf(address),
      token.decimals()
    ]);

    const factor = 10n ** BigInt(decimals);
    const whole = rawBal / factor;
    const fraction = (rawBal % factor).toString().padStart(decimals, "0").slice(0, 4);

    const formatted = `${whole.toString()}.${fraction} JERT`;

    return res.json({
      address,
      rawBalance: rawBal.toString(),
      formatted
    });
  } catch (err: any) {
    console.error("Error in /wallet/balance:", err.message);
    return res.status(500).json({
      error: "balance_fetch_failed",
      message: err.message
    });
  }
});

export default router;
