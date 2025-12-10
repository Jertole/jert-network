// src/constants/treasuryMultisig.ts

export const TREASURY_MULTISIG_ADDRESS =
  "0xYourTreasuryMultisigAddressHere"; // ← сюда вставь реальный адрес контракта

export const TREASURY_MULTISIG_ABI = [
  // getOwners() external view returns (address[])
  {
    inputs: [],
    name: "getOwners",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  // numConfirmationsRequired() external view returns (uint256)
  {
    inputs: [],
    name: "numConfirmationsRequired",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  // getTransactionCount() external view returns (uint256)
  {
    inputs: [],
    name: "getTransactionCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  // getTransaction(uint256)
  {
    inputs: [{ internalType: "uint256", name: "_txId", type: "uint256" }],
    name: "getTransaction",
    outputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "value", type: "uint256" },
      { internalType: "bytes", name: "data", type: "bytes" },
      { internalType: "bool", name: "executed", type: "bool" },
      { internalType: "uint256", name: "numConfirmations", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  // submitTransaction(address _to, uint256 _value, bytes _data)
  {
    inputs: [
      { internalType: "address", name: "_to", type: "address" },
      { internalType: "uint256", name: "_value", type: "uint256" },
      { internalType: "bytes", name: "_data", type: "bytes" },
    ],
    name: "submitTransaction",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // confirmTransaction(uint256 _txId)
  {
    inputs: [{ internalType: "uint256", name: "_txId", type: "uint256" }],
    name: "confirmTransaction",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // executeTransaction(uint256 _txId)
  {
    inputs: [{ internalType: "uint256", name: "_txId", type: "uint256" }],
    name: "executeTransaction",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
