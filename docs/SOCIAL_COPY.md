# Social Media Copy for v0.9.14 Launch

## X/Twitter Thread

### Tweet 1 (Main Announcement)
Applying for the x402 micro-grant. Our live demo pairs Payments MCP on the buyer side with PEAC receipts on the merchant side.

MCP pays. PEAC proves.

Portable, policy-bound receipts for any x402 endpoint.

Live: https://2larp402.vercel.app/
Repo: github.com/peacprotocol/peac-x402-receipts-demo

### Tweet 2 (Technical Details)
How it works:
1. Agent calls x402 endpoint
2. Gets 402 Payment Required
3. Payments MCP pays via USDC on Base
4. Agent retries with proof
5. Receives 200 OK + PEAC-Receipt (EdDSA-signed JWS)
6. Receipt proves: payment made, content delivered, policy bound

### Tweet 3 (Use Cases)
Three use cases we enable:

1. Agent-to-agent commerce with verifiable delivery
2. Enterprise audit trails for paid APIs
3. MCP marketplace readiness with OpenAPI discovery

All with independent verification. No trust required.

### Tweet 4 (Call to Action)
Open source (Apache-2.0). Reference implementation for any publisher building x402-gated APIs.

Try the demo: https://2larp402.vercel.app//docs/mcp-integration

Built on: @CoinbaseDev Payments MCP + x402 protocol

### Alternative Single Tweet
Just shipped v0.9.14: x402 demo with cryptographic receipts.

MCP pays. PEAC proves.

Every paid API call returns a verifiable receipt with policy snapshot and response hash. Works with Coinbase Payments MCP.

Live: https://2larp402.vercel.app/

## LinkedIn Post

**Payments MCP + PEAC: Verifiable Agent Commerce**

We just released v0.9.14 of our x402 demo, aligned with Coinbase's Payments MCP launch.

The insight: Payments MCP solves buyer infrastructure (wallets, onramps, payment execution). PEAC solves merchant infrastructure (receipts, policy binding, independent verification).

**What we built:**
- x402-gated API with stateless checkout
- EdDSA-signed receipts on every 200 OK
- Policy snapshots (AIPREF) in every receipt
- SHA256 response hashes for content integrity
- Public key verification (offline capable)

**Why it matters:**
As AI agents gain payment capability through MCP, publishers and enterprises will need verifiable proof of delivery. PEAC receipts provide that without requiring trust or centralized verification.

**Live demo:** https://2larp402.vercel.app/
**Open source:** github.com/peacprotocol/peac-x402-receipts-demo
**License:** Apache-2.0

Applying for the x402 micro-grant. Looking forward to helping build the agent commerce ecosystem.

## Hacker News Post

**Title:** Payments MCP pays. PEAC proves. Verifiable receipts for x402 APIs

**Body:**
We built a live demo of x402-gated APIs that issue cryptographic receipts on every paid response. It works out of the box with Coinbase's new Payments MCP (launched Oct 23).

The stack:
- x402 for payment discovery and execution
- USDC on Base for settlement
- EdDSA signatures for receipts
- AIPREF snapshots for policy binding
- SHA256 hashing for content integrity

The flow:
1. Agent discovers API via OpenAPI and peac.txt
2. Calls endpoint, gets 402 Payment Required
3. Payments MCP handles payment via x402
4. Agent retries with proof
5. Gets 200 OK + PEAC-Receipt header (JWS token)
6. Receipt can be verified offline with public key

Why this matters:
- MCP gives agents wallets and payment capability
- PEAC gives publishers verifiable proof of delivery
- Together: end-to-end auditable agent commerce

Use cases:
- Agent-to-agent commerce for data and tools
- Enterprise audit trails for paid APIs
- Marketplace readiness with machine discovery

Live demo: https://2larp402.vercel.app/
Source: https://github.com/peacprotocol/peac-x402-receipts-demo
License: Apache-2.0

We're applying for the x402 micro-grant. Feedback welcome.

## Product Hunt (If Applicable)

**Tagline:** Verifiable receipts for paid API calls

**Description:**
PEAC turns every paid API response into a cryptographic receipt. Works with Coinbase Payments MCP for agent-to-agent commerce.

**Key Features:**
- x402-gated endpoints with stateless checkout
- EdDSA-signed receipts on every 200 OK
- Policy snapshots (AIPREF) embedded in receipts
- SHA256 response hashes prove content integrity
- Offline verification with public keys
- OpenAPI discovery for agent compatibility
- Open source (Apache-2.0)

**Use Cases:**
- AI agents buying data, tools, and services
- Enterprise audit trails for paid APIs
- Marketplace listings with proof of delivery

**Tech Stack:**
Next.js, TypeScript, EdDSA, USDC on Base, x402 protocol

**Links:**
Website: https://2larp402.vercel.app/
GitHub: https://github.com/peacprotocol/peac-x402-receipts-demo
Docs: https://2larp402.vercel.app//docs/mcp-integration

## Email to @MurrLincoln (Coinbase)

**Subject:** x402 micro-grant application: PEAC Protocol v0.9.14

Hi Lincoln,

We are applying for an x402 micro-grant. Our live demo shows x402-gated API calls that return a PEAC receipt on every HTTP 200. The receipt binds who paid, for what, under which policy, with a response hash for integrity. It is independently verifiable with our public key.

**What is live today:**

- Merchant API at https://2larp402.vercel.app/ with peac.txt, OpenAPI, stateless 402, and verify
- Works with Payments MCP. Agents can call checkout-direct, hit 402, MCP pays via x402, then retry to receive a PEAC receipt
- Repo: https://github.com/peacprotocol/peac-x402-receipts-demo
- Protocol codebase is PEAC v0.9.14: https://github.com/peacprotocol/peac

**What we will ship with the grant:**

- Three public paid endpoints that issue receipts with AIPREF snapshots and response hashes
- A 90-second agent-to-agent recording that uses Payments MCP on the buyer side and PEAC on the merchant side
- Composite receipt variant for multi-step pipelines to showcase agent chaining

**Why this helps the ecosystem:**

MCP pays. PEAC proves. Publishers and enterprises get portable, verifiable proof without trusting the merchant. This accelerates real paid use cases for x402.

**Request:**
We are requesting the x402 micro-grant. Happy to share endpoints and the video immediately.

Best regards,
[Your Name]
Founder, PEAC Protocol
X: @[YourHandle]
Email: [your.email@example.com]

## Reddit (r/webdev, r/programming, r/crypto)

**Title:** Built an x402 demo with cryptographic receipts for agent commerce

**Body:**
Just released v0.9.14 of our x402 demo. It pairs Coinbase's new Payments MCP (buyer-side wallet) with PEAC receipts (merchant-side proof).

**Quick summary:**
- x402-gated API returns 402 Payment Required
- Payments MCP handles the payment (USDC on Base)
- API returns 200 OK with PEAC-Receipt header (EdDSA-signed JWS)
- Receipt includes: payment proof, policy snapshot, response SHA256
- Anyone can verify the receipt with the public key

**Why it's useful:**
- AI agents can autonomously purchase API calls
- Publishers get verifiable proof of delivery
- Enterprises get audit trails without trust

**Try it:**
- Live demo: https://2larp402.vercel.app/
- Docs: https://2larp402.vercel.app//docs/mcp-integration
- Source: https://github.com/peacprotocol/peac-x402-receipts-demo

Built with Next.js, TypeScript, EdDSA signatures. Apache-2.0 licensed.

Applying for the x402 micro-grant. Would love feedback from the community.
