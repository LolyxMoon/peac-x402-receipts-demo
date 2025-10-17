// app/api/shop/cart/route.ts
import { nanoid } from 'nanoid';
import { createCart } from '@/lib/catalog';

export const runtime = 'nodejs';

export async function POST() {
  const cart_id = 'cart_' + nanoid(10);
  const cart = createCart(cart_id);

  return Response.json({
    cart_id: cart.cart_id,
    items: cart.items
  });
}
