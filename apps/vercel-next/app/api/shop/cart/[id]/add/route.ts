// app/api/shop/cart/[id]/add/route.ts
import { NextRequest } from 'next/server';
import { addToCart, getProduct } from '@/lib/catalog';

export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await request.json();
  const { sku, qty = 1 } = body || {};

  if (!sku) {
    return Response.json(
      { error: 'missing_sku' },
      { status: 400 }
    );
  }

  const product = getProduct(sku);
  if (!product) {
    return Response.json(
      { error: 'invalid_sku', message: `Product ${sku} not found` },
      { status: 400 }
    );
  }

  const cart = addToCart(id, sku, Number(qty));
  if (!cart) {
    return Response.json(
      { error: 'cart_not_found', message: `Cart ${id} not found` },
      { status: 404 }
    );
  }

  return Response.json({ cart });
}
