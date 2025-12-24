// IMPORTANT: set your deployed JERT token contract address here
export const JERT_TOKEN_ADDRESS = "0xFB5A58c1b4B55F624d1D8FF30174a471e609E6CE";

// Minimal ERC-20 ABI (enough for transfer + decimals + balanceOf)
export const JERT_TOKEN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
] as const;
