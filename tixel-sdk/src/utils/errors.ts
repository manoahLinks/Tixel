/**
 * Error handling utilities
 */

import { SDKError } from '../types';

/**
 * Check if error is an SDK error
 */
export function isSDKError(error: any): error is SDKError {
  return error instanceof SDKError;
}

/**
 * Format error for logging
 */
export function formatError(error: any): string {
  if (isSDKError(error)) {
    return `[${error.code}] ${error.message}`;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return String(error);
}

/**
 * Wrap unknown errors in SDKError
 */
export function wrapError(error: any, message?: string): SDKError {
  if (isSDKError(error)) {
    return error;
  }
  
  return new SDKError(
    message || 'An unexpected error occurred',
    'UNKNOWN_ERROR',
    { originalError: error }
  );
}