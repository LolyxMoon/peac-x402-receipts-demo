# Draft Issue for coinbase/payments-mcp

**Title**: Add PEAC x402 Demo as Merchant Example

**Body**:

## Summary

We built a live x402-gated API that issues cryptographic PEAC-Receipts on every successful payment. It works out of the box with Payments MCP tools like `make_x402_request` and `check_payment_requirements`.

This can serve as a reference merchant implementation showing how publishers can:
- Expose x402-gated endpoints
- Issue verifiable receipts with policy snapshots
- Provide machine-readable discovery (peac.txt, OpenAPI)

## Live Demo

- URL: https://x402.peacprotocol.org
- Repo: https://github.com/peacprotocol/peac-x402-receipts-demo
- Protocol: https://github.com/peacprotocol/peac (v0.9.14)

## Integration with Payments MCP

Agents using MCP can:
1. Discover our API via OpenAPI: https://x402.peacprotocol.org/api/openapi.json
2. Call stateless checkout: `POST /api/shop/checkout-direct`
3. Receive 402 with x402 fields: `session_id`, `amount_usd`, `currency`, `chain`
4. MCP pays automatically via x402
5. Agent retries with proof
6. Receives 200 OK + `PEAC-Receipt` header (EdDSA-signed JWS)
7. Verify receipt: `POST /api/verify`

## Quick Test (curl)

```bash
# Step 1: Attempt checkout (expect 402)
curl -X POST https://x402.peacprotocol.org/api/shop/checkout-direct \
  -H "Content-Type: application/json" \
  -d '{"items":[{"sku":"sku_tea","qty":1}]}'

# Returns 402 with x402.session_id, x402.amount_usd, session_token

# Step 2: Pay via MCP or x402 CLI, get proof_id

# Step 3: Retry with proof (expect 200 + PEAC-Receipt)
curl -X POST https://x402.peacprotocol.org/api/shop/checkout-direct \
  -H "Content-Type: application/json" \
  -H "X-402-Session: <session_token>" \
  -H "X-402-Proof: <proof_id>" \
  -H "Idempotency-Key: test-1" \
  -d '{"items":[{"sku":"sku_tea","qty":1}]}'

# Returns 200 with order + PEAC-Receipt header
```

## Why This Helps the Ecosystem

MCP solves buyer infrastructure (wallets, onramps, payment execution). PEAC solves merchant infrastructure (receipts, policy binding, independent verification).

Together: end-to-end verifiable agent-to-agent commerce.

## Documentation

- Integration guide: https://x402.peacprotocol.org/docs/mcp-integration
- Discovery file: https://x402.peacprotocol.org/.well-known/peac.txt
- Policy snapshot: https://x402.peacprotocol.org/aipref.json

## Request

Add this demo to Payments MCP documentation as a merchant example showing:
- How to structure 402 responses for MCP compatibility
- How to issue verifiable receipts
- How to enable machine discovery

Happy to collaborate on documentation or examples.
