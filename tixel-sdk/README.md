# @tixel-sdk/usdcx

USDCx payments SDK for Stacks. Easily accept payments, create escrows, and bridge assets between Ethereum and Stacks.

## Features

- **USDCx Bridge**: Simplified bridging between Ethereum and Stacks using Circle's xReserve.
- **Payments & Escrow**: Streamlined interface for handling USDCx payments and building escrow logic on Stacks.
- **Cross-Chain Utilities**: Built-in helpers for address validation, unit conversion, and transaction tracking.

## Installation

```bash
npm install @tixel-sdk/usdcx
```

## Quick Start

### Bridge USDCx (Ethereum to Stacks)

```typescript
import { USDCxBridge } from '@tixel-sdk/usdcx';

const bridge = new USDCxBridge('testnet');

// Execute bridge (requires a viem WalletClient)
const result = await bridge.executeBridge({
  from: 'ethereum',
  to: 'stacks',
  amount: 100, // 100 USDC
  ethAddress: '0x...',
  stacksAddress: 'SP...',
  onProgress: (status, info) => console.log(status, info.message)
}, walletClient);
```

### Validate Addresses

```typescript
import { validateEthAddress, validateStacksAddress } from '@tixel-sdk/usdcx';

validateEthAddress('0x...'); // true/false
validateStacksAddress('SP...'); // true/false
```

## Documentation

For detailed usage, check out the `docs/` folder or visit the [GitHub repository](https://github.com/manoahLinks/Tixel/tree/main/tixel-sdk).

## Developer

Developed by Mano <manoahluka@gmail.com>.
License: MIT
