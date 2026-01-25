export const USDCX_BRIDGE_CONFIG = {
    ethRpcUrl: process.env.NEXT_PUBLIC_ETH_RPC_URL || "https://ethereum-sepolia.publicnode.com",
    xReserveContract: `0x${process.env.NEXT_PUBLIC_X_RESERVE_CONTRACT || "008888878f94C0d87defdf0B07f46B93C1934442"}` as `0x${string}`,
    ethUsdcContract: `0x${process.env.NEXT_PUBLIC_ETH_USDC_CONTRACT || "1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"}` as `0x${string}`,
    stacksDomain: parseInt(process.env.NEXT_PUBLIC_STACKS_DOMAIN || "10003"),
  };

// Stacks contracts (testnet)
export const STACKS_USDCX_CONTRACT =
  (process.env.NEXT_PUBLIC_STACKS_USDCX_CONTRACT ??
    "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.usdcx-v1") as `${string}.${string}`;

// Where you deploy `contracts/contracts/event-ticketing.clar` (contract name: `event-ticketings`)
export const STACKS_EVENT_TICKETING_CONTRACT =
  (process.env.NEXT_PUBLIC_STACKS_EVENT_TICKETING_CONTRACT ??
    "ST1VYVQJNH6XSH9GGCPBK5E5QCVB0JFFWG8ESPPSK.tixel-events") as `${string}.${string}`;