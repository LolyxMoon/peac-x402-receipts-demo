# Express Demo - PEAC × x402

Quick Node.js/Express demonstration of HTTP 402 payments with PEAC receipts.

## Features

- Product catalog and shopping cart
- HTTP 402 payment challenge
- x402 payment integration (demo mode)
- PEAC-Receipt generation (EdDSA signed)
- Receipt verification endpoint
- Sales ledger

## Quick Start

```bash
npm install
npm run dev
```

Visit http://localhost:8787/shop

## Demo Mode

The server starts in demo mode by default. Use the proof token `demo-pay-ok-123` to simulate payments.

## Endpoints

- `GET /shop` - Shopping interface
- `GET /shop/catalog` - Product catalog
- `POST /shop/cart` - Create cart
- `POST /shop/cart/:id/add` - Add items
- `POST /shop/checkout` - Checkout (402 → payment → 200 + receipt)
- `POST /verify` - Verify receipts
- `GET /shop/ledger` - View sales ledger
- `GET /.well-known/peac.txt` - PEAC policy discovery
- `GET /public-keys/:kid.json` - Public verification key

## Testing

```bash
# Create cart
CART_ID=$(curl -s -X POST http://localhost:8787/shop/cart | jq -r .cart_id)

# Add items
curl -X POST "http://localhost:8787/shop/cart/$CART_ID/add" \
  -H "Content-Type: application/json" \
  -d '{"sku":"sku_tea","qty":1}'

# Checkout (get 402)
curl http://localhost:8787/shop/checkout \
  -H "Content-Type: application/json" \
  -d "{\"cart_id\":\"$CART_ID\"}"

# Pay and get receipt
curl -i http://localhost:8787/shop/checkout \
  -H "Content-Type: application/json" \
  -H "X-402-Session: <session_id>" \
  -H "X-402-Proof: demo-pay-ok-123" \
  -d "{\"cart_id\":\"$CART_ID\"}"
```

## Environment Variables

Create a `.env` file:

```env
DEMO_MODE=true
DEMO_TOKEN=demo-pay-ok-123
X402_AMOUNT_USD=0.01
X402_CURRENCY=USDC
X402_CHAIN=base
PORT=8787
PUBLIC_ORIGIN=http://localhost:8787
```

For production with real x402:

```env
DEMO_MODE=false
FACILITATOR_VERIFY_URL=https://your-facilitator.com/verify
FACILITATOR_API_KEY=sk_x402_...
```

## Key Generation

```bash
npm run keygen
```

This generates Ed25519 keypair in `keys/` directory.

## Architecture

- **Stateful sessions**: In-memory session store
- **Receipt signing**: EdDSA (Ed25519)
- **Payment verification**: x402 facilitator or demo mode
- **Response format**: JSON with `PEAC-Receipt` header

Perfect for:
- Local development
- Demo recordings
- Understanding the flow

For production deployment, see `../vercel-next/` (stateless, serverless-ready).
