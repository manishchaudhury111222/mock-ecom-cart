const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export async function fetchProducts() {
    const res = await fetch(`${BASE}/api/products`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
}

export async function fetchCart() {
    const res = await fetch(`${BASE}/api/cart`);
    if (!res.ok) throw new Error('Failed to fetch cart');
    return res.json();
}

export async function addToCart(productId, qty = 1) {
    const res = await fetch(`${BASE}/api/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, qty })
    });
    return res.json();
}

export async function removeCartItem(id) {
    const res = await fetch(`${BASE}/api/cart/${id}`, { method: 'DELETE' });
    return res.json();
}

export async function updateCartItem(id, qty) {
    const res = await fetch(`${BASE}/api/cart/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qty })
    });
    return res.json();
}

export async function checkout(payload) {
    const res = await fetch(`${BASE}/api/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    return res.json();
}
