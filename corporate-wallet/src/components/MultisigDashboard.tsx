
import React, { useEffect, useState } from "react";
import { BrowserProvider, Contract, formatEther, parseEther } from "ethers";
import {
  TREASURY_MULTISIG_ABI,
  TREASURY_MULTISIG_ADDRESS,
} from "../config/treasuryMultisig";
import { STRINGS } from "../i18n/en";

declare global {
  interface Window {
    ethereum?: any;
  }
}

type TxItem = {
  id: number;
  to: string;
  value: bigint;
  data: string;
  executed: boolean;
  numConfirmations: bigint;
};

const MultisigDashboard: React.FC = () => {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signerAddress, setSignerAddress] = useState<string | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);

  const [owners, setOwners] = useState<string[]>([]);
  const [numConfirmationsRequired, setNumConfirmationsRequired] =
    useState<number>(0);
  const [isOwner, setIsOwner] = useState<boolean>(false);

  const [transactions, setTransactions] = useState<TxItem[]>([]);
  const [loadingTxs, setLoadingTxs] = useState<boolean>(false);

  const [newTxTo, setNewTxTo] = useState<string>("");
  const [newTxValue, setNewTxValue] = useState<string>("0");
  const [newTxData, setNewTxData] = useState<string>("0x");
  const [txSubmitting, setTxSubmitting] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setError(STRINGS.errors.metamaskNotFound);
        return;
      }

      const _provider = new BrowserProvider(window.ethereum);
      await _provider.send("eth_requestAccounts", []);
      const signer = await _provider.getSigner();
      const addr = await signer.getAddress();

      const _contract = new Contract(
        TREASURY_MULTISIG_ADDRESS,
        TREASURY_MULTISIG_ABI,
        signer
      );

      setProvider(_provider);
      setSignerAddress(addr);
      setContract(_contract);
      setError(null);
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? STRINGS.errors.walletConnectionError);
    }
  };

  const loadMultisigState = async (_contract?: Contract) => {
    try {
      const c = _contract ?? contract;
      if (!c) return;

      const onChainOwners: string[] = await c.getOwners();
      setOwners(onChainOwners);

      const required: bigint = await c.numConfirmationsRequired();
      setNumConfirmationsRequired(Number(required));

      if (signerAddress) {
        setIsOwner(
          onChainOwners
            .map((o) => o.toLowerCase())
            .includes(signerAddress.toLowerCase())
        );
      }

      setLoadingTxs(true);
      const txCountBig: bigint = await c.getTransactionCount();
      const txCount = Number(txCountBig);

      const txs: TxItem[] = [];
      for (let i = 0; i < txCount; i++) {
        const [to, value, data, executed, numConfirmations] =
          await c.getTransaction(i);
        txs.push({
          id: i,
          to,
          value,
          data,
          executed,
          numConfirmations,
        });
      }
      setTransactions(txs);
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? STRINGS.errors.failedToLoadMultisig);
    } finally {
      setLoadingTxs(false);
    }
  };

  useEffect(() => {
    if (!window.ethereum) {
      setError(STRINGS.errors.metamaskNotFound);
    }
  }, []);

  useEffect(() => {
    if (contract) {
      loadMultisigState(contract);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract, signerAddress]);

  const handleSubmitTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!contract || !signerAddress) {
      setError(STRINGS.errors.connectWalletFirst);
      return;
    }

    if (!isOwner) {
      setError(STRINGS.errors.onlyOwnerCanCreateTx);
      return;
    }

    try {
      setTxSubmitting(true);
      const valueWei =
        newTxValue.trim().length > 0
          ? parseEther(newTxValue)
          : parseEther("0");

      const dataBytes = newTxData && newTxData !== "" ? newTxData : "0x";

      const tx = await contract.submitTransaction(newTxTo, valueWei, dataBytes);
      await tx.wait();

      setNewTxTo("");
      setNewTxValue("0");
      setNewTxData("0x");

      await loadMultisigState();
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? STRINGS.errors.createTxFailed);
    } finally {
      setTxSubmitting(false);
    }
  };

  const handleConfirmTransaction = async (txId: number) => {
    if (!contract || !signerAddress) {
      setError(STRINGS.errors.connectWalletFirst);
      return;
    }
    try {
      setError(null);
      const tx = await contract.confirmTransaction(txId);
      await tx.wait();
      await loadMultisigState();
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? STRINGS.errors.confirmTxFailed);
    }
  };

  const handleExecuteTransaction = async (txId: number) => {
    if (!contract || !signerAddress) {
      setError(STRINGS.errors.connectWalletFirst);
      return;
    }
    try {
      setError(null);
      const tx = await contract.executeTransaction(txId);
      await tx.wait();
      await loadMultisigState();
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? STRINGS.errors.executeTxFailed);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex justify-center p-4">
      <div className="w-full max-w-5xl space-y-6">
        <header className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {STRINGS.multisig.title}
            </h1>
            <p className="text-sm text-slate-400">{STRINGS.multisig.subtitle}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {signerAddress ? (
              <>
                <span className="text-xs text-slate-400">
                  {STRINGS.multisig.connected}:{" "}
                  <span className="font-mono">
                    {signerAddress.slice(0, 6)}...{signerAddress.slice(-4)}
                  </span>
                </span>
                <button
                  className="px-3 py-1 text-xs rounded-full border border-emerald-500/60 text-emerald-300"
                  onClick={() => loadMultisigState()}
                >
                  {STRINGS.multisig.refreshState}
                </button>
              </>
            ) : (
              <button
                onClick={connectWallet}
                className="px-4 py-2 rounded-xl bg-emerald-500/90 hover:bg-emerald-400 text-slate-900 text-sm font-semibold shadow-lg shadow-emerald-500/30"
              >
                {STRINGS.multisig.connectMetaMask}
              </button>
            )}
          </div>
        </header>

        {error && (
          <div className="rounded-xl border border-red-600/60 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
            <h2 className="text-sm font-semibold text-slate-300 mb-2">
              {STRINGS.multisig.owners}
            </h2>
            <div className="space-y-1">
              {owners.length === 0 && (
                <p className="text-xs text-slate-500">
                  {STRINGS.multisig.notLoadedYet}
                </p>
              )}
              {owners.map((o) => (
                <div
                  key={o}
                  className={`flex items-center justify-between text-xs rounded-lg px-2 py-1 ${
                    signerAddress && o.toLowerCase() === signerAddress.toLowerCase()
                      ? "bg-emerald-500/15 text-emerald-200"
                      : "bg-slate-800/60 text-slate-200"
                  }`}
                >
                  <span className="font-mono">
                    {o.slice(0, 6)}...{o.slice(-4)}
                  </span>
                  {signerAddress &&
                    o.toLowerCase() === signerAddress.toLowerCase() && (
                      <span className="text-[10px] uppercase tracking-wide">
                        {STRINGS.multisig.you}
                      </span>
                    )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
            <h2 className="text-sm font-semibold text-slate-300 mb-2">
              {STRINGS.multisig.confirmationPolicy}
            </h2>
            <p className="text-4xl font-bold">
              {numConfirmationsRequired || "-"}
              <span className="text-base text-slate-400 ml-1">
                / {owners.length || "-"}
              </span>
            </p>
            <p className="mt-2 text-xs text-slate-400">
              {STRINGS.multisig.confirmationsNote}
            </p>
            <p className="mt-1 text-xs">
              {STRINGS.multisig.youLabel}:{" "}
              <span
                className={
                  isOwner ? "text-emerald-400 font-semibold" : "text-slate-400"
                }
              >
                {isOwner ? STRINGS.multisig.youAreOwner : STRINGS.multisig.youAreNotOwner}
              </span>
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
            <h2 className="text-sm font-semibold text-slate-300 mb-2">
              {STRINGS.multisig.contract}
            </h2>
            <p className="text-xs text-slate-400 break-all font-mono">
              {TREASURY_MULTISIG_ADDRESS}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {STRINGS.multisig.contractAddressNote}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200">
              {STRINGS.multisig.createTransaction}
            </h2>
          </div>

          <form
            className="grid gap-3 md:grid-cols-3"
            onSubmit={handleSubmitTransaction}
          >
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">
                {STRINGS.multisig.recipientAddress}
              </label>
              <input
                type="text"
                value={newTxTo}
                onChange={(e) => setNewTxTo(e.target.value)}
                placeholder="0x..."
                className="rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs font-mono outline-none focus:border-emerald-400"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">
                {STRINGS.multisig.amountEth}
              </label>
              <input
                type="number"
                min="0"
                step="0.0001"
                value={newTxValue}
                onChange={(e) => setNewTxValue(e.target.value)}
                className="rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs outline-none focus:border-emerald-400"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">
                {STRINGS.multisig.dataOptional}
              </label>
              <input
                type="text"
                value={newTxData}
                onChange={(e) => setNewTxData(e.target.value)}
                className="rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs font-mono outline-none focus:border-emerald-400"
              />
            </div>

            <div className="md:col-span-3 flex justify-end">
              <button
                type="submit"
                disabled={!isOwner || txSubmitting}
                className="px-4 py-2 rounded-xl bg-emerald-500/90 hover:bg-emerald-400 text-slate-900 text-sm font-semibold shadow-lg shadow-emerald-500/30 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {txSubmitting ? STRINGS.multisig.creating : STRINGS.multisig.createTransactionButton}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200">
              {STRINGS.multisig.transactions}
            </h2>
            {loadingTxs && (
              <span className="text-xs text-slate-400">{STRINGS.multisig.loading}</span>
            )}
          </div>

          {transactions.length === 0 ? (
            <p className="text-xs text-slate-500">
              {STRINGS.multisig.noTransactions}
            </p>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => {
                const confirmations = Number(tx.numConfirmations);
                const executed = tx.executed;
                const canExecute =
                  confirmations >= numConfirmationsRequired && !executed;

                return (
                  <div
                    key={tx.id}
                    className="rounded-xl border border-slate-700 bg-slate-950/70 p-3 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">
                        Tx #{tx.id}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide ${
                          executed
                            ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40"
                            : canExecute
                            ? "bg-yellow-500/15 text-yellow-300 border border-yellow-500/40"
                            : "bg-slate-800 text-slate-300 border border-slate-600"
                        }`}
                      >
                        {executed
                          ? STRINGS.multisig.statusExecuted
                          : canExecute
                          ? STRINGS.multisig.statusReady
                          : STRINGS.multisig.statusPending}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-3 gap-1">
                      <div>
                        <span className="text-slate-500">To: </span>
                        <span className="font-mono break-all">{tx.to}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Value: </span>
                        <span>
                          {tx.value === 0n ? "0" : formatEther(tx.value)} ETH
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Confirmations: </span>
                        <span>
                          {confirmations}/{numConfirmationsRequired}
                        </span>
                      </div>
                    </div>

                    {tx.data && tx.data !== "0x" && (
                      <div className="mt-1">
                        <span className="text-slate-500">Data: </span>
                        <span className="font-mono break-all">{tx.data}</span>
                      </div>
                    )}

                    <div className="mt-2 flex gap-2">
                      <button
                        className="px-3 py-1 rounded-lg border border-slate-600 text-slate-200 hover:border-emerald-400 hover:text-emerald-300 disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={!isOwner || executed}
                        onClick={() => handleConfirmTransaction(tx.id)}
                      >
                        Confirm
                      </button>
                      <button
                        className="px-3 py-1 rounded-lg border border-emerald-500/70 text-emerald-200 hover:bg-emerald-500/10 disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={!isOwner || !canExecute}
                        onClick={() => handleExecuteTransaction(tx.id)}
                      >
                        Execute
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default MultisigDashboard;


