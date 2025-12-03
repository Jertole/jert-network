
import React, { useEffect, useState } from "react";
import { getMultisigInfo } from "../services/jertContracts";
import {
  sendTreasuryTransaction,
  fetchTreasuryBalanceUSD,
  fetchTxHistory,
  WalletBalance,
  TxHistoryItem,
} from "../services/api";

interface MultisigInfo {
  owners: string[];
  threshold: number;
}

// адрес казначейства (multisig) — задаём через .env
const TREASURY_ADDRESS =
  process.env.REACT_APP_TREASURY_ADDRESS || ""; // 0x...

export const MultisigDashboard: React.FC = () => {
  const [info, setInfo] = useState<MultisigInfo | null>(null);
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [history, setHistory] = useState<TxHistoryItem[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);

  const [to, setTo] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);
  const [sendStatus, setSendStatus] = useState<string | null>(null);

  // загрузка multisig info + баланса + истории
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const mi = await getMultisigInfo();
        setInfo(mi as MultisigInfo);

        if (TREASURY_ADDRESS) {
          const [bal, hist] = await Promise.all([
            fetchTreasuryBalanceUSD(TREASURY_ADDRESS),
            fetchTxHistory(TREASURY_ADDRESS),
          ]);
          setBalance(bal);
          setHistory(hist);
        }
      } catch (e) {
        console.error("Failed to load multisig info or treasury data:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const refreshHistoryAndBalance = async () => {
    if (!TREASURY_ADDRESS) return;
    try {
      setHistoryLoading(true);
      const [bal, hist] = await Promise.all([
        fetchTreasuryBalanceUSD(TREASURY_ADDRESS),
        fetchTxHistory(TREASURY_ADDRESS),
      ]);
      setBalance(bal);
      setHistory(hist);
    } catch (e) {
      console.error("Failed to refresh treasury data:", e);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSend = async () => {
    setSendStatus(null);

    if (!to || !amount) {
      setSendStatus("Please fill recipient and amount.");
      return;
    }

    try {
      setSending(true);
      const result = await sendTreasuryTransaction({
        to,
        amount,
      });
      setSending(false);

      if (result.error) {
        setSendStatus(`Error: ${result.error}`);
      } else {
        setSendStatus(`Sent. txHash: ${result.txHash}`);
        setAmount("");
        // обновляем баланс + историю
        await refreshHistoryAndBalance();
      }
    } catch (e: any) {
      setSending(false);
      console.error("sendTreasuryTransaction error:", e);
      setSendStatus(`Error: ${e?.message || "Unknown error"}`);
    }
  };

  const renderHistory = () => {
    if (!TREASURY_ADDRESS) {
      return (
        <div
          style={{
            fontSize: 11,
            opacity: 0.7,
            marginTop: 8,
            color: "#ffcc88",
          }}
        >
          REACT_APP_TREASURY_ADDRESS is not set. History view requires a
          configured treasury address.
        </div>
      );
    }

    if (historyLoading) {
      return (
        <div style={{ fontSize: 12, opacity: 0.8 }}>Refreshing history…</div>
      );
    }

    if (!history.length) {
      return (
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          No transactions found for treasury address yet.
        </div>
      );
    }

    return (
      <div
        style={{
          marginTop: 8,
          maxHeight: 260,
          overflowY: "auto",
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 12,
          }}
        >
          <thead>
            <tr
              style={{
                background: "rgba(255,255,255,0.03)",
                textAlign: "left",
              }}
            >
              <th style={{ padding: "6px 8px" }}>Type</th>
              <th style={{ padding: "6px 8px" }}>Amount</th>
              <th style={{ padding: "6px 8px" }}>USD</th>
              <th style={{ padding: "6px 8px" }}>Hash</th>
              <th style={{ padding: "6px 8px" }}>Time</th>
            </tr>
          </thead>
          <tbody>
            {history.map((tx) => {
              const isIn = tx.type === "IN";
              const color = isIn ? "#6CFFB5" : "#FF8778";
              const sign = isIn ? "+" : "-";
              const shortHash =
                tx.hash.length > 18
                  ? `${tx.hash.slice(0, 8)}…${tx.hash.slice(-6)}`
                  : tx.hash;

              return (
                <tr
                  key={tx.hash}
                  style={{
                    borderTop: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <td style={{ padding: "4px 8px", color }}>{tx.type}</td>
                  <td style={{ padding: "4px 8px", color }}>
                    {sign}
                    {parseFloat(tx.amountJERT).toFixed(4)} JERT
                  </td>
                  <td style={{ padding: "4px 8px", color }}>
                    {sign}${parseFloat(tx.equivalentUSD).toFixed(2)}
                  </td>
                  <td
                    style={{
                      padding: "4px 8px",
                      fontFamily: "monospace",
                      opacity: 0.85,
                    }}
                    title={tx.hash}
                  >
                    {short
