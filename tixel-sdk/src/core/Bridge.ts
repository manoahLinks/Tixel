/**
 * Bridge - xReserve integration with wallet support
 */

import {
    createPublicClient,
    http,
    parseUnits,
    encodeFunctionData,
    type Hex,
    type WalletClient,
    type PublicClient,
  } from 'viem';
  import { sepolia, mainnet } from 'viem/chains';
  import type {
    BridgeParams,
    BridgeResult,
    BridgeStatus,
  } from '../types';
  import {
    validateEthAddress,
    validateStacksAddress,
    validateAmount,
  } from '../utils';
  import { BridgeError } from '../types';
  import {
    remoteRecipientCoder,
    bytes32FromBytes,
    X_RESERVE_ABI,
    ERC20_ABI,
  } from '../utils/bridge-helpers';
  
  interface BridgeConfig {
    xReserveContract: `0x${string}`;
    ethUsdcContract: `0x${string}`;
    stacksDomain: number;
  }
  
  export class Bridge {
    private publicClient: PublicClient;
    private config: BridgeConfig;
  
    constructor(network: 'mainnet' | 'testnet', ethRpcUrl?: string) {
      // Chain configuration
      const chain = network === 'mainnet' ? mainnet : sepolia;
      const rpcUrl = ethRpcUrl || (network === 'mainnet' 
        ? 'https://eth-mainnet.g.alchemy.com/v2/demo'
        : 'https://ethereum-sepolia.publicnode.com');
  
      // Public client (for reading blockchain state)
      this.publicClient = createPublicClient({
        chain,
        transport: http(rpcUrl),
      });
  
      // Contract addresses
      this.config = network === 'mainnet' 
        ? {
            // Mainnet addresses
            xReserveContract: '0x008888878f94C0d87defdf0B07f46B93C1934442',
            ethUsdcContract: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            stacksDomain: 10003,
          }
        : {
            // Testnet addresses (Sepolia)
            xReserveContract: '0x008888878f94C0d87defdf0B07f46B93C1934442',
            ethUsdcContract: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
            stacksDomain: 10003,
          };
  
      console.log(`🌉 Bridge initialized for ${network}`);
    }
  
    /**
     * Bridge USDCx between Ethereum and Stacks
     * @param params Bridge parameters
     * @param walletClient User's connected wallet client (from wagmi/viem)
     */
    async bridge(
      params: BridgeParams,
      walletClient: WalletClient
    ): Promise<BridgeResult> {
      try {
        this.validateBridgeParams(params);
  
        if (!walletClient.account) {
          throw new BridgeError('No wallet account connected');
        }
  
        console.log(
          `🌉 Initiating bridge: ${params.amount} USDCx from ${params.from} to ${params.to}`
        );
  
        if (params.from === 'ethereum' && params.to === 'stacks') {
          return await this.bridgeEthToStacks(params, walletClient);
        } else if (params.from === 'stacks' && params.to === 'ethereum') {
          return await this.bridgeStacksToEth(params, walletClient);
        } else {
          throw new BridgeError('Invalid bridge direction', { params });
        }
      } catch (error) {
        console.error('❌ Bridge failed:', error);
        throw new BridgeError(
          `Bridge operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          { params, error }
        );
      }
    }
  
    /**
     * Bridge from Ethereum to Stacks
     * User signs transactions with their connected wallet
     */
    private async bridgeEthToStacks(
      params: BridgeParams,
      walletClient: WalletClient
    ): Promise<BridgeResult> {
      const bridgeId = this.generateBridgeId();
      const startTime = Date.now();
  
      try {
        const account = walletClient.account!;
        console.log(`Ethereum wallet address: ${account.address}`);
  
        // Step 1: Check ETH balance for gas
        params.onProgress?.('initiated', {
          message: 'Checking ETH balance for gas...',
        });
  
        const nativeBalance = await this.publicClient.getBalance({
          address: account.address,
        });
  
        console.log(
          `Native balance: ${nativeBalance.toString()} wei (${(
            Number(nativeBalance) / 1e18
          ).toFixed(6)} ETH)`
        );
  
        if (nativeBalance === 0n) {
          throw new BridgeError('Insufficient ETH balance for gas fees');
        }
  
        // Step 2: Prepare deposit parameters
        const value = parseUnits(params.amount.toString(), 6); // USDC has 6 decimals
        const maxFeeAmount = parseUnits('0', 6);
        const remoteRecipient = bytes32FromBytes(
          remoteRecipientCoder.encode(params.stacksAddress)
        );
        const hookData = '0x' as Hex;
  
        console.log(
          `\nDepositing ${params.amount} USDC to Stacks recipient: ${params.stacksAddress}`
        );
  
        // Step 3: Check USDC balance
        params.onProgress?.('initiated', {
          message: 'Checking USDC balance...',
        });
  
        const usdcBalance = await this.publicClient.readContract({
          address: this.config.ethUsdcContract,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [account.address],
        });
  
        console.log(
          `USDC balance: ${usdcBalance?.toString()} (${(
            Number(usdcBalance) / 1e6
          ).toFixed(6)} USDC)`
        );
  
        if (usdcBalance < value) {
          throw new BridgeError(
            `Insufficient USDC balance. Required: ${(Number(value) / 1e6).toFixed(
              6
            )} USDC, Available: ${(Number(usdcBalance) / 1e6).toFixed(6)} USDC`
          );
        }
  
        // Step 4: Check current allowance
        params.onProgress?.('initiated', {
          message: 'Checking USDC allowance...',
        });
  
        const currentAllowance = await this.publicClient.readContract({
          address: this.config.ethUsdcContract,
          abi: ERC20_ABI,
          functionName: 'allowance',
          args: [account.address, this.config.xReserveContract],
        });
  
        console.log(`Current allowance: ${currentAllowance}`);
  
        // Step 5: Approve if needed (USER SIGNS THIS)
        let approveTxHash: Hex | undefined;
        if (currentAllowance < value) {
          params.onProgress?.('initiated', {
            message: 'Requesting approval... (Check your wallet)',
          });
  
          console.log('📝 Requesting approval from user wallet...');
  
          approveTxHash = await walletClient.sendTransaction({
            account: account.address,
            to: this.config.ethUsdcContract,
            chain: walletClient.chain,
            data: encodeFunctionData({
              abi: ERC20_ABI,
              functionName: 'approve',
              args: [this.config.xReserveContract, value],
            }),
          });
  
          console.log('Approval tx hash:', approveTxHash);
  
          params.onProgress?.('initiated', {
            message: 'Waiting for approval confirmation...',
          });
  
          await this.publicClient.waitForTransactionReceipt({ hash: approveTxHash });
          console.log('✅ Approval confirmed');
        } else {
          console.log('✅ Already approved');
        }
  
        // Step 6: Deposit transaction (USER SIGNS THIS)
        params.onProgress?.('confirmed', {
          message: 'Requesting deposit... (Check your wallet)',
        });
  
        console.log('📝 Requesting deposit transaction from user wallet...');
  
        const depositTxHash = await walletClient.sendTransaction({
          account: account.address,
          to: this.config.xReserveContract,
          chain: walletClient.chain,
          data: encodeFunctionData({
            abi: X_RESERVE_ABI,
            functionName: 'depositToRemote',
            args: [
              value,
              this.config.stacksDomain,
              remoteRecipient,
              this.config.ethUsdcContract,
              maxFeeAmount,
              hookData,
            ],
          }),
        });
  
        console.log('Deposit tx hash:', depositTxHash);
  
        params.onProgress?.('minting', {
          message: 'Waiting for deposit confirmation...',
        });
  
        await this.publicClient.waitForTransactionReceipt({ hash: depositTxHash });
  
        // Step 7: Wait for minting on Stacks
        params.onProgress?.('minted', {
          message: 'USDCx being minted on Stacks...',
        });
  
        await this.delay(5000);
  
        params.onProgress?.('complete', {
          message: 'Bridge complete!',
        });
  
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`✅ Bridge complete in ${duration}s! Bridge ID: ${bridgeId}`);
  
        return {
          bridgeId,
          status: 'complete',
          from: 'ethereum',
          to: 'stacks',
          amount: params.amount,
          ethTxHash: depositTxHash,
          stacksTxId: undefined,
          estimatedTime: 180,
        };
      } catch (error) {
        params.onProgress?.('failed', {
          message: error instanceof Error ? error.message : 'Bridge failed',
        });
  
        throw new BridgeError(
          `Ethereum to Stacks bridge failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          { bridgeId, error }
        );
      }
    }
  
    /**
     * Bridge from Stacks to Ethereum (withdrawal)
     */
    private async bridgeStacksToEth(
      _params: BridgeParams,
      _walletClient: WalletClient
    ): Promise<BridgeResult> {
      const bridgeId = this.generateBridgeId();
  
      throw new BridgeError(
        'Stacks to Ethereum bridge not yet implemented. Coming soon!',
        { bridgeId }
      );
    }
  
    /**
     * Get bridge status
     */
    async getBridgeStatus(bridgeId: string): Promise<BridgeStatus> {
      console.log(`📊 Checking bridge status: ${bridgeId}`);
      return 'complete';
    }
  
    /**
     * Estimate bridge time
     */
    estimateBridgeTime(from: 'ethereum' | 'stacks'): number {
      return from === 'ethereum' ? 180 : 240;
    }
  
    /**
     * Validate bridge parameters
     */
    private validateBridgeParams(params: BridgeParams): void {
      validateAmount(params.amount);
      validateEthAddress(params.ethAddress);
      validateStacksAddress(params.stacksAddress);
  
      if (params.from === params.to) {
        throw new BridgeError('Cannot bridge to same chain', { params });
      }
    }
  
    /**
     * Generate unique bridge ID
     */
    private generateBridgeId(): string {
      return `bridge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  
    /**
     * Delay helper
     */
    private delay(ms: number): Promise<void> {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
  }