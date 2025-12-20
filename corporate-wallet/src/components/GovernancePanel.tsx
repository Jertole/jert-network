import React, { useMemo, useState } from "react";
import type { BrowserProvider } from "ethers";
import { Contract, parseEther } from "ethers";
import {
  TREASURY_MULTISIG_ABI,
  TREASURY_MULTISIG_ADDRESS,
} from "../config/treasuryMultisig";

type Props = {
  provider: BrowserProvider | null;
  connectedAddress: string | null;
  chainId: number | null;
};

function isHexData(v: string) {
  return /^0x([0-9a-fA-F]{2})*$/.test(v);
}

export function GovernancePanel({ provider, connectedAddress, chainId }: Props) {
  const [to, setTo] = useState<string>("");
  const [ethValue, setEthValue] = useState<string>("0");
  const [data, setData] = useState<string>("0x");

  const [txIndex, setTxIndex] = useState<string>("0");
  const [busy, setBusy] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("");

  const canUseWallet = !!provider && !!connectedAddress;
  const hasMultisigAddress = !!TREASURY_MULTISIG_ADDRESS;

  const contractRO = useMemo(() => {
    if (!provider) return null;
    if (!TREASURY_MULTISIG_ADDRESS) return null;
    return new Contract(TREASURY_MULTISIG_ADDRESS, TREASURY_MULTISIG_ABI, provider);
  }, [provider]);

  async function submit() {
    if (!provider) return;
    if (!TREASURY_MULTISIG_ADDRESS) {
      setStatus("❌ Multisig address is not set. Please set VITE_TREASURY_MULTISIG_ADDRESS.");
      return;
    }
    if (!to) {
      setStatus("❗ 'To' address is required.");
      return;
    }
    if (!isHexData(data)) {
      setStatus("❗ 'Data' must be valid hex starting with 0x (e.g. 0x).");
      return;
    }

    setBusy(true);
    setStatus("Submitting transaction...");
    try {
      const signer = await provider.getSigner();
      const withSigner = contractRO!.connect(signer);

      const valueWei = parseEther(ethValue || "0");

      // ABI confirms: submitTransaction(address to, uint256 value, bytes data)
      const tx = await withSigner.submitTransaction(to, valueWei, data);
      setStatus(`✅ Submit sent: ${tx.hash}`);
      await tx.wait();
      setStatus(`✅ Submit mined: ${tx.hash}`);
    } catch (e: any) {
      setStatus(`❌ Submit failed: ${e?.shortMessage || e?.message || String(e)}`);
    } finally {
      setBusy(false);
    }
  }

  async function confirm() {
    if (!provider) return;
    if (!TREASURY_MULTISIG_ADDRESS) {
      setStatus("❌ Multisig address is not set. Please set VITE_TREASURY_MULTISIG_ADDRESS.");
      return;
    }

    setBusy(true);
    setStatus("Confirming transaction...");
    try {
      const signer = await provider.getSigner();
      const withSigner = contractRO!.connect(signer);

      // ABI confirms: confirmTransaction(uint256 txIndex)
      const tx = await withSigner.confirmTransaction(BigInt(txIndex));
      setStatus(`✅ Confirm sent: ${tx.hash}`);
      await tx.wait();
      setStatus(`✅ Confirm mined: ${tx.hash}`);
    } catch (e: any) {
      setStatus(`❌ Confirm failed: ${e?.shortMessage || e?.message || String(e)}`);
    } finally {
      setBusy(false);
    }
  }

  async function execute() {
    if (!provider) return;
    if (!TREASURY_MULTISIG_ADDRESS) {
      setStatus("❌ Multisig address is not set. Please set VITE_TREASURY_MULTISIG_ADDRESS.");
      return;
    }

    setBusy(true);
    setStatus("Executing transaction...");
    try {
      const signer = await provider.getSigner();
      const withSigner = contractRO!.connect(signer);

      // Most multisigs have: executeTransaction(uint256 txIndex)
      // If your ABI uses another name, we will adjust immediately.
      const tx = await withSigner.executeTransaction(BigInt(txIndex));
      setStatus(`✅ Execute sent: ${tx.hash}`);
      await tx.wait();
      setStatus(`✅ Execute mined: ${tx.hash}`);
    } catch (e: any) {
      setStatus(`❌ Execute failed: ${e?.shortMessage || e?.message || String(e)}`);
    } finally {
      setBusy(false);
    }
  }

  // UI guards
  if (!canUseWallet) {
    return (
      <div
        style={{
          padding: 16,
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(255,255,255,0.02)",
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Governance</div>
        <div style={{ opacity: 0.8, fontSize: 13 }}>
          Connect your wallet to submit/confirm/execute multisig transactions.
        </div>
      </div>
    );
  }

  if (!hasMultisigAddress) {
    return (
      <div
        style={{
          padding: 16,
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(255,255,255,0.02)",
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Governance</div>
        <div style={{ opacity: 0.85, fontSize: 13 }}>
          Multisig address is not set. Please set <code>VITE_TREASURY_MULTISIG_ADDRESS</code> in
          your local environment.
        </div>
      </div>
    );
  }

  const wrongNetwork = chainId != null && chainId !== 11155111;

  return (
    <div
      style={{
        padding: 16,
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontWeight: 700 }}>Governance</div>
          <div style={{ opacity: 0.75, fontSize: 13 }}>
            submit / confirm / execute multisig transactions
          </div>
        </div>
        {wrongNetwork && (
          <div style={{ color: "tomato", fontSize: 12, opacity: 0.95 }}>
            Wrong network (chainId {chainId}). Switch to Sepolia.
          </div>
        )}
      </div>

      <div style={{ height: 12 }} />

      <div style={{ display: "grid", gap: 10 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 12, opacity: 0.8 }}>To (address)</span>
          <input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="0x..."
            style={{ padding: "8px 10px", borderRadius: 10 }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 12, opacity: 0.8 }}>ETH value</span>
          <input
            value={ethValue}
            onChange={(e) => setEthValue(e.target.value)}
            placeholder="0"
            style={{ padding: "8px 10px", borderRadius: 10 }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 12, opacity: 0.8 }}>Data (hex)</span>
          <input
            value={data}
            onChange={(e) => setData(e.target.value)}
            placeholder="0x"
            style={{ padding: "8px 10px", borderRadius: 10 }}
          />
        </label>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button disabled={busy || wrongNetwork} onClick={submit}>
            Submit
          </button>
        </div>

        <hr style={{ opacity: 0.2 }} />

        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 12, opacity: 0.8 }}>Tx index</span>
          <input
            value={txIndex}
            onChange={(e) => setTxIndex(e.target.value)}
            placeholder="0"
            style={{ padding: "8px 10px", borderRadius: 10 }}
          />
        </label>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button disabled={busy || wrongNetwork} onClick={confirm}>
            Confirm
          </button>
          <button disabled={busy || wrongNetwork} onClick={execute}>
            Execute
          </button>
        </div>

        {status && (
          <div style={{ marginTop: 8, fontSize: 13, opacity: 0.9, whiteSpace: "pre-wrap" }}>
            {status}
          </div>
        )}
      </div>
    </div>
  );
}
