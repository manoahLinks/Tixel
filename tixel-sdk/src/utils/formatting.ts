/**
 * Amount formatting utilities
 */

const USDCX_DECIMALS = 6;

/**
 * Convert micro-USDCx to human-readable format
 * @param amount Amount in micro-USDCx (e.g., 100_000_000)
 * @returns Formatted string (e.g., "100 USDCx")
 */
export function formatAmount(amount: number): string {
  const value = amount / Math.pow(10, USDCX_DECIMALS);
  return `${value.toFixed(2)} USDCx`;
}

/**
 * Convert human-readable amount to micro-USDCx
 * @param amount Human-readable amount (e.g., "100.50" or 100.5)
 * @returns Amount in micro-USDCx (e.g., 100_500_000)
 */
export function parseAmount(amount: string | number): number {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    throw new Error(`Invalid amount: ${amount}`);
  }
  
  return Math.floor(numAmount * Math.pow(10, USDCX_DECIMALS));
}

/**
 * Format timestamp to readable date
 * @param timestamp Unix timestamp
 * @returns Formatted date string
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toISOString();
}