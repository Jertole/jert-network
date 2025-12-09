
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import {
  getTreasuryMultisigContract,
  getJERTTokenContract,
  provider,
} from "./services/jertContracts";
import { TxHistoryItem } from "./services/api";
import { TransactionsTable } from "./TransactionsTable";

type DashboardState = {
  loaded: boolean;
  treasuryAddress: string;
  owners: string[];
  required: number;
  ethBalance: string;
  jertBalance: string;
  txHistory: TxHistoryItem[];
};

const initialState: DashboardState = {
  loaded: false,
  treasuryAddress: "",
  owners: [],
  required: 0,
  ethBalance: "0.0",
  jertBalance: "0.0",
  txHistory: [],
};

export const MultisigDashboard: React.FC = () => {
  const [state, setState] = useState<DashboardState>(initialState);
  const [loading, setLoading] = useState(true);
  const [loadingTx, setLoadingTx] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCore();
  }, []);

  async function loadCore() {
    try {
      setLoading(true);
      setError(null);

      const multisig = getTreasuryMultisigContract();

      const [requiredBn, ownersCountBn] = await Promise.all([
        multisig.required(),
        multisig.getOwnersCount(),
      ]);

      const owners: string[] = [];
      const ownersCount = Number(ownersCountBn);
      for (let i = 0; i < ownersCount; i++) {
        const ownerAddr = await multisig.owners(i);
        owners.push(ownerAddr);
      }

      const treasuryAddress = await multisig.getAddress();

      const [ethBalanceBn, jertToken] = await Promise.all([
        provider.getBalance(treasuryAddress),
        Promise.resolve(getJERTTokenContract()),
      ]);

      const jertBalanceBn = await jertToken.balanceOf(treasuryAddress);

      const required = Number(requiredBn);
      const ethBalance = ethers.formatEther(ethBalanceBn);
      const jertBalance = ethers.formatUnits(jertBalanceBn, 18);

      setState((prev) => ({
        ...prev,
        loaded: true,
        treasuryAddress,
        owners,
        required,
        ethBalance,
        jertBalance,
      }));

      setLoading(false);

      // после базовой инфы грузим транзакции
      await loadTransactions(multisig, required);
    } catch (e: any) {
      console.error("loadCore failed:", e);
      setError(e?.message || "Failed to load multisig state");
      setLoading(false);
      setLoadingTx(false);
    }
  }

  async function loadTransactions(multisig: any, required: number) {
    try {
      setLoadingTx(true);

      let txCountBn: bigint;
      try {
        txCountBn = await multisig.getTransactionCount();
      } catch {
        // если по какой-то причине функции нет — просто без истории
        setState((prev) => ({ ...prev, txHistory: [] }));
        setLoadingTx(false);
        return;
      }

      const txCount = Number(txCountBn);
      const limit = 50; // максимум 50 последних

      const items: TxHistoryItem[] = [];
      const start = Math.max(0, txCount - limit);

      for (let i = txCount - 1; i >= start; i--) {
        const raw = await multisig.transactions(i);

        // raw: [destination, value, data, executed, confirmations]
        const destination: string = raw[0];
        const value: bigint = raw[1];
        const data: string = raw[2];
        const executed: boolean = raw[3];
        const confirmations: bigint = raw[4];

        const valueEth = ethers.formatEther(value);

        items.push({
          id: i,
          direction: "OUT",
          to: destination,
          amountEth: valueEth,
          executed,
          confirmations: Number(confirmations),
          required,
        });
      }

      setState((prev) => ({
        ...prev,
        txHistory: items,
      }));
      setLoadingTx(false);
    } catch (e) {
      console.error("loadTransactions failed:", e);
      setLoadingTx(false);
    }
  }

  const { treasuryAddress, owners, required, ethBalance, jertBalance, txHistory } =
    state;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      {/* Header Card */}
      <div
        style={{
          padding: 18,
          borderRadius: 18,
          border: "1px solid rgba(96,165,250,0.35)",
          background:
            "radial-gradient(circle at top,#0b1120 0,#020617 45%,#020617 100%)",
          boxShadow:
            "0 0 35px rgba(37,99,235,0.16), 0 0 90px rgba(8,47,73,0.35)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 2, minWidth: 220 }}>
            <div
              style={{
                fontSize: 13,
                textTransform: "uppercase",
                letterSpacing: 1.4,
                color: "#93c5fd",
              }}
            >
              JERT Treasury Multisig
            </div>
            <div
              style={{
                fontSize: 11,
                opacity: 0.75,
                marginTop: 4,
              }}
            >
              Core on-chain treasury for Cryogas / JERT infrastructure.
            </div>

            <div
              style={{
                marginTop: 12,
                fontSize: 11,
                opacity: 0.8,
                fontFamily: "monospace",
                wordBreak: "break-all",
              }}
            >
              <span style={{ opacity: 0.7 }}>Address:&nbsp;</span>
              {treasuryAddress || (loading ? "loading…" : "n/a")}
            </div>
          </div>

          {/* KPI блоки */}
          <div
            style={{
              display: "flex",
              flex: 3,
              minWidth: 260,
              gap: 12,
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            <KpiCard
              label="Signers / Required"
              value={
                loading
                  ? "…"
                  : `${owners.length || 0} / ${required || 0}`
              }
              hint="Multisig threshold"
            />
            <KpiCard
              label="ETH Balance"
              value={loading ? "…" : `${Number(ethBalance).toFixed(4)} ETH`}
              hint="On-chain treasury balance"
            />
            <KpiCard
              label="JERT Balance"
              value={
                loading
                  ? "…"
                  : `${Number(jertBalance).toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })} JERT`
              }
              hint="Utility token balance of treasury"
            />
          </div>
        </div>

        {/* Owners */}
        <div style={{ marginTop: 14 }}>
          <div
            style={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: 0.9,
              opacity: 0.7,
              marginBottom: 6,
            }}
          >
            Owners
          </div>
          {owners.length === 0 && !loading ? (
            <div style={{ fontSize: 11, opacity: 0.6 }}>No owners loaded.</div>
          ) : (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              {owners.map((owner) => (
                <div
                  key={owner}
                  style={{
                    padding: "4px 8px",
                    borderRadius: 999,
                    border: "1px solid rgba(148,163,184,0.45)",
                    background: "rgba(15,23,42,0.8)",
                    fontSize: 10,
                    fontFamily: "monospace",
                    maxWidth: 220,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={owner}
                >
                  {owner}
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div
            style={{
              marginTop: 10,
              fontSize: 11,
              color: "#fecaca",
            }}
          >
            Error: {error}
          </div>
        )}
      </div>

      {/* Таблица транзакций с индикаторами подписи */}
      <TransactionsTable
        history={txHistory}
        loading={loadingTx}
        compact={false}
      />
    </div>
  );
};

const KpiCard: React.FC<{
  label: string;
  value: string;
  hint?: string;
}> = ({ label, value, hint }) => {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 140,
        padding: 10,
        borderRadius: 14,
        border: "1px solid rgba(148,163,184,0.5)",
        background:
          "linear-gradient(135deg,rgba(15,23,42,0.96),rgba(30,64,175,0.35))",
      }}
    >
      <div
        style={{
          fontSize: 11,
          opacity: 0.75,
          textTransform: "uppercase",
          letterSpacing: 0.8,
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 16,
          fontWeight: 600,
        }}
      >
        {value}
      </div>
      {hint && (
        <div
          style={{
            fontSize: 10,
            opacity: 0.6,
            marginTop: 2,
          }}
        >
          {hint}
        </div>
      )}
    </div>
  );
};
