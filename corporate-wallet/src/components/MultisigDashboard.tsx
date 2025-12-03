-// corporate-wallet/src/components/MultisigDashboard.tsx

import React, { useEffect, useState } from "react";
import { getMultisigInfo } from "../services/jertContracts";
import {
  sendTreasuryTransaction,
  fetchTreasuryBalanceUSD,
  WalletBalance,
} from "../services/api";

interface MultisigInfo {
  owners: string[];
  threshold: number;
  // если позже добавишь address мультисига из контракта —
  // сюда можно добавить: treasuryAddress?: string;
}

// адрес казначейства можно задать через .env
const TREASURY_ADDRESS =
  process.env.REACT_APP_TREASURY_ADDRESS ||
  ""; // 0x... адрес multisig / казначейства

export const MultisigDashboard: React.FC = () => {
  const [info, setInfo] = useState<MultisigInfo | null>(null);
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [to, setTo] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);
  const [sendStatus, setSendStatus] = useState<string | null>(null);

  // загрузка on-chain инфо + баланса казначейства
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const mi = await getMultisigInfo();
        setInfo(mi as MultisigInfo);

        if (TREASURY_ADDRESS) {
          const bal = await fetchTreasuryBalanceUSD(TREASURY_ADDRESS);
          setBalance(bal);
        }
      } catch (e) {
        console.error("Failed to load multisig info or balance:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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

        // обновляем баланс казначейства
        try {
          if (TREASURY_ADDRESS) {
            const bal = await fetchTreasuryBalanceUSD(TREASURY_ADDRESS);
            setBalance(bal);
          }
        } catch (e) {
          console.error("Failed to refresh treasury balance:", e);
        }
      }
    } catch (e: any) {
      setSending(false);
      console.error("sendTreasuryTransaction error:", e);
      setSendStatus(`Error: ${e?.message || "Unknown error"}`);
    }
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
              environment to enable USD balance view.
            </div>
          )}

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
