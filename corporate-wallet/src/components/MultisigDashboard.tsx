

import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getTreasuryMultisigContract } from "../services/jertContracts";

type MultisigTx = {
  id: bigint;
  to: string;
  valueEth: string;
  data: string;
  executed: boolean;
  numConfirmations: number;
};

type MultisigDashboardProps = {
  className?: string;
};

const MultisigDashboard: React.FC<MultisigDashboardProps> = ({ className }) => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string | null>(null);

  const [owners, setOwners] = useState<string[]>([]);
  const [threshold, setThreshold] = useState<number>(0);

  const [transactions, setTransactions] = useState<MultisigTx[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // form state
  const [to, setTo] = useState<string>("");
  const [valueEth, setValueEth] = useState<string>("0");
  const [data, setData] = useState<string>("0x");

  const isOwner = account
    ? owners.map((o) => o.toLowerCase()).includes(account.toLowerCase())
    : false;

  // init provider + signer
  useEffect(() => {
    const init = async () => {
      if (typeof window === "undefined" || !(window as any).ethereum) {
        setError("No EVM provider found. Please install MetaMask.");
        return;
      }
      try {
        const browserProvider = new ethers.BrowserProvider(
          (window as any).ethereum
        );
        setProvider(browserProvider);

        const accounts = await (window as any).ethereum.request({
          method: "eth_requestAccounts",
        });
        const acc = accounts[0] as string;
        setAccount(acc);

        const signer = await browserProvider.getSigner();
        setSigner(signer);
      } catch (e: any) {
        console.error(e);
        setError("Failed to connect wallet");
      }
    };

    void init();
  }, []);

  // load multisig summary + tx list
  useEffect(() => {
    const loadMultisigState = async () => {
      if (!signer) return;
      setLoading(true);
      setError(null);
      try {
        const multisig = getTreasuryMultisigContract(signer);

        const [ownersFromChain, thresholdFromChain] = await Promise.all([
          multisig.getOwners(),
          multisig.getThreshold(),
        ]);

        setOwners(ownersFromChain);
        setThreshold(Number(thresholdFromChain));

        let txCount: bigint;
        try {
          txCount = await multisig.getTransactionCount();
        } catch {
          txCount = 0n;
        }

        const txs: MultisigTx[] = [];
        for (let i = 0n; i < txCount; i++) {
          const tx = await multisig.getTransaction(i);
          txs.push({
            id: i,
            to: tx.to,
            valueEth: ethers.formatEther(tx.value),
            data: tx.data,
            executed: tx.executed,
            numConfirmations: Number(tx.numConfirmations),
          });
        }

        setTransactions(txs);
      } catch (e: any) {
        console.error(e);
        setError("Failed to load multisig data");
      } finally {
        setLoading(false);
      }
    };

    void loadMultisigState();
  }, [signer]);

  const refreshTransactions = async () => {
    if (!signer) return;
    try {
      const multisig = getTreasuryMultisigContract(signer);
      let txCount: bigint = 0n;
      try {
        txCount = await multisig.getTransactionCount();
      } catch {
        txCount = 0n;
      }

      const txs: MultisigTx[] = [];
      for (let i = 0n; i < txCount; i++) {
        const tx = await multisig.getTransaction(i);
        txs.push({
          id: i,
          to: tx.to,
          valueEth: ethers.formatEther(tx.value),
          data: tx.data,
          executed: tx.executed,
          numConfirmations: Number(tx.numConfirmations),
        });
      }

      setTransactions(txs);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signer) return;
    setStatusMessage(null);
    setError(null);

    try {
      const multisig = getTreasuryMultisigContract(signer);

      if (!ethers.isAddress(to)) {
        setError("Invalid 'to' address");
        return;
      }

      const valueWei = ethers.parseEther(valueEth || "0");
      const txData = data === "" ? "0x" : data;

      const tx = await multisig.submitTransaction(to, valueWei, txData);
      await tx.wait();

      setStatusMessage("Transaction proposal submitted");
      setTo("");
      setValueEth("0");
      setData("0x");

      await refreshTransactions();
    } catch (e: any) {
      console.error(e);
      setError(e?.reason || "Failed to submit transaction");
    }
  };

  const handleConfirm = async (id: bigint) => {
    if (!signer) return;
    setStatusMessage(null);
    setError(null);
    try {
      const multisig = getTreasuryMultisigContract(signer);
      const tx = await multisig.confirmTransaction(id);
      await tx.wait();
      setStatusMessage(`Transaction #${id.toString()} confirmed`);
      await refreshTransactions();
    } catch (e: any) {
      console.error(e);
      setError(e?.reason || "Failed to confirm transaction");
    }
  };

  const handleRevoke = async (id: bigint) => {
    if (!signer) return;
    setStatusMessage(null);
    setError(null);
    try {
      const multisig = getTreasuryMultisigContract(signer);
      const tx = await multisig.revokeConfirmation(id);
      await tx.wait();
      setStatusMessage(`Confirmation revoked for TX #${id.toString()}`);
      await refreshTransactions();
    } catch (e: any) {
      console.error(e);
      setError(e?.reason || "Failed to revoke confirmation");
    }
  };

  const handleExecute = async (id: bigint) => {
    if (!signer) return;
    setStatusMessage(null);
    setError(null);
    try {
      const multisig = getTreasuryMultisigContract(signer);
      const tx = await multisig.executeTransaction(id);
      await tx.wait();
      setStatusMessage(`Transaction #${id.toString()} executed`);
      await refreshTransactions();
    } catch (e: any) {
      console.error(e);
      setError(e?.reason || "Failed to execute transaction");
    }
  };

  const pendingTxs = transactions.filter((t) => !t.executed);
  const executedTxs = transactions.filter((t) => t.executed);

  // ---------- helpers for visual status ----------
  const getTxStatus = (tx: MultisigTx) => {
    if (tx.executed) {
      return { label: "EXECUTED", color: "#4caf50" };
    }
    if (threshold > 0 && tx.numConfirmations >= threshold) {
      return { label: `READY ${tx.numConfirmations}/${threshold}`, color: "#00e676" };
    }
    return {
      label: `PENDING ${tx.numConfirmations}/${threshold || "?"}`,
      color: "#ffb300",
    };
  };

  const getProgressBarWidth = (tx: MultisigTx) => {
    if (!threshold || threshold <= 0) return "0%";
    const ratio = Math.min(tx.numConfirmations / threshold, 1);
    return `${(ratio * 100).toFixed(0)}%`;
  };

  const totalPending = pendingTxs.length;
  const totalReady =
    threshold > 0
      ? pendingTxs.filter((t) => t.numConfirmations >= threshold).length
      : 0;
  const totalExecuted = executedTxs.length;

  return (
    <div className={className ?? ""} style={{ padding: "16px" }}>
      <h2>Multisig Treasury Dashboard</h2>

      {account && (
        <p>
          Connected wallet: <b>{account}</b>{" "}
          {isOwner ? (
            <span style={{ color: "green" }}>(multisig owner)</span>
          ) : (
            <span style={{ color: "red" }}>(not an owner)</span>
          )}
        </p>
      )}

      {owners.length > 0 && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #00a3e8",
          }}
        >
          <h3>Owners & Threshold</h3>
          <p>
            Threshold: <b>{threshold}</b> of {owners.length}
          </p>
          <ul>
            {owners.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Summary indicators */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "16px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            background: "#101622",
            border: "1px solid #00a3e8",
            minWidth: "140px",
          }}
        >
          <div style={{ fontSize: "12px", color: "#9fc5ff" }}>Pending</div>
          <div style={{ fontSize: "18px", color: "#ffffff" }}>{totalPending}</div>
        </div>
        <div
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            background: "#10251b",
            border: "1px solid #00e676",
            minWidth: "140px",
          }}
        >
          <div style={{ fontSize: "12px", color: "#a5ffce" }}>Ready (>= threshold)</div>
          <div style={{ fontSize: "18px", color: "#ffffff" }}>{totalReady}</div>
        </div>
        <div
          style={{
            padding: "8px 12px",
            borderRadius: "8px",
            background: "#1b1010",
            border: "1px solid #ef5350",
            minWidth: "140px",
          }}
        >
          <div style={{ fontSize: "12px", color: "#ffcdd2" }}>Executed</div>
          <div style={{ fontSize: "18px", color: "#ffffff" }}>{totalExecuted}</div>
        </div>
      </div>

      {error && (
        <div style={{ color: "red", marginBottom: "8px" }}>{error}</div>
      )}
      {statusMessage && (
        <div style={{ color: "green", marginBottom: "8px" }}>
          {statusMessage}
        </div>
      )}
      {loading && <div>Loading multisig data…</div>}

      {/* New Transaction Form */}
      <div
        style={{
          marginTop: "16px",
          marginBottom: "24px",
          padding: "16px",
          borderRadius: "8px",
          border: "1px solid #444",
          background: "#0b1020",
          color: "#e5f5ff",
        }}
      >
        <h3>Submit New Transaction</h3>
        {!isOwner && (
          <p style={{ color: "#ffb347" }}>
            Only multisig owners can submit transactions.
          </p>
        )}
        <form onSubmit={handleSubmitTx}>
          <div style={{ marginBottom: "8px" }}>
            <label>
              To address:
              <input
                type="text"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                style={{ width: "100%", padding: "6px", marginTop: "4px" }}
                placeholder="0x..."
              />
            </label>
          </div>
          <div style={{ marginBottom: "8px" }}>
            <label>
              Value (ETH):
              <input
                type="number"
                step="0.0001"
                min="0"
                value={valueEth}
                onChange={(e) => setValueEth(e.target.value)}
                style={{ width: "100%", padding: "6px", marginTop: "4px" }}
              />
            </label>
          </div>
          <div style={{ marginBottom: "8px" }}>
            <label>
              Data (hex, optional):
              <input
                type="text"
                value={data}
                onChange={(e) => setData(e.target.value)}
                style={{ width: "100%", padding: "6px", marginTop: "4px" }}
                placeholder="0x"
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={!isOwner}
            style={{
              marginTop: "8px",
              padding: "8px 16px",
              borderRadius: "6px",
              border: "none",
              background: isOwner ? "#00a3e8" : "#555",
              color: "#fff",
              cursor: isOwner ? "pointer" : "not-allowed",
            }}
          >
            Submit Proposal
          </button>
        </form>
      </div>

      {/* Pending transactions */}
      <div style={{ marginBottom: "24px" }}>
        <h3>Pending Transactions</h3>
        {pendingTxs.length === 0 && <p>No pending transactions</p>}
        {pendingTxs.length > 0 && (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "14px",
            }}
          >
            <thead>
              <tr>
                <th style={{ borderBottom: "1px solid #444", padding: "4px" }}>
                  #
                </th>
                <th style={{ borderBottom: "1px solid #444", padding: "4px" }}>
                  To
                </th>
                <th style={{ borderBottom: "1px solid #444", padding: "4px" }}>
                  Value (ETH)
                </th>
                <th style={{ borderBottom: "1px solid #444", padding: "4px" }}>
                  Confirmations
                </th>
                <th style={{ borderBottom: "1px solid #444", padding: "4px" }}>
                  Status
                </th>
                <th style={{ borderBottom: "1px solid #444", padding: "4px" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {pendingTxs.map((tx) => {
                const status = getTxStatus(tx);
                const barWidth = getProgressBarWidth(tx);
                return (
                  <tr key={tx.id.toString()}>
                    <td style={{ borderBottom: "1px solid #333", padding: "4px" }}>
                      {tx.id.toString()}
                    </td>
                    <td style={{ borderBottom: "1px solid #333", padding: "4px" }}>
                      {tx.to}
                    </td>
                    <td style={{ borderBottom: "1px solid #333", padding: "4px" }}>
                      {tx.valueEth}
                    </td>
                    <td style={{ borderBottom: "1px solid #333", padding: "4px" }}>
                      {tx.numConfirmations}/{threshold || "?"}
                      <div
                        style={{
                          marginTop: "4px",
                          height: "6px",
                          width: "100%",
                          background: "#222",
                          borderRadius: "3px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: barWidth,
                            height: "100%",
                            background:
                              status.label.startsWith("READY") || status.label === "EXECUTED"
                                ? "#00e676"
                                : "#ffb300",
                            transition: "width 0.2s ease-out",
                          }}
                        />
                      </div>
                    </td>
                    <td style={{ borderBottom: "1px solid #333", padding: "4px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          fontSize: "11px",
                          background: "#111",
                          color: status.color,
                          border: `1px solid ${status.color}`,
                        }}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td
                      style={{
                        borderBottom: "1px solid #333",
                        padding: "4px",
                        display: "flex",
                        gap: "6px",
                      }}
                    >
                      <button
                        onClick={() => handleConfirm(tx.id)}
                        disabled={!isOwner}
                        style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          border: "none",
                          background: "#00a3e8",
                          color: "#fff",
                          cursor: isOwner ? "pointer" : "not-allowed",
                        }}
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => handleRevoke(tx.id)}
                        disabled={!isOwner}
                        style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          border: "none",
                          background: "#ff9800",
                          color: "#fff",
                          cursor: isOwner ? "pointer" : "not-allowed",
                        }}
                      >
                        Revoke
                      </button>
                      <button
                        onClick={() => handleExecute(tx.id)}
                        disabled={!isOwner || tx.numConfirmations < threshold}
                        style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          border: "none",
                          background:
                            isOwner && tx.numConfirmations >= threshold
                              ? "#4caf50"
                              : "#555",
                          color: "#fff",
                          cursor:
                            isOwner && tx.numConfirmations >= threshold
                              ? "pointer"
                              : "not-allowed",
                        }}
                      >
                        Execute
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Executed transactions */}
      <div>
        <h3>Executed Transactions</h3>
        {executedTxs.length === 0 && <p>No executed transactions yet</p>}
        {executedTxs.length > 0 && (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "14px",
            }}
          >
            <thead>
              <tr>
                <th style={{ borderBottom: "1px solid #444", padding: "4px" }}>
                  #
                </th>
                <th style={{ borderBottom: "1px solid #444", padding: "4px" }}>
                  To
                </th>
                <th style={{ borderBottom: "1px solid #444", padding: "4px" }}>
                  Value (ETH)
                </th>
                <th style={{ borderBottom: "1px solid #444", padding: "4px" }}>
                  Confirmations
                </th>
              </tr>
            </thead>
            <tbody>
              {executedTxs.map((tx) => (
                <tr key={tx.id.toString()}>
                  <td style={{ borderBottom: "1px solid #333", padding: "4px" }}>
                    {tx.id.toString()}
                  </td>
                  <td style={{ borderBottom: "1px solid #333", padding: "4px" }}>
                    {tx.to}
                  </td>
                  <td style={{ borderBottom: "1px solid #333", padding: "4px" }}>
                    {tx.valueEth}
                  </td>
                  <td style={{ borderBottom: "1px solid #333", padding: "4px" }}>
                    {tx.numConfirmations}/{threshold || "?"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MultisigDashboard;
