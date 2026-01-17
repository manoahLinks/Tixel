import { useState, useCallback } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { parseUnits, type Hex, pad, toHex, encodeFunctionData } from 'viem';
import * as P from 'micro-packed';
import { createAddress, addressToString, AddressVersion, StacksWireType } from '@stacks/transactions';
import { hex } from '@scure/base';

import { walletClient, getWalletClient } from "@/lib/chain";

export type USDCxDepositStatus = 
  | 'idle'
  | 'checking_balance'
  | 'approving'
  | 'depositing'
  | 'success'
  | 'error';

export type USDCxDepositStep = {
  status: USDCxDepositStatus;
  message: string;
  progress: number;
};

interface USDCxDepositConfig {
  ethRpcUrl: string;
  xReserveContract: `0x${string}`;
  ethUsdcContract: `0x${string}`;
  stacksDomain: number;
}

// ============ Helper Functions ============
const remoteRecipientCoder = P.wrap<string>({
  encodeStream(w, value: string) {
    const address = createAddress(value);
    P.bytes(11).encodeStream(w, new Uint8Array(11).fill(0));
    P.U8.encodeStream(w, address.version);
    P.bytes(20).encodeStream(w, hex.decode(address.hash160));
  },
  decodeStream(r) {
    P.bytes(11).decodeStream(r);
    const version = P.U8.decodeStream(r);
    const hash = P.bytes(20).decodeStream(r);
    return addressToString({
      hash160: hex.encode(hash),
      version: version as AddressVersion,
      type: StacksWireType.Address,
    });
  },
});

function bytes32FromBytes(bytes: Uint8Array): Hex {
  return toHex(pad(bytes, { size: 32 }));
}

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
] as const;

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
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "remaining", type: "uint256" }],
  },
] as const;

