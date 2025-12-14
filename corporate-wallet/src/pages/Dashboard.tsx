import React from "react";
import { useEffect, useState } from "react";
import { JertBalance } from "../components/JertBalance";
import { SendJert } from "../components/SendJert";
import { MultisigOverview } from "../components/MultisigOverview";

type ContractsJson = {
  network?: string;
  chainId?: number;
  updated?: string;
  contracts?: {
    TreasuryMultisig?: { address?: string; notes?: string };
    JERTToken?: { address?: string };
    KYCRegistry?: { address?: string };
    ComplianceGateway?: { address?: string };
  };
  multisig?: {
    owners?: string[];
    threshold?: number;
    notes?: string;
  };
};

export const Dashboard: React.FC = () => {
  const [contractsInfo, setContractsInfo] = useState<ContractsJson | null>(null);
  const [contractsError, setContractsError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/contract-addresses.json", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as ContractsJson;
        setContractsInfo(json);
        setContractsError(null);
      } catch (e: any) {
        setContractsError(e?.message ?? "Failed to load contract-addresses.json");
        setContractsInfo(null);
      }
    })();
  }, []);

  return (
    <div
      id="dashboard-root"
      style={{
        minHeight: "100vh",
        padding: "24px 16px 40px",
        background: "#020308",
        color: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      {/* HEADER */}
      <header
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          marginBottom: 8,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: 0.5,
              }}
            >
              JERT Corporate Wallet
            </h1>

            <p
              style={{
                margin: "6px 0 0",
                fontSize: 13,
                opacity: 0.7,
              }}
            >
              Treasury balance, token transfers and multisig overview.
            </p>
          </div>

          <div
            style={{
              padding: "8px 14px",
              borderRadius: 999,
              border: "1px solid #222",
              background:
                "linear-gradient(90deg, rgba(0,229,255,0.12), rgba(0,255,157,0.12), rgba(176,0,255,0.14))",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: 1,
              whiteSpace: "nowrap",
            }}
          >
            Building the Green Cold Energy Network across Eurasia
          </div>
        </div>
      </header>

      {/* TREASURY MULTISIG (A9) */}
      <div
        style={{
          padding: 16,
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(255,255,255,0.02)",
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 8 }}>
          Treasury Multisig (2-of-3)
        </div>

        {contractsError && <div>Error: {contractsError}</div>}
        {!contractsError && !contractsInfo && <div>Loading…</div>}

        {contractsInfo && (
          <div style={{ display: "grid", gap: 8 }}>
            <div>
              <b>Network:</b> {contractsInfo.network ?? "n/a"}{" "}
              {contractsInfo.chainId ? `(chainId ${contractsInfo.chainId})` : ""}
            </div>

            <div>
              <b>Treasury:</b>{" "}
              <code>{contractsInfo.contracts?.TreasuryMultisig?.address || "n/a"}</code>
            </div>

            <div>
              <b>Threshold:</b>{" "}
              {contractsInfo.multisig?.threshold ?? "n/a"} / 3
            </div>

            {contractsInfo.multisig?.owners?.map((a, i) => (
              <div key={i}>
                <b>Owner {i + 1}:</b> <code>{a || "(empty)"}</code>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MAIN GRID */}
      <main
        style={{
          display: "grid",
          gap: 24,
          gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1.2fr)",
        }}
      >
        {/* LEFT SIDE */}
        <section
          aria-label="Balance and transfer section"
          style={{
            display: "grid",
            gap: 20,
          }}
        >
          <div>
            <h2
              style={{
                margin: "0 0 10px",
                fontSize: 16,
                fontWeight: 600,
                opacity: 0.9,
              }}
            >
              Treasury & Token Balance
            </h2>
            <JertBalance />
          </div>

          <div>
            <h2
              style={{
                margin: "0 0 10px",
                fontSize: 16,
                fontWeight: 600,
                opacity: 0.9,
              }}
            >
              Send JERT
            </h2>
            <SendJert />
          </div>
        </section>

        {/* RIGHT SIDE */}
        <section
          aria-label="Multisig overview"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <h2
            style={{
              margin: "0 0 10px",
              fontSize: 16,
              fontWeight: 600,
              opacity: 0.9,
            }}
          >
            Treasury Multisig Status
          </h2>
          <MultisigOverview />
        </section>
      </main>
    </div>
  );
};

export default Dashboard;

