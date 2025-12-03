// corporate-wallet/src/components/TransactionsTable.tsx

import React, { useMemo, useState } from "react";
import { TxHistoryItem } from "../services/api";

interface Props {
  history: TxHistoryItem[];
  loading?: boolean;
  compact?: boolean;
}

type FilterType = "ALL" | "IN" | "OUT";

export const TransactionsTable: React.FC<Props> = ({
  history,
  loading = false,
  compact = false,
}) => {
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [page, setPage] = useState<number>(1);
  const pageSize = compact ? 8 : 10;

  const filtered = useMemo(() => {
    if (filter === "ALL") return history;
    return history.filter((tx) => tx.type === filter);
  }, [history, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const currentPageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const handleFilterChange = (next: FilterType) => {
    setFilter(next);
    setPage(1); // сбрасываем на первую страницу
  };

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

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
    <div style={{ marginTop: 8 }}>
      {/* Фильтры */}
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          marginBottom: 6,
        }}
      >
        <span style={{ fontSize: 11, opacity: 0.75 }}>Filter:</span>
        {(["ALL", "IN", "OUT"] as FilterType[]).map((ft) => {
          const active = filter === ft;
          return (
            <button
              key={ft}
              onClick={() => handleFilterChange(ft)}
              style={{
                padding: "4px 10px",
                borderRadius: 999,
                border: active
                  ? "1px solid rgba(0,229,255,0.8)"
                  : "1px solid rgba(255,255,255,0.18)",
                background: active
                  ? "linear-gradient(90deg, #00e5ff 0%, #23d4ff 50%, #00b3ff 100%)"
                  : "rgba(5,7,11,0.8)",
                color: active ? "#05070b" : "#f1f5f9",
                fontSize: 11,
                cursor: "pointer",
              }}
            >
              {ft}
            </button>
          );
        })}
        <div style={{ marginLeft: "auto", fontSize: 11, opacity: 0.7 }}>
          {filtered.length} tx • Page {page} / {totalPages}
        </div>
      </div>

      {/* Таблица */}
      <div
        style={{
          maxHeight: compact ? 220 : 320,
          overflowY: "auto",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(0,0,0,0.25)",
        }}
      >
        <table
          style
