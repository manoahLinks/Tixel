"use client";

import { createConfig, WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http } from "viem";
import { sepolia } from "viem/chains";
import { injected, walletConnect } from "wagmi/connectors";
import React from "react";

/* ------------------ Wagmi Config ------------------ */
export const createWagmiConfig = () =>
  createConfig({
    chains: [sepolia],
    connectors: [
      injected(),
      walletConnect({
        projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
      }),
    ],
    transports: {
      [sepolia.id]: http(process.env.NEXT_PUBLIC_ETH_RPC_URL),
    },
  });

/* ------------------ React Query ------------------ */
export const createQueryClient = () => new QueryClient();

/* ------------------ Provider ------------------ */
export const AppWagmiProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const config = createWagmiConfig();
  const queryClient = createQueryClient();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
};
