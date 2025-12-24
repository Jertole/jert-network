import React, { useEffect, useMemo, useState } from "react";
import { calcMw, calcUsd } from "../config/pricing";

const TerminalBenefitsCard: React.FC = () => {
  const [amount, setAmount] = useState("2");
  const n = Number(amount) || 0;

  // mobile breakpoint (same as others)
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

    const title: React.CSSProperties = {
      margin: 0,
      color: "rgba(0,255,255,0.92)",
      fontSize: isMobile ? 16 : 18,
      letterSpacing: 0.2,
    };

    const sub: React.CSSProperties = {
      marginTop: 6,
      fontSize: 12,
      opacity: 0.78,
    };

    const label: React.CSSProperties = {
      marginTop: 12,
      fontSize: 12,
      opacity: 0.8,
    };

    const input: React.CSSProperties = {
      width: "100%",
      boxSizing: "border-box",
      height: 44,
      borderRadius: 12,
      padding: "0 14px",
      outline: "none",
      border: "1px solid rgba(0,255,255,0.35)",
      boxShadow: "0 0 0 1px rgba(0,0,0,0.25) inset",
      background: "rgba(0,0,0,0.35)",
      color: "rgba(255,255,255,0.92)",
      fontSize: 16,
      fontFamily: "monospace",
    };

    const mono: React.CSSProperties = {
      marginTop: 10,
      fontFamily: "monospace",
      overflowWrap: "anywhere",
      wordBreak: "break-word",
    };

    const valueAccent: React.CSSProperties = {
      color: "rgba(0,255,255,0.92)",
      fontWeight: 900,
    };

    return { panel, title, sub, label, input, mono, valueAccent };
  }, [isMobile]);

  return (
    <div style={styles.panel}>
      <h3 style={styles.title}>Spend / Settle → Treasury</h3>
      <div style={styles.sub}>
        Quick estimator for settlement value (UI-only).
      </div>

      <div style={styles.label}>Amount (JERT)</div>
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        inputMode="decimal"
        style={styles.input}
      />

      <div style={styles.mono}>
        ≈ USD: <span style={styles.valueAccent}>${calcUsd(n).toFixed(2)}</span>
      </div>

      <div style={styles.mono}>
        ≈ MW: <span style={styles.valueAccent}>{calcMw(n).toFixed(3)}</span>
      </div>
    </div>
  );
};

export default TerminalBenefitsCard;

