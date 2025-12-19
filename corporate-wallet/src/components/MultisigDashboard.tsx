import React, { useEffect, useState } from "react";
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

export const MultisigDashboard: React.FC = () => {
  const [owners, setOwners] = useState<string[]>([]);
  const [required, setRequired] = useState<number>(0);
  const [balance, setBalance] = useState<string>("0");
  const [txs, setTxs] = useState<TxItem[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!window.ethereum) return;

      const provider = new BrowserProvider(window.ethereum);
      const contract = new Contract(
        TREASURY_MULTISIG_ADDRESS,
        TREASURY_MULTISIG_ABI,
        provider
      );

      const ownersList = await contract.getOwners();
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

      setOwners(ownersList);
      setRequired(Number(req));
      setBalance(formatEther(bal));
      setTxs(txItems);
    };

    load();
  }, []);

  return (
    <div>
      <h2>Multisig Treasury</h2>

      <section>
        <p><strong>Contract:</strong> {TREASURY_MULTISIG_ADDRESS}</p>
        <p><strong>Required confirmations:</strong> {required}</p>
        <p><strong>Owners:</strong> {owners.length}</p>
        <p><strong>ETH balance:</strong> {balance}</p>
      </section>

      <section>
        <h3>Owners</h3>
        <ul>
          {owners.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Transactions</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>To</th>
              <th>Value (ETH)</th>
              <th>Confirmations</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {txs.map((tx) => (
              <tr key={tx.id}>
                <td>{tx.id}</td>
                <td>{tx.to}</td>
                <td>{formatEther(tx.value)}</td>
                <td>{tx.numConfirmations.toString()} / {required}</td>
                <td>{tx.executed ? "Executed" : "Pending"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};
