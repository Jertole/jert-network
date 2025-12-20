import React from "react";

type Props = {
  address: string | null;
  chainId: number | null;
  onConnect: () => Promise<void>;
  onDisconnect: () => void;
  onSwitchToSepolia?: () => Promise<void>;
  expectedChainId?: number; // 11155111 for Sepolia
};

function shortAddr(a: string) {
  return `${a.slice(0, 6)}...${a.slice(-4)}`;
}

export const ConnectWallet: React.FC<Props> = ({
  address,
  chainId,
  onConnect,
  onDisconnect,
  onSwitchToSepolia,
  expectedChainId,
}) => {
  const isConnected = !!address;
  const isWrongNetwork =
    isConnected && expectedChainId != null && chainId != null && chainId !== expectedChainId;

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      {!isConnected ? (
        <button onClick={onConnect}>Connect Wallet</button>
      ) : (
        <>
          <div style={{ opacity: 0.9 }}>
            Connected: <b>{shortAddr(address!)}</b>
            {chainId != null && (
              <>
                {" "}• chainId: <b>{chainId}</b>
              </>
            )}
          </div>

          {isWrongNetwork && onSwitchToSepolia && (
            <button onClick={onSwitchToSepolia}>Switch to Sepolia</button>
          )}

          <button onClick={onDisconnect}>Disconnect</button>
        </>
      )}

      {isWrongNetwork && <div style={{ color: "tomato" }}>Wrong network. Please switch.</div>}
    </div>
  );
};

