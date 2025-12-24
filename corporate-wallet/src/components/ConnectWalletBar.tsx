
import React, { useEffect, useMemo, useState } from "react";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const SEPOLIA_CHAIN_ID_HEX = "0xaa36a7"; // 11155111

type Props = {
  expectedChainIdHex?: string;
};

export default function ConnectWalletBar({
  expectedChainIdHex = SEPOLIA_CHAIN_ID_HEX,
}: Props) {
  const [hasProvider, setHasProvider] = useState<boolean>(false);
  const [address, setAddress] = useState<string | null>(null);
  const [chainIdHex, setChainIdHex] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const isExpectedNetwork = useMemo(() => {
    if (!chainIdHex) return false;
    return chainIdHex.toLowerCase() === expectedChainIdHex.toLowerCase();
  }, [chainIdHex, expectedChainIdHex]);

  const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

  const readState = async () => {
    try {
      setError(null);
      if (!window.ethereum) {
        setHasProvider(false);
        setAddress(null);
        setChainIdHex(null);
        return;
      }
      setHasProvider(true);

      const chain = await window.ethereum.request({ method: "eth_chainId" });
      setChainIdHex(chain);

      const accounts: string[] = await window.ethereum.request({
        method: "eth_accounts",
      });
      setAddress(accounts?.[0] ?? null);
    } catch (e: any) {
      setError(e?.message ?? "Failed to read wallet state");
    }
  };

  useEffect(() => {
    readState();

    if (!window.ethereum) return;

    const onAccounts = (accs: string[]) => setAddress(accs?.[0] ?? null);
    const onChain = (cid: string) => setChainIdHex(cid);

    window.ethereum.on?.("accountsChanged", onAccounts);
    window.ethereum.on?.("chainChanged", onChain);

    return () => {
      window.ethereum.removeListener?.("accountsChanged", onAccounts);
      window.ethereum.removeListener?.("chainChanged", onChain);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connect = async () => {
    try {
      setError(null);
      if (!window.ethereum) {
        setError("MetaMask not detected");
        return;
      }
      const accounts: string[] = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAddress(accounts?.[0] ?? null);

      const chain = await window.ethereum.request({ method: "eth_chainId" });
      setChainIdHex(chain);
    } catch (e: any) {
      setError(e?.message ?? "Connect failed");
    }
  };

  const disconnectUiOnly = () => {
    // MetaMask doesn't support programmatic disconnect; we only clear UI state.
    setAddress(null);
  };

  const switchToSepolia = async () => {
    try {
      setError(null);
      if (!window.ethereum) {
        setError("MetaMask not detected");
        return;
      }
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: expectedChainIdHex }],
      });
      const chain = await window.ethereum.request({ method: "eth_chainId" });
      setChainIdHex(chain);
    } catch (e: any) {
      setError(e?.message ?? "Switch network failed");
    }
  };

  const styles = useMemo(() => {
    const panel: React.CSSProperties = {
      padding: isMobile ? 14 : 16,
      borderRadius: isMobile ? 16 : 18,
      border: "1px solid rgba(0,255,255,0.14)",
      background: "rgba(5,10,20,0.55)",
      boxShadow: "0 0 18px rgba(0,255,255,0.10)",
      display: "flex",
      justifyContent: "space-between",
      gap: 12,
      flexWrap: "wrap",
      alignItems: "center",
      width: "100%",
      boxSizing: "border-box",
      overflow: "hidden",
    };

    const left: React.CSSProperties = {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      minWidth: 0,
      flex: "1 1 360px",
    };

    const monoRow: React.CSSProperties = {
      fontFamily: "monospace",
      fontSize: 12,
      opacity: 0.9,
      minWidth: 0,
      overflowWrap: "anywhere",
      wordBreak: "break-word",
    };

    const actions: React.CSSProperties = isMobile
      ? {
          display: "flex",
          flexDirection: "column",
          gap: 10,
          alignItems: "stretch",
          width: "100%",
        }
      : {
          display: "flex",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap",
          justifyContent: "flex-end",
        };

    // Canon button (same height/radius family as SendJert/Multisig)
    const btnBase: React.CSSProperties = {
      height: 54,
      borderRadius: 16,
      padding: "10px 14px",
      fontWeight: 900,
      cursor: "pointer",
      boxSizing: "border-box",
      width: isMobile ? "100%" : "auto",
      whiteSpace: "nowrap",
    };

    const btnPrimary: React.CSSProperties = {
      ...btnBase,
      border: "1px solid rgba(0,255,255,0.22)",
      background: "rgba(0,255,255,0.10)",
      color: "rgba(0,255,255,0.95)",
      boxShadow: "0 0 14px rgba(0,255,255,0.18)",
    };

    const btnGhost: React.CSSProperties = {
      ...btnBase,
      border: "1px solid rgba(255,255,255,0.16)",
      background: "rgba(255,255,255,0.06)",
      color: "rgba(255,255,255,0.92)",
      fontWeight: 800,
    };

    const btnBlue: React.CSSProperties = {
      ...btnBase,
      border: "1px solid rgba(0,255,255,0.18)",
      background: "rgba(0,120,255,0.10)",
      color: "rgba(180,220,255,0.95)",
    };

    const errorStyle: React.CSSProperties = {
      fontSize: 12,
      color: "rgba(255,120,120,0.95)",
      maxWidth: "100%",
      overflowWrap: "anywhere",
      wordBreak: "break-word",
    };

    return {
      panel,
      left,
      monoRow,
      actions,
      btnPrimary,
      btnGhost,
      btnBlue,
      errorStyle,
    };
  }, [isMobile]);

  return (
    <div style={styles.panel}>
      <div style={styles.left}>
        <div style={{ fontWeight: 900, color: "rgba(0,255,255,0.92)" }}>
          Wallet
        </div>

        <div style={styles.monoRow}>
          Provider: {hasProvider ? "MetaMask" : "Not detected"}
        </div>

        <div style={styles.monoRow}>
          Address: {address ? short(address) : "—"}
        </div>

        <div style={styles.monoRow}>
          Chain: {chainIdHex ?? "—"}{" "}
          {chainIdHex && (
            <span style={{ marginLeft: 8, opacity: 0.8 }}>
              {isExpectedNetwork ? "(OK)" : "(Wrong network)"}
            </span>
          )}
        </div>

        {error && <div style={styles.errorStyle}>{error}</div>}
      </div>

      <div style={styles.actions}>
        {!address ? (
          <button type="button" onClick={connect} style={styles.btnPrimary}>
            Connect MetaMask
          </button>
        ) : (
          <button
            type="button"
            onClick={disconnectUiOnly}
            style={styles.btnGhost}
          >
            Disconnect (UI)
          </button>
        )}

        <button type="button" onClick={switchToSepolia} style={styles.btnBlue}>
          Switch to Sepolia
        </button>
      </div>
    </div>
  );
}

