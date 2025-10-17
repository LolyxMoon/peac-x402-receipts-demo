import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700">
      {/* Header */}
      <header className="container mx-auto px-6 py-6">
        <nav className="flex items-center justify-between">
          <div className="text-white font-bold text-2xl">
            PEAC × x402
          </div>
          <div className="flex gap-4">
            <Link
              href="/.well-known/peac.txt"
              className="text-white/90 hover:text-white transition-colors"
            >
              peac.txt
            </Link>
            <Link
              href="/verify/offline"
              className="text-white/90 hover:text-white transition-colors"
            >
              Verify
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Verifiable Receipts for
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-pink-200">
              Paid API Calls
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
            Every <code className="bg-white/20 px-2 py-1 rounded">200 OK</code> comes with a cryptographic receipt.
            <br />
            Pay with x402 (Base/USDC) → Get proof of what you bought, from whom, under which policy.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/shop"
              className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all hover:scale-105 shadow-xl"
            >
              Try Human Checkout
            </Link>
            <Link
              href="#for-agents"
              className="bg-gradient-to-r from-yellow-400 to-pink-400 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-yellow-500 hover:to-pink-500 transition-all hover:scale-105 shadow-xl"
            >
              Agent API
            </Link>
            <Link
              href="#how-it-works"
              className="bg-white/10 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/20 transition-all border-2 border-white/30"
            >
              How It Works
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-white/90">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-3xl font-bold mb-2">HTTP 402</div>
              <div className="text-sm">Payment Required → x402 → Receipt</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-3xl font-bold mb-2">EdDSA</div>
              <div className="text-sm">Cryptographically signed receipts</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-3xl font-bold mb-2">Base/USDC</div>
              <div className="text-sm">Onchain payments, verifiable proofs</div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div id="how-it-works" className="max-w-5xl mx-auto mt-32">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '1',
                title: 'Discovery',
                description: 'Agent reads /.well-known/peac.txt to learn payment options, receipt policy, and public keys'
              },
              {
                step: '2',
                title: 'HTTP 402',
                description: 'API returns 402 Payment Required with session_id and amount (e.g., $0.05 USDC)'
              },
              {
                step: '3',
                title: 'Pay via x402',
                description: 'Agent pays on Base with USDC, gets proof_id from facilitator'
              },
              {
                step: '4',
                title: 'Get Receipt',
                description: '200 OK with PEAC-Receipt header: cryptographic proof of purchase, verifiable forever'
              }
            ].map((item) => (
              <div key={item.step} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-white/80 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* For Agents */}
        <div id="for-agents" className="max-w-5xl mx-auto mt-32">
          <h2 className="text-4xl font-bold text-white text-center mb-6">
            Agent-to-Agent Commerce
          </h2>
          <p className="text-xl text-white/90 text-center mb-12 max-w-3xl mx-auto">
            Autonomous agents can discover, purchase, and verify digital goods using machine-readable APIs.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-3">Discovery</h3>
              <p className="text-white/80 mb-4 text-sm">
                Start with <code className="bg-white/20 px-2 py-1 rounded text-xs">/.well-known/peac.txt</code> to learn payment options and policies.
              </p>
              <Link
                href="/.well-known/peac.txt"
                className="text-yellow-300 hover:text-yellow-200 text-sm font-medium"
              >
                View peac.txt →
              </Link>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-3">OpenAPI Spec</h3>
              <p className="text-white/80 mb-4 text-sm">
                Complete API documentation with schemas, endpoints, and examples.
              </p>
              <Link
                href="/api/openapi.json"
                className="text-yellow-300 hover:text-yellow-200 text-sm font-medium"
              >
                View OpenAPI →
              </Link>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-3">Documentation</h3>
              <p className="text-white/80 mb-4 text-sm">
                curl examples, headless buyer agent code, receipt format details.
              </p>
              <a
                href="https://github.com/peac/x402-demo/blob/main/docs/AGENT_TO_AGENT.md"
                className="text-yellow-300 hover:text-yellow-200 text-sm font-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Docs →
              </a>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-400/10 to-pink-400/10 backdrop-blur-lg rounded-xl p-8 border-2 border-yellow-400/30">
            <h3 className="text-2xl font-semibold text-white mb-4">Stateless Checkout Endpoint</h3>
            <p className="text-white/90 mb-4">
              <code className="bg-white/20 px-2 py-1 rounded">POST /api/shop/checkout-direct</code>
            </p>
            <p className="text-white/80 text-sm mb-4">
              No cart state required. Send items array, get 402 → pay via x402 → retry with proof → receive cryptographic receipt.
            </p>
            <div className="bg-black/30 rounded p-4 font-mono text-xs text-white/90 overflow-x-auto">
              <div className="mb-2"># Step 1: Attempt checkout</div>
              <div className="text-yellow-300">curl -X POST /api/shop/checkout-direct \</div>
              <div className="text-yellow-300 ml-4">  -d {`'{"items":[{"sku":"sku_tea","qty":1}]}'`}</div>
              <div className="mt-4 mb-2"># Step 2: Get session_id from 402 response, pay via x402</div>
              <div className="mt-4 mb-2"># Step 3: Retry with proof</div>
              <div className="text-pink-300">curl -X POST /api/shop/checkout-direct \</div>
              <div className="text-pink-300 ml-4">  -H {`"X-402-Session: $TOKEN"`} \</div>
              <div className="text-pink-300 ml-4">  -H {`"X-402-Proof: $PROOF_ID"`} \</div>
              <div className="text-pink-300 ml-4">  -d {`'{"items":[{"sku":"sku_tea","qty":1}]}'`}</div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-5xl mx-auto mt-32">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            Why PEAC Receipts?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: 'Portable Proofs',
                description: 'Receipts are self-contained JWS tokens. Verify anywhere with the public key.'
              },
              {
                title: 'Policy-Bound',
                description: 'Every receipt embeds the AIPREF snapshot: license terms, retention, refund policy.'
              },
              {
                title: 'Content Integrity',
                description: 'Response body SHA256 hash proves you got exactly what you paid for.'
              },
              {
                title: 'Rail-Agnostic',
                description: 'x402 today. Same receipt format works with any future payment rail.'
              }
            ].map((feature) => (
              <div key={feature.title} className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
                <h3 className="text-2xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-white/80">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-3xl mx-auto mt-32 text-center bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20">
          <h2 className="text-3xl font-bold text-white mb-4">
            Try It Now
          </h2>
          <p className="text-white/90 mb-8 text-lg">
            Complete a real checkout with $0.05 USDC demo payment,
            <br />
            get a cryptographic receipt, verify it instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shop"
              className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all hover:scale-105 shadow-xl"
            >
              Open Shop Demo
            </Link>
            <Link
              href="/verify/offline"
              className="bg-purple-500/50 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-purple-500/70 transition-all border-2 border-white/30"
            >
              Verify Offline
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="max-w-5xl mx-auto mt-32 pt-12 border-t border-white/20 text-center text-white/70">
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-6">
            <Link href="/.well-known/peac.txt" className="hover:text-white transition-colors">
              peac.txt
            </Link>
            <Link href="/aipref.json" className="hover:text-white transition-colors">
              aipref.json
            </Link>
            <Link href="/api/openapi.json" className="hover:text-white transition-colors">
              openapi.json
            </Link>
            <Link href="/api/verify" className="hover:text-white transition-colors">
              /api/verify
            </Link>
          </div>
          <p className="text-sm">
            PEAC Protocol v0.9.11 · Demo amounts: $0.01–$0.05 USDC on Base
          </p>
        </footer>
      </main>
    </div>
  );
}
