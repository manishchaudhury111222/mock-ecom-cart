import React from 'react';
import ProductCard from './ProductCard';

export default function ProductGrid({ products = [], loading, onAdd }) {
  if (loading) {
    return <div className="grid-skel">Loading products…</div>;
  }
  return (
    <section className="grid">
      {products.map(p => (
        <ProductCard key={p.id} product={p} onAdd={() => onAdd(p.id, 1)} />
      ))}
    </section>
  );
}
