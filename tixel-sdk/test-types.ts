import { 
    AcceptPaymentParams, 
    CreateEscrowParams,
    // BridgeParams,
    formatAmount,
    parseAmount,
    validateStacksAddress,
    validateEthAddress
  } from './src/index';
  
  // Test types
  const payment: AcceptPaymentParams = {
    amount: 100_000_000,
    recipient: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
    metadata: { orderId: '123' }
  };
  
  const escrow: CreateEscrowParams = {
    amount: 1000_000_000,
    buyer: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
    seller: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE',
    releaseCondition: 'manual'
  };
  
  // Test utilities
  console.log('Format:', formatAmount(100_000_000));  // "100.00 USDCx"
  console.log('Parse:', parseAmount('50.5'));         // 50_500_000
  console.log('Valid Stacks:', validateStacksAddress('SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7'));
  console.log('Valid Eth:', validateEthAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'));
  
  console.log(payment, escrow)
  console.log('✅ All types working!');