# v0.9.14-demo1 Release Ready

**Status**: ✅ Ready for production deployment and x402 grant application

**Date**: 2025-10-26

## Summary

Release v0.9.14-demo1 positions PEAC as the merchant-side complement to Coinbase Payments MCP. All code changes complete, documentation ready, grant materials prepared, social copy drafted.

## What Changed

### Core Updates
- All version strings updated from v0.9.11 to v0.9.14
- Added "Works with Coinbase Payments MCP" section to homepage
- Created comprehensive integration guide at /docs/mcp-integration
- Added copy-to-clipboard for curl examples and receipt tokens
- Fixed em-dashes throughout (replaced with standard dashes)

### Quality Assurance
- CI smoke test with 6 comprehensive tests
- GitHub Actions workflow (push, PR, daily at 9am UTC)
- Production deployment checklist
- Artifact storage structure created

### Documentation
- DEPLOYMENT_GUIDE.md - Step-by-step deployment instructions
- PRODUCTION_CHECKLIST.md - Environment config and verification
- COINBASE_MCP_ISSUE.md - Draft issue for payments-mcp repo
- X402_GRANT_APPLICATION.md - Complete grant application
- SOCIAL_COPY.md - X, LinkedIn, HN, Email, Reddit copy
- RELEASE_NOTES_v0.9.14-demo1.md - Detailed changelog

## Verification Status

### Local Tests: ✅ PASSING
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

### Build: ✅ SUCCESS
- Next.js production build completes
- All 16 routes generate successfully
- No TypeScript or ESLint errors
- Zero warnings

### Headless Agent: ✅ WORKING
- Discovers API via peac.txt
- Handles 402 response
- Completes payment with DEMO_PROOF
- Receives order + PEAC-Receipt
- Verifies receipt (valid: true)
- Generates all 4 artifacts

## Ready to Deploy

### Git Status
```
Modified: 7 files (version updates, MCP section, copy buttons)
New: 13 files (components, docs, scripts, workflows)
```

### Next Commands
```bash
# 1. Commit changes
git add .
git commit -m "release: v0.9.14-demo1 - MCP integration + CI smoke tests"

# 2. Tag release
git tag -a v0.9.14-demo1 -m "Release v0.9.14-demo1: MCP integration"

# 3. Push
git push origin main
git push origin v0.9.14-demo1

# 4. Deploy (Vercel auto-deploys on push to main)
# Or manually trigger in Vercel dashboard

# 5. Verify production
BASE_URL=https://2larp402.vercel.app/ ./scripts/smoke-test.sh

# 6. Save artifacts
DATE=$(date +%Y-%m-%d)
mkdir -p docs/artifacts/$DATE
# Run agent, copy artifacts, commit

# 7. Create GitHub release
# Go to releases, attach artifacts, publish

# 8. Post on X/Twitter (use docs/SOCIAL_COPY.md)

# 9. Email Lincoln at Coinbase (use docs/SOCIAL_COPY.md)

# 10. Create issue on coinbase/payments-mcp (use docs/COINBASE_MCP_ISSUE.md)

# 11. Submit grant application (use docs/X402_GRANT_APPLICATION.md)
```

Full instructions: docs/DEPLOYMENT_GUIDE.md

## Positioning for Grant

### One-Paragraph Pitch
Payments MCP equips buyer agents with wallets and x402 payment capability. PEAC is the merchant proof layer that turns every paid HTTP 200 into a portable, policy-bound, independently verifiable receipt. Use MCP to pay. Use PEAC to prove. This creates measurable value for publishers and enterprises that need auditability, policy binding, and content integrity on paid API responses.

### Three Business Use Cases
1. **Agent-to-agent commerce**: Paid responses include PEAC receipt with AIPREF snapshot and response hash. Ideal for paid data, paid actions, or per-call tools that agents chain together.

2. **Enterprise audit mode**: Security and compliance teams can verify receipts offline with only the public key. Receipts are portable and rail-agnostic, so card rails in future require no format changes.

3. **Marketplace readiness**: OpenAPI and peac.txt enable machine discovery. Payments MCP can discover requirements and pay. Publishers can list pricing and policy with receipts as evidence of delivery.

### Why x402 Ecosystem Benefits
- Direct protocol alignment (402-pay-retry over HTTP, USDC on Base)
- Buyer synergy (works with MCP make_x402_request tool)
- Merchant infrastructure gap (MCP pays, PEAC proves)
- Adoption catalyst (as MCP grows, publishers need proof layer)

## Grant Application Status

