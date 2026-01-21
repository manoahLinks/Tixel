'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useBridge } from '@/hooks/useBridge';

export default function BridgeForm() {
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
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Bridge USDCx to Stacks</h2>

      {!isConnected ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Please connect your wallet to continue</p>
        </div>
      ) : (
        <form onSubmit={handleBridge} className="space-y-4">
          {/* Amount Input */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
            />
          </div>

          {/* Stacks Address Input */}
          <div>
            <label htmlFor="stacksAddress" className="block text-sm font-medium text-gray-700 mb-2">
              Stacks Address
            </label>
            <input
              id="stacksAddress"
              type="text"
              value={stacksAddress}
              onChange={(e) => setStacksAddress(e.target.value)}
              placeholder="SP..."
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed font-mono text-sm"
              required
            />
          </div>

          {/* Progress Display */}
          {isLoading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900">
                  {bridgeStatus || 'Processing...'}
                </span>
                <span className="text-sm text-blue-700">{progress.percentage}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              <p className="text-xs text-blue-700 mt-2">{progress.message}</p>
            </div>
          )}

          {/* Success Message */}
          {isSuccess && txHash && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm font-medium text-green-900 mb-2">✅ Bridge Successful!</p>
              <a
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-green-700 hover:text-green-900 underline break-all"
              >
                View on Etherscan →
              </a>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm font-medium text-red-900 mb-1">❌ Error</p>
              <p className="text-xs text-red-700">{error.message}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!isSuccess ? (
              <button
                type="submit"
                disabled={isLoading || !amount || !stacksAddress}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Bridging...' : 'Bridge to Stacks'}
              </button>
            ) : (
              <button
                type="button"
                onClick={reset}
                className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Bridge Again
              </button>
            )}
          </div>

          {/* Info */}
          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
            <p className="font-medium mb-1">ℹ️ Bridge Info:</p>
            <ul className="space-y-1 ml-4 list-disc">
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
