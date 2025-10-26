# Production Deployment Checklist v0.9.14-demo1

## Environment Variables (Vercel Production)

Required:
- `PUBLIC_ORIGIN=https://2larp402.vercel.app/`
- `PEAC_KID=peac-demo-key-1`
- `PEAC_PRIVATE_KEY_BASE64=<EdDSA private key>`
- `X402_CHAIN=base`
- `X402_CURRENCY=USDC`

Optional (for non-demo payments):
- `FACILITATOR_PAY_URL=<x402 facilitator endpoint>`
- `FACILITATOR_API_KEY=<facilitator auth token>`

Do NOT set in production:
- `DEMO_MODE` (must be absent or false)
- `NEXT_PUBLIC_DEMO_MODE` (must be absent or false)

## Pre-Deployment Verification

1. Build succeeds locally:
```bash
cd apps/vercel-next
npm run build
```

2. No TypeScript or ESLint errors
3. All routes generate successfully (16 expected)

## Post-Deployment Verification

Run smoke test:
```bash
./scripts/smoke-test.sh
```

Expected results:
- All 6 tests pass
- Catalog returns 3 items
- OpenAPI spec valid
- peac.txt ≤20 lines
- 402 flow works (session_id, amount_usd, currency, chain present)
- PEAC-Receipt header present on 200
- Receipt verifies with valid: true

## Artifacts Archive

Save test results to:
```
docs/artifacts/YYYY-MM-DD/
  - order.json
  - receipt.jws
  - verify.json
  - smoke-test-output.txt
```

## DNS and SSL

- Canonical: `https://2larp402.vercel.app/`
- Middleware redirects all non-canonical hosts (except localhost)
- SSL certificate valid and auto-renewing
- HSTS enabled

### www Subdomain Redirect Setup

To redirect www.x402.peacprotocol.org to x402.peacprotocol.org:

1. **DNS Configuration** (in your DNS provider, e.g., Namecheap):
   - Add CNAME record: `www` → `cname.vercel-dns.com`

2. **Vercel Domain Configuration**:
   - Go to Project Settings → Domains
   - Add domain: `www.x402.peacprotocol.org`
   - Set redirect to: `x402.peacprotocol.org` (308 Permanent)
   - Enable "Redirect to HTTPS"

3. **Verification**:
   ```bash
   curl -I https://www.x402.peacprotocol.org
   # Should return: 308 Permanent Redirect
   # Location: https://2larp402.vercel.app//
   ```

## Monitoring

Post-deployment:
- Check Vercel deployment logs for errors
- Verify analytics capture (if enabled)
- Confirm no 500s in first 24 hours

## Rollback Plan

If smoke test fails:
1. Revert deployment in Vercel dashboard
2. Check environment variables match checklist
3. Review build logs for missing dependencies
4. Re-deploy after fixing
