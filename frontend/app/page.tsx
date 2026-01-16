"use client";

import { useConnect, useAccount } from "wagmi";

export default function Home() {

  const { connect, connectors } = useConnect();
  const { address, isConnected } = useAccount();

  if (isConnected) return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black gap-y-2">
      <h4 className="text-3xl"><span className="text-orange-400 font-bold">Tixel</span>  will be a game changer</h4>
      <p>{address}</p>

      <button
        className="p-2 bg-orange-400 font-semibold text-gray-700 cursor-pointer"
      >
        Bridge USDC to Stacks L2
      </button>
    </div>  
  );

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
  
      <div className="flex flex-col">
      {connectors.map((connector) => (
        <button
          className="border p-2 m-2"
          key={connector.uid}
          onClick={() => connect({ connector })}
        >
          Connect {connector.name}
        </button>
      ))}
    </div>
    </div>
  );
}
