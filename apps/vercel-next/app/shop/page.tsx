'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Product = {
  sku: string;
  title: string;
  price_usd: number;
};

type CartItem = {
  sku: string;
  title: string;
  price: number;
  qty: number;
};

export default function ShopPage() {
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [cartId, setCartId] = useState<string>('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [receipt, setReceipt] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCatalog();
    createCart();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchCatalog() {
    try {
      console.log('Fetching catalog...');
      const res = await fetch('/api/shop/catalog');
      console.log('Catalog response:', res.status, res.ok);
      if (!res.ok) {
        console.error('Catalog fetch failed:', res.status, res.statusText);
        setMessage(`Failed to load catalog: ${res.status}`);
        return;
      }
      const data = await res.json();
      console.log('Catalog data:', data);
      setCatalog(data.items || []);
      console.log('Catalog set:', data.items?.length, 'items');
    } catch (error) {
      console.error('Catalog error:', error);
      setMessage('Failed to load catalog');
    }
  }

  async function createCart() {
    try {
      const res = await fetch('/api/shop/cart', { method: 'POST' });
      if (!res.ok) {
        console.error('Cart creation failed:', res.status, res.statusText);
        return;
      }
      const data = await res.json();
      setCartId(data.cart_id);
    } catch (error) {
      console.error('Cart error:', error);
    }
  }

  async function addToCart(sku: string) {
    if (!cartId) return;

    const res = await fetch(`/api/shop/cart/${cartId}/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sku, qty: 1 })
    });

    const data = await res.json();
    if (data.items) {
      setCartItems(data.items);
      setMessage('Added to cart!');
      setTimeout(() => setMessage(''), 2000);
    } else {
      console.error('Unexpected response:', data);
      setMessage('Error adding to cart');
    }
  }

  async function checkout() {
    if (!cartId) return;
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/shop/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart_id: cartId })
      });

      const data = await res.json();

      if (res.status === 402) {
        setMessage(`Payment Required: $${data.x402.amount_usd} USDC. Using demo token...`);

        setTimeout(async () => {
          const paidRes = await fetch('/api/shop/checkout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-402-Proof': 'demo-pay-ok-123',
              'X-402-Session': data.session_token
            },
            body: JSON.stringify({ cart_id: cartId })
          });

          if (paidRes.ok) {
            const receiptJws = paidRes.headers.get('PEAC-Receipt');
            const order = await paidRes.json();

            setReceipt(receiptJws || '');
            setMessage(`Order ${order.order_id} complete! Receipt received.`);
            setCartItems([]);

            await createCart();
          } else {
            setMessage('Payment verification failed');
          }
          setLoading(false);
        }, 1000);
      } else {
        setMessage('Checkout failed');
        setLoading(false);
      }
    } catch (error) {
      setMessage('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setLoading(false);
    }
  }

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8 text-center">
          <Link href="/" className="text-white/80 hover:text-white text-sm">← Back to Home</Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-4 mb-2">
            Agent Shopper Demo
          </h1>
          <p className="text-white/90 text-lg">
            Add items → Checkout → Auto-pay with x402 → Get PEAC Receipt
          </p>
        </div>

        {message && (
          <div className="max-w-4xl mx-auto mb-6 bg-white/90 backdrop-blur-lg rounded-lg px-6 py-4 text-center font-semibold">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="lg:col-span-2 bg-white/95 backdrop-blur-lg rounded-xl p-6">
            <h2 className="text-2xl font-bold text-purple-600 mb-4 pb-2 border-b-2 border-purple-600">
              Catalog
            </h2>
            <div className="space-y-3">
              {catalog.map((product) => (
                <div
                  key={product.sku}
                  className="flex justify-between items-center p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:shadow-lg transition-all"
                >
                  <div>
                    <h3 className="font-semibold text-lg">{product.title}</h3>
                    <p className="text-purple-600 font-bold text-xl">
                      ${product.price_usd.toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => addToCart(product.sku)}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-all hover:scale-105"
                    disabled={!cartId}
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-lg rounded-xl p-6">
            <h2 className="text-2xl font-bold text-purple-600 mb-4 pb-2 border-b-2 border-purple-600">
              Cart
            </h2>

            {cartItems.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Cart is empty</p>
            ) : (
              <>
                <div className="space-y-2 mb-4">
                  {cartItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between py-2 border-b">
                      <div>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-sm text-gray-600">Qty: {item.qty}</div>
                      </div>
                      <div className="font-semibold">${(item.price * item.qty).toFixed(2)}</div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t-2 border-purple-600">
                  <div className="flex justify-between mb-4">
                    <span className="text-xl font-bold">Total:</span>
                    <span className="text-xl font-bold text-purple-600">
                      ${cartTotal.toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={checkout}
                    disabled={loading || cartItems.length === 0}
                    className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-purple-700 transition-all hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? 'Processing...' : 'Checkout with x402'}
                  </button>
                </div>
              </>
            )}

            {cartId && (
              <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                <div className="text-xs text-gray-600">Cart ID</div>
                <div className="text-xs font-mono break-all">{cartId}</div>
              </div>
            )}
          </div>
        </div>

        {receipt && (
          <div className="max-w-6xl mx-auto mt-6 bg-white/95 backdrop-blur-lg rounded-xl p-6">
            <h2 className="text-2xl font-bold text-purple-600 mb-4">
              PEAC Receipt (JWS)
            </h2>
            <textarea
              readOnly
              value={receipt}
              className="w-full h-32 p-4 font-mono text-sm bg-gray-50 border-2 border-purple-200 rounded-lg"
            />
            <div className="mt-4 flex gap-4">
              <Link
                href="/verify/offline"
                className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-all"
              >
                Verify Receipt
              </Link>
              <a
                href={`/api/verify`}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-all"
              >
                API Docs
              </a>
            </div>
          </div>
        )}

        {process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && (
          <div className="max-w-6xl mx-auto mt-8 text-center text-white/80 text-sm">
            <p>Demo Mode: Using token &quot;demo-pay-ok-123&quot; - No real payment required</p>
          </div>
        )}
      </div>
    </div>
  );
}
