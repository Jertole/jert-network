import React from "react";

export function GovernancePanel() {
  return (
    <div className="card">
      <h2>Governance & Treasury Control</h2>

      <p>
        The JERT treasury is governed by an on-chain multi-signature smart contract.
        Material treasury actions require approval from multiple independent control domains,
        ensuring operational execution without centralized control.
      </p>

      <p>
        <strong>Control Model:</strong> 2-of-3 Multisignature
        <br />
        <strong>Enforcement:</strong> On-chain (EVM smart contract)
      </p>

      <h3>Signer 1 — Local Infrastructure Operator</h3>

      <ul>
        <li>
          <strong>Entity:</strong> CRYOGAS LLC (Kazakhstan)
        </li>
        <li>
          <strong>BIN:</strong> 230140010661
        </li>
        <li>
          <strong>Role:</strong> Physical infrastructure execution and capital deployment
        </li>
        <li>
          <strong>EOA:</strong>{" "}
          <span className="mono">
            0x9e9832733b247240fb81d49362b5f679dddff90e
          </span>
        </li>
        <li>
          <strong>Status:</strong> Active
        </li>
      </ul>

      <p className="muted">
        Additional signers and internal governance arrangements are intentionally
        not disclosed publicly. Full governance disclosure is available under NDA
        to regulated institutional investors and partners.
      </p>
    </div>
  );
}
