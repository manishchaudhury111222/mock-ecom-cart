// backend/server.js
// Simple file-backed mock DB using fs.promises
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const { nanoid } = require('nanoid');

const app = express();
app.use(cors());
app.use(express.json());

const DB_FILE = path.join(__dirname, 'db.json');
const TEMP_DB_FILE = path.join(__dirname, 'db.json.tmp');

// Helper: load DB from file (safe read)
async function loadDB() {
    try {
        const raw = await fs.readFile(DB_FILE, 'utf8');
        const data = JSON.parse(raw);
        // ensure structure
        data.products = data.products || [];
        data.cart = data.cart || [];
        return data;
    } catch (err) {
        // If file missing or invalid, initialize default
        const initial = { products: [], cart: [] };
        await writeDB(initial);
        return initial;
    }
}

// Helper: atomic write (write temp then rename)
async function writeDB(data) {
    const str = JSON.stringify(data, null, 2);
    await fs.writeFile(TEMP_DB_FILE, str, 'utf8');
    await fs.rename(TEMP_DB_FILE, DB_FILE);
}

// Utility: calculate cart total
function calcTotal(cart, products) {
    let total = 0;
    for (const item of cart) {
        const prod = products.find(p => p.id === item.productId);
        if (prod) total += (Number(prod.price) || 0) * (Number(item.qty) || 0);
    }
    return Number(total.toFixed(2));
}

// Initialize DB file if not present (with sample products)
async function ensureInitialData() {
    const data = await loadDB();
    if (!data.products || data.products.length === 0) {
        data.products = [
            { "id": "p1", "name": "Aurora Wireless Headphones", "price": 79.99, "desc": "Crisp sound, 30h battery" },
            { "id": "p2", "name": "Nimbus Smartwatch", "price": 129.95, "desc": "Heart-rate, sleep tracking" },
            { "id": "p3", "name": "Lumen Desk Lamp", "price": 39.5, "desc": "Warm/cool dimmable light" },
            { "id": "p4", "name": "Vega Thermal Mug", "price": 19.99, "desc": "Keeps drinks hot for 6h" },
            { "id": "p5", "name": "Atlas Backpack", "price": 59.0, "desc": "Laptop friendly, water-resistant" }
        ];
        data.cart = [];
        await writeDB(data);
    }
}
ensureInitialData().catch(err => console.error('DB init error:', err));

/**
 * GET /api/products
 */
app.get('/api/products', async (req, res) => {
    try {
        const db = await loadDB();
        res.json(db.products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to load products' });
    }
});

/**
 * GET /api/cart
 */
app.get('/api/cart', async (req, res) => {
    try {
        const db = await loadDB();
        const cart = db.cart.map(ci => {
            const prod = db.products.find(p => p.id === ci.productId) || {};
            return {
                id: ci.id,
                productId: ci.productId,
                qty: ci.qty,
                product: { name: prod.name, price: prod.price, desc: prod.desc }
            };
        });
        const total = calcTotal(db.cart, db.products);
        res.json({ cart, total });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to load cart' });
    }
});

/**
 * POST /api/cart
 * Body: { productId, qty }
 */
app.post('/api/cart', async (req, res) => {
    try {
        const { productId, qty } = req.body;
        if (!productId || !qty || qty <= 0) return res.status(400).json({ error: 'Invalid payload' });

        const db = await loadDB();
        const exists = db.products.find(p => p.id === productId);
        if (!exists) return res.status(404).json({ error: 'Product not found' });

        const existing = db.cart.find(c => c.productId === productId);
        if (existing) {
            existing.qty += qty;
        } else {
            db.cart.push({ id: nanoid(), productId, qty });
        }
        await writeDB(db);
        const total = calcTotal(db.cart, db.products);
        res.json({ success: true, total });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to add to cart' });
    }
});

/**
 * DELETE /api/cart/:id
 */
app.delete('/api/cart/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const db = await loadDB();
        const before = db.cart.length;
        db.cart = db.cart.filter(c => c.id !== id);
        await writeDB(db);
        const after = db.cart.length;
        if (before === after) return res.status(404).json({ error: 'Cart item not found' });
        const total = calcTotal(db.cart, db.products);
        res.json({ success: true, total });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to remove cart item' });
    }
});

/**
 * POST /api/cart/:id  (update qty)
 * Body: { qty }
 */
app.post('/api/cart/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { qty } = req.body;
        if (qty == null || qty < 0) return res.status(400).json({ error: 'Invalid qty' });

        const db = await loadDB();
        const item = db.cart.find(c => c.id === id);
        if (!item) return res.status(404).json({ error: 'Item not found' });
        if (qty === 0) {
            db.cart = db.cart.filter(c => c.id !== id);
        } else {
            item.qty = qty;
        }
        await writeDB(db);
        const total = calcTotal(db.cart, db.products);
        res.json({ success: true, total });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update item' });
    }
});

/**
 * POST /api/checkout
 * Body: { name, email }
 */
app.post('/api/checkout', async (req, res) => {
    try {
        const { name, email } = req.body;
        if (!name || !email) return res.status(400).json({ error: 'Name and email required' });

        const db = await loadDB();
        if (!db.cart || db.cart.length === 0) return res.status(400).json({ error: 'Cart is empty' });

        const total = calcTotal(db.cart, db.products);
        const receipt = {
            id: 'r_' + nanoid(),
            name,
            email,
            items: db.cart,
            total,
            timestamp: new Date().toISOString()
        };

        // clear cart
        db.cart = [];
        await writeDB(db);

        res.json({ success: true, receipt });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Checkout failed' });
    }
});

/**
 * Dev: reset DB (clear cart)
 */
app.post('/api/_reset', async (req, res) => {
    try {
        const db = await loadDB();
        db.cart = [];
        await writeDB(db);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Reset failed' });
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend server running on http://localhost:${PORT}`));
