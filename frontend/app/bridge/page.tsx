import BridgeForm from '@/components/BridgeForm';

export default function BridgePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            USDCx Bridge
          </h1>
          <p className="text-gray-600">
            Bridge USDC from Ethereum to Stacks using Circle's xReserve
          </p>
        </div>

        <BridgeForm />

        {/* Additional Info Section */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">How it works</h3>
          <ol className="space-y-3 text-sm text-gray-700">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                1
              </span>
              <span>
                <strong>Approve:</strong> Allow the xReserve contract to spend your USDC
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                2
              </span>
              <span>
                <strong>Deposit:</strong> Send USDC to the xReserve bridge contract
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                3
              </span>
              <span>
                <strong>Wait:</strong> The bridge processes your transaction (~3 minutes)
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                4
              </span>
              <span>
                <strong>Receive:</strong> USDCx is minted to your Stacks address
              </span>
            </li>
          </ol>
        </div>
      </div>
    </main>
  );
}
