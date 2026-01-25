"use client";

import { useAccount, useConnect } from "wagmi";

function shortAddr(addr: string) {
  if (!addr) return "";
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function EvmWalletControls() {
  const { connect, connectors } = useConnect();
  const { address, isConnected } = useAccount();

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">EVM wallet</h2>
          <p className="mt-1 text-xs text-zinc-400">
            Connect to bridge from Ethereum (Sepolia).
          </p>
        </div>

        {isConnected && address ? (
          <div className="text-right">
            <p className="text-xs text-zinc-400">Connected</p>
            <p className="mt-1 font-mono text-xs text-zinc-200">{shortAddr(address)}</p>
          </div>
        ) : (
          <p className="text-xs text-zinc-400">Not connected</p>
        )}
      </div>

      {!isConnected ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {connectors.map((connector) => (
            <button
              key={connector.uid}
              type="button"
              onClick={() => connect({ connector })}
              className="rounded-md border border-zinc-700 bg-black px-3 py-2 text-xs font-semibold text-zinc-100 hover:border-orange-400 hover:text-orange-400"
            >
              Connect {connector.name}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

