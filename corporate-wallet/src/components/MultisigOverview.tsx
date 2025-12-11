import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getDefaultNetwork, DEFAULT_NETWORK_KEY } from "../config/networks";
import { getJsonRpcProvider } from "../lib/provider";
import { getMultisigAddress } from "../config/multisig";
import TreasuryMultisigABI from "../abi/TreasuryMultisig.json";

export const MultisigOverview: React.FC = () => {
  const [owners, setOwners] = useState<string[]>([]);
  const [required, setRequired] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const network = getDefaultNetwork();
  const multisigAddress = getMultisigAddress(DEFAULT_NETWORK_KEY);

  useEffect(() => {
    const load = async () => {
      if (!multisigAddress) {
        setError("Multisig address not configured.");
        setLoading(false);
        return;
      }
      try {
        const provider = getJsonRpcProvider();
        const contract = new ethers.Contract(
          multisigAddress,
          TreasuryMultisigABI,
          provider
        );

        // ПОДГОНИ под свои методы, если они называются иначе
        const [rawOwners, rawRequired] = await Promise.all([
          contract.getOwners(),
          contract.numConfirmationsRequired(),
        ]);

        setOwners(rawOwners as string[]);
        setRequired(Number(rawRequired));
        setLoading(false);
      } catch (e: any) {
        console.error("[JERT] multisig load error:", e);
        setError(e?.message ?? "Failed to load multisig info");
        setLoading(false);
      }
    };

    load();
  }, [multisigAddress]);

  return (
    <div
      style={{
        borderRadius: 16,
        padding: 16,
        border: "1px solid #222",
        background: "#05050a",
        color: "#f5f5f5",
        maxWidth: 480,
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: 8 }}>Treasury Multisig</h2>
      <p style={{ fontSize: 12, opacity: 0.7, marginTop: 0 }}>
        Network: <strong>{network.label}</strong>
      </p>
      <p style={{ fontSize: 12, marginTop: 4 }}>
        Address:{" "}
        {multisigAddress ? (
          <span style={{ fontFamily: "monospace" }}>{multisigAddress}</span>
        ) : (
          <span style={{ color: "#ff6b6b" }}>not configured</span>
        )}
      </p>

      {loading && <p style={{ fontSize: 12 }}>Loading...</p>}

      {!loading && error && (
        <p style={{ color: "#ff6b6b", fontSize: 12 }}>{error}</p>
      )}

      {!loading && !error && (
        <>
          <p style={{ fontSize: 12, marginTop: 8 }}>
            Required confirmations:{" "}
            <strong>{required !== null ? required : "-"}</strong>
          </p>
          <p style={{ fontSize: 12, marginTop: 8, marginBottom: 4 }}>
            Owners:
          </p>
          <ul style={{ paddingLeft: 18, marginTop: 0 }}>
            {owners.map((o) => (
              <li
                key={o}
                style={{
                  fontSize: 12,
                  fontFamily: "monospace",
                  marginBottom: 2,
                }}
              >
                {o}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};
