import { useCallback, useEffect, useMemo, useState } from "react";
import { BrowserProvider } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const SEPOLIA_CHAIN_ID = 11155111;

export function useWallet() {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);

  const hasEthereum = typeof window !== "undefined" && !!window.ethereum;

  const connect = useCallback(async () => {
    if (!hasEthereum) {
      alert("MetaMask (window.ethereum) not found. Please install MetaMask.");
      return;
    }
    const p = new BrowserProvider(window.ethereum);

    const accounts: string[] = await p.send("eth_requestAccounts", []);
    const net = await p.getNetwork();

    setProvider(p);
    setAddress(accounts?.[0] ?? null);
    setChainId(Number(net.chainId));
  }, [hasEthereum]);

  const disconnect = useCallback(() => {
    setProvider(null);
    setAddress(null);
    setChainId(null);
  }, []);

  const switchToSepolia = useCallback(async () => {
    if (!hasEthereum) return;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }], // 11155111
      });
    } catch (err: any) {
      if (err?.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0xaa36a7",
              chainName: "Sepolia",
              nativeCurrency: { name: "SepoliaETH", symbol: "ETH", decimals: 18 },
              rpcUrls: ["https://rpc.sepolia.org"],
              blockExplorerUrls: ["https://sepolia.etherscan.io"],
            },
          ],
        });
      } else {
        throw err;
      }
    }

    if (provider) {
      const net = await provider.getNetwork();
      setChainId(Number(net.chainId));
    } else {
      await connect();
    }
  }, [connect, hasEthereum, provider]);

  useEffect(() => {
    if (!hasEthereum) return;

    const handleAccountsChanged = (accs: string[]) => {
      setAddress(accs?.[0] ?? null);
    };

    const handleChainChanged = (_hexChainId: string) => {
      setProvider(new BrowserProvider(window.ethereum));
      setChainId(parseInt(_hexChainId, 16));
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [hasEthereum]);

  const signerReady = useMemo(() => !!provider && !!address, [provider, address]);

  return {
    hasEthereum,
    provider,
    address,
    chainId,
    signerReady,
    connect,
    disconnect,
    switchToSepolia,
  };
}
