
import React, { useState } from "react";
import { ethers } from "ethers";
import JERTTokenABI from "../abi/JERTToken.json";
import { DEFAULT_NETWORK_KEY, getDefaultNetwork } from "../config/networks";
import { getJertTokenAddress } from "../config/jertToken";
import { getBrowserSigner } from "../lib/ethereum";
import { PinModal } from "./PinModal";

type TxState = "idle" | "signing" | "pending" | "success" | "error";

export const SendJert: React.FC = () => {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [txState, setTxState] = useState<TxState>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const network = getDefaultNetwork();
  const tokenAddress = getJertTokenAddress(DEFAULT_NETWORK_KEY);

  const isValidAddress = (addr: string) => ethers.isAddress(addr);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setTxHash(null);

    if (!tokenAddress) {
      setError("JERT token address is not configured for this network.");
      setTxState("error");
      return;
    }

    if (!isValidAddress(to)) {
      setError("Recipient address is invalid.");
      setTxState("error");
      return;
    }

    const trimmedAmount = amount.trim();
    if (!trimmedAmount || Number(trimmedAmount) <= 0) {
      setError("Amount must be greater than 0.");
      setTxState("error");
      return;
    }

    try {
      setTxState("signing");

      // 1) Получаем signer из MetaMask
      const signer = await getBrowserSigner();
      const contract = new ethers.Contract(tokenAddress, JERTTokenABI, signer);

      // 2) Узнаём decimals токена и форматируем amount
      const decimals: number = await contract.decimals();
      const parsedAmount = ethers.parseUnits(trimmedAmount, decimals);

      // 3) Отправляем транзакцию transfer(to, amount)
      const tx = await contract.transfer(to, parsedAmount);
      setTxHash(tx.hash as string);
      setTxState("pending");

      // 4) Ждём подтверждения
      await tx.wait();

      setTxState("success");
    } catch (e: any) {
      console.error("[JERT] send error:", e);
      const msg =
        e?.reason || e?.message || "Failed to send JERT transaction.";
      setError(msg);
      setTxState("error");
    }
  };

  const disabled = txState === "signing" || txState === "pending";

  return (
    <div
      id="send-jert-card"
      style={{
        borderRadius: 16,
        padding: 16,
        border: "1px solid #222",
        background: "#05050a",
        color: "#f5f5f5",
        maxWidth: 480,
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: 8 }}>Send JERT</h2>
      <p style={{ fontSize: 12, opacity: 0.7, marginTop: 0 }}>
        Network: <strong>{network.label}</strong> (chainId {network.chainId})
      </p>

      {!tokenAddress && (
        <p style={{ color: "#ff6b6b", fontSize: 12 }}>
          ⚠ Configure token address in <code>src/config/jertToken.ts</code>.
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>
          Recipient address
        </label>
        <input
          type="text"
          value={to}
          onChange={(e) => setTo(e.target.value.trim())}
          placeholder="0x..."
          style={{
            width: "100%",
            padding: "8px 10px",
            borderRadius: 8,
            border: "1px solid #333",
            background: "#0b0b12",
            color: "#f5f5f5",
            fontFamily: "monospace",
            fontSize: 13,
            marginBottom: 10,
          }}
        />

        <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>
          Amount (JERT)
        </label>
        <input
          type="number"
          min="0"
          step="0.0001"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.0"
          style={{
            width: "100%",
            padding: "8px 10px",
            borderRadius: 8,
            border: "1px solid #333",
            background: "#0b0b12",
            color: "#f5f5f5",
            fontSize: 13,
            marginBottom: 12,
          }}
        />

        <button
          type="submit"
          disabled={disabled || !tokenAddress}
          style={{
            marginTop: 4,
            width: "100%",
            padding: "9px 12px",
            borderRadius: 999,
            border: "none",
            background:
              "linear-gradient(90deg, #00e5ff 0%, #00ff9d 50%, #b000ff 100%)",
            color: "#000",
            fontWeight: 600,
            cursor: disabled ? "default" : "pointer",
            opacity: disabled ? 0.6 : 1,
          }}
        >
          {txState === "signing"
            ? "Waiting for signature..."
            : txState === "pending"
            ? "Transaction pending..."
            : "Send JERT"}
        </button>
      </form>

      {txHash && (
        <p style={{ fontSize: 12, marginTop: 10 }}>
          Tx hash:{" "}
          <span style={{ fontFamily: "monospace" }}>
            {txHash.substring(0, 10)}...
            {txHash.substring(txHash.length - 6)}
          </span>
        </p>
      )}

      {txState === "success" && (
        <p style={{ color: "#4ade80", fontSize: 12, marginTop: 4 }}>
          ✅ Transaction confirmed
        </p>
      )}

      {txState === "error" && error && (
        <p style={{ color: "#ff6b6b", fontSize: 12, marginTop: 8 }}>{error}</p>
      )}
    </div>
  );
};
