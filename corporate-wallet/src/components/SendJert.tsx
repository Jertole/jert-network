
import React, { useEffect, useMemo, useState } from "react";
import { BrowserProvider, Contract, parseUnits } from "ethers";
import { JERT_TOKEN_ABI, JERT_TOKEN_ADDRESS } from "../config/jertToken";

declare global {
  interface Window {
    ethereum?: any;
  }
}

type Props = {
  chainLabel?: string; // e.g. "Sepolia"
  chainId?: number; // e.g. 11155111
};

const SendJert: React.FC<Props> = ({
  chainLabel = "Sepolia",
  chainId = 11155111,
}) => {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  // Mobile breakpoint (same logic as other components)
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
    const neon = "rgba(60, 255, 240, 0.85)";
    const border = "rgba(60, 255, 240, 0.35)";
    const panelBg = "rgba(15, 18, 28, 0.60)";

    const cardPad = isMobile ? 14 : 18;
    const radius = isMobile ? 16 : 18;

    const card: React.CSSProperties = {
      width: "100%",
      maxWidth: 760,
      boxSizing: "border-box",
      padding: cardPad,
      borderRadius: radius,
      background: panelBg,
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "0 0 0 1px rgba(0,0,0,0.25) inset",
      overflow: "hidden",
    };

    const title: React.CSSProperties = {
      fontSize: isMobile ? 30 : 40,
      fontWeight: 700,
      margin: "4px 0 6px 0",
      letterSpacing: 0.2,
    };

    const sub: React.CSSProperties = {
      fontSize: 14,
      opacity: 0.8,
      marginBottom: 14,
    };

    const label: React.CSSProperties = {
      fontSize: 13,
      opacity: 0.9,
      margin: "10px 0 6px 0",
    };

    // Single canonical form width inside card: 100%
    const form: React.CSSProperties = {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      gap: 12,
      boxSizing: "border-box",
      padding: 0,
      margin: 0,
    };

    const input: React.CSSProperties = {
      width: "100%",
      boxSizing: "border-box",
      height: 44,
      borderRadius: 12,
      padding: "0 14px",
      outline: "none",
      border: `1px solid ${border}`,
      boxShadow: "0 0 0 1px rgba(0,0,0,0.25) inset",
      background: "rgba(10, 12, 18, 0.55)",
      color: "rgba(255,255,255,0.92)",
      fontSize: 16,
    };

    // Button aligned with Multisig canonical height/radius
    const button: React.CSSProperties = {
      width: "100%",
      boxSizing: "border-box",
      height: 54,
      marginTop: 14,
      borderRadius: 16,
      border: 0,
      cursor: "pointer",
      fontSize: 16,
      fontWeight: 900,
      letterSpacing: 0.3,
      color: "rgba(10, 12, 18, 0.92)",
      background:
        "linear-gradient(90deg, rgba(60,255,240,0.95) 0%, rgba(90,220,255,0.90) 55%, rgba(255,120,220,0.92) 100%)",
      boxShadow: "0 0 18px rgba(60,255,240,0.14)",
      display: "block",
    };

    const buttonDisabled: React.CSSProperties = {
      opacity: 0.55,
      cursor: "not-allowed",
      filter: "grayscale(0.15)",
    };

    const hint: React.CSSProperties = {
      marginTop: 10,
      fontSize: 12,
      opacity: 0.75,
    };

    const statusStyle: React.CSSProperties = {
      marginTop: 10,
      fontSize: 13,
      color: neon,
      wordBreak: "break-word",
    };

    return {
      card,
      title,
      sub,
      label,
      form,
      input,
      button,
      buttonDisabled,
      hint,
      statusStyle,
    };
  }, [isMobile]);

  async function onSend() {
    setStatus(null);

    try {
      if (!window.ethereum) {
        setStatus("MetaMask not found.");
        return;
      }

      const to = recipient.trim();
      const amt = amount.trim();

      if (!to || !to.startsWith("0x") || to.length < 42) {
        setStatus("Recipient address looks invalid.");
        return;
      }
      if (!amt || Number(amt) <= 0) {
        setStatus("Amount must be > 0.");
        return;
      }

      setBusy(true);

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const token = new Contract(JERT_TOKEN_ADDRESS, JERT_TOKEN_ABI, signer);

      // assume 18 decimals
      const value = parseUnits(amt, 18);

      const tx = await token.transfer(to, value);
      setStatus(`Transaction sent: ${tx.hash}`);
      await tx.wait();
      setStatus("Done ✅");
      setRecipient("");
      setAmount("");
    } catch (e: any) {
      setStatus(e?.message || "Error sending transaction.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={styles.card}>
      <div style={styles.title}>Send JERT</div>

      <div style={styles.sub}>
        Network: {chainLabel} (chainId {chainId})
      </div>

      <div style={styles.form}>
        <div>
          <div style={styles.label}>Recipient address</div>
          <input
            style={styles.input}
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            autoComplete="off"
            spellCheck={false}
            inputMode="text"
          />
        </div>

        <div>
          <div style={styles.label}>Amount (JERT)</div>
          <input
            style={styles.input}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            autoComplete="off"
            spellCheck={false}
            inputMode="decimal"
          />
        </div>

        <button
          style={{
            ...styles.button,
            ...(busy ? styles.buttonDisabled : {}),
          }}
          onClick={onSend}
          disabled={busy}
        >
          {busy ? "Sending..." : "Send JERT"}
        </button>

        <div style={styles.hint}>
          Gas is handled by MetaMask. UI does not display ETH or gas amounts.
        </div>

        {status && <div style={styles.statusStyle}>{status}</div>}
      </div>
    </div>
  );
};

export default SendJert;

