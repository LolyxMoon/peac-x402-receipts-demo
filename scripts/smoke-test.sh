#!/bin/bash

# PEAC x402 Smoke Test
# Tests critical endpoints to ensure 402 flow works correctly

set -e  # Exit on error

# Configuration
BASE_URL="${BASE_URL:-https://2larp402.vercel.app/}"
DEMO_PROOF="demo-pay-ok-123"

echo "🧪 PEAC x402 Smoke Test"
echo "Base URL: $BASE_URL"
echo ""

# Test 1: GET /api/shop/catalog
echo "✓ Test 1: GET /api/shop/catalog"
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/shop/catalog")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" != "200" ]; then
  echo "❌ FAILED: Expected 200, got $HTTP_CODE"
  exit 1
fi

ITEM_COUNT=$(echo "$BODY" | jq '.items | length')
if [ "$ITEM_COUNT" -lt 1 ]; then
  echo "❌ FAILED: Expected at least 1 item, got $ITEM_COUNT"
  exit 1
fi
echo "   → 200 OK, $ITEM_COUNT items in catalog"
echo ""

# Test 2: GET /api/openapi.json
echo "✓ Test 2: GET /api/openapi.json"
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/openapi.json")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" != "200" ]; then
  echo "❌ FAILED: Expected 200, got $HTTP_CODE"
  exit 1
fi

OPENAPI_VERSION=$(echo "$BODY" | jq -r '.openapi')
if [ "$OPENAPI_VERSION" != "3.0.1" ]; then
  echo "❌ FAILED: Expected OpenAPI 3.0.1, got $OPENAPI_VERSION"
  exit 1
fi
echo "   → 200 OK, OpenAPI version $OPENAPI_VERSION"
echo ""

# Test 3: GET /.well-known/peac.txt
echo "✓ Test 3: GET /.well-known/peac.txt"
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/.well-known/peac.txt")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" != "200" ]; then
  echo "❌ FAILED: Expected 200, got $HTTP_CODE"
  exit 1
fi

LINE_COUNT=$(echo "$BODY" | wc -l | tr -d ' ')
if [ "$LINE_COUNT" -gt 20 ]; then
  echo "❌ FAILED: peac.txt should be ≤20 lines, got $LINE_COUNT"
  exit 1
fi
echo "   → 200 OK, $LINE_COUNT lines (≤20 spec compliant)"
echo ""

# Test 4: POST /api/shop/checkout-direct without payment (expect 402)
echo "✓ Test 4: POST /api/shop/checkout-direct (no payment → expect 402)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/shop/checkout-direct" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"sku":"sku_tea","qty":1}]}')
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" != "402" ]; then
  echo "❌ FAILED: Expected 402, got $HTTP_CODE"
  exit 1
fi

SESSION_ID=$(echo "$BODY" | jq -r '.x402.session_id')
SESSION_TOKEN=$(echo "$BODY" | jq -r '.session_token')
AMOUNT=$(echo "$BODY" | jq -r '.x402.amount_usd')
CURRENCY=$(echo "$BODY" | jq -r '.x402.currency')
CHAIN=$(echo "$BODY" | jq -r '.x402.chain')

if [ "$SESSION_ID" == "null" ] || [ "$SESSION_TOKEN" == "null" ]; then
  echo "❌ FAILED: Missing session_id or session_token in 402 response"
  exit 1
fi

if [ "$CURRENCY" != "USDC" ] || [ "$CHAIN" != "base" ]; then
  echo "❌ FAILED: Expected USDC/base, got $CURRENCY/$CHAIN"
  exit 1
fi

echo "   → 402 Payment Required"
echo "   → session_id: $SESSION_ID"
echo "   → amount: $AMOUNT $CURRENCY on $CHAIN"
echo ""

# Test 5: POST /api/shop/checkout-direct with payment proof (expect 200 + PEAC-Receipt)
echo "✓ Test 5: POST /api/shop/checkout-direct (with payment → expect 200 + receipt)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/shop/checkout-direct" \
  -H "Content-Type: application/json" \
  -H "X-402-Session: $SESSION_TOKEN" \
  -H "X-402-Proof: $DEMO_PROOF" \
  -H "Idempotency-Key: smoke-test-$SESSION_ID" \
  -D /tmp/smoke-test-headers.txt \
  -d '{"items":[{"sku":"sku_tea","qty":1}]}')
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" != "200" ]; then
  echo "❌ FAILED: Expected 200, got $HTTP_CODE"
  echo "Response: $BODY"
  exit 1
fi

ORDER_ID=$(echo "$BODY" | jq -r '.order_id')
GRAND_TOTAL=$(echo "$BODY" | jq -r '.totals.grand_total')

if [ "$ORDER_ID" == "null" ]; then
  echo "❌ FAILED: Missing order_id in 200 response"
  exit 1
fi

# Check for PEAC-Receipt header
PEAC_RECEIPT=$(grep -i "PEAC-Receipt:" /tmp/smoke-test-headers.txt | cut -d' ' -f2- | tr -d '\r\n' || echo "")
if [ -z "$PEAC_RECEIPT" ]; then
  echo "❌ FAILED: Missing PEAC-Receipt header in 200 response"
  cat /tmp/smoke-test-headers.txt
  exit 1
fi

echo "   → 200 OK"
echo "   → order_id: $ORDER_ID"
echo "   → grand_total: $GRAND_TOTAL $CURRENCY"
echo "   → PEAC-Receipt: ${PEAC_RECEIPT:0:50}... (${#PEAC_RECEIPT} chars)"
echo ""

# Test 6: POST /api/verify with receipt
echo "✓ Test 6: POST /api/verify (verify receipt)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/verify" \
  -H "Content-Type: application/json" \
  -d "{\"receipt\":\"$PEAC_RECEIPT\"}")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" != "200" ]; then
  echo "❌ FAILED: Expected 200, got $HTTP_CODE"
  exit 1
fi

VALID=$(echo "$BODY" | jq -r '.valid')
if [ "$VALID" != "true" ]; then
  echo "❌ FAILED: Receipt verification failed (valid=$VALID)"
  echo "Response: $BODY"
  exit 1
fi

PROOF_ID=$(echo "$BODY" | jq -r '.payload.payment.proof_id')
if [ "$PROOF_ID" != "$DEMO_PROOF" ]; then
  echo "❌ FAILED: Proof ID mismatch (expected $DEMO_PROOF, got $PROOF_ID)"
  exit 1
fi

echo "   → 200 OK"
echo "   → valid: true"
echo "   → proof_id: $PROOF_ID"
echo ""

# Cleanup
rm -f /tmp/smoke-test-headers.txt

echo "✅ All tests passed!"
echo ""
echo "Summary:"
echo "  ✓ Catalog endpoint working"
echo "  ✓ OpenAPI spec available"
echo "  ✓ peac.txt discoverable"
echo "  ✓ 402 payment flow working"
echo "  ✓ PEAC-Receipt issued on payment"
echo "  ✓ Receipt verification working"
