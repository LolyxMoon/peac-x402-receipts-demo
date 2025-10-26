# Agent-to-Agent Commerce with x402

This document describes the agent-to-agent (A2A) transaction flow implemented in the PEAC x402 demo. Unlike traditional human-driven e-commerce, this flow allows autonomous agents to discover, pay for, and verify digital goods using HTTP 402 payment-required responses and cryptographic receipts.

## Overview

The A2A flow demonstrates:
- **Machine discovery**: Agents find API endpoints via `/.well-known/peac.txt` and `/api/openapi.json`
- **Stateless checkout**: No session state or cookies required
- **Payment proof**: On-chain x402 payments via Base/USDC
- **Cryptographic receipts**: EdDSA-signed JWS tokens proving the transaction
- **Verification**: Independent receipt verification without trusting the merchant

## Architecture

```
┌─────────────────┐                    ┌──────────────────┐
│  Buyer Agent    │                    │  Merchant API    │
│  (headless)     │                    │  (Next.js)       │
└────────┬────────┘                    └────────┬─────────┘
         │                                      │
         │ 1. GET /.well-known/peac.txt        │
         │────────────────────────────────────>│
         │                                      │
         │ 2. GET /api/shop/catalog             │
         │────────────────────────────────────>│
         │                                      │
         │ 3. POST /api/shop/checkout-direct    │
         │    {items: [{sku, qty}]}             │
         │────────────────────────────────────>│
         │                                      │
         │ 4. 402 Payment Required              │
         │    {x402: {session_id, amount_usd}}  │
         │<────────────────────────────────────│
         │                                      │
         │ 5. Pay via x402 (Base/USDC)          │
         │    → proof_id                        │
         │                                      │
         │ 6. POST /api/shop/checkout-direct    │
         │    Headers: X-402-Session, X-402-Proof│
         │────────────────────────────────────>│
         │                                      │
         │ 7. 200 OK + PEAC-Receipt (JWS)       │
         │    {order_id, items, totals}         │
         │<────────────────────────────────────│
         │                                      │
         │ 8. POST /api/verify                  │
         │    {receipt}                         │
         │────────────────────────────────────>│
         │                                      │
         │ 9. {valid: true, payload}            │
         │<────────────────────────────────────│
```

## Discovery

Agents start by fetching `/.well-known/peac.txt`:

```bash
curl https://2larp402.vercel.app//.well-known/peac.txt
```

Response:
```
# ≤20 lines, dev-phase: v0.9.11
preferences: /aipref.json
access_control: http-402
payments: [x402]
provenance: c2pa
receipts: required
verify: /api/verify
openapi: /api/openapi.json
public_keys: [{"kid":"peac-demo-key-1","alg":"EdDSA","key":"/public-keys/peac-demo-key-1.json"}]
```

Then fetch the OpenAPI specification:

```bash
curl https://2larp402.vercel.app//api/openapi.json
```

This returns a complete OpenAPI 3.0.1 spec describing all endpoints, request/response schemas, and required headers.

## Stateless Checkout Flow

### Step 1: Get catalog

```bash
curl https://2larp402.vercel.app//api/shop/catalog
```

Response:
```json
{
  "items": [
    {"sku": "sku_tea", "title": "Premium Green Tea", "price_usd": 0.50},
    {"sku": "sku_coffee", "title": "Artisan Coffee Beans", "price_usd": 1.00},
    {"sku": "sku_honey", "title": "Raw Organic Honey", "price_usd": 0.75}
  ]
}
```

### Step 2: Attempt checkout (expect 402)

```bash
curl -X POST https://2larp402.vercel.app//api/shop/checkout-direct \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"sku": "sku_tea", "qty": 1},
      {"sku": "sku_coffee", "qty": 1}
    ]
  }'
```

Response (402 Payment Required):
```json
{
  "x402": {
    "session_id": "wvRjHmE1tiiMMObN7wFLY",
    "amount_usd": 1.50,
    "currency": "USDC",
    "chain": "base"
  },
  "session_token": "eyJhbGc..."
}
```

The `session_token` is a signed JWS containing:
```json
{
  "sid": "wvRjHmE1tiiMMObN7wFLY",
  "subject": "direct-checkout",
  "amount": 1.50,
  "currency": "USDC",
  "chain": "base",
  "rail": "x402",
  "issued_at": "2025-10-17T14:07:11.685Z",
  "items_sha256": "0b8cdec5ff98924c7d8e311b3410781b4b4d940d0067dbe51eab9961fe1cf1e2"
}
```

