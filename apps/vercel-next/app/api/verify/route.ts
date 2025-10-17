// app/api/verify/route.ts
import { NextRequest } from 'next/server';
import { verifyPeacReceipt, getPublicJWK } from '@/lib/peac';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { receipt } = body || {};

    if (!receipt) {
      return Response.json(
        { valid: false, error: 'missing_receipt' },
        { status: 400 }
      );
    }

    // Get public key for verification
    const publicJwk = getPublicJWK();

    try {
      const { protectedHeader, payload } = await verifyPeacReceipt(receipt, publicJwk);

      return Response.json({
        valid: true,
        header: protectedHeader,
        payload
      });
    } catch (error: any) {
      return Response.json(
        {
          valid: false,
          error: 'verify_failed',
          message: error.message || 'Receipt verification failed'
        },
        { status: 400 }
      );
    }
  } catch (error) {
    return Response.json(
      { valid: false, error: 'invalid_request' },
      { status: 400 }
    );
  }
}
