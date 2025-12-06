
import React, { useEffect, useState } from "react";
import { getMultisigInfo, getTreasuryBalance } from "../services/jertContracts";
import { sendTreasuryTransaction } from "../services/api";

interface MultisigInfo {
  owners: string[];
  threshold: number;
}

export const MultisigDashboard: React.FC = () => {
  const [info, setInfo] = useState<MultisigInfo | null>(null);
  const [balanceJert, setBalanceJert] = useState<number>(0);

  const [energyMWh, setEnergyMWh] = useState<number>(0);
  const [coldMWh, setColdMWh] = useState<number>(0);

  const [rates, setRates] = useState<any>(null);

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    const ms = await getMultisigInfo();
    const bal = await getTreasuryBalance();
    const r = await fetch("/api/energy/rates").then((x) => x.json());
    const conv = await fetch(`/api/energy/convert?jert=${bal}`).then((x) =>
      x.json()
    );

    setInfo(ms);
    setBalanceJert(bal);

    setRates(r);
    setEnergyMWh(conv.energyMWhEquivalent);
    setColdMWh(conv.coldMWhEquivalent);

    setLoading(false);
  }

  if (loading) return <div>Loading multisig data...</div>;
  if (!info) return <div>Error: multisig not available</div>;

  return (
    <div className="card">
      <h2>Multisig Treasury</h2>

      <div>
        <strong>Owners:</strong>
        <ul>
          {info.owners.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>

        <strong>Threshold: {info.threshold}/3 required</strong>
      </div>

      <hr />

      <div>
        <h3>Treasury Balance</h3>
        <p>
          {balanceJert} JERT
        </p>

        <h4>Energy Equivalent</h4>
        <p>{energyMWh} MWh</p>

        <h4>Cold-Energy Equivalent</h4>
        <p>{coldMWh} MWh-cold</p>

        <h4>USD Reference</h4>
        <p>USD/MWh: {rates.usdPerMWh}</p>
        <p>USD/MWh-cold: {rates.usdPerMWhCold}</p>
      </div>

      <button onClick={loadData} className="btn-refresh">
        Refresh
      </button>
    </div>
  );
};
