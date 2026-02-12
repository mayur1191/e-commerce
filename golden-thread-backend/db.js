const Database = require("better-sqlite3");
const bcrypt = require("bcrypt");

const db = new Database("store.db");

// tables
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user'
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL,
  rating REAL NOT NULL DEFAULT 4.6,
  image TEXT NOT NULL,
  description TEXT NOT NULL,
  sizes TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id INTEGER,
  status TEXT NOT NULL,
  total REAL NOT NULL,
  shipping REAL NOT NULL,
  subtotal REAL NOT NULL,
  address_name TEXT NOT NULL,
  address_phone TEXT NOT NULL,
  address_line TEXT NOT NULL,
  address_city TEXT NOT NULL,
  items_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  image TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS blogs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  image TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL
);
`);

// seed admin if missing
const adminEmail = "admin@golden.local";
const admin = db.prepare("SELECT * FROM users WHERE email=?").get(adminEmail);
if (!admin) {
  const hash = bcrypt.hashSync("admin123", 10);
  db.prepare("INSERT INTO users(name,email,password_hash,role) VALUES(?,?,?,?)")
    .run("Admin", adminEmail, hash, "admin");
  console.log("✅ Seeded admin:", adminEmail, "password: admin123");
}

// seed products if empty
const count = db.prepare("SELECT COUNT(*) as c FROM products").get().c;
if (count === 0) {
  const now = new Date().toISOString();
  const seed = [
    ["Goldline Bomber Jacket","Men",189,4.7,"https://images.unsplash.com/photo-1520975693411-4373f4b0b47d?auto=format&fit=crop&w=1200&q=80","Premium bomber with a satin-gold sheen and warm lining.","S,M,L,XL"],
    ["Golden Aura Dress","Women",199,4.8,"https://images.unsplash.com/photo-1520975685467-82f5f0c0d8a2?auto=format&fit=crop&w=1200&q=80","Elegant flow with luxe finish.","XS,S,M,L"],
    ["Mini Explorer Hoodie","Kid",79,4.8,"https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=1200&q=80","Soft hoodie for everyday adventures.","2Y,4Y,6Y,8Y"]
  ];
  const ins = db.prepare(`
    INSERT INTO products(name,category,price,rating,image,description,sizes,created_at)
    VALUES(?,?,?,?,?,?,?,?)
  `);
  for (const p of seed) ins.run(...p, now);
  console.log("✅ Seeded products");
  
}
// seed categories
const catCount = db.prepare("SELECT COUNT(*) as c FROM categories").get().c;
if (catCount === 0) {
  const now = new Date().toISOString();
  const cats = [
    ["Men", "men", "https://images.unsplash.com/photo-1520975682031-a12c7d1fb26f?auto=format&fit=crop&w=1200&q=80"],
    ["Women", "women", "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80"],
    ["Kid", "kid", "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=1200&q=80"],
    ["Hoodies", "hoodies", "https://images.unsplash.com/photo-1520975682031-a12c7d1fb26f?auto=format&fit=crop&w=1200&q=80"],
    ["Dresses", "dresses", "https://images.unsplash.com/photo-1520975685467-82f5f0c0d8a2?auto=format&fit=crop&w=1200&q=80"]
  ];
  const ins = db.prepare("INSERT INTO categories(name,slug,image,created_at) VALUES(?,?,?,?)");
  cats.forEach(c => ins.run(c[0], c[1], c[2], now));
  console.log("✅ Seeded categories");
}

// seed blogs
const blogCount = db.prepare("SELECT COUNT(*) as c FROM blogs").get().c;
if (blogCount === 0) {
  const now = new Date().toISOString();
  const posts = [
    [
      "Golden Theme Styling: 5 Outfit Ideas",
      "golden-theme-styling-5-ideas",
      "Learn how to style gold accents without overdoing it.",
      "Gold accents work best when balanced with neutrals like black, cream, and denim...\n\nTip 1: Keep one statement piece...\nTip 2: Pair with matte textures...\nTip 3: Use minimal accessories...\n\nTry these combinations for Men, Women, and Kid outfits.",
      "https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=1200&q=80"
    ],
    [
      "How to Choose the Perfect Fit",
      "how-to-choose-perfect-fit",
      "A quick guide to fit, fabric, and comfort for everyday wear.",
      "Choosing the right fit is about shoulder lines, waist comfort, and movement...\n\nWe recommend measuring...\n\nFor hoodies: size up for oversized looks.\nFor dresses: focus on waist and length.",
      "https://images.unsplash.com/photo-1520975693411-4373f4b0b47d?auto=format&fit=crop&w=1200&q=80"
    ]
  ];
  const ins = db.prepare("INSERT INTO blogs(title,slug,excerpt,content,image,created_at) VALUES(?,?,?,?,?,?)");
  posts.forEach(p => ins.run(p[0], p[1], p[2], p[3], p[4], now));
  console.log("✅ Seeded blogs");
}

// seed reviews
const revCount = db.prepare("SELECT COUNT(*) as c FROM reviews").get().c;
if (revCount === 0) {
  const now = new Date().toISOString();
  const revs = [
    ["Ayesha", 5, "Amazing quality and the golden vibe looks premium."],
    ["Omar", 5, "Fast delivery and great fitting. Love the hoodie!"],
    ["Sara", 4, "Nice fabric and stitching. The theme is very elegant."]
  ];
  const ins = db.prepare("INSERT INTO reviews(name,rating,comment,created_at) VALUES(?,?,?,?)");
  revs.forEach(r => ins.run(r[0], r[1], r[2], now));
  console.log("✅ Seeded reviews");
}



module.exports = db;
