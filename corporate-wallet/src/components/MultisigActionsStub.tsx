
import React, { useEffect, useMemo, useState } from "react";

type Props = {
  connectedAddress?: string | null;
};

export default function MultisigActionsStub({ connectedAddress }: Props) {
  const [to, setTo] = useState<string>("");
  const [txId, setTxId] = useState<string>("0");

  const connected = useMemo(() => Boolean(connectedAddress), [connectedAddress]);

  // Simple mobile breakpoint for layout
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 720;
  });

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 720);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const styles = useMemo(() => {
    const panel: React.CSSProperties = {
      padding: isMobile ? 14 : 16,
      borderRadius: isMobile ? 16 : 20,
      border: "1px solid rgba(0,255,255,0.14)",
      background: "rgba(5,10,20,0.55)",
      boxShadow: "0 0 18px rgba(0,255,255,0.10)",
      width: "100%",
      boxSizing: "border-box",
      overflow: "hidden",
    };

    const label: React.CSSProperties = { fontSize: 12, opacity: 0.8 };

    const mono: React.CSSProperties = { fontFamily: "monospace" };

    const inputBase: React.CSSProperties = {
      width: "100%",
      boxSizing: "border-box",
      minWidth: 0,
      padding: "10px 12px",
      height: 40,
      fontSize: 13,
      borderRadius: 12,
      border: "1px solid rgba(0,255,255,0.35)",
      background: "rgba(0,0,0,0.35)",
      color: "#f5f5f5",
      outline: "none",
      ...mono,
    };

    // Button style aligned with Send JERT (height/radius/weight)
    const actionBtnBase: React.CSSProperties = {
      width: "100%",
      boxSizing: "border-box",
      height: 54,
      borderRadius: 16,
      border: "1px solid rgba(0,255,255,0.18)",
      fontWeight: 900,
      cursor: "pointer",
      padding: "10px 14px",
      letterSpacing: 0.3,
    };

    const actionBtn = (active: boolean): React.CSSProperties => ({
      ...actionBtnBase,
      background: active ? "rgba(0,255,255,0.10)" : "rgba(255,255,255,0.06)",
      color: active ? "rgba(0,255,255,0.95)" : "rgba(255,255,255,0.65)",
      cursor: active ? "pointer" : "not-allowed",
      opacity: active ? 1 : 0.85,
    });

    const gridRow: React.CSSProperties = isMobile
      ? {
          display: "flex",
          flexDirection: "column",
          gap: 12,
          width: "100%",
          marginTop: 12,
        }
      : {
          display: "grid",
          gridTemplateColumns: "1fr 140px 1fr 1fr", // Create | TxID | Confirm | Execute
          gap: 12,
          width: "100%",
          alignItems: "end",
          marginTop: 12,
        };

    const txIdWrap: React.CSSProperties = isMobile
      ? { width: "100%" }
      : { width: "100%", minWidth: 0 };

    const txIdInput: React.CSSProperties = {
      ...inputBase,
      height: 54, // match buttons height
      borderRadius: 16,
      padding: "10px 12px",
      textAlign: "center",
    };

    return {
      panel,
      label,
      mono,
      inputBase,
      actionBtn,
      gridRow,
      txIdWrap,
      txIdInput,
    };
  }, [isMobile]);

  return (
    <div style={styles.panel}>
      <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
        Connected signer:{" "}
        <span style={{ fontFamily: "monospace" }}>
          {connectedAddress ?? "—"}
        </span>
      </div>

      {/* Recipient */}
      <div style={{ marginTop: 14 }}>
        <div style={styles.label}>To (recipient)</div>
        <input
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="0x…"
          style={styles.inputBase}
        />
      </div>

      {/* Actions Row (aligned: ends exactly with Execute) */}
      <div style={styles.gridRow}>
        <button
          type="button"
          disabled={!connected}
          onClick={() =>
            alert(
              `Stub: Create Tx\nTo: ${to}\nValue: (hidden; MetaMask will handle gas)`
            )
          }
          style={styles.actionBtn(connected)}
        >
          Create Tx
        </button>

        <div style={styles.txIdWrap}>
          <div style={styles.label}>Tx ID</div>
          <input
            value={txId}
            onChange={(e) => setTxId(e.target.value)}
            inputMode="numeric"
            style={styles.txIdInput}
          />
        </div>

        <button
          type="button"
          disabled={!connected}
          onClick={() => alert(`Stub: Confirm Tx #${txId}`)}
          style={styles.actionBtn(connected)}
        >
          Confirm
        </button>

        <button
          type="button"
          disabled={!connected}
          onClick={() => alert(`Stub: Execute Tx #${txId}`)}
          style={styles.actionBtn(connected)}
        >
          Execute
        </button>
      </div>

      <div style={{ marginTop: 10, fontSize: 12, opacity: 0.65 }}>
        Gas is handled by MetaMask. UI does not display ETH or gas amounts.
      </div>
    </div>
  );
}

