import React, { useState } from 'react';

export default function CartItem({ item, onRemove, onChangeQty }) {
  const [qty, setQty] = useState(item.qty);

  function handleQty(delta) {
    const next = Math.max(0, qty + delta);
    setQty(next);
    onChangeQty(next);
  }

  return (
    <div className="cart-item">
      <div className="ci-left">
        <div className="ci-thumb">{item.product.name.charAt(0)}</div>
        <div>
          <div className="ci-title">{item.product.name}</div>
          <div className="ci-price">₹{(item.product.price).toFixed(2)}</div>
        </div>
      </div>
      <div className="ci-right">
        <div className="qty-controls">
          <button className="small" onClick={()=>handleQty(-1)}>-</button>
          <div className="qty">{qty}</div>
          <button className="small" onClick={()=>handleQty(1)}>+</button>
        </div>
        <div className="ci-actions">
          <button className="link" onClick={onRemove}>Remove</button>
        </div>
      </div>
    </div>
  );
}
