import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import axios from 'axios';
import { createHash } from 'crypto';
import { nanoid } from 'nanoid';
import { importJWK, SignJWT, jwtVerify } from 'jose';
import fs from 'fs';
import path from 'path';
import qs from 'qs';

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(morgan('tiny'));
app.use('/.well-known', express.static('public/.well-known', { fallthrough: false }));
app.use('/public-keys', express.static('public-keys', { fallthrough: false }));
app.get('/aipref.json', (_, res) => res.sendFile(path.resolve('public/aipref.json')));
app.get('/shop', (_, res) => res.sendFile(path.resolve('public/shop.html')));

const {
  PORT = 8787,
  PUBLIC_ORIGIN = 'http://localhost:8787',
  X402_AMOUNT_USD = '0.01',
  X402_CURRENCY = 'USDC',
  X402_CHAIN = 'base',
  FACILITATOR_VERIFY_URL,
  FACILITATOR_API_KEY,
  DEMO_MODE = 'false',
  DEMO_TOKEN = 'demo-pay-ok-123'
} = process.env;

const demoMode = /^true$/i.test(DEMO_MODE);

// keys
const signerJwk = JSON.parse(fs.readFileSync('keys/peac-ed25519.private.jwk.json', 'utf8'));
const publicJwk = JSON.parse(fs.readFileSync('keys/peac-ed25519.public.jwk.json', 'utf8'));
const SIGNER = await importJWK(signerJwk, 'EdDSA');

// 402 session store
const sessions = new Map();

// catalog & cart store
const CATALOG = [
  { sku: 'sku_tea', title: 'Premium Tea Sample', price_usd: 0.01 },
  { sku: 'sku_cof', title: 'Artisan Coffee Sample', price_usd: 0.01 },
  { sku: 'sku_choc', title: 'Dark Chocolate Bar', price_usd: 0.02 }
];
const carts = new Map(); // cart_id -> {items:[{sku, qty}]}
const orders = new Map(); // order_id -> {order + receipt}

function sha256Hex(buf) {
  return createHash('sha256').update(buf).digest('hex');
}

