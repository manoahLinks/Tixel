# Tixel

A cross-chain event ticketing platform that enables seamless ticket purchases on Stacks blockchain using USDC bridged from Ethereum.

## Overview

Tixel solves the problem of fragmented liquidity across blockchains by allowing users to bridge USDC from Ethereum and purchase event tickets on Stacks. The platform combines the security of Bitcoin (through Stacks) with the accessibility of Ethereum's ecosystem.

## Key Features

- **Cross-Chain Bridging**: Seamlessly bridge USDC from Ethereum to Stacks
- **Event Creation**: Organizers can create events with customizable ticket prices and supply
- **Ticket Purchasing**: Buy tickets using USDCx (USDC on Stacks)
- **NFT Tickets**: Each ticket is a unique, verifiable NFT
- **Transparent Sales**: All transactions recorded on-chain
- **Bitcoin Security**: Leverages Stacks' connection to Bitcoin for enhanced security

## How It Works

### For Attendees
1. Connect your wallet (Ethereum or Stacks)
2. Bridge USDC from Ethereum to Stacks (if needed)
3. Browse available events
4. Purchase tickets with USDCx
5. Receive your NFT ticket

### For Organizers
1. Create an event with details and ticket pricing
2. Set ticket supply and sale parameters
3. Manage sales through the platform
4. Withdraw proceeds in USDCx

## Tech Stack

- **Smart Contracts**: Clarity (Stacks blockchain)
- **Frontend**: React/Next.js, TypeScript
- **Styling**: Tailwind CSS
- **Wallets**: Leather Wallet (Stacks), MetaMask (Ethereum)
- **Bridge**: Ethereum-Stacks bridge protocol

## NPM Package: @tixel-sdk/usdcx

To simplify cross-chain development, I built an NPM package that makes it easy for developers to integrate Ethereum-Stacks bridging into their applications.

### Features
- Simple API for bridging USDC from Ethereum to Stacks
- Built-in transaction status tracking
- TypeScript support
- Minimal configuration required

### Installation
```bash
npm install @tixel-sdk/usdcx
```

### Quick Start
```typescript
import { USDCxBridge } from '@tixel-sdk/usdcx';

const bridge = new USDCxBridge('testnet');

// Bridge USDC from Ethereum to Stacks
await bridge.executeBridge({
  from: 'ethereum',
  to: 'stacks',
  amount: 100,
  ethAddress: '0x...',
  stacksAddress: 'SP...',
  onProgress: (status, info) => console.log(status, info.message)
}, walletClient);
```

This package abstracts the complexity of cross-chain bridging, allowing developers to focus on building great user experiences without worrying about the underlying bridge infrastructure.

## Project Structure

```
tixel/
├── contracts/           # Clarity smart contracts
│   ├── event-ticketing.clar # Event creation and ticket management
│   └── tickets.clar         # NFT ticket implementation
├── frontend/           # React application
│   ├── components/     # UI components
│   ├── hooks/          # Custom React hooks
│   └── lib/            # Shared logic and config
└── tixel-sdk/          # NPM package for bridging (@tixel-sdk/usdcx)
```

## Smart Contracts

### Event Contract
Manages event creation, ticket inventory, and sales. Key functions include:
- `create-event`: Create a new event with specified parameters
- `buy-ticket`: Purchase tickets using USDCx
- `get-event`: Retrieve event details
- `get-all-events`: Fetch all events

### Ticket NFT Contract
Handles NFT ticket minting and transfers for event access verification.

## Getting Started

### Prerequisites
- Node.js v18+
- Leather Wallet or Hiro Wallet (for Stacks)
- MetaMask (for Ethereum bridging)

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/tixel.git

# Install dependencies
cd tixel
npm install

# Set up environment variables
cp .env.example .env

# Run the development server
npm run dev
```

### Environment Variables
```
NEXT_PUBLIC_STACKS_NETWORK=testnet
NEXT_PUBLIC_CONTRACT_ADDRESS=ST...
NEXT_PUBLIC_ETHEREUM_RPC_URL=https://...
```

## Roadmap

- **Phase 1**: Core ticketing functionality with Ethereum bridging (Current)
- **Phase 2**: Secondary marketplace for ticket resales
- **Phase 3**: Support for additional chains (Polygon, Arbitrum, Base)
- **Phase 4**: Dynamic pricing and Dutch auctions
- **Phase 5**: Event attendance verification and POAPs

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

## Contact

For questions or support, please open an issue or reach out to the team.

---

**Tixel - Making event ticketing borderless**