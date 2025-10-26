# Vercel Next.js App - PEAC × x402

Production-ready Next.js 15 application with stateless HTTP 402 payments and PEAC receipts.

## Features

- **Stateless 402 sessions**: No database required
- **Serverless-friendly**: Works on Vercel Edge/Node runtimes
- **Landing page**: Beautiful gradient hero with features
- **Shop demo**: Cart checkout with x402 payments
- **Offline verifier**: Verify any PEAC receipt
- **Discovery endpoints**: `/.well-known/peac.txt`, public keys, AIPREF

## Quick Start

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your signing key
npm run dev
```

Visit http://localhost:3000

## Deploy to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/peacprotocol/peac-x402-receipts-demo&project-name=peac-x402-demo&repository-name=peac-x402-demo&root-directory=apps/vercel-next)

### Manual Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Variables

Configure in Vercel Dashboard (Settings → Environment Variables):

```env
PEAC_SIGNING_JWK={"crv":"Ed25519","d":"...","x":"...","kty":"OKP","alg":"EdDSA","use":"sig"}
PEAC_KID=peac-prod-key-1
DEMO_MODE=true
DEMO_TOKEN=demo-pay-ok-123
X402_CHAIN=base
X402_CURRENCY=USDC
PUBLIC_ORIGIN=https://2larp402.vercel.app/
NEXT_PUBLIC_ORIGIN=https://2larp402.vercel.app/
```

For production x402 payments:

```env
DEMO_MODE=false
FACILITATOR_VERIFY_URL=https://your-facilitator.com/verify
FACILITATOR_API_KEY=sk_x402_...
```

## Generate Production Keys

```bash
node -p "
const { generateKeyPair } = require('jose');
(async () => {
  const { publicKey, privateKey } = await generateKeyPair('EdDSA', { crv: 'Ed25519' });
  const jose = await import('jose');
  const priv = await jose.exportJWK(privateKey);
  const pub = await jose.exportJWK(publicKey);
  priv.kid = 'peac-prod-key-1';
  priv.alg = 'EdDSA';
  priv.use = 'sig';
  console.log('PEAC_SIGNING_JWK=' + JSON.stringify(priv));
})();
"
```

## Architecture

### Stateless Sessions

Session state is encoded in signed JWT tokens:

1. Client requests checkout → Server returns `402` with `session_token` (JWS)
2. Token contains: `{sid, subject, amount, currency, chain, issued_at}`
3. Client pays, gets `proof_id`
4. Client retries with `X-402-Session: <token>` + `X-402-Proof: <proof>`
5. Server verifies token signature + validates proof
6. Server returns `200 OK` with `PEAC-Receipt` header

Benefits:
- No database or Redis needed
- Horizontally scalable
- Works on serverless platforms
- No session cleanup required

### API Routes

- `GET /api/shop/catalog` - Product list
- `POST /api/shop/cart` - Create cart
- `POST /api/shop/cart/:id/add` - Add items
- `POST /api/shop/checkout` - Stateless 402 + receipt issuance
- `POST /api/verify` - Verify receipts
- `GET /.well-known/peac.txt` - PEAC discovery
- `GET /public-keys/:kid` - Public verification key

### Pages

- `/` - Landing page
- `/shop` - Cart checkout demo
- `/verify/offline` - Receipt verifier

## Domain Configuration

### Canonical Domain

Set `x402.peacprotocol.org` as primary domain in Vercel.

### Redirects

Configure in `vercel.json`:

```json
{
  "redirects": [
    {
      "source": "https://demo.peacprotocol.org/:path*",
      "destination": "https://2larp402.vercel.app//:path*",
      "permanent": true
    }
  ]
}
```

## Testing

```bash
# Test discovery
curl https://2larp402.vercel.app//.well-known/peac.txt

# Test 402 challenge
curl https://2larp402.vercel.app//api/shop/checkout \
  -H "Content-Type: application/json" \
  -d '{"cart_id":"cart_xyz"}'

# Test with demo token
curl -i https://2larp402.vercel.app//api/shop/checkout \
  -H "Content-Type: application/json" \
  -H "X-402-Session: <session_token>" \
  -H "X-402-Proof: demo-pay-ok-123" \
  -d '{"cart_id":"cart_xyz"}'
```

## Customization

### Add Products

Edit `lib/catalog.ts`:

```typescript
export const CATALOG: Product[] = [
  { sku: 'custom', title: 'Custom Product', price_usd: 0.10 },
];
```

### Update AIPREF

Edit `public/aipref.json` to reflect your policies.

### Branding

- Metadata: `app/layout.tsx`
- Landing page: `app/page.tsx`
- Colors: Tailwind config

## Performance

- API routes: Node.js runtime for crypto operations
- Static pages: Edge runtime
- CDN: Vercel Edge Network
- Caching: Public key and discovery endpoints cached

## Security

- Private keys in environment variables only
- EdDSA signatures (Ed25519)
- Session tokens time-bound
- No secrets in client code
- CORS headers on receipts

## Troubleshooting

### Key not found

Ensure `PEAC_SIGNING_JWK` is set correctly in Vercel environment variables.

### 402 verification fails

Check `FACILITATOR_VERIFY_URL` and `FACILITATOR_API_KEY` are correct for production mode.

### Build errors

Ensure Node.js 20+ is selected in Vercel project settings.

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Deployment](https://vercel.com/docs)
- [PEAC Protocol](https://peacprotocol.org)
