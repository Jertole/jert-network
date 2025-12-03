

import React from "react";
import { TxHistoryItem } from "../services/api";

interface Props {
  history: TxHistoryItem[];
  loading?: boolean;
  compact?: boolean;
}

export const TransactionsTable: React.FC<Props> = ({
  history,
  loading = false,
  compact = false,
}) => {
  if (loading) {
    return (
      <div style={{ fontSize: 12, opacity: 0.8 }}>
        Loading transaction history…
      </div>
    );
  }

  if (!history.length) {
    return (
      <div style={{ fontSize: 12, opacity: 0.7 }}>
        No transactions found.
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: 8,
        maxHeight: compact ? 200 : 320,
        overflowY: "auto",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(0,0,0,0.25)",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: compact ? 11 : 12,
        }}
      >
        <thead>
          <tr
            style={{
              background: "rgba(255,255,255,0.04)",
              textAlign: "left",
              height: 34,
            }}
          >
            <th style={{ padding: "6px 8px" }}>Type</th>
            <th style={{ padding: "6px 8px" }}>JERT</th>
            <th style={{ padding: "6px 8px" }}>USD</th>
            {!compact && <th style={{ padding: "6px 8px" }}>Hash</th>}
            {!compact && <th style={{ padding: "6px 8px" }}>Time</th>}
          </tr>
        </thead>

        <tbody>
          {history.map((tx) => {
            const isIn = tx.type === "IN";
            const color = isIn ? "#63ffb2" : "#ff8072";
            const sign = isIn ? "+" : "-";

            const shortHash =
              tx.hash.length > 20
                ? `${tx.hash.slice(0, 10)}…${tx.hash.slice(-8)}`
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
                  {parseFloat(tx.amountJERT).toFixed(4)}
                </td>
                <td style={{ padding: "4px 8px", color }}>
                  {sign}${parseFloat(tx.equivalentUSD).toFixed(2)}
                </td>

                {!compact && (
                  <td
                    style={{
                      padding: "4px 8px",
                      opacity: 0.85,
                      fontFamily: "monospace",
                      whiteSpace: "nowrap",
                    }}
                    title={tx.hash}
                  >
                    {shortHash}
                  </td>
                )}
                {!compact && (
                  <td
                    style={{
                      padding: "4px 8px",
                      opacity: 0.75,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {tx.time || "—"}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
