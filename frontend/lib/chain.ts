import { createPublicClient, createWalletClient, http, custom, type Chain, type WalletClient } from "viem";
import { sepolia } from "viem/chains";

const RPC_URL = process.env.NEXT_PUBLIC_ETH_RPC_URL || "https://ethereum-sepolia.publicnode.com";
type SupportedChainName = 'sepolia';

const CHAIN_MAP: Record<SupportedChainName, Chain> = {
  sepolia,
};

const selectedChainName = (process.env.NEXT_PUBLIC_CHAIN?.toLowerCase() as SupportedChainName) || "sepolia";
export const SELECTED_CHAIN = CHAIN_MAP[selectedChainName] ?? sepolia;

export const publicClient = createPublicClient({
  chain: SELECTED_CHAIN,
  transport: http(RPC_URL),
});

// Legacy walletClient for backwards compatibility - prefer getWalletClient() for dynamic wallet access
export const walletClient = typeof window !== "undefined" && (window as any).ethereum
  ? createWalletClient({
      chain: SELECTED_CHAIN,
      transport: custom((window as any).ethereum),
    })
  : undefined;

// Dynamic wallet client getter - use this when you have a provider from Dynamic Labs
export const getWalletClient = (provider: any): WalletClient | undefined => {
  if (!provider) return undefined;
  return createWalletClient({
    chain: SELECTED_CHAIN,
    transport: custom(provider),
  });
};
