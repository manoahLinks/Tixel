/**
 * USDCxBridge - Simplified bridge-only SDK
 */

import type { WalletClient } from 'viem';
import type { BridgeParams, BridgeResult, BridgeStatus } from '../types';
import { Bridge } from './Bridge';

export class USDCxBridge {
  private bridge: Bridge;

  constructor(network: 'mainnet' | 'testnet', ethRpcUrl?: string) {
    this.bridge = new Bridge(network, ethRpcUrl);
    console.log(`🌉 USDCx Bridge SDK initialized on ${network}`);
  }

  /**
   * Bridge USDCx between Ethereum and Stacks
   */
  async executeBridge(
    params: BridgeParams,
    walletClient: WalletClient
  ): Promise<BridgeResult> {
    return this.bridge.bridge(params, walletClient);
  }

  /**
   * Get bridge status
   */
  async getStatus(bridgeId: string): Promise<BridgeStatus> {
    return this.bridge.getBridgeStatus(bridgeId);
  }

  /**
   * Estimate bridge time
   */
  estimateTime(from: 'ethereum' | 'stacks'): number {
    return this.bridge.estimateBridgeTime(from);
  }
}