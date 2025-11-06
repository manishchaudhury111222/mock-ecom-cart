import React, { useState } from 'react';
import { checkout } from '../api';

export default function CheckoutModal({ open, onClose }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const res = await checkout({ name, email });
      if (!res.success) throw new Error(res.error || 'Checkout failed');
      setReceipt(res.receipt);
    } catch (err) {
      setErr(err.message || 'Checkout error');
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;
  return (
    <div className="modal">
      <div className="modal-card">
        <button className="modal-close" onClick={() => { setReceipt(null); onClose(); }}>✕</button>
        {!receipt ? (
          <>
            <h3>Checkout</h3>
            <form onSubmit={submit} className="checkout-form">
              <label>
                Name
                <input value={name} onChange={(e)=>setName(e.target.value)} required />
              </label>
              <label>
                Email
                <input value={email} onChange={(e)=>setEmail(e.target.value)} required type="email"/>
              </label>
              {err && <div className="form-error">{err}</div>}
              <div className="modal-actions">
                <button className="btn ghost" type="button" onClick={()=>onClose()}>Cancel</button>
                <button className="btn primary" type="submit" disabled={loading}>Place Order</button>
              </div>
            </form>
          </>
        ) : (
          <div className="receipt">
            <h3>Receipt</h3>
            <p>Thank you, <strong>{receipt.name}</strong></p>
            <p><strong>Total:</strong> ₹{receipt.total.toFixed(2)}</p>
            <p><small>Order ID: {receipt.id}</small></p>
            <p><small>{new Date(receipt.timestamp).toLocaleString()}</small></p>
            <div className="modal-actions">
              <button className="btn" onClick={()=>{ setReceipt(null); onClose(); }}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
