import React, { useEffect, useState } from "react";
import { getMultisigInfo, getTreasuryBalance } from "../services/jertContracts";

interface MultisigInfo {
  owners: string[];
  threshold: number;
}

export const MultisigDashboard: React.FC = () => {
  const [info, setInfo] = useState<MultisigInfo | null>(null);
  const [balance, setBalance] = useState<string>("0.0000 JERT");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [mi, bal] = await Promise.all([
          getMultisigInfo(),
          getTreasuryBalance()
        ]);
        setInfo(mi);
        setBalance(bal);
      } catch (e) {
        console.error("Failed to load multisig info:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div
      style={{
        borderRadius: 16,
        border: "1px solid rgba(0,229,255,0.3)",
        padding: 24,
        background:
          "radial-gradient(circle at top left, rgba(0,229,255,0.12), transparent 60%)"
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>Multisig Treasury Overview</div>
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          2-of-3 governance: Cryogas KZ / Vitlax Nordic / SY Power Energy
        </div>
      </div>

      {loading && <div style={{ fontSize: 12 }}>Loading on-chain data...</div>}

      {!loading && info && (
        <>
          <div
            style={{
              display: "flex",
              gap: 24,
              flexWrap: "wrap",
              marginBottom: 16
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
              <div style={{ fontSize: 20, fontWeight: 700, color: "#00e5ff" }}>
                {balance}
              </div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Owners</div>
            <ul style={{ paddingLeft: 16, fontSize: 13 }}>
              {info.owners.map((o) => (
                <li key={o} style={{ wordBreak: "break-all" }}>
                  {o}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {!loading && !info && (
        <div style={{ fontSize: 12, opacity: 0.7 }}>No on-chain data available.</div>
      )}
    </div>
  );
};

