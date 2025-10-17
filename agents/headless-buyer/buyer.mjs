import 'dotenv/config';
import fs from 'fs-extra';
import axios from 'axios';
import { execa } from 'execa';
import crypto from 'crypto';

const ORIGIN = process.env.MERCHANT_ORIGIN || 'http://localhost:8787';
const OUT = process.env.OUT_DIR || 'out';
const PAY_MODE = (process.env.PAY_MODE || 'cli').toLowerCase();
const X402_BIN = process.env.X402_BIN || 'x402';
const X402_CUR = process.env.X402_CURRENCY || 'USDC';
const X402_CHAIN = process.env.X402_CHAIN || 'base';
const FACIL_PAY_URL = process.env.FACILITATOR_PAY_URL || '';
const FACIL_KEY = process.env.FACILITATOR_API_KEY || '';
const DEMO_PROOF = process.env.DEMO_PROOF || '';

await fs.ensureDir(OUT);

function sha256Hex(s) { return crypto.createHash('sha256').update(s).digest('hex'); }

async function fetchJson(url, opts={}) {
  const r = await axios({ url, method: 'GET', ...opts });
  return r.data;
}

async function postJson(url, data, headers={}) {
  const r = await axios.post(url, data, { headers });
  return r;
}

async function payWithCli(to, sessionId, amount, currency=X402_CUR, chain=X402_CHAIN) {
  const args = ['pay','--to', to, '--session', sessionId, '--network', chain, '--amount', String(amount), '--currency', currency];
  const { stdout } = await execa(X402_BIN, args, { stdio: 'pipe' });
  const m = stdout.match(/proof_id:\s*([A-Za-z0-9_-]+)/i);
  if (!m) throw new Error(`x402 CLI did not print proof_id. Output:\n${stdout}`);
  return m[1];
}

async function payWithFacilitator(sessionId, amount, currency=X402_CUR, chain=X402_CHAIN) {
  if (!FACIL_PAY_URL || !FACIL_KEY) throw new Error('FACILITATOR_PAY_URL/API_KEY missing');
  const resp = await axios.post(FACIL_PAY_URL, { session_id: sessionId, amount, currency, chain, to: `${ORIGIN}/api/shop/checkout-direct` }, {
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${FACIL_KEY}` },
    timeout: 20_000
  });
  if (!resp.data?.proof_id) throw new Error('Facilitator did not return proof_id');
  return resp.data.proof_id;
}

async function main(){
  console.log('== Headless buyer agent ==');
  console.log('Merchant:', ORIGIN);

  const peacTxt = await axios.get(`${ORIGIN}/.well-known/peac.txt`).then(r=>r.data);
  console.log('peac.txt:\n', peacTxt);

  const catalog = await fetchJson(`${ORIGIN}/api/shop/catalog`);
  const pick = catalog.items.slice(0,2);
  console.log('Selected items:', pick.map(p => `${p.sku} (${p.title})`).join(', '));

  const checkoutBody = { items: pick.map(p => ({ sku: p.sku, qty: 1 })) };

  let r402;
  try {
    await postJson(`${ORIGIN}/api/shop/checkout-direct`, checkoutBody, { 'Content-Type': 'application/json' });
    throw new Error('Expected 402, got 200');
  } catch (e) {
    if (e.response?.status !== 402) throw e;
    r402 = e.response.data;
  }

  const sessionId = r402?.x402?.session_id;
  const amount = r402?.x402?.amount_usd;
  const sessionToken = r402?.session_token;
  console.log('402 session:', sessionId, 'amount:', amount);

  let proofId;
  if (DEMO_PROOF) {
    console.log('Using DEMO_PROOF token (for sandbox only).');
    proofId = DEMO_PROOF;
  } else if (PAY_MODE === 'cli') {
    proofId = await payWithCli(`${ORIGIN}/api/shop/checkout-direct`, sessionId, amount);
  } else {
    proofId = await payWithFacilitator(sessionId, amount);
  }
  console.log('proof_id:', proofId);

  const idempKey = `order-${sessionId}`;
  const r200 = await axios.post(`${ORIGIN}/api/shop/checkout-direct`, checkoutBody, {
    headers: { 'Content-Type': 'application/json', 'X-402-Session': sessionToken, 'X-402-Proof': proofId, 'Idempotency-Key': idempKey }
  });

  const receipt = r200.headers['peac-receipt'];
  const order = r200.data;

  await fs.ensureDir(OUT);
  await fs.writeJson(`${OUT}/order.json`, order, { spaces: 2 });
  await fs.writeFile(`${OUT}/receipt.jws`, receipt);

  console.log('Order:', order.order_id, 'grand_total=', order.totals.grand_total);
  console.log('PEAC-Receipt (JWS) saved to', `${OUT}/receipt.jws`);

  const verify = await postJson(`${ORIGIN}/api/verify`, { receipt }, { 'Content-Type': 'application/json' });
  const payload = verify.data.payload;
  const ok = verify.data.valid === true && payload?.payment?.proof_id === proofId;
  console.log('verify:', verify.data.valid, ok ? '[Valid]' : '[Invalid]');

  await fs.writeJson(`${OUT}/verify.json`, verify.data, { spaces: 2 });
  console.log('Verification saved to', `${OUT}/verify.json`);

  const provenance = {
    order_sha256: sha256Hex(JSON.stringify(order)),
    receipt_sha256: sha256Hex(receipt),
    verified_at: new Date().toISOString()
  };
  await fs.writeJson(`${OUT}/provenance.json`, provenance, { spaces: 2 });
  console.log('Provenance saved:', provenance);
}

main().catch(e => { console.error(e); process.exit(1); });
