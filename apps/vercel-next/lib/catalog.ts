// lib/catalog.ts - Product catalog and cart utilities

export type Product = {
  sku: string;
  title: string;
  price_usd: number;
};

export type CartItem = {
  sku: string;
  qty: number;
};

export type Cart = {
  cart_id: string;
  items: CartItem[];
};

export const CATALOG: Product[] = [
  { sku: 'sku_tea', title: 'Premium Tea Sample', price_usd: 0.01 },
  { sku: 'sku_cof', title: 'Artisan Coffee Sample', price_usd: 0.02 },
  { sku: 'sku_choc', title: 'Dark Chocolate Bar', price_usd: 0.02 }
];

// In-memory cart storage (ephemeral, for demo purposes)
// In production, you'd use a database or Redis
const CART_STORE = new Map<string, Cart>();

export function getProduct(sku: string): Product | undefined {
  return CATALOG.find(p => p.sku === sku);
}

export function getCart(cart_id: string): Cart | undefined {
  return CART_STORE.get(cart_id);
}

export function createCart(cart_id: string): Cart {
  const cart: Cart = { cart_id, items: [] };
  CART_STORE.set(cart_id, cart);
  return cart;
}

export function addToCart(cart_id: string, sku: string, qty: number): Cart | null {
  const cart = CART_STORE.get(cart_id);
  if (!cart) return null;

  const product = getProduct(sku);
  if (!product) return null;

  const existingItem = cart.items.find(item => item.sku === sku);
  if (existingItem) {
    existingItem.qty += qty;
  } else {
    cart.items.push({ sku, qty });
  }

  CART_STORE.set(cart_id, cart);
  return cart;
}

export function calculateCartTotal(cart: Cart): {
  items: Array<{ sku: string; qty: number; unit_price_usd: number }>;
  subtotal: number;
  tax: number;
  fees: number;
  grand_total: number;
} {
  const items = cart.items.map(item => {
    const product = getProduct(item.sku);
    return {
      sku: item.sku,
      qty: item.qty,
      unit_price_usd: product?.price_usd || 0
    };
  });

  const subtotal = Number(
    items.reduce((sum, item) => sum + item.qty * item.unit_price_usd, 0).toFixed(2)
  );

  return {
    items,
    subtotal,
    tax: 0,
    fees: 0,
    grand_total: subtotal
  };
}
