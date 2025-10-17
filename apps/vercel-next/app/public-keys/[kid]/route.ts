// app/public-keys/[kid]/route.ts
import { getPublicJWK } from '@/lib/peac';

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  context: { params: Promise<{ kid: string }> }
) {
  const { kid } = await context.params;
  const expectedKid = process.env.PEAC_KID || 'peac-demo-key-1';

  if (kid !== expectedKid) {
    return Response.json(
      { error: 'key_not_found' },
      { status: 404 }
    );
  }

  const publicJwk = getPublicJWK();

  return Response.json(publicJwk, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=86400, immutable'
    }
  });
}
