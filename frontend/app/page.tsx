"use client";

import { useConnect, useAccount, useWalletClient } from "wagmi";
import { useDepositUSDCx } from "@/hooks/useDepositUSDCx";
import { USDCX_BRIDGE_CONFIG } from "@/lib/config";
import BridgeForm from "@/components/BridgeForm";

export default function Home() {

  const { connect, connectors } = useConnect();
  const { address, isConnected } = useAccount();

  const { depositUSDCx, isLoading, step } = useDepositUSDCx(USDCX_BRIDGE_CONFIG);

  const handleDeposit = async () => {

    try {
      await depositUSDCx(
        "0.1",                                      // Amount in USDC
        "ST1VYVQJNH6XSH9GGCPBK5E5QCVB0JFFWG8ESPPSK" // Stacks address
      );
    } catch (error) {
      console.error(error);
    }
  };


  if (isConnected) return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black gap-y-2">
      <h4 className="text-3xl"><span className="text-orange-400 font-bold">Tixel</span>  will be a game changer</h4>
      <p>{address}</p>

      <button
        className="p-2 bg-orange-400 font-semibold text-gray-700 cursor-pointer"
        onClick={handleDeposit} 
        disabled={isLoading}
      >
        {isLoading ? step.message : 'Bridge USDC to Stacks '}
      </button>

      <BridgeForm/>
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
