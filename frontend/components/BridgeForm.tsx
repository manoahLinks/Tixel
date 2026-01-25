'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useBridge } from '@/hooks/useBridge';
import { getLocalStorage, isConnected as stacksIsConnected } from '@stacks/connect';

export default function BridgeForm({
  className = "max-w-md",
}: {
  className?: string;
}) {
  const { address, isConnected } = useAccount();
  const {
    executeBridge,
    status,
    bridgeStatus,
    txHash,
    error,
    progress,
    reset,
    isLoading,
    isSuccess,
  } = useBridge('testnet');

  const [amount, setAmount] = useState('');
  const [stacksAddress, setStacksAddress] = useState('');

  useEffect(() => {
    if (stacksAddress) return;
    if (!stacksIsConnected()) return;
    const userData = getLocalStorage();
    const stx = userData?.addresses?.stx?.[0]?.address ?? '';
    if (stx) setStacksAddress(stx);
  }, [stacksAddress]);

  const handleBridge = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !stacksAddress || !address) {
      return;
    }

    try {
      await executeBridge({
        from: 'ethereum',
        to: 'stacks',
        amount: parseFloat(amount),
        ethAddress: address,
        stacksAddress,
      });
    } catch (err) {
      console.error('Bridge failed:', err);
    }
  };

  return (
    <div className={`${className} w-full rounded-lg border border-zinc-800 bg-zinc-950 p-6`}>
      <h2 className="mb-6 text-xl font-semibold text-zinc-100">Bridge USDCx to Stacks</h2>

      {!isConnected ? (
        <div className="text-center py-8">
          <p className="mb-4 text-sm text-zinc-400">Please connect your wallet to continue</p>
        </div>
      ) : (
        <form onSubmit={handleBridge} className="space-y-4">
          {/* Amount Input */}
          <div>
            <label htmlFor="amount" className="mb-2 block text-xs text-zinc-400">
              Amount (USDC)
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              disabled={isLoading}
              className="w-full rounded-md border border-zinc-800 bg-black px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-orange-400 focus:outline-none disabled:opacity-50"
              required
            />
          </div>

          {/* Stacks Address Input */}
          <div>
            <label htmlFor="stacksAddress" className="mb-2 block text-xs text-zinc-400">
              Stacks Address
            </label>
            <input
              id="stacksAddress"
              type="text"
              value={stacksAddress}
              onChange={(e) => setStacksAddress(e.target.value)}
              placeholder="SP..."
              disabled={isLoading}
              className="w-full rounded-md border border-zinc-800 bg-black px-3 py-2 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-orange-400 focus:outline-none disabled:opacity-50"
              required
            />
            {!stacksAddress && stacksIsConnected() ? (
              <p className="mt-2 text-xs text-zinc-500">
                Tip: connect your Stacks wallet above to auto-fill this.
              </p>
            ) : null}
          </div>

          {/* Progress Display */}
          {isLoading && (
            <div className="rounded-lg border border-zinc-800 bg-black p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-zinc-100">
                  {bridgeStatus || 'Processing...'}
                </span>
                <span className="text-sm text-zinc-400">{progress.percentage}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-800">
                <div
                  className="h-2 rounded-full bg-orange-400 transition-all duration-300"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-zinc-400">{progress.message}</p>
            </div>
          )}

          {/* Success Message */}
          {isSuccess && txHash && (
            <div className="rounded-lg border border-zinc-800 bg-black p-4">
              <p className="mb-2 text-sm font-medium text-zinc-100">Bridge Successful</p>
              <a
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-xs text-orange-400 hover:text-orange-300 underline"
              >
                View on Etherscan →
              </a>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="rounded-lg border border-red-900/40 bg-black p-4">
              <p className="mb-1 text-sm font-medium text-zinc-100">Error</p>
              <p className="text-xs text-red-300">{error.message}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!isSuccess ? (
              <button
                type="submit"
                disabled={isLoading || !amount || !stacksAddress}
                className="flex-1 rounded-md bg-orange-400 px-4 py-3 text-sm font-semibold text-black hover:bg-orange-300 disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Bridging...' : 'Bridge to Stacks'}
              </button>
            ) : (
              <button
                type="button"
                onClick={reset}
                className="flex-1 rounded-md border border-zinc-700 px-4 py-3 text-sm font-semibold text-zinc-100 hover:border-orange-400 hover:text-orange-400 transition-colors"
              >
                Bridge Again
              </button>
            )}
          </div>

          {/* Info */}
          <div className="rounded-lg border border-zinc-800 bg-black p-3 text-xs text-zinc-400">
            <p className="mb-1 font-medium text-zinc-100">Bridge Info</p>
            <ul className="ml-4 list-disc space-y-1">
              <li>Estimated time: ~3 minutes</li>
              <li>Network: Sepolia Testnet → Stacks Testnet</li>
              <li>You'll need ETH for gas fees</li>
            </ul>
          </div>
        </form>
      )}
    </div>
  );
}
