
import React, { useEffect, useState } from "react";
import { BrowserProvider, Contract, formatEther, parseEther } from "ethers";
import {
  TREASURY_MULTISIG_ABI,
  TREASURY_MULTISIG_ADDRESS,
} from "../constants/treasuryMultisig";

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

  // Подключение к MetaMask
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setError("MetaMask не найден. Установи расширение браузера.");
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
      setError(e.message ?? "Ошибка подключения к кошельку");
    }
  };

  // Загрузка базовой инфы (owners, required, tx list)
  const loadMultisigState = async (_contract?: Contract) => {
    try {
      const c = _contract ?? contract;
      if (!c) return;

      // owners
      const onChainOwners: string[] = await c.getOwners();
      setOwners(onChainOwners);

      const required: bigint = await c.numConfirmationsRequired();
      setNumConfirmationsRequired(Number(required));

      if (signerAddress) {
        setIsOwner(
          onChainOwners.map((o) => o.toLowerCase()).includes(
            signerAddress.toLowerCase()
          )
        );
      }

      // transactions
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
      setError(e.message ?? "Ошибка загрузки данных мультисиг кошелька");
    } finally {
      setLoadingTxs(false);
    }
  };

  // Первый рендер: если MetaMask есть — не коннектимся автоматически, даём кнопку
  useEffect(() => {
    if (!window.ethereum) {
      setError("MetaMask не найден. Установи расширение браузера.");
    }
  }, []);

  // Когда меняется контракт или адрес — перезагружаем состояние
  useEffect(() => {
    if (contract) {
      loadMultisigState(contract);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract, signerAddress]);

  // Сабмит новой транзакции
  const handleSubmitTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!contract || !signerAddress) {
      setError("Сначала подключи кошелёк");
      return;
    }

    if (!isOwner) {
      setError("Только владелец multisig может создавать транзакции");
      return;
    }

    try {
      setTxSubmitting(true);
      const valueWei =
        newTxValue.trim().length > 0
          ? parseEther(newTxValue)
          : parseEther("0");

      const dataBytes =
        newTxData && newTxData !== ""
          ? newTxData
          : "0x";

      const tx = await contract.submitTransaction(newTxTo, valueWei, dataBytes);
      await tx.wait();

      // Очистить форму
      setNewTxTo("");
      setNewTxValue("0");
      setNewTxData("0x");

      // Перезагрузить состояние
      await loadMultisigState();
    } catch (e: any) {
      console.error(e);
      setError(e.message ?? "Ошибка при создании транзакции");
    } finally {
      setTxSubmitting(false);
    }
  };

  const handleConfirmTransaction = async (txId: number) => {
    if (!contract || !signerAddress) {
      setError("Сначала подключи кошелёк");
      return;
    }
    try {
      setError(null);
      const tx = await contract.confirmTransaction(txId);
      await tx.wait();
      await loadMultisigState();
    } catch (e: any) {
      console.error(e);
      setError(e.message ?? "Ошибка при подтверждении транзакции");
    }
  };

  const handleExecuteTransaction = async (txId: number) => {
    if (!contract || !signerAddress) {
      setError("Сначала подключи кошелёк");
      return;
    }
    try {
      setError(null);
      const tx = await contract.executeTransaction(txId);
      await tx.wait();
      await loadMultisigState();
    } catch (e: any) {
      console.error(e);
      setError(e.message ?? "Ошибка при исполнении транзакции");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex justify-center p-4">
      <div className="w-full max-w-5xl space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              JERT Treasury Multisig
            </h1>
            <p className="text-sm text-slate-400">
              Корпоративный неоновый мультисиг-кошелёк Cryogas / JERT Network
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {signerAddress ? (
              <>
                <span className="text-xs text-slate-400">
                  Подключен:{" "}
                  <span className="font-mono">
                    {signerAddress.slice(0, 6)}...
                    {signerAddress.slice(-4)}
                  </span>
                </span>
                <button
                  className="px-3 py-1 text-xs rounded-full border border-emerald-500/60 text-emerald-300"
                  onClick={() => loadMultisigState()}
                >
                  Обновить состояние
                </button>
              </>
            ) : (
              <button
                onClick={connectWallet}
                className="px-4 py-2 rounded-xl bg-emerald-500/90 hover:bg-emerald-400 text-slate-900 text-sm font-semibold shadow-lg shadow-emerald-500/30"
              >
                Подключить MetaMask
              </button>
            )}
          </div>
        </header>

        {/* Ошибки */}
        {error && (
          <div className="rounded-xl border border-red-600/60 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* Общая инфа */}
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
            <h2 className="text-sm font-semibold text-slate-300 mb-2">
              Owners
            </h2>
            <div className="space-y-1">
              {owners.length === 0 && (
                <p className="text-xs text-slate-500">Пока не загружено.</p>
              )}
              {owners.map((o) => (
                <div
                  key={o}
                  className={`flex items-center justify-between text-xs rounded-lg px-2 py-1 ${
                    signerAddress &&
                    o.toLowerCase() === signerAddress.toLowerCase()
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
                        You
                      </span>
                    )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
            <h2 className="text-sm font-semibold text-slate-300 mb-2">
              Confirmation Policy
            </h2>
            <p className="text-4xl font-bold">
              {numConfirmationsRequired || "-"}
              <span className="text-base text-slate-400 ml-1">
                / {owners.length || "-"}
              </span>
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Требуемое число подтверждений для выполнения транзакции.
            </p>
            <p className="mt-1 text-xs">
              Ты:{" "}
              <span
                className={
                  isOwner ? "text-emerald-400 font-semibold" : "text-slate-400"
                }
              >
                {isOwner ? "владелец multisig" : "не являешься владельцем"}
              </span>
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
            <h2 className="text-sm font-semibold text-slate-300 mb-2">
              Contract
            </h2>
            <p className="text-xs text-slate-400 break-all font-mono">
              {TREASURY_MULTISIG_ADDRESS}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Убедись, что этот адрес совпадает с деплоем в сети (Hardhat / testnet / mainnet).
            </p>
          </div>
        </section>

        {/* Форма создания транзакции */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200">
              Создать транзакцию
            </h2>
            {isOwner ? (
              <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/40">
                Доступно: владелец
              </span>
            ) : (
              <span className="text-[10px] px-2 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                Только для владельцев
              </span>
            )}
          </div>

          <form
            className="grid gap-3 md:grid-cols-3"
            onSubmit={handleSubmitTransaction}
          >
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">
                Адрес получателя (to)
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
                Сумма, ETH (value)
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

            <div className="flex flex-col gap-1 md:col-span-1">
              <label className="text-xs text-slate-400">
                Data (hex, optional)
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
                {txSubmitting ? "Создание..." : "Создать транзакцию"}
              </button>
            </div>
          </form>
        </section>

        {/* Список транзакций */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200">
              Транзакции
            </h2>
            {loadingTxs && (
              <span className="text-xs text-slate-400">Загрузка...</span>
            )}
          </div>

          {transactions.length === 0 ? (
            <p className="text-xs text-slate-500">
              Транзакций пока нет. Создай первую.
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
                          ? "Executed"
                          : canExecute
                          ? "Ready to execute"
                          : "Pending"}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-3 gap-1">
                      <div>
                        <span className="text-slate-500">To: </span>
                        <span className="font-mono break-all">
                          {tx.to}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Value: </span>
                        <span>
                          {tx.value === 0n
                            ? "0"
                            : formatEther(tx.value)}{" "}
                          ETH
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
                        <span className="font-mono break-all">
                          {tx.data}
                        </span>
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
