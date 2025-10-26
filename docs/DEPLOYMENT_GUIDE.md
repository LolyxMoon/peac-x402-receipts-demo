# Deployment Guide: v0.9.14-demo1

## Pre-Deployment Steps

### 1. Verify Local Build
```bash
cd apps/vercel-next
npm install
npm run build
```

Expected: No TypeScript or ESLint errors. All 16 routes generate successfully.

### 2. Run Smoke Test Locally
```bash
cd ../..
chmod +x scripts/smoke-test.sh
./scripts/smoke-test.sh
```

Expected: All 6 tests pass.

### 3. Review Changes
```bash
git status
git diff
```

Review all modified and new files.

## Commit and Tag Release

### 1. Stage Changes
```bash
git add .
```

### 2. Commit with Release Message
```bash
git commit -m "release: v0.9.14-demo1 - MCP integration + CI smoke tests

- Add Works with Payments MCP section and integration guide
- Update all version strings to v0.9.14
- Add copy buttons for curl and receipt JWS
- Create CI smoke test (6 tests: catalog, OpenAPI, peac.txt, 402 flow, receipt, verify)
- Add GitHub Actions workflow for automated testing
- Create production checklist and grant application materials
- Fix: Remove em-dashes from user-facing text
- Docs: Add COINBASE_MCP_ISSUE.md, X402_GRANT_APPLICATION.md, SOCIAL_COPY.md
"
```

### 3. Create Git Tag
```bash
git tag -a v0.9.14-demo1 -m "Release v0.9.14-demo1: MCP integration and CI smoke tests"
```

### 4. Push to Remote
```bash
git push origin main
git push origin v0.9.14-demo1
```

## Vercel Production Deployment

### 1. Verify Environment Variables

Go to Vercel dashboard > peac-x402-receipts-demo > Settings > Environment Variables

Required for Production:
- `PUBLIC_ORIGIN` = `https://2larp402.vercel.app/`
- `PEAC_KID` = `peac-demo-key-1`
- `PEAC_PRIVATE_KEY_BASE64` = [your EdDSA private key]
- `X402_CHAIN` = `base`
- `X402_CURRENCY` = `USDC`

Optional (for non-demo payments):
- `FACILITATOR_PAY_URL` = [x402 facilitator endpoint]
- `FACILITATOR_API_KEY` = [facilitator auth token]

Must NOT be set:
- `DEMO_MODE` (omit or set to empty)
- `NEXT_PUBLIC_DEMO_MODE` (omit or set to empty)

### 2. Deploy

Vercel will auto-deploy on push to main, or trigger manually:
- Go to Vercel dashboard
- Click "Redeploy" on latest deployment
- Select "Production" environment
- Click "Redeploy"

### 3. Wait for Deployment

Watch build logs. Expected: Build succeeds, all routes generated, no errors.

## Post-Deployment Verification

### 1. Run Smoke Test Against Production
```bash
BASE_URL=https://2larp402.vercel.app/ ./scripts/smoke-test.sh
```

Expected output:
```
✅ All tests passed!

Summary:
  ✓ Catalog endpoint working
  ✓ OpenAPI spec available
  ✓ peac.txt discoverable
  ✓ 402 payment flow working
  ✓ PEAC-Receipt issued on payment
  ✓ Receipt verification working
```

### 2. Save Artifacts
```bash
# Create dated directory
DATE=$(date +%Y-%m-%d)
mkdir -p docs/artifacts/$DATE

# Save smoke test output
BASE_URL=https://2larp402.vercel.app/ ./scripts/smoke-test.sh > docs/artifacts/$DATE/smoke-test-output.txt

# Save sample order and receipt (from headless buyer agent)
cd agents/headless-buyer
rm -rf out/
npm start
cp out/order.json ../../docs/artifacts/$DATE/
cp out/receipt.jws ../../docs/artifacts/$DATE/
cp out/verify.json ../../docs/artifacts/$DATE/
cd ../..

# Commit artifacts
git add docs/artifacts/$DATE/
git commit -m "docs: add v0.9.14-demo1 deployment artifacts ($DATE)"
git push
```

### 3. Manual Verification Checklist

