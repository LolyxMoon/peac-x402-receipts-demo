# x402 Micro-Grant Application

## Project Name
PEAC Protocol v0.9.14 - x402 Demo

## Applicant Information
- Name: [Your Name]
- Organization: PEAC Protocol / Originary
- Email: [your.email@example.com]
- X/Twitter: @[YourHandle]
- GitHub: @[YourGitHub]

## Project URLs
- Live Demo: https://2larp402.vercel.app/
- GitHub Repo: https://github.com/peacprotocol/peac-x402-receipts-demo
- Protocol Codebase: https://github.com/peacprotocol/peac (v0.9.14)
- Integration Docs: https://2larp402.vercel.app//docs/mcp-integration

## One-Paragraph Summary

Payments MCP equips buyer agents with wallets and x402 payment capability. PEAC is the merchant proof layer that turns every paid HTTP 200 into a portable, policy-bound, independently verifiable receipt. Use MCP to pay. Use PEAC to prove. This creates measurable value for publishers and enterprises that need auditability, policy binding, and content integrity on paid API responses.

## What is Live Today

1. **x402-Gated API**
   - Stateless 402 responses with session_id, amount_usd, currency, chain
   - Idempotency support for safe retries
   - Deterministic order_id generation

2. **PEAC-Receipt Issuance**
   - EdDSA-signed JWS receipts on every 200 OK
   - Receipt includes: payment proof_id, AIPREF policy snapshot, response SHA256 hash
   - Exposed via PEAC-Receipt header with CORS support

3. **Machine Discovery**
   - peac.txt at /.well-known/peac.txt
   - OpenAPI 3.0 spec at /api/openapi.json
   - AIPREF policy document at /aipref.json

4. **Independent Verification**
   - POST /api/verify endpoint
   - Public key at /public-keys/peac-demo-key-1.json
   - Receipts portable and verifiable anywhere

5. **MCP Compatibility**
   - Works with Payments MCP make_x402_request tool
   - Compatible with check_payment_requirements
   - Integration guide at /docs/mcp-integration

## Business Use Cases

### 1. Agent-to-Agent Commerce for Data and Tools
Paid API responses include a PEAC receipt with AIPREF snapshot and response hash. Ideal for paid data, paid actions, or per-call tools that agents chain together. Receipts prove delivery and policy adherence without trust.

### 2. Enterprise Audit Mode for Paid APIs
Security and compliance teams can verify receipts offline with only the public key. Receipts are portable and rail-agnostic, so future card rails require no format changes.

### 3. Marketplace Readiness with MCP
OpenAPI and peac.txt enable machine discovery. Payments MCP can discover requirements and pay. Publishers can list pricing and policy with receipts as evidence of delivery.

## Why This Helps the x402 Ecosystem

1. **Direct Protocol Alignment**
   - Implements x402 402-pay-retry pattern over HTTP
   - Uses USDC on Base for settlement
   - Exposes machine-readable discovery

2. **Buyer Synergy**
   - Works out of the box with Payments MCP
   - Compatible with MCP tools: check_payment_requirements, make_x402_request
   - No custom integration needed

3. **Merchant Infrastructure Gap**
   - MCP solves buyer-side (wallets, onramps, execution)
   - PEAC solves merchant-side (receipts, policy, verification)
   - Together: end-to-end verifiable commerce

4. **Adoption Catalyst**
   - As MCP grows, publishers will demand proof of delivery
   - PEAC receipts answer that without changing MCP
   - Reference implementation available for any publisher

## What We Will Ship with the Grant

1. **Three Production Paid Endpoints**
   - Catalog with paid items
   - Stateless checkout (already live)
   - Article/content access with per-request pricing
   - All issue PEAC-Receipts with AIPREF snapshots

2. **90-Second Agent-to-Agent Recording**
   - Shows Payments MCP on buyer side
   - Shows PEAC receipts on merchant side
   - Demonstrates full 402-pay-receipt-verify cycle
   - Highlights composite receipt for multi-step pipelines

3. **Composite Receipt Variant**
   - Multi-step receipt with steps[] array
   - Merkle root for step integrity
   - Showcases agent chaining use case
   - Schema at /schemas/peac-receipt.json

4. **Enhanced Documentation**
   - Complete integration guide for publishers
   - Golden test vectors for receipt verification
   - Example code for receipt generation
   - SBOM and provenance for releases

5. **Hardened Production Features**
   - Rate limiting and replay protection
   - Session TTL and proof reuse guards
   - Prometheus metrics export
   - OWASP ZAP baseline in CI

## Technical Specifications

- **Protocol**: x402 over HTTP with USDC on Base
- **Receipt Format**: EdDSA-signed JWS (RFC 7515)
- **Policy Binding**: AIPREF v0.9.14 snapshots
- **Content Integrity**: SHA256 response hashes
- **Discovery**: peac.txt (≤20 lines), OpenAPI 3.0
- **Verification**: Public key-based, offline-capable
- **Rail Agnostic**: x402 today, card rails tomorrow (same format)

## Open Source Commitment

- **License**: Apache-2.0
- **Repository**: https://github.com/peacprotocol/peac-x402-receipts-demo
- **Protocol Repo**: https://github.com/peacprotocol/peac
- **CONTRIBUTING.md**: Available
- **CODEOWNERS**: @peacprotocol

## Timeline

- Week 1: Complete production hardening (rate limits, metrics, SBOM)
- Week 2: Ship composite receipt schema and examples
- Week 3: Record 90-second demo video
- Week 4: Publish documentation and golden vectors

## Grant Request Amount

[Specify amount based on x402 micro-grant guidelines]

## Additional Notes

We are applying immediately after the Payments MCP launch (Oct 23, 2025) because we see the merchant proof layer as the natural complement to MCP's buyer infrastructure. Our demo is live, open source, and ready to serve as a reference for any publisher building x402-gated APIs.

The core insight: MCP pays. PEAC proves. Together they enable verifiable agent commerce at scale.

## Contact Preference

Email: [your.email@example.com]
X DM: @[YourHandle]
Availability: Weekdays 9am-5pm PT

---

**Attachments**:
- Live demo URL: https://2larp402.vercel.app/
- Smoke test results: docs/artifacts/[DATE]/
- Architecture diagram: (optional)
- Demo video: (when ready)
