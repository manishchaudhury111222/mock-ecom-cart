import React, { useEffect, useState } from 'react';
import { fetchCart, removeCartItem, updateCartItem } from '../api';
import CartItem from './CartItem';

export default function CartDrawer({ open, onClose, cartData, onCartChange, onCheckout }) {
  const [local, setLocal] = useState(cartData);

  useEffect(()=> setLocal(cartData), [cartData]);

  async function removeItem(id) {
    await removeCartItem(id);
    const updated = await fetchCart();
    onCartChange(updated);
  }

  async function changeQty(id, qty) {
    await updateCartItem(id, qty);
    const updated = await fetchCart();
    onCartChange(updated);
  }

  return (
    <aside className={`drawer ${open ? 'open': ''}`}>
      <div className="drawer-header">
        <h2>Your Cart</h2>
        <button className="btn ghost" onClick={onClose}>Close</button>
      </div>
      <div className="drawer-content">
        {local.cart && local.cart.length ? (
          <>
            <div className="cart-list">
              {local.cart.map(item => (
                <CartItem key={item.id} item={item} onRemove={()=>removeItem(item.id)} onChangeQty={(q)=>changeQty(item.id, q)} />
              ))}
            </div>
            <div className="cart-summary">
              <div className="total">Total <strong>₹{local.total.toFixed(2)}</strong></div>
              <div className="actions">
                <button className="btn ghost" onClick={onClose}>Continue shopping</button>
                <button className="btn primary" onClick={onCheckout}>Checkout</button>
              </div>
            </div>
          </>
        ) : <div className="empty">Your cart is empty — add something nice!</div>}
      </div>
    </aside>
  );
}
