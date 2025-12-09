// corporate-wallet/src/components/TransactionsTable.tsx

import React, { useMemo, useState } from "react";
import { TxHistoryItem } from "../services/api";

interface Props {
  history: TxHistoryItem[];
  loading?: boolean;
  compact?: boolean;
}

type FilterType = "ALL" | "PENDING" | "EXECUTED";

export const TransactionsTable: React.FC<Props> = ({
  history,
  loading = false,
  compact = false,
}) => {
  const [filter, setFilter] = useState<FilterType>("ALL");

  const filtered = useMemo(() => {
    switch (filter) {
      case "PENDING":
        return history.filter((tx) => !tx.executed);
      case "EXECUTED":
        return history.filter((tx) => tx.executed);
      default:
        return history;
    }
  }, [history, filter]);

  return (
    <div
      style={{
        padding: compact ? 12 : 16,
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "radial-gradient(circle at top, #111827, #020617)",
        boxShadow: "0 0 30px rgba(0,0,0,0.45)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 14,
              textTransform: "uppercase",
              letterSpacing: 1.2,
              opacity: 0.8,
            }}
          >
            Transactions
          </div>
          <div style={{ fontSize: 11, opacity: 0.6 }}>
            Multisig proposals & executions
          </div>
        </div>

        {/* Фильтр */}
        <div
          style={{
            display: "flex",
            gap: 6,
            alignItems: "center",
            fontSize: 11,
          }}
        >
          <span style={{ opacity: 0.7 }}>Filter:</span>
          {(["ALL", "PENDING", "EXECUTED"] as FilterType[]).map((ft) => {
            const active = filter === ft;
            return (
              <button
                key={ft}
                onClick={() => setFilter(ft)}
                style={{
                  padding: "4px 8px",
                  borderRadius: 999,
                  border: active
                    ? "1px solid rgba(96,165,250,0.9)"
                    : "1px solid rgba(148,163,184,0.4)",
                  background: active
                    ? "linear-gradient(90deg,#0ea5e9,#6366f1)"
                    : "transparent",
                  color: active ? "#0f172a" : "#e5e7eb",
                  fontSize: 11,
                  cursor: "pointer",
                }}
              >
                {ft}
              </button>
            );
          })}
        </div>
      </div>

      {/* Таблица */}
      <div
        style={{
          maxHeight: compact ? 220 : 320,
          overflowY: "auto",
          borderRadius: 12,
          border: "1px solid rgba(15,23,42,0.9)",
          background: "rgba(2,6,23,0.9)",
        }}
      >
        {loading ? (
          <div
            style={{
              padding: 16,
              textAlign: "center",
              fontSize: 12,
              opacity: 0.7,
            }}
          >
            Loading transactions…
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              padding: 16,
              textAlign: "center",
              fontSize: 12,
              opacity: 0.7,
            }}
          >
            No transactions found.
          </div>
        ) : (
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
                  background:
                    "linear-gradient(90deg,rgba(15,23,42,0.9),rgba(30,64,175,0.4))",
                }}
              >
                <th
                  style={{
                    textAlign: "left",
                    padding: "8px 10px",
                    fontWeight: 500,
                    opacity: 0.8,
                  }}
                >
                  #
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "8px 10px",
                    fontWeight: 500,
                    opacity: 0.8,
                  }}
                >
                  To
                </th>
                <th
                  style={{
                    textAlign: "right",
                    padding: "8px 10px",
                    fontWeight: 500,
                    opacity: 0.8,
                    whiteSpace: "nowrap",
                  }}
                >
                  Amount (ETH)
                </th>
                <th
                  style={{
                    textAlign: "center",
                    padding: "8px 10px",
                    fontWeight: 500,
                    opacity: 0.8,
                    whiteSpace: "nowrap",
                  }}
                >
                  Approvals
                </th>
                <th
                  style={{
                    textAlign: "right",
                    padding: "8px 10px",
                    fontWeight: 500,
                    opacity: 0.8,
                  }}
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx, idx) => {
                const confirmations = tx.confirmations ?? 0;
                const required = tx.required ?? 0;
                const ratio =
                  required > 0 ? Math.min(1, confirmations / required) : 0;
                const percent = Math.round(ratio * 100);

                return (
                  <tr
                    key={tx.id}
                    style={{
                      borderBottom: "1px solid rgba(15,23,42,0.8)",
                    }}
                  >
                    <td
                      style={{
                        padding: "6px 10px",
                        opacity: 0.8,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {tx.id}
                    </td>
                    <td
                      style={{
                        padding: "6px 10px",
                        maxWidth: 220,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontFamily: "monospace",
                        fontSize: 11,
                      }}
                      title={tx.to}
                    >
                      {tx.to}
                    </td>
                    <td
                      style={{
                        padding: "6px 10px",
                        textAlign: "right",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {tx.amountEth}
                    </td>
                    <td
                      style={{
                        padding: "6px 10px",
                        textAlign: "center",
                        minWidth: 140,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                        }}
                      >
                        <div
                          style={{
                            height: 6,
                            borderRadius: 999,
                            background: "rgba(15,23,42,0.9)",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${percent}%`,
                              background:
                                "linear-gradient(90deg,#22c55e,#eab308)",
                              transition: "width 0.25s ease-out",
                            }}
                          />
                        </div>
                        <div
                          style={{
                            fontSize: 10,
                            opacity: 0.7,
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          {confirmations}/{required} ({percent}%)
                        </div>
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "6px 10px",
                        textAlign: "right",
                      }}
                    >
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: 999,
                          fontSize: 10,
                          textTransform: "uppercase",
                          letterSpacing: 0.6,
                          background: tx.executed
                            ? "rgba(16,185,129,0.15)"
                            : "rgba(245,158,11,0.12)",
                          border: tx.executed
                            ? "1px solid rgba(16,185,129,0.7)"
                            : "1px solid rgba(245,158,11,0.6)",
                          color: tx.executed ? "#a7f3d0" : "#fed7aa",
                        }}
                      >
                        {tx.executed ? "Executed" : "Pending"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
