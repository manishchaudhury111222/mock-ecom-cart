import React from 'react';

export default function Header({ cartCount=0, onOpenCart }) {
  return (
    <header className="header">
      <div className="brand">Vibe <span>Commerce</span></div>
      <nav className="nav">
        <button className="btn ghost">Products</button>
        <button className="btn" onClick={onOpenCart}>
          Cart <span className="badge">{cartCount}</span>
        </button>
      </nav>
    </header>
  );
}
