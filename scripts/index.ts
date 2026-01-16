import dotenv from "dotenv";
dotenv.config()
import {
  createWalletClient,
  createPublicClient,
  http,
  parseUnits,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { bytes32FromBytes, remoteRecipientCoder } from "./helpers";

// ============ Configuration constants ============
const config = {
  // Public Ethereum Sepolia RPC and your private wallet key
  ETH_RPC_URL: process.env.RPC_URL || "https://ethereum-sepolia.publicnode.com",
  PRIVATE_KEY: process.env.PRIVATE_KEY as `0x${string}`, 

  // Contract addresses on testnet
  X_RESERVE_CONTRACT: "008888878f94C0d87defdf0B07f46B93C1934442",
  ETH_USDC_CONTRACT: "1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",

  // Deposit parameters for Stacks
  STACKS_DOMAIN: 10003, // Stacks domain ID
  STACKS_RECIPIENT: "ST1VYVQJNH6XSH9GGCPBK5E5QCVB0JFFWG8ESPPSK", // Address to receive minted USDCx on Stacks
  DEPOSIT_AMOUNT: "0.1",
  MAX_FEE: "0",
};

// ============ Contract ABIs ============
const X_RESERVE_ABI = [
  {
    name: "depositToRemote",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "value", type: "uint256" },
      { name: "remoteDomain", type: "uint32" },
      { name: "remoteRecipient", type: "bytes32" },
      { name: "localToken", type: "address" },
      { name: "maxFee", type: "uint256" },
      { name: "hookData", type: "bytes" },
    ],
    outputs: [],
  },
];

const ERC20_ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "success", type: "bool" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "balance", type: "uint256" }],
  },
];


async function main() {
  if (!config.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY must be set in your .env file");
  }

  // Set up wallet and wallet provider
  const account = privateKeyToAccount(config.PRIVATE_KEY);
  const client = createWalletClient({
    account,
    chain: sepolia,
    transport: http(config.ETH_RPC_URL),
  });

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(config.ETH_RPC_URL),
  });

  console.log(`Ethereum wallet address: ${account.address}`);

  // Check native ETH balance
  const nativeBalance = await publicClient.getBalance({
    address: account.address,
  });
    console.log(
    `Native balance: ${nativeBalance.toString()} wei (${(
      Number(nativeBalance) / 1e18
    ).toFixed(6)} ETH)`,
  );
  if (nativeBalance === 0n)
    throw new Error("Insufficient native balance for gas fees");

  // Prepare deposit params (USDC has 6 decimals)
  const value = parseUnits(config.DEPOSIT_AMOUNT, 6);
  const maxFee = parseUnits(config.MAX_FEE, 6);
  const remoteRecipient = bytes32FromBytes(remoteRecipientCoder.encode(config.STACKS_RECIPIENT));
  const hookData = "0x";

  console.log(
    `\nDepositing ${config.DEPOSIT_AMOUNT} USDC to Stacks recipient: ${config.STACKS_RECIPIENT}`,
  );

  // Check token balance
  const usdcBalance = await publicClient.readContract({
    address: `0x${config.ETH_USDC_CONTRACT}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [account.address],
  });
  console.log(
    `USDC balance: ${usdcBalance?.toString()} (${(
      Number(usdcBalance) / 1e6
    ).toFixed(6)} USDC)`,
  );

  let balance = usdcBalance as bigint; 

  if (balance < value) {
    throw new Error(
      `Insufficient USDC balance. Required: ${(Number(value) / 1e6).toFixed(
        6,
      )} USDC`,
    );
  }

  // Approve xReserve to spend USDC
  const approveTxHash = await client.writeContract({
    address: `0x${config.ETH_USDC_CONTRACT}`,
    abi: ERC20_ABI,
    functionName: "approve",
    args: [`0x${config.X_RESERVE_CONTRACT}`, value],
  });
  console.log("Approval tx hash:", approveTxHash);
  console.log("Waiting for approval confirmation...");

  await publicClient.waitForTransactionReceipt({ hash: approveTxHash });
  console.log("✅ Approval confirmed");

  // Deposit transaction
  const depositTxHash = await client.writeContract({
    address: `0x${config.X_RESERVE_CONTRACT}`,
    abi: X_RESERVE_ABI,
    functionName: "depositToRemote",
    args: [
      value,
      config.STACKS_DOMAIN,
      remoteRecipient,
      `0x${config.ETH_USDC_CONTRACT}`,
      maxFee,
      hookData,
    ],
  });

  console.log("Deposit tx hash:", depositTxHash);
  console.log(
    "✅ Transaction submitted. You can track this on Sepolia Etherscan.",
  );
}

// ============ Call the main function ============
main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});