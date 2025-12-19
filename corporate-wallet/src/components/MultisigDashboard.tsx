import React, { useEffect, useMemo, useState } from "react";
import { BrowserProvider, Contract, formatEther } from "ethers";
import {
  TREASURY_MULTISIG_ABI,
  TREASURY_MULTISIG_ADDRESS,
} from "../config/treasuryMultisig";

declare global {
  interface Window {
    ethereum?: any;
  }
}

type TxItem = {
  id: number;
  to: string;
  value: bigint;
  executed: boolean;
  numConfirmations: bigint;
};

function shortAddress(addr: string, left = 6, right = 4) {
  if (!addr) return "";
  if (addr.length <= left + right + 2) return addr;
  return `${addr.slice(0, left)}…${addr.slice(-right)}`;
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Fallback for older environments
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }
}

function Badge({
  label,
  variant = "neutral",
}: {
  label: string;
  variant?: "neutral" | "success" | "warning";
}) {
  const style: React.CSSProperties = useMemo(() => {
    const base: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      padding: "2px 10px",
      borderRadius: 999,
      fontSize: 12,
      lineHeight: "18px",
      border: "1px solid rgba(255,255,255,0.12)",
      background: "rgba(255,255,255,0.06)",
      color: "rgba(255,255,255,0.92)",
      whiteSpace: "nowrap",
    };

    if (variant === "success") {
      return {
        ...base,
        border: "1px solid rgba(34,197,94,0.35)",
        background: "rgba(34,197,94,0.12)",
      };
    }
    if (variant === "warning") {
      return {
        ...base,
        border: "1px solid rgba(245,158,11,0.35)",
        background: "rgba(245,158,11,0.12)",
      };
    }
    return base;
  }, [variant]);

  return <span style={style}>{label}</span>;
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(0,0,0,0.20)",
        padding: 16,
        marginBottom: 14,
      }}
    >
      {children}
    </div>
  );
}

function LabelValue({
  label,
  value,
  onCopy,
  mono = false,
}: {
  label: string;
  value: string;
  onCopy?: () => void;
  mono?: boolean;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
      <div style={{ color: "rgba(255,255,255,0.70)", fontSize: 13 }}>
        {label}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: 13,
          fontFamily: mono ? "ui-monospace, SFMono-Regular, Menlo, monospace" : undefined,
          color: "rgba(255,255,255,0.92)",
        }}
      >
        <span>{value}</span>
        {onCopy && (
          <button
            onClick={onCopy}
            style={{
              cursor: "pointer",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.9)",
              padding: "4px 10px",
              fontSize: 12,
            }}
            aria-label={`Copy ${label}`}
            title={`Copy ${label}`}
          >
            Copy
          </button>
        )}
      </div>
    </div>
  );
}

