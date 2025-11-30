import { ethers } from "ethers";

const RPC_URL = import.meta.env.VITE_JERT_RPC_URL || "http://127.0.0.1:8545";

// TODO: заменить адреса и ABI реальными
const TREASURY_MULTISIG_ADDRESS = "0x0000000000000000000000000000000000000000";
const JERT_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000";

const TREASURY_ABI: any[] = [
  "function getOwners() view returns (address[])",
  "function threshold() view returns (uint256)"
];

const JERT_ABI: any[] = ["function balanceOf(address) view returns (uint256)", "function decimals() view returns (uint8)"];

let provider: ethers.JsonRpcProvider | null = null;

function getProvider() {
  if (!provider) {
    provider = new ethers.JsonRpcProvider(RPC_URL);
  }
  return provider;
}

export async function getMultisigInfo(): Promise<{ owners: string[]; threshold: number }> {
  // TODO: включить реальный контракт, сейчас мок:
  if (TREASURY_MULTISIG_ADDRESS === "0x0000000000000000000000000000000000000000") {
    return {
      owners: [
        "CEO Cryogas KZ (placeholder)",
        "CEO Vitlax Nordic AB (placeholder)",
        "CEO SY Power Energy (placeholder)"
      ],
      threshold: 2
    };
  }

  const prov = getProvider();
  const contract = new ethers.Contract(
    TREASURY_MULTISIG_ADDRESS,
    TREASURY_ABI,
    prov
  );

  const owners: string[] = await contract.getOwners();
  const threshold: bigint = await contract.threshold();

  return {
    owners,
    threshold: Number(threshold)
  };
}

export async function getTreasuryBalance(): Promise<string> {
  if (
    TREASURY_MULTISIG_ADDRESS === "0x0000000000000000000000000000000000000000" ||
    JERT_TOKEN_ADDRESS === "0x0000000000000000000000000000000000000000"
  ) {
    return "0.0000 JERT";
  }

  const prov = getProvider();
  const token = new ethers.Contract(JERT_TOKEN_ADDRESS, JERT_ABI, prov);

  const [rawBal, decimals]: [bigint, number] = await Promise.all([
    token.balanceOf(TREASURY_MULTISIG_ADDRESS),
    token.decimals()
  ]);

  const factor = 10n ** BigInt(decimals);
  const whole = rawBal / factor;
  const fraction = (rawBal % factor).toString().padStart(decimals, "0").slice(0, 4);

  return `${whole.toString()}.${fraction} JERT`;
}