### Step 3: Pay via x402

The agent pays using the x402 protocol (via CLI, facilitator, or demo token):

```bash
# Using demo mode (for testing)
PROOF_ID="demo-pay-ok-123"

# Using x402 CLI (production)
x402 pay --to https://2larp402.vercel.app//api/shop/checkout-direct \
  --session wvRjHmE1tiiMMObN7wFLY \
  --network base \
  --amount 1.50 \
  --currency USDC
# → proof_id: proof_abc123xyz
```

### Step 4: Complete checkout with proof

```bash
curl -X POST https://2larp402.vercel.app//api/shop/checkout-direct \
  -H "Content-Type: application/json" \
  -H "X-402-Session: eyJhbGc..." \
  -H "X-402-Proof: demo-pay-ok-123" \
  -H "Idempotency-Key: order-wvRjHmE1tiiMMObN7wFLY" \
  -d '{
    "items": [
      {"sku": "sku_tea", "qty": 1},
      {"sku": "sku_coffee", "qty": 1}
    ]
  }' \
  -i
```

Response (200 OK):
```
HTTP/2 200
content-type: application/json
peac-receipt: eyJhbGciOiJFZERTQSIsImtpZCI6InBlYWMtZGVtby1rZXktMSIsInR5cCI6InBlYWMtcmVjZWlwdCtqd3MifQ.eyJyZWNlaXB0X3ZlcnNpb24iOiIwLjkuMTEiLCJpc3N1ZWRfYXQiOiIyMDI1LTEwLTE3VDE0OjA3OjExLjY4NVoiLCJzdWJqZWN0IjoiZGlyZWN0LWNoZWNrb3V0Iiwi...
access-control-expose-headers: PEAC-Receipt

{
  "order_id": "ord_0b8cdec5ff",
  "items": [
    {"sku": "sku_tea", "title": "Premium Green Tea", "price": 0.50, "qty": 1},
    {"sku": "sku_coffee", "title": "Artisan Coffee Beans", "price": 1.00, "qty": 1}
  ],
  "totals": {
    "subtotal": 1.50,
    "tax": 0.00,
    "grand_total": 1.50
  },
  "created_at": "2025-10-17T14:07:11.685Z"
}
```

### Step 5: Verify receipt

```bash
curl -X POST https://2larp402.vercel.app//api/verify \
  -H "Content-Type: application/json" \
  -d '{
    "receipt": "eyJhbGciOiJFZERTQSIsImtpZCI6InBlYWMtZGVtby1rZXktMSIsInR5cCI6InBlYWMtcmVjZWlwdCtqd3MifQ..."
  }'
```

Response:
```json
{
  "valid": true,
  "header": {
    "alg": "EdDSA",
    "kid": "peac-demo-key-1",
    "typ": "peac-receipt+jws"
  },
  "payload": {
    "receipt_version": "0.9.11",
    "issued_at": "2025-10-17T14:07:11.685Z",
    "subject": "direct-checkout",
    "request": {
      "method": "POST",
      "path": "/api/shop/checkout-direct",
      "query": ""
    },
    "response": {
      "status": 200,
      "body_sha256": "0b8cdec5ff98924c7d8e311b3410781b4b4d940d0067dbe51eab9961fe1cf1e2"
    },
    "payment": {
      "rail": "x402",
      "amount": 1.50,
      "currency": "USDC",
      "chain": "base",
      "proof_id": "demo-pay-ok-123",
      "session_id": "wvRjHmE1tiiMMObN7wFLY",
      "payer": "demo-payer"
    },
    "policy": {
      "aipref_url": "https://2larp402.vercel.app//aipref.json",
      "aipref_snapshot": {
        "version": "0.9.11",
        "purpose": ["paid-access", "auditability"],
        "retention": {"max_days": 0},
        "sharing": {"third_parties": false},
        "payment": {"rail": "x402", "chain": "base", "currency": "USDC"},
        "security": {"sign": true, "verify": true}
      }
    },
    "provenance": {
      "c2pa": null
    },
    "verify_url": "https://2larp402.vercel.app//api/verify"
  }
}
```

## Receipt Contents

The PEAC receipt is a cryptographically signed JWT (JWS) that proves:

1. **What was purchased**: `body_sha256` hash of the order JSON
2. **When it happened**: `issued_at` timestamp
3. **Who paid**: `payment.payer` identifier
4. **How much**: `payment.amount`, `payment.currency`, `payment.chain`
5. **Payment proof**: `payment.proof_id` from x402 on-chain transaction
6. **Merchant policy**: Snapshot of AI preferences at transaction time
7. **Verification**: Independently verifiable via public key