export const useDepositUSDCx = (config: USDCxDepositConfig) => {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  // const { data: walletClient } = useWalletClient();
  
  const [step, setStep] = useState<USDCxDepositStep>({
    status: 'idle',
    message: '',
    progress: 0,
  });
  const [txHash, setTxHash] = useState<string>('');
  const [error, setError] = useState<Error | null>(null);

  const depositUSDCx = useCallback(
    async (amount: string, stacksRecipient: string, maxFee: string = "0") => {
      // Validation
      if (!isConnected || !address) {
        throw new Error('Please connect your wallet first');
      }

      if (!walletClient) {
        throw new Error('Wallet client not available');
      }

      if (!publicClient) {
        throw new Error('Public client not available');
      }

      setError(null);
      setTxHash('');
      const startTime = Date.now();

      try {
        console.log(`Ethereum wallet address: ${address}`);

        // Step 1: Check native ETH balance for gas
        setStep({
          status: 'checking_balance',
          message: 'Checking ETH balance for gas...',
          progress: 10,
        });

        const nativeBalance = await publicClient.getBalance({ address });
        console.log(
          `Native balance: ${nativeBalance.toString()} wei (${(
            Number(nativeBalance) / 1e18
          ).toFixed(6)} ETH)`,
        );

        if (nativeBalance === 0n) {
          throw new Error('Insufficient ETH balance for gas fees');
        }

        // Step 2: Prepare deposit params (USDC has 6 decimals)
        const value = parseUnits(amount, 6);
        const maxFeeAmount = parseUnits(maxFee, 6);
        const remoteRecipient = bytes32FromBytes(remoteRecipientCoder.encode(stacksRecipient));
        const hookData = "0x" as Hex;

        console.log(
          `\nDepositing ${amount} USDC to Stacks recipient: ${stacksRecipient}`,
        );

        // Step 3: Check USDC balance
        setStep({
          status: 'checking_balance',
          message: 'Checking USDC balance...',
          progress: 20,
        });

        const usdcBalance = await publicClient.readContract({
          address: config.ethUsdcContract,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [address],
        });

        console.log(
          `USDC balance: ${usdcBalance?.toString()} (${(
            Number(usdcBalance) / 1e6
          ).toFixed(6)} USDC)`,
        );

        if (usdcBalance < value) {
          throw new Error(
            `Insufficient USDC balance. Required: ${(Number(value) / 1e6).toFixed(
              6,
            )} USDC, Available: ${(Number(usdcBalance) / 1e6).toFixed(6)} USDC`,
          );
        }

        // Step 4: Check current allowance
        setStep({
          status: 'checking_balance',
          message: 'Checking USDC allowance...',
          progress: 30,
        });

        const currentAllowance = await publicClient.readContract({
          address: config.ethUsdcContract,
          abi: ERC20_ABI,
          functionName: 'allowance',
          args: [address, config.xReserveContract],
        });

        // Step 5: Approve xReserve if needed
        if (currentAllowance < value) {
          setStep({
            status: 'approving',
            message: 'Approving USDC for xReserve... (confirm in wallet)',
            progress: 40,
          });

          const approveTxHash = await walletClient?.sendTransaction({
            account: address,
            to: config.ethUsdcContract,
            data: encodeFunctionData({
              abi: ERC20_ABI,
              functionName: 'approve',
              args: [config.xReserveContract, value],
            }),
          });

          console.log('Approval tx hash:', approveTxHash);
          
          setStep({
            status: 'approving',
            message: 'Waiting for approval confirmation...',
            progress: 50,
          });

          await publicClient.waitForTransactionReceipt({ hash: approveTxHash });
          console.log('✅ Approval confirmed');
        } else {
          console.log('✅ Already approved');
        }

        // Step 6: Deposit transaction
        setStep({
          status: 'depositing',
          message: 'Depositing USDC to Stacks... (confirm in wallet)',
          progress: 70,
        });

        const depositTxHash = await walletClient.sendTransaction({
          account: address,
          to: config.xReserveContract,
          data: encodeFunctionData({
            abi: X_RESERVE_ABI,
            functionName: 'depositToRemote',
            args: [
              value,
              config.stacksDomain,
              remoteRecipient,
              config.ethUsdcContract,
              maxFeeAmount,
              hookData,
            ],
          }),
        });

        setTxHash(depositTxHash);
        console.log('Deposit tx hash:', depositTxHash);

        setStep({
          status: 'depositing',
          message: 'Waiting for deposit confirmation...',
          progress: 85,
        });

        await publicClient.waitForTransactionReceipt({ hash: depositTxHash });

        // Success
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        setStep({
          status: 'success',
          message: `Deposit complete in ${duration}s! Track on Etherscan.`,
          progress: 100,
        });

        return {
          success: true,
          txHash: depositTxHash,
          amount,
          stacksRecipient,
        };
      } catch (err: any) {
        console.error('USDCx deposit error:', err);
        
        // Parse error message
        let errorMessage = 'Deposit failed';
        if (err?.message) {
          if (err.message.includes('user rejected')) {
            errorMessage = 'Transaction rejected by user';
          } else if (err.message.includes('insufficient funds')) {
            errorMessage = 'Insufficient funds for transaction';
          } else {
            errorMessage = err.message;
          }
        }

        const error = new Error(errorMessage);
        setError(error);
        setStep({
          status: 'error',
          message: errorMessage,
          progress: 0,
        });
        
        throw error;
      }
    },
    [isConnected, address, walletClient, publicClient, config]
  );

  const reset = useCallback(() => {
    setStep({ status: 'idle', message: '', progress: 0 });
    setTxHash('');
    setError(null);
  }, []);

  return {
    depositUSDCx,
    reset,
    step,
    txHash,
    error,
    isLoading: step.status !== 'idle' && step.status !== 'success' && step.status !== 'error',
    isSuccess: step.status === 'success',
    isError: step.status === 'error',
    // Legacy compatibility
    status: step.message,
    progress: step.progress,
  };
};