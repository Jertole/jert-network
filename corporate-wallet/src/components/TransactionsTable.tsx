
import React, { useEffect, useState } from "react";
import { getRecentTransactions, UICorporateTx } from "../services/api";

export const TransactionsTable: React.FC = () => {
  const [items, setItems] = useState<UICorporateTx[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getRecentTransactions();
        setItems(data);
      } catch (e) {
        console.error("Failed to load transactions:", e);
      }
    };
    load();
  }, []);

  return (
    <div
      style={{
        borderRadius: 16,
        border: "1px solid rgba(0,229,255,0.2)",
        padding: 24,
        background: "#070b10"
      }}
    >
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>Recent Treasury Activity</div>
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          On-chain movements of JERT from the corporate vault (view only).
        </div>
      </div>

      {items.length === 0 ? (
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          No transactions yet. They will appear here once the network is live.
        </div>
      ) : (
        <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <th style={{ padding: "6px 4px" }}>Hash</th>
              <th style={{ padding: "6px 4px" }}>Type</th>
              <th style={{ padding: "6px 4px" }}>Amount</th>
              <th style={{ padding: "6px 4px" }}>Block</th>
              <th style={{ padding: "6px 4px" }}>Time</th>
            </tr>
          </thead>
          <tbody>
            {items.map((tx) => (
              <tr key={tx.hash} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "6px 4px", maxWidth: 200, wordBreak: "break-all" }}>
                  {tx.hash}
                </td>
                <td style={{ padding: "6px 4px" }}>{tx.type}</td>
                <td style={{ padding: "6px 4px" }}>{tx.amount}</td>
                <td style={{ padding: "6px 4px" }}>{tx.blockNumber}</td>
                <td style={{ padding: "6px 4px" }}>{tx.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
