import BridgeForm from '@/components/BridgeForm';
import SiteHeader from "@/components/SiteHeader";
import Container from "@/components/Container";
import EvmWalletControls from "@/components/EvmWalletControls";
import StacksWalletControls from "@/components/StacksWalletControls";

export default function BridgePage() {
  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <SiteHeader />
      <main>
        <Container className="py-10">
          <div className="max-w-4xl">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold tracking-tight">USDCx Bridge</h1>
              <p className="mt-2 text-sm text-zinc-400">
                Bridge USDC from Ethereum to Stacks using Circle&apos;s xReserve.
              </p>
            </div>

            <div className="mb-6 grid gap-4 md:grid-cols-2">
              <EvmWalletControls />
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-sm font-semibold text-zinc-100">Stacks wallet</h2>
                    <p className="mt-1 text-xs text-zinc-400">
                      Connect so we can use your Stacks address for the bridge destination.
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <StacksWalletControls />
                </div>
              </div>
            </div>

            <BridgeForm />

            <div className="mt-8 rounded-lg border border-zinc-800 bg-zinc-950 p-6">
              <h3 className="text-sm font-semibold text-zinc-100">How it works</h3>
              <ol className="mt-4 space-y-3 text-sm text-zinc-300">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-black text-xs font-semibold text-orange-400">
                    1
                  </span>
                  <span>
                    <strong className="text-zinc-100">Approve:</strong> Allow the xReserve contract to spend your USDC
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-black text-xs font-semibold text-orange-400">
                    2
                  </span>
                  <span>
                    <strong className="text-zinc-100">Deposit:</strong> Send USDC to the xReserve bridge contract
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-black text-xs font-semibold text-orange-400">
                    3
                  </span>
                  <span>
                    <strong className="text-zinc-100">Wait:</strong> The bridge processes your transaction (~3 minutes)
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-black text-xs font-semibold text-orange-400">
                    4
                  </span>
                  <span>
                    <strong className="text-zinc-100">Receive:</strong> USDCx is minted to your Stacks address
                  </span>
                </li>
              </ol>
            </div>
          </div>
        </Container>
      </main>
    </div>
  );
}