The receipt can be verified by:
- Checking the EdDSA signature against the merchant's public key
- Verifying the `body_sha256` matches the order JSON
- Confirming the `proof_id` exists on-chain (Base blockchain)
- Validating the `session_id` matches the payment session

## Running the Headless Buyer Agent

### Setup

```bash
cd agents/headless-buyer
npm install
cp .env.example .env
```

Edit `.env` to configure:

```bash
# Merchant URL
MERCHANT_ORIGIN=https://2larp402.vercel.app/

# Payment mode: 'cli' or 'facilitator' or use DEMO_PROOF
PAY_MODE=cli

# For demo/testing only
DEMO_PROOF=demo-pay-ok-123

# x402 CLI settings (if PAY_MODE=cli)
X402_BIN=x402
X402_CURRENCY=USDC
X402_CHAIN=base

# Output directory
OUT_DIR=out
```

### Run

```bash
npm start
```

The agent will:
1. Discover the merchant API via `peac.txt`
2. Fetch the product catalog
3. Select first 2 items
4. Attempt checkout and receive 402
5. Pay via configured method (demo/CLI/facilitator)
6. Retry checkout with payment proof
7. Save artifacts to `out/`:
   - `order.json` - Order details
   - `receipt.jws` - Cryptographic receipt
   - `verify.json` - Receipt verification result
   - `provenance.json` - SHA256 hashes for audit trail

### Example Output

```
== Headless buyer agent ==
Merchant: https://2larp402.vercel.app/
peac.txt:
 # ≤20 lines, dev-phase: v0.9.11
preferences: /aipref.json
access_control: http-402
payments: [x402]
...

Selected items: sku_tea (Premium Green Tea), sku_coffee (Artisan Coffee Beans)
402 session: wvRjHmE1tiiMMObN7wFLY amount: 1.5
Using DEMO_PROOF token (for sandbox only).
proof_id: demo-pay-ok-123
Order: ord_0b8cdec5ff grand_total= 1.5
PEAC-Receipt (JWS) saved to out/receipt.jws
verify: true [Valid]
Verification saved to out/verify.json
Provenance saved: {
  order_sha256: '0b8cdec5ff98924c7d8e311b3410781b4b4d940d0067dbe51eab9961fe1cf1e2',
  receipt_sha256: 'a7f3e...',
  verified_at: '2025-10-17T14:07:15.123Z'
}
```

## Key Differences from Human Flow

| Human Flow | Agent Flow |
|------------|------------|
| Browser UI, cart state | Headless, stateless API |
| Cookies, sessions | Signed JWT tokens |
| Credit card forms | x402 on-chain payment |
| Email receipts | Cryptographic JWS receipts |
| Trust merchant | Verify independently |
| Manual discovery | Machine-readable `peac.txt` + OpenAPI |

## Security Properties

1. **Stateless sessions**: No server-side state, all session data in signed tokens
2. **Items integrity**: `items_sha256` prevents item substitution between 402 and payment
3. **Idempotency**: Safe retries using `Idempotency-Key` header
4. **Non-repudiation**: Merchant cannot deny issuing receipt (EdDSA signature)
5. **Auditability**: SHA256 hashes create provenance chain
6. **Independent verification**: Anyone with public key can verify receipt

## Production Considerations

For production deployments:

1. **Payment verification**: Connect to real x402 facilitator (set `FACILITATOR_VERIFY_URL` and `FACILITATOR_API_KEY`)
2. **Key management**: Store signing keys in secure vault (not env vars)
3. **Rate limiting**: Add rate limits to prevent abuse
4. **Monitoring**: Track 402 sessions, payment conversions, receipt verifications
5. **C2PA provenance**: Embed content provenance metadata (currently null)
6. **Expiration**: Add expiration times to session tokens
7. **Amount validation**: Verify `amount_usd` matches catalog prices server-side

## Demo Mode

For testing without real payments, set:

```bash
DEMO_MODE=true
DEMO_TOKEN=demo-pay-ok-123
```

The merchant will accept `demo-pay-ok-123` as valid payment proof. Remove these for production.

## Further Reading

- PEAC Protocol: https://peacprotocol.org
- x402 Specification: https://x402.org
- OpenAPI 3.0: https://swagger.io/specification/
- EdDSA (Ed25519): https://ed25519.cr.yp.to/
- Base Chain: https://base.org
