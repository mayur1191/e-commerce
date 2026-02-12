require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./db");
const { authRequired, adminOnly } = require("./auth");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5050;

function orderId() {
  const p1 = Math.random().toString(16).slice(2, 6).toUpperCase();
  const p2 = Math.random().toString(16).slice(2, 6).toUpperCase();
  const ts = Date.now().toString(36).toUpperCase().slice(-4);
  return `GT-${p1}-${p2}-${ts}`;
}

function deriveStatus(createdAtISO) {
  const t = new Date(createdAtISO).getTime();
  const mins = (Date.now() - t) / 60000;
  if (mins < 1.5) return "Placed";
  if (mins < 3) return "Packed";
  if (mins < 6) return "Shipped";
  return "Delivered";
}

// health
app.get("/api/health", (req, res) => res.json({ ok: true }));

// auth
app.post("/api/auth/register", (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ error: "Missing fields" });

  const exists = db.prepare("SELECT id FROM users WHERE email=?").get(email);
  if (exists) return res.status(409).json({ error: "Email already used" });

  const hash = bcrypt.hashSync(password, 10);
  const info = db.prepare("INSERT INTO users(name,email,password_hash,role) VALUES(?,?,?,?)")
    .run(name, email, hash, "user");

  const token = jwt.sign({ id: info.lastInsertRowid, email, role: "user" }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: info.lastInsertRowid, name, email, role: "user" } });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Missing fields" });

  const user = db.prepare("SELECT * FROM users WHERE email=?").get(email);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = bcrypt.compareSync(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

// products
app.get("/api/products", (req, res) => {
  const { category, q, sort } = req.query;
  let list = db.prepare("SELECT * FROM products ORDER BY id DESC").all();

  if (category && category !== "All") list = list.filter(p => p.category === category);
  if (q) {
    const s = String(q).toLowerCase();
    list = list.filter(p =>
      p.name.toLowerCase().includes(s) ||
      p.description.toLowerCase().includes(s) ||
      p.category.toLowerCase().includes(s)
    );
  }

  if (sort === "Price: Low") list.sort((a,b)=>a.price-b.price);
  if (sort === "Price: High") list.sort((a,b)=>b.price-a.price);
  if (sort === "Top Rated") list.sort((a,b)=>b.rating-a.rating);

  // normalize sizes
  list = list.map(p => ({ ...p, sizes: p.sizes.split(",") }));
  res.json(list);
});

app.post("/api/products", authRequired, adminOnly, (req, res) => {
  const { name, category, price, rating, image, description, sizes } = req.body || {};
  if (!name || !category || !price || !image || !description || !Array.isArray(sizes) || !sizes.length) {
    return res.status(400).json({ error: "Missing fields" });
  }
  const now = new Date().toISOString();
  const info = db.prepare(`
    INSERT INTO products(name,category,price,rating,image,description,sizes,created_at)
    VALUES(?,?,?,?,?,?,?,?)
  `).run(name, category, Number(price), Number(rating || 4.6), image, description, sizes.join(","), now);

  const created = db.prepare("SELECT * FROM products WHERE id=?").get(info.lastInsertRowid);
  created.sizes = created.sizes.split(",");
  res.json(created);
});

// orders
app.post("/api/orders", authRequired, (req, res) => {
  const { items, address, totals } = req.body || {};
  if (!Array.isArray(items) || !items.length) return res.status(400).json({ error: "Cart is empty" });
  if (!address?.name || !address?.phone || !address?.line || !address?.city) return res.status(400).json({ error: "Missing address" });
  if (!totals?.subtotal && totals?.subtotal !== 0) return res.status(400).json({ error: "Missing totals" });

  // payment demo (simulate success)
  // Here you can integrate Stripe later (server-side).
  const id = orderId();
  const createdAt = new Date().toISOString();

  db.prepare(`
    INSERT INTO orders(id,user_id,status,total,shipping,subtotal,address_name,address_phone,address_line,address_city,items_json,created_at)
    VALUES(?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    id,
    req.user.id,
    "Placed",
    Number(totals.total),
    Number(totals.shipping),
    Number(totals.subtotal),
    address.name,
    address.phone,
    address.line,
    address.city,
    JSON.stringify(items),
    createdAt
  );

  res.json({ id, status: "Placed", createdAt });
});

app.get("/api/orders/my", authRequired, (req, res) => {
  const rows = db.prepare("SELECT * FROM orders WHERE user_id=? ORDER BY created_at DESC").all(req.user.id);
  res.json(rows.map(o => ({
    id: o.id,
    status: deriveStatus(o.created_at),
    total: o.total,
    createdAt: o.created_at
  })));
});

app.get("/api/orders/:id", (req, res) => {
  const id = String(req.params.id || "").toUpperCase();
  const o = db.prepare("SELECT * FROM orders WHERE id=?").get(id);
  if (!o) return res.status(404).json({ error: "Not found" });

  res.json({
    id: o.id,
    status: deriveStatus(o.created_at),
    createdAt: o.created_at,
    totals: { subtotal: o.subtotal, shipping: o.shipping, total: o.total },
    address: { name: o.address_name, phone: o.address_phone, line: o.address_line, city: o.address_city },
    items: JSON.parse(o.items_json)
  });
});
// --- ADMIN: list all orders ---
app.get("/api/admin/orders", authRequired, adminOnly, (req, res) => {
  const rows = db.prepare(`
    SELECT
      o.id, o.status, o.total, o.shipping, o.subtotal, o.created_at,
      o.address_name, o.address_phone, o.address_city,
      u.email as user_email
    FROM orders o
    LEFT JOIN users u ON u.id = o.user_id
    ORDER BY o.created_at DESC
  `).all();

  res.json(rows.map(o => ({
    id: o.id,
    status: deriveStatus(o.created_at), // derived demo timeline
    rawStatus: o.status,                // original saved status if you want it
    total: o.total,
    subtotal: o.subtotal,
    shipping: o.shipping,
    createdAt: o.created_at,
    customer: {
      name: o.address_name,
      phone: o.address_phone,
      city: o.address_city,
      email: o.user_email || null
    }
  })));
});

// --- ADMIN: get order details ---
app.get("/api/admin/orders/:id", authRequired, adminOnly, (req, res) => {
  const id = String(req.params.id || "").toUpperCase();
  const o = db.prepare("SELECT * FROM orders WHERE id=?").get(id);
  if (!o) return res.status(404).json({ error: "Not found" });

  res.json({
    id: o.id,
    status: deriveStatus(o.created_at),
    rawStatus: o.status,
    createdAt: o.created_at,
    totals: { subtotal: o.subtotal, shipping: o.shipping, total: o.total },
    address: {
      name: o.address_name,
      phone: o.address_phone,
      line: o.address_line,
      city: o.address_city,
    },
    items: JSON.parse(o.items_json)
  });
});

// --- ADMIN: update order status ---
app.patch("/api/admin/orders/:id/status", authRequired, adminOnly, (req, res) => {
  const id = String(req.params.id || "").toUpperCase();
  const { status } = req.body || {};
  const allowed = ["Placed", "Packed", "Shipped", "Delivered"];

  if (!allowed.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const exists = db.prepare("SELECT id FROM orders WHERE id=?").get(id);
  if (!exists) return res.status(404).json({ error: "Not found" });

  db.prepare("UPDATE orders SET status=? WHERE id=?").run(status, id);
  res.json({ ok: true, id, status });
});
// single product
app.get("/api/products/:id", (req, res) => {
  const id = Number(req.params.id);
  const p = db.prepare("SELECT * FROM products WHERE id=?").get(id);
  if (!p) return res.status(404).json({ error: "Not found" });
  res.json({ ...p, sizes: p.sizes.split(",") });
});
app.get("/api/categories", (req, res) => {
  const rows = db.prepare("SELECT * FROM categories ORDER BY name ASC").all();
  res.json(rows);
});
app.get("/api/category/:slug/products", (req, res) => {
  const slug = String(req.params.slug || "").toLowerCase();
  const cat = db.prepare("SELECT * FROM categories WHERE slug=?").get(slug);
  if (!cat) return res.status(404).json({ error: "Category not found" });

  // match products.category = cat.name
  let list = db.prepare("SELECT * FROM products ORDER BY id DESC").all();
  list = list.filter(p => String(p.category).toLowerCase() === String(cat.name).toLowerCase());
  list = list.map(p => ({ ...p, sizes: p.sizes.split(",") }));
  res.json({ category: cat, products: list });
});
app.get("/api/blogs", (req, res) => {
  const rows = db.prepare("SELECT id,title,slug,excerpt,image,created_at FROM blogs ORDER BY created_at DESC").all();
  res.json(rows);
});

app.get("/api/blogs/:slug", (req, res) => {
  const slug = String(req.params.slug || "");
  const post = db.prepare("SELECT * FROM blogs WHERE slug=?").get(slug);
  if (!post) return res.status(404).json({ error: "Not found" });
  res.json(post);
});
app.get("/api/reviews", (req, res) => {
  const rows = db.prepare("SELECT * FROM reviews ORDER BY created_at DESC LIMIT 12").all();
  res.json(rows);
});
app.post("/api/contact", (req, res) => {
  const { name, email, subject, message } = req.body || {};
  if (!name || !email || !subject || !message) return res.status(400).json({ error: "Missing fields" });

  const now = new Date().toISOString();
  db.prepare("INSERT INTO contact_messages(name,email,subject,message,created_at) VALUES(?,?,?,?,?)")
    .run(name, email, subject, message, now);

  res.json({ ok: true });
});
app.get("/api/admin/contact", authRequired, adminOnly, (req, res) => {
  const rows = db.prepare("SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 200").all();
  res.json(rows);
});
app.post("/api/admin/categories", authRequired, adminOnly, (req, res) => {
  const { name, slug, image } = req.body || {};
  if (!name || !slug) return res.status(400).json({ error: "Missing fields" });

  const now = new Date().toISOString();
  try {
    db.prepare("INSERT INTO categories(name,slug,image,created_at) VALUES(?,?,?,?)")
      .run(name, slug.toLowerCase(), image || null, now);
    res.json({ ok: true });
  } catch {
    res.status(409).json({ error: "Category name/slug already exists" });
  }
});

app.get("/api/categories", (req, res) => {
  const rows = db.prepare("SELECT * FROM categories ORDER BY name ASC").all();
  res.json(rows);
});

app.listen(PORT, () => console.log(`✅ API running on http://localhost:${PORT}`));