async function verifyX402WithFacilitator(session_id, proof_id) {
  if (demoMode) {
    if (proof_id === DEMO_TOKEN) {
      return {
        valid: true,
        amount: Number(X402_AMOUNT_USD),
        currency: X402_CURRENCY,
        chain: X402_CHAIN,
        payer: 'demo-payer',
        rail: 'x402'
      };
    }
    return { valid: false };
  }
  if (!FACILITATOR_VERIFY_URL || !FACILITATOR_API_KEY) {
    console.warn('Facilitator not configured; set FACILITATOR_VERIFY_URL and FACILITATOR_API_KEY.');
    return { valid: false };
  }
  try {
    const resp = await axios.post(
      FACILITATOR_VERIFY_URL,
      { session_id, proof_id },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${FACILITATOR_API_KEY}`
        },
        timeout: 8000
      }
    );
    return resp.data;
  } catch (e) {
    console.error('Facilitator verify error', e.response?.status, e.response?.data || e.message);
    return { valid: false };
  }
}

function send402(res, session_id) {
  res
    .status(402)
    .set('Cache-Control', 'no-store')
    .json({
      error: 'payment_required',
      message: 'Pay via x402 and retry with proof',
      x402: {
        chain: X402_CHAIN,
        currency: X402_CURRENCY,
        amount_usd: Number(X402_AMOUNT_USD),
        facilitator_verify: !!FACILITATOR_VERIFY_URL,
        session_id,
        pay_endpoint_hint: `${PUBLIC_ORIGIN}/factcheck`
      },
      peac: {
        policy: `${PUBLIC_ORIGIN}/.well-known/peac.txt`,
        receipts: 'required'
      }
    });
}

async function signPeacReceipt({ request, response, payment, aiprefUrl, aiprefSnapshot }) {
  const now = new Date().toISOString();
  const payload = {
    receipt_version: '0.9.11',
    issued_at: now,
    subject: 'factcheck',
    request,
    response,
    payment,
    policy: {
      aipref_url: aiprefUrl,
      aipref_snapshot: aiprefSnapshot
    },
    provenance: { c2pa: null },
    verify_url: `${PUBLIC_ORIGIN}/verify`
  };
  const jws = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'EdDSA', kid: publicJwk.kid, typ: 'peac-receipt+jws' })
    .sign(await importJWK(signerJwk, 'EdDSA'));
  return jws;
}

async function runFactCheck(targetUrl) {
  const resp = await axios.get(targetUrl, { timeout: 6000 });
  const text = String(resp.data);
  const snippet = text.replace(/\s+/g, ' ').slice(0, 400);
  const hash = sha256Hex(text);
  return { ok: true, snippet, page_hash: hash };
}

app.get('/factcheck', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'missing_url', message: 'Provide ?url=' });

  const proof_id = req.get('X-402-Proof');
  const session_id = req.get('X-402-Session') || req.query.session_id || '';

  if (!proof_id) {
    const sid = nanoid();
    sessions.set(sid, { created_at: Date.now(), url, paid: false });
    return send402(res, sid);
  }

  const sess = sessions.get(session_id);
  if (!sess) return send402(res, nanoid());

  const verification = await verifyX402WithFacilitator(session_id, proof_id);
  if (!verification.valid) return send402(res, session_id);

  sess.paid = true; sess.proof_id = proof_id; sess.payer = verification.payer;

  try {
    const result = await runFactCheck(url);
    const body = { url, result };
    const bodyStr = JSON.stringify(body);
    const bodyHash = sha256Hex(bodyStr);

    const receiptJws = await signPeacReceipt({
      request: { method: 'GET', path: '/factcheck', query: qs.stringify({ url }, { encodeValuesOnly: true }) },
      response: { status: 200, body_sha256: bodyHash },
      payment: {
        rail: 'x402',
        amount: Number(X402_AMOUNT_USD),
        currency: X402_CURRENCY,
        chain: X402_CHAIN,
        proof_id,
        session_id,
        payer: verification.payer || 'unknown'
      },
      aiprefUrl: `${PUBLIC_ORIGIN}/aipref.json`,
      aiprefSnapshot: JSON.parse(fs.readFileSync('public/aipref.json', 'utf8'))
    });

    res
      .status(200)
      .set('PEAC-Receipt', receiptJws)
      .set('Cache-Control', 'no-store')
      .json(body);

  } catch (e) {
    console.error(e);
    return res.status(502).json({ error: 'factcheck_failed', message: e.message.slice(0, 200) });
  }
});

// --- SHOP ENDPOINTS ---

app.get('/shop/catalog', (_req, res) => {
  res.json({ items: CATALOG });
});

app.post('/shop/cart', (_req, res) => {
  const id = nanoid();
  carts.set(id, { items: [] });
  res.json({ cart_id: id, items: [] });
});

app.post('/shop/cart/:id/add', (req, res) => {
  const id = req.params.id;
  const { sku, qty = 1 } = req.body || {};
  const cart = carts.get(id);
  const item = CATALOG.find(p => p.sku === sku);
  if (!cart || !item) return res.status(400).json({ error: 'bad_request' });
  cart.items.push({ sku, qty: Number(qty) });
  res.json({ cart });
});

app.get('/shop/cart/:id', (req, res) => {
  const cart = carts.get(req.params.id);
  if (!cart) return res.status(404).json({ error: 'cart_not_found' });
  res.json({ cart });
});

app.post('/shop/checkout', async (req, res) => {
  const { cart_id } = req.body || {};
  const cart = carts.get(cart_id);
  if (!cart || !cart.items.length) {
    return res.status(400).json({ error: 'empty_cart', message: 'Cart is empty or not found' });
  }

  // compute totals
  const lineItems = cart.items.map(li => {
    const p = CATALOG.find(x => x.sku === li.sku);
    return { sku: li.sku, qty: li.qty, unit_price_usd: p.price_usd };
  });
  const subtotal = lineItems.reduce((s, li) => s + li.qty * li.unit_price_usd, 0);
  const tax = 0;
  const fees = 0;
  const grand = Number(subtotal.toFixed(2));

  const proof_id = req.get('X-402-Proof');
  const session_id = req.get('X-402-Session') || req.query.session_id || '';

  if (!proof_id) {
    const sid = nanoid();
    sessions.set(sid, { created_at: Date.now(), subject: `cart:${cart_id}`, amount: grand });
    // Send custom 402 with the actual cart amount
    return res
      .status(402)
      .set('Cache-Control', 'no-store')
      .json({
        error: 'payment_required',
        message: 'Pay via x402 and retry with proof',
        x402: {
          chain: X402_CHAIN,
          currency: X402_CURRENCY,
          amount_usd: grand,
          facilitator_verify: !!FACILITATOR_VERIFY_URL,
          session_id: sid,
          pay_endpoint_hint: `${PUBLIC_ORIGIN}/shop/checkout`
        },
        peac: {
          policy: `${PUBLIC_ORIGIN}/.well-known/peac.txt`,
          receipts: 'required'
        }
      });
  }

  const sess = sessions.get(session_id);
  if (!sess) {
    const sid = nanoid();
    return res.status(402).set('Cache-Control', 'no-store').json({
      error: 'payment_required',
      message: 'Session not found',
      x402: {
        chain: X402_CHAIN,
        currency: X402_CURRENCY,
        amount_usd: grand,
        session_id: sid
      }
    });
  }

  const verification = await verifyX402WithFacilitator(session_id, proof_id);
  if (!verification.valid) {
    return res.status(402).set('Cache-Control', 'no-store').json({
      error: 'payment_invalid',
      message: 'Payment verification failed',
      x402: { session_id }
    });
  }

  // construct order
  const order = {
    order_id: 'ord_' + nanoid(6),
    items: lineItems,
    totals: { subtotal: Number(subtotal.toFixed(2)), tax, fees, grand_total: grand },
    created_at: new Date().toISOString()
  };
  const bodyStr = JSON.stringify(order);
  const bodyHash = sha256Hex(bodyStr);

  const aiprefSnapshot = JSON.parse(fs.readFileSync('public/aipref.json', 'utf8'));
  const receiptPayload = {
    receipt_version: '0.9.11',
    issued_at: new Date().toISOString(),
    subject: 'order',
    request: { method: 'POST', path: '/shop/checkout', query: '' },
    response: { status: 200, body_sha256: bodyHash },
    payment: {
      rail: 'x402',
      amount: grand,
      currency: X402_CURRENCY,
      chain: X402_CHAIN,
      proof_id,
      session_id,
      payer: verification.payer || 'unknown'
    },
    order: {
      order_id: order.order_id,
      items: lineItems,
      totals: order.totals
    },
    policy: {
      aipref_url: `${PUBLIC_ORIGIN}/aipref.json`,
      aipref_snapshot: aiprefSnapshot
    },
    provenance: { c2pa: null },
    verify_url: `${PUBLIC_ORIGIN}/verify`
  };

  const receiptJws = await new SignJWT(receiptPayload)
    .setProtectedHeader({ alg: 'EdDSA', kid: publicJwk.kid, typ: 'peac-receipt+jws' })
    .sign(await importJWK(signerJwk, 'EdDSA'));

  // Store order with receipt
  orders.set(order.order_id, {
    ...order,
    receipt: receiptJws,
    payment: {
      session_id,
      proof_id,
      payer: verification.payer,
      verified_at: new Date().toISOString()
    }
  });

  res
    .status(200)
    .set('Access-Control-Expose-Headers', 'PEAC-Receipt')
    .set('PEAC-Receipt', receiptJws)
    .set('Cache-Control', 'no-store')
    .json(order);
});

app.get('/shop/ledger', (_req, res) => {
  const ordersList = Array.from(orders.values()).map(o => ({
    order_id: o.order_id,
    created_at: o.created_at,
    total: o.totals.grand_total,
    items_count: o.items.length,
    payer: o.payment.payer,
    has_receipt: !!o.receipt
  }));

  const totalRevenue = ordersList.reduce((sum, o) => sum + o.total, 0);

  res.json({
    summary: {
      total_orders: ordersList.length,
      total_revenue_usd: Number(totalRevenue.toFixed(2)),
      currency: X402_CURRENCY,
      chain: X402_CHAIN
    },
    orders: ordersList
  });
});

app.post('/verify', express.json(), async (req, res) => {
  const { receipt } = req.body || {};
  if (!receipt) return res.status(400).json({ valid: false, error: 'missing_receipt' });
  try {
    const PUB = await importJWK(publicJwk, 'EdDSA');
    const { payload, protectedHeader } = await jwtVerify(receipt, PUB, { algorithms: ['EdDSA'] });
    return res.json({ valid: true, header: protectedHeader, payload });
  } catch (e) {
    return res.status(400).json({ valid: false, error: 'verify_failed', message: e.message });
  }
});

app.get('/', (_, res) => res.json({ ok: true, service: 'peac-x402-demo' }));

app.listen(process.env.PORT || 8787, () => {
  console.log(`PEAC x402 demo up on ${PUBLIC_ORIGIN}`);
  if (demoMode) console.log('DEMO_MODE=true — use header: X-402-Proof:', process.env.DEMO_TOKEN);
});
