// src/components/JertBalance.tsx
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import JERTTokenABI from "../abi/JERTToken.json";
import { getDefaultNetwork, DEFAULT_NETWORK_KEY } from "../config/networks";
import { getJertTokenAddress } from "../config/jertToken";
import { getJsonRpcProvider } from "../lib/provider";

type FetchState = "idle" | "loading" | "ready" | "error";

export const JertBalance: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string>(
    import.meta.env.VITE_TREASURY_ADDRESS || ""
  );
  const [balance, setBalance] = useState<string>("-");
  const [symbol, setSymbol] = useState<string>("JERT");
  const [state, setState] = useState<FetchState>("idle");
  const [error, setError] = useState<string | null>(null);

  const network = getDefaultNetwork();
  const tokenAddress = getJertTokenAddress(DEFAULT_NETWORK_KEY);

  const isValidAddress = (addr: string) => ethers.isAddress(addr);

  const loadBalance = async () => {
    if (!tokenAddress) {
      setError("JERT token address is not set for current network.");
      setState("error");
      return;
    }

    if (!walletAddress || !isValidAddress(walletAddress)) {
      setError("Enter a valid Ethereum address.");
      setState("error");
      return;
    }

    try {
      setState("loading");
      setError(null);

      const provider = getJsonRpcProvider();
      const contract = new ethers.Contract(tokenAddress, JERTTokenABI, provider);

      const [rawBalance, decimals, tokenSymbol] = await Promise.all([
        contract.balanceOf(walletAddress),
        contract.decimals(),
        contract.symbol(),
      ]);

      const formatted = ethers.formatUnits(rawBalance, decimals);
      setBalance(formatted);
      setSymbol(tokenSymbol);
      setState("ready");
    } catch (e: any) {
      console.error("[JERT] balance error:", e);
      setError(e?.message ?? "Failed to fetch balance");
      setState("error");
    }
  };

  useEffect(() => {
    if (walletAddress && isValidAddress(walletAddress) && tokenAddress) {
      // авто-загрузка при открытии, если уже есть корректный адрес
      loadBalance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadBalance();
  };

  return (
    <div
      style={{
        borderRadius: "16px",
        padding: "16px",
        border: "1px solid #222",
        background: "#05050a",
        color: "#f5f5f5",
        maxWidth: 420,
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: 8 }}>JERT Balance</h2>
      <p style={{ fontSize: 12, opacity: 0.7, marginTop: 0 }}>
        Network: <strong>{network.label}</strong> (chainId {network.chainId})
      </p>

      {!tokenAddress && (
        <p style={{ color: "#ff6b6b", fontSize: 12 }}>
          ⚠ Set JERT token address in <code>src/config/jertToken.ts</code>.
        </p>
      )}

      <form onSubmit={handleSubmit} style={{ marginBottom: 12 }}>
        <label style={{ display: "block", fontSize: 12, marginBottom: 4 }}>
          Wallet address
        </label>
        <input
          type="text"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value.trim())}
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
          }}
        />
        <button
          type="submit"
          style={{
            marginTop: 10,
            width: "100%",
            padding: "8px 12px",
            borderRadius: 999,
            border: "none",
            background:
              "linear-gradient(90deg, #00e5ff 0%, #00ff9d 50%, #b000ff 100%)",
            color: "#000",
            fontWeight: 600,
            cursor: "pointer",
          }}
          disabled={state === "loading" || !tokenAddress}
        >
          {state === "loading" ? "Loading..." : "Refresh balance"}
        </button>
      </form>

      <div
        style={{
          padding: "10px 12px",
          borderRadius: 12,
          border: "1px solid #333",
          background: "#060612",
        }}
      >
        <div style={{ fontSize: 12, opacity: 0.7 }}>Current balance</div>
        <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>
          {balance} <span style={{ fontSize: 16 }}>{symbol}</span>
        </div>
      </div>

      {state === "error" && error && (
        <p style={{ color: "#ff6b6b", fontSize: 12, marginTop: 8 }}>{error}</p>
      )}
    </div>
  );
};