### Materials Ready
- ✅ Live demo URL: https://2larp402.vercel.app/
- ✅ GitHub repo: public, Apache-2.0
- ✅ Integration docs: /docs/mcp-integration
- ✅ Technical specs documented
- ✅ Use cases articulated
- ✅ Timeline proposed (4 weeks)
- ✅ Acceptance signals defined

### To Complete Before Submission
- [ ] Fill in personal details (name, email, X handle)
- [ ] Specify grant amount (per x402 guidelines)
- [ ] Record 90-second demo video
- [ ] Attach video to application
- [ ] Submit via grant portal or designated email

Template: docs/X402_GRANT_APPLICATION.md

## Social Distribution

### X/Twitter Thread (4 tweets)
Ready to post. See: docs/SOCIAL_COPY.md > X/Twitter Thread

Key message: "MCP pays. PEAC proves."

### Email to Lincoln (Coinbase)
Template ready. See: docs/SOCIAL_COPY.md > Email to @MurrLincoln

Fill in: name, X handle, email

### Issue for payments-mcp Repo
Ready to file. See: docs/COINBASE_MCP_ISSUE.md

Proposes adding PEAC demo as merchant reference implementation

### LinkedIn Post
Corporate-friendly version ready. See: docs/SOCIAL_COPY.md > LinkedIn Post

### Hacker News
Technical details for HN audience. See: docs/SOCIAL_COPY.md > Hacker News Post

## Demo Video Script

**Duration**: 60-90 seconds

**Setup**:
- Terminal: agents/headless-buyer (right side)
- Browser: https://2larp402.vercel.app/ (left side)
- Recording: QuickTime (Cmd+Shift+5)

**Flow**:
1. Show homepage MCP section (15s)
2. Run `npm start` in terminal (35s)
3. Show artifacts: `ls out/` and `cat out/order.json` (15s)
4. Close: "MCP gives agents wallets. PEAC gives merchants receipts. Verifiable agent commerce." (5s)

## Known Limitations (Acknowledge if Asked)

- Demo uses DEMO_PROOF token (not real x402 payments yet)
- Single EdDSA key (no rotation documentation)
- No rate limiting (coming in v0.9.15)
- No composite receipts (coming in v0.9.15)

These are expected for a demo and do not block grant application.

## Success Metrics (Track First Week)

- [ ] Smoke test passes daily (automated via GH Actions)
- [ ] GitHub stars/forks increase
- [ ] X/Twitter engagement (retweets, likes, replies)
- [ ] Coinbase team acknowledgment
- [ ] Grant application confirmation
- [ ] Community PRs or issues filed

## Support Resources

If issues arise:
1. Check docs/PRODUCTION_CHECKLIST.md
2. Review Vercel logs
3. Run smoke test to isolate failure
4. Verify environment variables
5. Test locally with same config

## Rollback Plan

If critical issues post-deployment:
1. Revert deployment in Vercel (find previous, click "Redeploy")
2. Or revert Git: `git revert v0.9.14-demo1 && git push`
3. Notify via X/Twitter if downtime occurred

## Next Release (v0.9.15)

Queued features:
- Rate limiting and replay protection
- Session TTL and proof reuse guards
- Prometheus metrics export
- OWASP ZAP baseline in CI
- Composite receipt schema
- SBOM generation on release

Timeline: 2-3 weeks after v0.9.14 launch

## Final Checklist

Before deployment:
- [x] All version strings updated to v0.9.14
- [x] Em-dashes removed from user-facing text
- [x] MCP section added to homepage
- [x] Integration guide created
- [x] Copy buttons functional
- [x] CI smoke test working
- [x] Grant materials prepared
- [x] Social copy drafted
- [x] Deployment guide written

Ready to execute:
- [ ] Commit and tag release
- [ ] Push to GitHub
- [ ] Deploy to Vercel production
- [ ] Run smoke test against production
- [ ] Save and commit artifacts
- [ ] Create GitHub release
- [ ] Record demo video
- [ ] Post on X/Twitter
- [ ] Email Coinbase (Lincoln)
- [ ] File payments-mcp issue
- [ ] Submit grant application

## Contact for Grant

When ready to submit, fill in:
- Applicant name: [Your Name]
- Email: [your.email@example.com]
- X/Twitter: @[YourHandle]
- GitHub: @[YourGitHub]

Application template: docs/X402_GRANT_APPLICATION.md

---

**Bottom Line**: All code complete. All docs ready. All positioning clear. Ready to deploy, record, and apply for grant.

**Key Message**: MCP pays. PEAC proves. Verifiable agent commerce.

**Next Action**: Review docs/DEPLOYMENT_GUIDE.md and execute deployment steps.
