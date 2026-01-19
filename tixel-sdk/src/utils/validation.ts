/**
 * Validation utilities
 */

import { ValidationError } from '../types';

/**
 * Validate Stacks address
 * @param address Stacks address to validate
 * @returns true if valid
 */
export function validateStacksAddress(address: string): boolean {
  // Stacks addresses start with SP or ST and are 41 characters
  const stacksRegex = /^(SP|ST)[0-9A-Z]{39}$/;
  return stacksRegex.test(address);
}

/**
 * Validate Ethereum address
 * @param address Ethereum address to validate
 * @returns true if valid
 */
export function validateEthAddress(address: string): boolean {
  // Ethereum addresses start with 0x and are 42 characters
  const ethRegex = /^0x[0-9a-fA-F]{40}$/;
  return ethRegex.test(address);
}

/**
 * Validate amount is positive
 * @param amount Amount to validate
 * @throws ValidationError if invalid
 */
export function validateAmount(amount: number): void {
  if (amount <= 0) {
    throw new ValidationError('Amount must be greater than 0', { amount });
  }
  
  if (!Number.isFinite(amount)) {
    throw new ValidationError('Amount must be a finite number', { amount });
  }
}

/**
 * Validate network type
 * @param network Network to validate
 * @throws ValidationError if invalid
 */
export function validateNetwork(network: string): void {
  if (network !== 'mainnet' && network !== 'testnet') {
    throw new ValidationError(
      'Network must be "mainnet" or "testnet"',
      { network }
    );
  }
}