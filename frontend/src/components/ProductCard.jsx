import React from 'react';

export default function ProductCard({ product, onAdd }) {
  return (
    <article className="card">
      <div className="card-media">{/* placeholder */}
        <div className="product-chip">{product.name.split(' ')[0]}</div>
      </div>
      <div className="card-body">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-desc">{product.desc}</p>
        <div className="card-footer">
          <div className="price">₹{product.price.toFixed(2)}</div>
          <button className="btn primary" onClick={onAdd}>Add to cart</button>
        </div>
      </div>
    </article>
  );
}
