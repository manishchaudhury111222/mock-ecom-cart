import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import ProductGrid from './components/ProductGrid';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import { fetchProducts, fetchCart, addToCart } from './api';

export default function App() {
  const [products, setProducts] = useState([]);
  const [cartState, setCartState] = useState({ cart: [], total: 0 });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  async function loadAll() {
    setLoading(true);
    try {
      const [prods, cart] = await Promise.all([fetchProducts(), fetchCart()]);
      setProducts(prods);
      setCartState(cart);
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', text: err.message || 'Error' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, []);

  async function handleAdd(productId, qty = 1) {
    try {
      await addToCart(productId, qty);
      const updated = await fetchCart();
      setCartState(updated);
      setToast({ type: 'success', text: 'Added to cart' });
      setDrawerOpen(true);
    } catch (err) {
      setToast({ type: 'error', text: err.message || 'Add failed' });
    }
  }

  return (
    <div className="app-root">
      <Header cartCount={cartState.cart.reduce((s,i)=>s+i.qty,0)} onOpenCart={()=>setDrawerOpen(true)} />
      <main className="container">
        <section className="hero">
          <div>
            <h1>Vibe Commerce</h1>
            <p className="lead">Simple cart, pretty UI — mock e-commerce.</p>
          </div>
          <div className="hero-illustration">🛍️</div>
        </section>

        <ProductGrid products={products} loading={loading} onAdd={handleAdd} />

        <footer className="footer">Made with ❤️ — Mock E-Com Cart</footer>
      </main>

      <CartDrawer
        open={drawerOpen}
        onClose={()=>setDrawerOpen(false)}
        cartData={cartState}
        onCartChange={(c)=>setCartState(c)}
        onCheckout={()=>{ setDrawerOpen(false); setCheckoutOpen(true); }}
      />

      <CheckoutModal
        open={checkoutOpen}
        onClose={()=>{ setCheckoutOpen(false); loadAll(); }}
      />

      { toast && <div className={`toast ${toast.type}`}>{toast.text}<button onClick={()=>setToast(null)}>✕</button></div>}
    </div>
  );
}
