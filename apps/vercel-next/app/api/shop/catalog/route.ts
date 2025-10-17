// app/api/shop/catalog/route.ts
import { CATALOG } from '@/lib/catalog';

export const runtime = 'nodejs';

export async function GET() {
  return Response.json({
    items: CATALOG
  }, {
    headers: {
      'Cache-Control': 'public, max-age=60'
    }
  });
}