Visit in browser:
- [ ] Homepage loads: https://2larp402.vercel.app/
- [ ] MCP section visible with NEW badge
- [ ] Copy button works on curl example
- [ ] Navigation to /docs/mcp-integration works
- [ ] Integration guide renders correctly
- [ ] Shop demo loads: https://2larp402.vercel.app//shop
- [ ] Verify page loads: https://2larp402.vercel.app//verify/offline
- [ ] peac.txt accessible: https://2larp402.vercel.app//.well-known/peac.txt
- [ ] OpenAPI accessible: https://2larp402.vercel.app//api/openapi.json
- [ ] Footer shows v0.9.14

## GitHub Release

### 1. Create Release on GitHub

Go to: https://github.com/peacprotocol/peac-x402-receipts-demo/releases/new

- Tag: v0.9.14-demo1
- Title: Release v0.9.14-demo1: MCP Integration
- Description: Copy from docs/RELEASE_NOTES_v0.9.14-demo1.md
- Attach artifacts: docs/artifacts/[DATE]/*.{json,jws,txt}
- Click "Publish release"

## Outreach

### 1. Post on X/Twitter
Use thread from docs/SOCIAL_COPY.md (X/Twitter Thread section)

### 2. Email Lincoln at Coinbase
Use email template from docs/SOCIAL_COPY.md (Email to @MurrLincoln section)

Fill in:
- [Your Name]
- @[YourHandle]
- [your.email@example.com]

### 3. Create Issue on coinbase/payments-mcp

Go to: https://github.com/coinbase/payments-mcp/issues/new

Copy body from: docs/COINBASE_MCP_ISSUE.md

### 4. Submit x402 Grant Application

Use docs/X402_GRANT_APPLICATION.md as template

Fill in:
- [Your Name]
- [your.email@example.com]
- @[YourHandle]
- @[YourGitHub]
- [Specify amount based on grant guidelines]

Submit via x402 grant portal (when available) or email to designated address.

## Recording Demo Video

### 1. Setup
- Clean terminal: `cd agents/headless-buyer && rm -rf out/ && clear`
- Open browser: https://2larp402.vercel.app/
- Position: Browser (left 50%), Terminal (right 50%)
- Start recording (QuickTime: Cmd+Shift+5)

### 2. Script (60-90 seconds)

**Part 1: Homepage (15s)**
- Scroll to "Works with Payments MCP" section
- Highlight: "MCP pays. PEAC proves."

**Part 2: Terminal Demo (35s)**
```bash
pwd
# Shows: .../agents/headless-buyer
npm start
# Wait for completion, show all output
```

**Part 3: Artifacts (15s)**
```bash
ls -lh out/
cat out/order.json
# Quick view of verify.json
```

**Part 4: Close (5s)**
Narrate: "MCP gives agents wallets. PEAC gives merchants receipts. Together: verifiable agent commerce."

### 3. Export and Share
- Save as: peac-x402-demo-v0.9.14.mov
- Upload to: YouTube, X/Twitter, LinkedIn
- Add to GitHub release

## Monitoring

### First 24 Hours

Monitor:
- Vercel deployment logs (check for errors)
- Analytics (if enabled)
- GitHub Actions smoke test (runs daily at 9am UTC)
- Social media responses

### Known Limitations

Document in README if asked:
- Demo uses DEMO_PROOF token (not real x402 payments)
- Single EdDSA key (no rotation)
- No rate limiting yet (coming in v0.9.15)
- No composite receipts yet (coming in v0.9.15)

## Rollback Plan

If critical issues discovered:

1. Revert in Vercel:
   - Go to Deployments tab
   - Find previous working deployment
   - Click "Redeploy"

2. Revert Git:
```bash
git revert v0.9.14-demo1
git push
```

3. Notify users via X/Twitter if downtime occurred

## Success Metrics

Track over first week:
- [ ] Smoke test passes daily
- [ ] GitHub stars/forks increase
- [ ] X/Twitter engagement (likes, retweets, replies)
- [ ] Coinbase team acknowledgment
- [ ] Grant application confirmation received
- [ ] At least 1 community PR or issue filed

## Support

If issues arise:
- Check Vercel logs first
- Run smoke test to isolate failing component
- Review docs/PRODUCTION_CHECKLIST.md
- Check environment variables match requirements
- Test locally with same config

## Next Steps (Post-Launch)

Queue for v0.9.15:
- Rate limiting and replay protection
- Prometheus metrics
- OWASP ZAP baseline
- Composite receipt schema
- SBOM generation
- Key rotation documentation