export const MultisigDashboard: React.FC = () => {
  const [owners, setOwners] = useState<string[]>([]);
  const [required, setRequired] = useState<number>(0);
  const [balanceEth, setBalanceEth] = useState<string>("0");
  const [txs, setTxs] = useState<TxItem[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!window.ethereum) return;

      const provider = new BrowserProvider(window.ethereum);
      const contract = new Contract(
        TREASURY_MULTISIG_ADDRESS,
        TREASURY_MULTISIG_ABI,
        provider
      );

      const ownersList: string[] = await contract.getOwners();
      const req = await contract.requiredConfirmations();
      const txCount = await contract.getTransactionCount();
      const bal = await provider.getBalance(TREASURY_MULTISIG_ADDRESS);

      const txItems: TxItem[] = [];
      for (let i = 0; i < Number(txCount); i++) {
        const tx = await contract.transactions(i);
        txItems.push({
          id: i,
          to: tx.to,
          value: tx.value,
          executed: tx.executed,
          numConfirmations: tx.numConfirmations,
        });
      }

      // newest first
      txItems.sort((a, b) => b.id - a.id);

      setOwners(ownersList);
      setRequired(Number(req));
      setBalanceEth(formatEther(bal));
      setTxs(txItems);
    };

    load();
  }, []);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(null), 1200);
    return () => clearTimeout(t);
  }, [copied]);

  const headerRow: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: 12,
    marginBottom: 10,
  };

  const tableStyle: React.CSSProperties = {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    overflow: "hidden",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.10)",
  };

  const thStyle: React.CSSProperties = {
    textAlign: "left",
    fontSize: 12,
    padding: "10px 12px",
    color: "rgba(255,255,255,0.70)",
    background: "rgba(255,255,255,0.06)",
    borderBottom: "1px solid rgba(255,255,255,0.10)",
    whiteSpace: "nowrap",
  };

  const tdStyle: React.CSSProperties = {
    padding: "10px 12px",
    fontSize: 13,
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    color: "rgba(255,255,255,0.90)",
    verticalAlign: "middle",
  };

  return (
    <div style={{ marginTop: 18 }}>
      <div style={headerRow}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Treasury Multisig</div>
          <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>
            Read-only governance overview
          </div>
        </div>
        {copied && <Badge label="Copied" variant="success" />}
      </div>

      <Card>
        <div style={{ display: "grid", gap: 10 }}>
          <LabelValue
            label="Contract address"
            value={shortAddress(TREASURY_MULTISIG_ADDRESS)}
            mono
            onCopy={async () => {
              await copyToClipboard(TREASURY_MULTISIG_ADDRESS);
              setCopied("contract");
            }}
          />
          <LabelValue label="Owners" value={`${owners.length}`} />
          <LabelValue label="Required confirmations" value={`${required}`} />
          <LabelValue label="ETH balance" value={balanceEth} />
        </div>
      </Card>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 650 }}>Owners</div>
          <Badge label="Read-only" variant="neutral" />
        </div>

        {owners.length === 0 ? (
          <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>
            No owners found (wallet not connected or wrong network).
          </div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {owners.map((o, idx) => (
              <div
                key={o}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.10)",
                  background: "rgba(255,255,255,0.04)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Badge label={`Owner #${idx + 1}`} variant="neutral" />
                  <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                    {shortAddress(o, 8, 6)}
                  </span>
                </div>
                <button
                  onClick={async () => {
                    await copyToClipboard(o);
                    setCopied(o);
                  }}
                  style={{
                    cursor: "pointer",
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.06)",
                    color: "rgba(255,255,255,0.9)",
                    padding: "4px 10px",
                    fontSize: 12,
                  }}
                  title="Copy address"
                >
                  Copy
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 650 }}>Transactions</div>
          <Badge label={`${txs.length} total`} variant="neutral" />
        </div>

        {txs.length === 0 ? (
          <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}>
            No transactions yet.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>To</th>
                  <th style={thStyle}>Value</th>
                  <th style={thStyle}>Confirmations</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {txs.map((tx, i) => {
                  const isLast = i === txs.length - 1;
                  return (
                    <tr key={tx.id}>
                      <td style={{ ...tdStyle, borderBottom: isLast ? "none" : tdStyle.borderBottom }}>
                        <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                          {tx.id}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, borderBottom: isLast ? "none" : tdStyle.borderBottom }}>
                        <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                          {shortAddress(tx.to, 8, 6)}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, borderBottom: isLast ? "none" : tdStyle.borderBottom }}>
                        {formatEther(tx.value)} ETH
                      </td>
                      <td style={{ ...tdStyle, borderBottom: isLast ? "none" : tdStyle.borderBottom }}>
                        <Badge
                          label={`${tx.numConfirmations.toString()} / ${required}`}
                          variant={tx.executed ? "success" : "warning"}
                        />
                      </td>
                      <td style={{ ...tdStyle, borderBottom: isLast ? "none" : tdStyle.borderBottom }}>
                        <Badge
                          label={tx.executed ? "Executed" : "Pending"}
                          variant={tx.executed ? "success" : "warning"}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
