
import { Router, Request, Response } from "express";
import { ethers } from "ethers";
import { config } from "../config";

const router = Router();

const provider = new ethers.JsonRpcProvider(config.rpcUrl);

const JERT_TOKEN_ADDRESS =
  process.env.JERT_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000";

const ERC20_IFACE = new ethers.Interface([
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "function decimals() view returns (uint8)"
]);
const JERT_TOKEN_ADDRESS =
  process.env.JERT_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000";

const ERC20_ABI = [
  "function transfer(address to, uint256 value) returns (bool)",
  "function decimals() view returns (uint8)"
];

const SENDER_PRIVATE_KEY = process.env.SENDER_PRIVATE_KEY || "";

router.post("/tx/send", async (req: Request, res: Response) => {
  try {
    const { signedTx } = req.body;

    if (!signedTx) {
      return res.status(400).json({ error: "signedTx is required" });
    }

    // Broadcast TX to JERT private EVM
    const txResponse = await provider.broadcastTransaction(signedTx);
    const receipt = await txResponse.wait();

    return res.json({
      status: "confirmed",
      txHash: receipt?.hash,
      blockNumber: receipt?.blockNumber
    });

  } catch (err: any) {
    console.error("TX relay error:", err.message);

    return res.status(500).json({
      error: "Transaction relay failed",
      message: err.message
    });
  }
});


router.get("/tx/history", async (req: Request, res: Response) => {
  try {
    const address = (req.query.address as string | undefined) || "";
    if (!address) {
      return res.status(400).json({ error: "address is required" });
    }

    // если адрес токена не задан — безопасно возвращаем пустой список
    if (
      !JERT_TOKEN_ADDRESS ||
      JERT_TOKEN_ADDRESS ===
        "0x0000000000000000000000000000000000000000"
    ) {
      return res.json([]);
    }

    const normalized = ethers.getAddress(address);
    const addressTopic = ethers.zeroPadValue(normalized, 32);
    const transferTopic = ethers.id(
      "Transfer(address,address,uint256)"
    );

    const currentBlock = await provider.getBlockNumber();
    const fromBlock = currentBlock > 5000 ? currentBlock - 5000 : 0; // последние ~5000 блоков

    // читаем логи Transfer по JERT токену
    const logs = await provider.getLogs({
      address: JERT_TOKEN_ADDRESS,
      fromBlock,
      toBlock: currentBlock,
      topics: [transferTopic]
    });

    // узнаём decimals один раз
    const tokenContract = new ethers.Contract(
      JERT_TOKEN_ADDRESS,
      ERC20_IFACE,
      provider
    );
    const decimals: number = await tokenContract.decimals();
    const factor = 10n ** BigInt(decimals);

    // фильтруем те Transfer, где addr = from или to
    const filtered = logs.filter((log) => {
      const fromTopic = log.topics[1];
      const toTopic = log.topics[2];
      return (
        fromTopic === addressTopic || toTopic === addressTopic
      );
    });

    // ограничим, чтобы не отдавать слишком много
    const limited = filtered.slice(-100);

    // собираем блоки для timestamp
    const blockNumbers = Array.from(
      new Set(limited.map((l) => l.blockNumber))
    );
    const blocks = await Promise.all(
      blockNumbers.map((bn) => provider.getBlock(bn))
    );
    const blockMap = new Map<number, any>();
    blocks.forEach((b) => {
      if (b) blockMap.set(b.number, b);
    });

    const history = limited.map((log) => {
      const parsed = ERC20_IFACE.parseLog(log);
      const from: string = parsed.args.from;
      const to: string = parsed.args.to;
      const value: bigint = parsed.args.value;

      const whole = value / factor;
      const fraction = (value % factor)
        .toString()
        .padStart(decimals, "0")
        .slice(0, 4);
      const amountStr = `${whole.toString()}.${fraction} JERT`;

      const block = blockMap.get(log.blockNumber);
      const timestamp = block?.timestamp
        ? new Date(block.timestamp * 1000).toISOString()
        : null;

      const type =
        from.toLowerCase() === normalized.toLowerCase()
          ? "OUT"
          : "IN";

      return {
        hash: log.transactionHash,
        type,
        amount: amountStr,
        blockNumber: log.blockNumber,
        time: timestamp
      };
    });

    return res.json(history);
  } catch (err: any) {
    console.error("Error in /tx/history:", err.message);
    return res.status(500).json({
      error: "history_fetch_failed",
      message: err.message
    });
  }
});
          {
            hash: "0xMOCK_TX_HASH_1",
            type: "INFO",
            amount: "0.0000 JERT",
            blockNumber: 0,
            time: new Date().toISOString(),
            address
          }
        ]
      : [];

  return res.json(mockHistory);
  } catch (err: any) {
    console.error("Error in /tx/history:", err.message);
    return res.status(500).json({
      error: "history_fetch_failed",
      message: err.message
    });
  }
});
export default router;
