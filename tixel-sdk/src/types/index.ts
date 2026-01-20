/**
 * Core type definitions for USDCx SDK
 */

// ============================================================================
// SDK Configuration
// ============================================================================

export interface SDKConfig {
    network: 'mainnet' | 'testnet';
    stacksApiUrl?: string;
    contractAddress?: string;
    ethRpcUrl?: string;
  }
  
  export type NetworkType = 'mainnet' | 'testnet';
  
  // ============================================================================
  // Payment Types
  // ============================================================================
  
  export interface AcceptPaymentParams {
    amount: number;              // Amount in micro-USDCx (6 decimals)
    recipient: string;           // Stacks address (SP...)
    senderAddress?: string;      // Optional sender address
    metadata?: Record<string, any>;  // Custom metadata
    memo?: string;              // On-chain memo (optional)
  }
  
  export interface PaymentResult {
    txid: string;
    status: PaymentStatus;
    amount: number;
    recipient: string;
    sender?: string;
    timestamp: number;
    metadata?: Record<string, any>;
  }
  
  export type PaymentStatus = 'pending' | 'confirmed' | 'failed';
  
  // ============================================================================
  // Escrow Types
  // ============================================================================
  
  export interface CreateEscrowParams {
    amount: number;
    buyer: string;              // Stacks address
    seller: string;             // Stacks address
    arbiter?: string;           // Optional third party
    releaseCondition: ReleaseCondition;
    timelock?: number;          // Seconds until auto-release (optional)
    metadata?: Record<string, any>;
  }
  
  export type ReleaseCondition = 'manual' | 'time-locked' | 'milestone';
  
  export interface Escrow {
    escrowId: string;
    amount: number;
    buyer: string;
    seller: string;
    arbiter?: string;
    status: EscrowStatus;
    releaseCondition: ReleaseCondition;
    createdAt: number;
    releasedAmount: number;
    metadata?: Record<string, any>;
  }
  
  export type EscrowStatus = 'active' | 'released' | 'refunded' | 'disputed';
  
  export interface ReleaseEscrowParams {
    amount?: number;            // Optional: partial release
    releaseType: 'full' | 'partial';
    metadata?: Record<string, any>;
  }
  
  export interface RefundEscrowParams {
    reason?: string;
    metadata?: Record<string, any>;
  }
  
  // ============================================================================
  // Bridge Types
  // ============================================================================
  
  export interface BridgeParams {
    from: 'ethereum' | 'stacks';
    to: 'ethereum' | 'stacks';
    amount: number;             // Human-readable amount (not micro)
    ethAddress: string;         // Ethereum address (0x...)
    stacksAddress: string;      // Stacks address (SP...)
    onProgress?: (status: BridgeStatus, details?: BridgeProgressDetails) => void;
  }
  
  export interface BridgeResult {
    bridgeId: string;
    status: BridgeStatus;
    from: 'ethereum' | 'stacks';
    to: 'ethereum' | 'stacks';
    amount: number;
    ethTxHash?: string;
    stacksTxId?: string;
    estimatedTime?: number;     // Seconds
  }
  
  export type BridgeStatus = 
    | 'initiated' 
    | 'confirmed' 
    | 'minting' 
    | 'minted' 
    | 'complete' 
    | 'failed';
  
  export interface BridgeProgressDetails {
    confirmations?: number;
    requiredConfirmations?: number;
    message?: string;
  }
  
  // ============================================================================
  // Transaction Types
  // ============================================================================
  
  export interface Transaction {
    txid: string;
    type: TransactionType;
    amount: number;
    from?: string;
    to?: string;
    status: TransactionStatus;
    timestamp: number;
    blockHeight?: number;
    metadata?: Record<string, any>;
  }
  
  export type TransactionType = 'payment' | 'escrow' | 'bridge' | 'refund';
  export type TransactionStatus = 'pending' | 'confirmed' | 'failed';
  
  export interface QueryOptions {
    limit?: number;
    offset?: number;
    type?: TransactionType;
    status?: TransactionStatus;
  }
  
  // ============================================================================
  // Error Types
  // ============================================================================
  
  export class SDKError extends Error {
    constructor(
      message: string,
      public code: string,
      public details?: any
    ) {
      super(message);
      this.name = 'SDKError';
    }
  }
  
  export class PaymentError extends SDKError {
    constructor(message: string, details?: any) {
      super(message, 'PAYMENT_ERROR', details);
      this.name = 'PaymentError';
    }
  }
  
  export class EscrowError extends SDKError {
    constructor(message: string, details?: any) {
      super(message, 'ESCROW_ERROR', details);
      this.name = 'EscrowError';
    }
  }
  
  export class BridgeError extends SDKError {
    constructor(message: string, details?: any) {
      super(message, 'BRIDGE_ERROR', details);
      this.name = 'BridgeError';
    }
  }
  
  export class ValidationError extends SDKError {
    constructor(message: string, details?: any) {
      super(message, 'VALIDATION_ERROR', details);
      this.name = 'ValidationError';
    }
  }
  
  // ============================================================================
  // Utility Types
  // ============================================================================
  
  export interface Balance {
    address: string;
    amount: number;             // In micro-USDCx
    formatted: string;          // Human-readable (e.g., "100.50 USDCx")
  }