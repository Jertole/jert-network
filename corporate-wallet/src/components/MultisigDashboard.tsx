
import React, { useEffect, useMemo, useState } from "react";
import { getMultisigInfo, getTreasuryBalance } from "../services/jertContracts";
import {
  convertJert,
  getEnergyRates,
  getRecentTransactions,
  UICorporateTx,
  EnergyRates,
} from "../services/api";

interface MultisigInfo {
  owners: string[];
  threshold: number;
}

const PAGE_SIZE = 10;

export const MultisigDashboard: React.FC = () => {
  const [info, setInfo] = useState<MultisigInfo | null>(null);
  const [balanceJert, setBalanceJert] = useState<number>(0);

  const [rates, setRates] = useState<EnergyRates | null>(null);
  const [energyMWh, setEnergyMWh] = useState<number>(0);
  const [coldMWh, setColdMWh] = useState<number>(0);

  const [txs, setTxs] = useState<UICorporateTx[]>([]);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [page, setPage] = useState<number>(1);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const [infoRes, balanceRes, ratesRes] = await Promise.all([
          getMultisigInfo(),
          getTreasuryBalance(),
          getEnergyRates(),
        ]);

        // balanceRes может быть строкой "123.45 JERT" или числом
        let numericBalance = 0;
        if (typeof balanceRes === "number") {
          numericBalance = balanceRes;
        } else {
          const asString = String(balanceRes);
          const parts = asString.split(" ");
          numericBalance = parseFloat(parts[0]) || 0;
        }

        const conv = await convertJert(numericBalance);
        const txHistory = await getRecentTransactions();

        setInfo(infoRes);
        setBalanceJert(numericBalance);
        setRates(ratesRes);
        setEnergyMWh(conv.energyMWhEquivalent);
        setColdMWh(conv.coldMWhEquivalent);
        setTxs(txHistory);
        setPage(1);
      } catch (e: any) {
        console.error("Failed to load multisig dashboard:", e);
        setError(e?.message ?? "Failed to load multisig data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // фильтрация и пагинация по типу
  const { pagedTxs, totalPages } = useMemo(() => {
    const filtered =
      filterType === "ALL"
        ? txs
        : txs.filter((tx) => tx.type.toUpperCase() === filterType);
    const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, pages);
    const start = (currentPage - 1) * PAGE_SIZE;
    const slice = filtered.slice(start, start + PAGE_SIZE);

    return { pagedTxs: slice, totalPages: pages };
  }, [txs, filterType, page]);

  const handleChangeFilter = (next: string) => {
    setFilterType(next);
    setPage(1);
  };

  const handlePrevPage = () => setPage((p) => Math.max(1, p - 1));
  const handleNextPage = () =>
    setPage((p) => Math.min(totalPages, p + 1));

  // --- UI ---

  return (
    <div
      style={{
        padding: 24,
        background: "rgba(5,6,10,0.9)",
        borderRadius: 24,
        border: "1px solid rgba(57,230,255,0.35)",
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: 8 }}>Multisig Treasury</h2>
      <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 16 }}>
        On-chain treasury securing Cryogas / JERT infrastructure budget.
      </div>

      {error && (
        <div
          style={{
            marginBottom: 12,
            padding: 8,
            borderRadius: 8,
            background: "rgba(255,99,71,0.1)",
            color: "salmon",
            fontSize: 12,
          }}
        >
          Error: {error}
        </div>
      )}

      {loading && (
        <div style={{ fontSize: 12, opacity: 0.8 }}>Loading on-chain data…</div>
      )}

      {!loading && info && (
        <>
          {/* верхние карточки */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 16,
              marginBottom: 24,
            }}
          >
            {/* Owners */}
            <div
              style={{
                borderRadius: 16,
                padding: 16,
                border: "1px solid rgba(57,230,255,0.3)",
                background: "rgba(5,6,10,0.95)",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  opacity: 0.7,
                  marginBottom: 6,
                }}
              >
                Owners
              </div>
              <ul
                style={{
                  paddingLeft: 16,
                  margin: 0,
                  listStyle: "disc",
                  fontSize: 12,
                }}
              >
                {info.owners.map((o, idx) => (
                  <li key={o + idx}>
                    <code>{o}</code>
                  </li>
                ))}
              </ul>
              <div
                style={{
                  fontSize: 11,
                  opacity: 0.7,
                  marginTop: 8,
                }}
              >
                {info.threshold}-of-{info.owners.length} governance:
                Cryogas KZ, Vitlax Nordic, SY Power Energy.
              </div>
            </div>

            {/* Threshold + Balance */}
            <div
              style={{
                borderRadius: 16,
                padding: 16,
                border: "1px solid rgba(57,230,255,0.3)",
                background: "rgba(5,6,10,0.95)",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div>
                <div
                  style={{ fontSize: 12, opacity: 0.7, marginBottom: 2 }}
                >
                  Signing Threshold
                </div>
                <div style={{ fontSize: 24, fontWeight: 600 }}>
                  {info.threshold} / {info.owners.length}
                </div>
              </div>
              <div>
                <div
                  style={{ fontSize: 12, opacity: 0.7, marginBottom: 2 }}
                >
                  Treasury Balance
                </div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 600,
                    color: "#39e6ff",
                  }}
                >
                  {balanceJert.toFixed(4)} JERT
                </div>
              </div>
            </div>

            {/* Energy equivalents */}
            <div
              style={{
                borderRadius: 16,
                padding: 16,
                border: "1px solid rgba(57,230,255,0.5)",
                background:
                  "radial-gradient(circle at top, rgba(57,230,255,0.18), rgba(5,6,10,0.98))",
              }}
            >
              <div
                style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}
              >
                Energy Equivalent
              </div>
              <div style={{ fontSize: 14 }}>
                <div>≈ {energyMWh.toFixed(2)} MWh</div>
                <div>≈ {coldMWh.toFixed(2)} MWh-cold</div>
              </div>

              {rates && (
                <div
                  style={{
                    fontSize: 11,
                    opacity: 0.7,
                    marginTop: 8,
                  }}
                >
                  Reference: {rates.usdPerMWh.toFixed(2)} USD/MWh,&nbsp;
                  {rates.usdPerMWhCold.toFixed(2)} USD/MWh-cold
                </div>
              )}
              <div
                style={{
                  fontSize: 10,
                  opacity: 0.65,
                  marginTop: 6,
                }}
              >
                Conversion rules: 100 JERT = 1 MWh, 1000 JERT = 1 MWh-cold.
                USD pricing handled off-chain by JERT Energy Oracle.
              </div>
            </div>
          </div>

          {/* Transactions section */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <h3 style={{ margin: 0 }}>Recent Treasury Transactions</h3>
              <div style={{ display: "flex", gap: 8, fontSize: 12 }}>
                <label>
                  Type:&nbsp;
                  <select
                    value={filterType}
                    onChange={(e) => handleChangeFilter(e.target.value)}
                    style={{
                      background: "rgba(5,6,10,0.9)",
                      color: "#fff",
                      borderRadius: 999,
                      padding: "4px 8px",
                      border: "1px solid rgba(57,230,255,0.4)",
                      fontSize: 12,
                    }}
                  >
                    <option value="ALL">All</option>
                    <option value="IN">IN</option>
                    <option value="OUT">OUT</option>
                    <option value="INFO">INFO</option>
                  </select>
                </label>
              </div>
            </div>

            {txs.length === 0 ? (
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                No transactions available yet.
              </div>
            ) : (
              <>
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: 12,
                    }}
                  >
                    <thead>
                      <tr>
                        <th style={thStyle}>Hash</th>
                        <th style={thStyle}>Type</th>
                        <th style={thStyle}>Amount</th>
                        <th style={thStyle}>Block</th>
                        <th style={thStyle}>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedTxs.map((tx) => (
                        <tr key={tx.hash}>
                          <td style={tdStyle}>
                            <code>
                              {tx.hash.slice(0, 10)}…{tx.hash.slice(-6)}
                            </code>
                          </td>
                          <td style={tdStyle}>{tx.type}</td>
                          <td style={tdStyle}>{tx.amount}</td>
                          <td style={tdStyle}>{tx.blockNumber}</td>
                          <td style={tdStyle}>{tx.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 8,
                    fontSize: 12,
                  }}
                >
                  <div>
                    Page {page} of {totalPages}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={handlePrevPage}
                      disabled={page <= 1}
                      style={pagerBtnStyle}
                    >
                      ◀ Prev
                    </button>
                    <button
                      onClick={handleNextPage}
                      disabled={page >= totalPages}
                      style={pagerBtnStyle}
                    >
                      Next ▶
                    </button>
                  </div>
                </div>
              </>
            )}
          </div
