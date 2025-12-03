

import React, { useEffect, useState } from "react";
import { getMultisigInfo } from "../services/jertContracts";
import { TransaktionsTable from "../TransactionsTable"; 
    history={history}
    loading={historyLoading}
/>
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
                    {shortHash}
                  </td>
                  <td
                    style={{
                      padding: "4px 8px",
                      opacity: 0.75,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {tx.time || "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div
      style={{
        borderRadius: 16,
        border: "1px solid rgba(0,229,255,0.3)",
        padding: 24,
        background:
          "radial-gradient(circle at top left, rgba(0,229,255,0.12), transparent 60%)",
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>
          Multisig Treasury Overview
        </div>
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          2-of-3 governance: Cryogas KZ / Vitlax Nordic / SY Power Energy
        </div>
      </div>

      {loading && (
        <div style={{ fontSize: 12 }}>Loading on-chain data and balances...</div>
      )}

      {!loading && info && (
        <>
          {/* Верхний блок: threshold + баланс */}
          <div
            style={{
              display: "flex",
              gap: 24,
              flexWrap: "wrap",
              marginBottom: 16,
            }}
          >
            <div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Threshold</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>
                {info.threshold} / {info.owners.length}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Treasury Balance</div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#00e5ff",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <span>
                  {balance
                    ? `${parseFloat(balance.balanceJERT).toFixed(2)} JERT`
                    : "—"}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    opacity: 0.8,
                    marginTop: 2,
                  }}
                >
                  {balance
                    ? `≈ $${parseFloat(balance.equivalentUSD).toFixed(2)} USD`
                    : "USD value not available"}
                </span>
              </div>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <button
                onClick={historyLoading ? undefined : refreshHistoryAndBalance}
                style={{
                  padding: "6px 10px",
                  borderRadius: 999,
                  border: "1px solid rgba(0,229,255,0.4)",
                  background: "rgba(5,7,11,0.7)",
                  color: "#00e5ff",
                  fontSize: 11,
                  cursor: historyLoading ? "default" : "pointer",
                  opacity: historyLoading ? 0.6 : 1,
                }}
              >
                {historyLoading ? "Refreshing…" : "Refresh history"}
              </button>
            </div>
          </div>

          {!TREASURY_ADDRESS && (
            <div
              style={{
                fontSize: 11,
                opacity: 0.7,
                marginBottom: 12,
                color: "#ffcc88",
              }}
            >
              REACT_APP_TREASURY_ADDRESS is not set. Please define it in your
              environment to enable USD balance & history view.
            </div>
          )}

          {/* Owners */}
          <div>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>
              Owners
            </div>
            <ul style={{ paddingLeft: 16, fontSize: 13 }}>
              {info.owners.map((o) => (
                <li key={o} style={{ wordBreak: "break-all" }}>
                  {o}
                </li>
              ))}
            </ul>
          </div>

          {/* История транзакций казначейства */}
          <div
            style={{
              marginTop: 24,
              paddingTop: 16,
              borderTop: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
              Treasury Transaction History (JERT + USD)
            </div>
            <div style={{ fontSize: 11, opacity: 0.75, marginBottom: 4 }}>
              IN — inflow to treasury, OUT — payouts or infrastructure costs.
            </div>
            {<TransactionsTable
    history={history}
    loading={historyLoading}
    compact={false}
  />
</div>
              
          </div>

          {/* Отправка из казначейства (dev) */}
          <div
            style={{
              marginTop: 24,
              paddingTop: 16,
              borderTop: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
              Send from Treasury (dev)
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                maxWidth: 420,
              }}
            >
              <input
                style={{
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "rgba(0,0,0,0.4)",
                  color: "#fff",
                  fontSize: 12,
                }}
                placeholder="Recipient address"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
              <input
                style={{
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "rgba(0,0,0,0.4)",
                  color: "#fff",
                  fontSize: 12,
                }}
                placeholder="Amount (JERT)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <button
                onClick={sending ? undefined : handleSend}
                style={{
                  marginTop: 4,
                  padding: "8px 12px",
                  borderRadius: 999,
                  border: "none",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: sending ? "default" : "pointer",
                  opacity: sending ? 0.6 : 1,
                  background:
                    "linear-gradient(90deg, #00e5ff 0%, #23d4ff 50%, #00b3ff 100%)",
                  color: "#05070b",
                }}
              >
                {sending ? "Sending..." : "Send from Treasury"}
              </button>
              {sendStatus && (
                <div
                  style={{
                    fontSize: 11,
                    marginTop: 4,
                    opacity: 0.8,
                  }}
                >
                  {sendStatus}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {!loading && !info && (
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          No on-chain data available.
        </div>
      )}
    </div>
  );
};
