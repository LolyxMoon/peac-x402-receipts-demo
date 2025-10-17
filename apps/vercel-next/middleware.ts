import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const CANON = 'x402.peacprotocol.org';

export function middleware(req: NextRequest) {
  const host = req.headers.get('host') || '';
  if (host !== CANON) {
    return NextResponse.redirect(
      `https://${CANON}${req.nextUrl.pathname}${req.nextUrl.search}`,
      308
    );
  }
  return NextResponse.next();
}
