# Deployment Guide

## Vercel Deployment

### 1. Configure Project Settings

In your Vercel project settings (https://vercel.com/your-org/peac-x402-receipts-demo/settings):

**General → Build & Development Settings:**
- **Root Directory:** `apps/vercel-next`
- **Framework Preset:** Next.js
- **Build Command:** `npm run build` (default)
- **Output Directory:** `.next` (default)
- **Install Command:** `npm install` (default)

### 2. Generate Ed25519 Keys

```bash
cd apps/express-demo
node keygen.mjs
```

This creates:
- `peac-demo-key-1.private.jwk.json` (keep secret)
- `peac-demo-key-1.public.jwk.json` (public)

Copy the **private key** contents for the next step.

### 3. Add Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

```bash
PEAC_SIGNING_JWK={"crv":"Ed25519","d":"YOUR_PRIVATE_KEY","x":"YOUR_PUBLIC_KEY","kty":"OKP","alg":"EdDSA","use":"sig"}
PEAC_KID=peac-demo-key-1
DEMO_MODE=true
DEMO_TOKEN=demo-pay-ok-123
X402_CHAIN=base
X402_CURRENCY=USDC
PUBLIC_ORIGIN=https://x402.peacprotocol.org
NEXT_PUBLIC_ORIGIN=https://x402.peacprotocol.org
```

**Production (when ready):**
```bash
DEMO_MODE=false
FACILITATOR_VERIFY_URL=https://your-facilitator.com/verify
FACILITATOR_API_KEY=sk_x402_your_key_here
```

### 4. Domain Configuration

**In Vercel:**
1. Go to Settings → Domains
2. Add domain: `x402.peacprotocol.org`
3. Configure DNS records as instructed

**In Namecheap (or your DNS provider):**
```
Type    Host    Value                          TTL
A       x402    76.76.21.21                   Automatic
CNAME   www     cname.vercel-dns.com          Automatic
```

### 5. Deploy

After configuring the above:

1. Go to Deployments → Redeploy
2. Select the latest deployment
3. Click "Redeploy" to trigger a new build with correct settings

### 6. Verify Deployment

Test these endpoints:

```bash
# Homepage
curl https://x402.peacprotocol.org/

# Catalog API
curl https://x402.peacprotocol.org/api/shop/catalog

# PEAC discovery
curl https://x402.peacprotocol.org/.well-known/peac.txt

# Public key
curl https://x402.peacprotocol.org/public-keys/peac-demo-key-1.json
```

## Troubleshooting

### 404 Errors on All Routes

**Cause:** Root Directory not set correctly

**Fix:**
- Go to Vercel Settings → General
- Set Root Directory to `apps/vercel-next`
- Redeploy

### Public Key Returns 404

**Cause:** `PEAC_SIGNING_JWK` environment variable missing

**Fix:**
- Add environment variable in Vercel dashboard
- Redeploy

### Build Fails with Type Errors

**Cause:** TypeScript strict mode errors

**Fix:**
- Ensure all dependencies are installed
- Check that turbopack is NOT in build command
- Build command should be: `npm run build`

## Local Development

```bash
cd apps/vercel-next
npm install
npm run dev
```

Server runs on http://localhost:3000

## Express Demo (for testing)

```bash
cd apps/express-demo
npm install
node keygen.mjs
node server.mjs
```

Server runs on http://localhost:8787
