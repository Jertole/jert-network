import React, { useEffect, useMemo, useState } from "react";
import HeaderBar from "../components/HeaderBar";
import ConnectWalletBar from "../components/ConnectWalletBar";
import MultisigActionsStub from "../components/MultisigActionsStub";
import SendJert from "../components/SendJert";
import TerminalBenefitsCard from "../components/TerminalBenefitsCard";

const Dashboard: React.FC = () => {
  // UI-only: we’ll later replace with a shared wallet hook/provider
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);

  // Mobile adaptive (single source of truth)
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
    const pagePadding = isMobile ? 12 : 24;
    const gap = isMobile ? 12 : 18;
    const cardPad = isMobile ? 14 : 18;
    const radius = isMobile ? 16 : 18;

    const page: React.CSSProperties = {
      minHeight: "100vh",
      background: "#02020a",
      color: "#f5f5f5",
      padding: pagePadding,
      boxSizing: "border-box",
      display: "flex",
      justifyContent: "center",
    };

    const stack: React.CSSProperties = {
      width: "100%",
      maxWidth: 760, // ✅ single canonical width
      display: "flex",
      flexDirection: "column",
      gap,
    };

    const card: React.CSSProperties = {
      width: "100%",
      boxSizing: "border-box",
      padding: cardPad,
      borderRadius: radius,
      background: "rgba(15, 18, 28, 0.60)",
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "0 0 0 1px rgba(0,0,0,0.25) inset",
      overflow: "hidden",
    };

    return { page, stack, card };
  }, [isMobile]);

  return (
    <div style={styles.page}>
      <div style={styles.stack}>
        {/* CANON HEADER */}
        <div style={styles.card}>
          <HeaderBar />
        </div>

        {/* UI-B: CONNECT + NETWORK */}
        <div style={styles.card}>
          <ConnectWalletBar />
          {/* We do not yet lift state from ConnectWalletBar — wiring comes in the next step */}
        </div>

        {/* UI-B: MULTISIG ACTIONS (STUB) */}
        <div style={styles.card}>
          <MultisigActionsStub connectedAddress={connectedAddress} />
        </div>

        {/* MAIN ACTIONS */}
        <div style={styles.card}>
          <SendJert />
        </div>

        <div style={styles.card}>
          <TerminalBenefitsCard />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

