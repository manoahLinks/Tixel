import { useState, useCallback } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { USDCxBridge } from '@tixel-sdk/usdcx';
import type { BridgeParams, BridgeResult, BridgeStatus } from '@tixel-sdk/usdcx';

export type BridgeHookStatus = 'idle' | 'loading' | 'success' | 'error';

export interface UseBridgeReturn {
  executeBridge: (params: Omit<BridgeParams, 'onProgress'>) => Promise<BridgeResult | null>;
  status: BridgeHookStatus;
  bridgeStatus: BridgeStatus | null;
  bridgeResult: BridgeResult | null;
  txHash: string | null;
  error: Error | null;
  progress: {
    message: string;
    percentage: number;
  };
  reset: () => void;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

const BRIDGE_STATUS_MESSAGES: Record<BridgeStatus, string> = {
  initiated: 'Initiating bridge...',
  confirmed: 'Transaction confirmed',
  minting: 'Minting USDCx on Stacks...',
  minted: 'USDCx minted successfully',
  complete: 'Bridge complete!',
  failed: 'Bridge failed',
};

const BRIDGE_STATUS_PROGRESS: Record<BridgeStatus, number> = {
  initiated: 20,
  confirmed: 50,
  minting: 75,
  minted: 90,
  complete: 100,
  failed: 0,
};

export const useBridge = (network: 'mainnet' | 'testnet' = 'testnet'): UseBridgeReturn => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [status, setStatus] = useState<BridgeHookStatus>('idle');
  const [bridgeStatus, setBridgeStatus] = useState<BridgeStatus | null>(null);
  const [bridgeResult, setBridgeResult] = useState<BridgeResult | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [progressMessage, setProgressMessage] = useState<string>('');

  const executeBridge = useCallback(
    async (params: Omit<BridgeParams, 'onProgress'>): Promise<BridgeResult | null> => {
      // Validation
      if (!isConnected || !address) {
        const err = new Error('Please connect your wallet first');
        setError(err);
        setStatus('error');
        throw err;
      }

      if (!walletClient) {
        const err = new Error('Wallet client not available');
        setError(err);
        setStatus('error');
        throw err;
      }

      // Reset state
      setError(null);
      setStatus('loading');
      setBridgeStatus(null);
      setTxHash(null);
      setProgressMessage('Initializing bridge...');

      try {
        // Initialize SDK
        const bridge = new USDCxBridge(network);

        // Execute bridge with progress callback
        const result = await bridge.executeBridge(
          {
            ...params,
            onProgress: (status, details) => {
              console.log(`Bridge status: ${status}`, details);
              setBridgeStatus(status);
              setProgressMessage(details?.message || BRIDGE_STATUS_MESSAGES[status]);
            },
          },
          walletClient
        );

        // Success
        setBridgeResult(result);
        setTxHash(result.ethTxHash || null);
        setStatus('success');
        setBridgeStatus('complete');
        setProgressMessage('Bridge completed successfully!');

        return result;
      } catch (err: any) {
        console.error('Bridge error:', err);

        // Parse error message
        let errorMessage = 'Bridge failed';
        if (err?.message) {
          if (err.message.includes('user rejected') || err.message.includes('User rejected')) {
            errorMessage = 'Transaction rejected by user';
          } else if (err.message.includes('insufficient funds')) {
            errorMessage = 'Insufficient funds for transaction';
          } else if (err.message.includes('Insufficient USDC')) {
            errorMessage = err.message;
          } else if (err.message.includes('Insufficient ETH')) {
            errorMessage = err.message;
          } else {
            errorMessage = err.message;
          }
        }

        const error = new Error(errorMessage);
        setError(error);
        setStatus('error');
        setBridgeStatus('failed');
        setProgressMessage(errorMessage);

        throw error;
      }
    },
    [isConnected, address, walletClient, network]
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setBridgeStatus(null);
    setBridgeResult(null);
    setTxHash(null);
    setError(null);
    setProgressMessage('');
  }, []);

  return {
    executeBridge,
    status,
    bridgeStatus,
    bridgeResult,
    txHash,
    error,
    progress: {
      message: progressMessage,
      percentage: bridgeStatus ? BRIDGE_STATUS_PROGRESS[bridgeStatus] : 0,
    },
    reset,
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isError: status === 'error',
  };
};
