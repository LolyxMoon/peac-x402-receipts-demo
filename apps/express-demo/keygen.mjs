import { generateKeyPair, exportJWK } from 'jose';
import fs from 'fs';

const { publicKey, privateKey } = await generateKeyPair('EdDSA', { crv: 'Ed25519' });
const kid = 'peac-demo-key-1';

const jwkPriv = await exportJWK(privateKey);
const jwkPub  = await exportJWK(publicKey);
jwkPriv.kid = kid; jwkPriv.alg = 'EdDSA'; jwkPriv.use = 'sig';
jwkPub.kid  = kid; jwkPub.alg  = 'EdDSA'; jwkPub.use  = 'sig';

fs.mkdirSync('keys', { recursive: true });
fs.writeFileSync('keys/peac-ed25519.private.jwk.json', JSON.stringify(jwkPriv, null, 2));
fs.writeFileSync('keys/peac-ed25519.public.jwk.json',  JSON.stringify(jwkPub,  null, 2));
console.log('Wrote keys/peac-ed25519.{private,public}.jwk.json with kid=', kid);
