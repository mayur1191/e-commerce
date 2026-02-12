import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, Link, useNavigate, useLocation ,useParams} from "react-router-dom";
import { api, getUser, setToken, setUser } from "./api.js";

function money(n){ return `AED ${Number(n).toFixed(2)}`; }

export default function App(){
  const [user, setUserState] = useState(getUser());
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem("gt_cart2")||"[]"); } catch { return []; }
  });

  useEffect(()=> localStorage.setItem("gt_cart2", JSON.stringify(cart)), [cart]);

  const logout = () => {
    setToken("");
    setUser(null);
    setUserState(null);
  };

  return (
    <>
      <Header user={user} cart={cart} logout={logout} />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop cart={cart} setCart={setCart} />} />
          <Route path="/product/:id" element={<ProductPage cart={cart} setCart={setCart} />} />

          <Route path="/category/:slug" element={<CategoryPage cart={cart} setCart={setCart} />} />

          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blog/:slug" element={<BlogSingle />} />
          
          <Route path="/contact" element={<Contact />} />

          <Route path="/cart" element={<CartPage user={user} cart={cart} setCart={setCart} />} />
          <Route path="/checkout" element={<CheckoutPage user={user} cart={cart} setCart={setCart} />} />
          <Route path="/thank-you" element={<ThankYou />} />

          <Route path="/login" element={<Login setUserState={setUserState} />} />
          <Route path="/track" element={<Track />} />
          <Route path="/admin" element={<Admin user={user} />} />
          <Route path="/admin/categories" element={<Admin user={user} defaultTab="categories" />} />

          <Route path="*" element={<NotFound />} />
        </Routes>

      </div>

      <div style={{padding:"18px 0 28px", color:"var(--muted)", fontSize:12, borderTop:"1px solid rgba(212,175,55,.12)"}}>
        <div className="container" style={{display:"flex",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}>
          <div>© {new Date().getFullYear()} Golden Thread</div>
          <div>WooCommerce-like flow • Shop → Cart → Checkout</div>
        </div>
      </div>
    </>
  );
}

function Header({ user, cart, logout }){
  const cartCount = cart.reduce((s,it)=>s+it.qty,0);
  const loc = useLocation();

  const chipClass = (path) => "chip" + (loc.pathname === path ? " active" : "");

  return (
    <div className="topbar">
      <div className="container">
        <div className="nav">
          <Link className="brand" to="/">
            <div className="logo"></div>
            <div>
              <h1>GOLDEN THREAD</h1>
              <small>Men • Women • Kid</small>
            </div>
          </Link>

         <div className="row">
          <Link className={chipClass("/")} to="/">Home</Link>
          <Link className={chipClass("/shop")} to="/shop">Shop</Link>
          <Link className={chipClass("/cart")} to="/cart">Cart</Link>
          <Link className={chipClass("/checkout")} to="/checkout">Checkout</Link>
          <Link className={chipClass("/track")} to="/track">Track Order</Link>
          <Link className={chipClass("/blogs")} to="/blogs">Blogs</Link>
<Link className={chipClass("/contact")} to="/contact">Contact</Link>
          {user?.role === "admin" && <Link className={chipClass("/admin")} to="/admin">Admin</Link>}
        </div>


          <div className="row">
            <span className="chip" style={{cursor:"default"}}>
              Cart: <b style={{color:"var(--gold2)"}}>{cartCount}</b>
            </span>
            {user ? (
              <>
                <span className="chip" style={{cursor:"default"}}>
                  {user.email} ({user.role})
                </span>
                <button className="btn" onClick={logout}>Logout</button>
              </>
            ) : (
              <Link className="btn primary" to="/login">Login</Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
function Home(){
  const [featured, setFeatured] = useState([]);
  const [cats, setCats] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    Promise.all([
      api.products({ category:"All", sort:"Top Rated" }),
      api.categories(),
      api.blogs(),
      api.reviews()
    ])
      .then(([prods, c, b, r]) => {
        setFeatured(prods.slice(0, 4));
        setCats(c);
        setBlogs(b.slice(0, 3));
        setReviews(r.slice(0, 6));
      })
      .catch(e => setErr(e.message));
  }, []);

  return (
    <div style={{padding:"18px 0 30px"}}>
      {/* HERO */}
      <div className="card" style={{padding:16}}>
        <div style={{display:"flex", justifyContent:"space-between", gap:12, flexWrap:"wrap", alignItems:"center"}}>
          <div>
            <div style={{fontWeight:900, fontSize:26}}>Golden Thread</div>
            <div className="muted" style={{marginTop:6, fontSize:13, maxWidth:620}}>
              Premium clothing with a golden theme. Shop by category, read style blogs, and track orders like WooCommerce.
            </div>
            <div style={{height:12}} />
            <div className="row">
              <Link className="btn primary" to="/shop">Shop Now</Link>
              <Link className="btn" to="/blogs">Read Blogs</Link>
              <Link className="btn" to="/contact">Contact</Link>
            </div>
          </div>

          <div className="card" style={{
            width: "min(420px, 100%)",
            overflow:"hidden",
            padding:0,
            background:"rgba(17,17,26,.25)"
          }}>
            <div style={{
              height:220,
              backgroundImage:"url(https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=1200&q=80)",
              backgroundSize:"cover",
              backgroundPosition:"center"
            }} />
          </div>
        </div>

        {err && <div className="muted" style={{marginTop:10}}>{err}</div>}
      </div>

      <div style={{height:14}} />

      {/* CATEGORIES */}
      <div className="card" style={{padding:16}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", gap:10, flexWrap:"wrap"}}>
          <div style={{fontWeight:900}}>Shop by Category</div>
          <Link className="chip" to="/shop">View all products</Link>
        </div>

        <div style={{height:12}} />
        <div className="grid">
          {cats.map(c => (
            <Link key={c.id} to={`/category/${c.slug}`} className="card" style={{padding:12, background:"rgba(17,17,26,.25)"}}>
              <div style={{
                height:180, borderRadius:16,
                backgroundImage:`url(${c.image || "https://images.unsplash.com/photo-1520975682031-a12c7d1fb26f?auto=format&fit=crop&w=1200&q=80"})`,
                backgroundSize:"cover", backgroundPosition:"center",
                border:"1px solid rgba(212,175,55,.14)"
              }} />
              <div style={{height:10}} />
              <div style={{fontWeight:900, fontSize:16}}>{c.name}</div>
              <div className="muted" style={{fontSize:12, marginTop:6}}>Open category →</div>
            </Link>
          ))}
        </div>
      </div>

      <div style={{height:14}} />

      {/* FEATURED */}
      <div className="card" style={{padding:16}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", gap:10, flexWrap:"wrap"}}>
          <div style={{fontWeight:900}}>Featured Products</div>
          <Link className="chip" to="/shop">View all</Link>
        </div>

        <div style={{height:12}} />
        <div className="grid">
          {featured.map(p => (
            <Link key={p.id} to={`/product/${p.id}`} className="card" style={{padding:12, background:"rgba(17,17,26,.25)"}}>
              <div style={{
                height:210, borderRadius:16,
                backgroundImage:`url(${p.image})`,
                backgroundSize:"cover", backgroundPosition:"center",
                border:"1px solid rgba(212,175,55,.14)"
              }} />
              <div style={{height:10}} />
              <div style={{display:"flex", justifyContent:"space-between", gap:10}}>
                <div style={{fontWeight:900}}>{p.name}</div>
                <span className="chip" style={{cursor:"default"}}>{p.category}</span>
              </div>
              <div className="muted" style={{fontSize:12, marginTop:6}}>
                ★ {Number(p.rating).toFixed(1)} • <span className="price">{money(p.price)}</span>
              </div>
              <div className="muted" style={{fontSize:12, marginTop:6}}>Open product →</div>
            </Link>
          ))}
        </div>
      </div>

      <div style={{height:14}} />

      {/* BLOGS */}
      <div className="card" style={{padding:16}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", gap:10, flexWrap:"wrap"}}>
          <div style={{fontWeight:900}}>Latest Blogs</div>
          <Link className="chip" to="/blogs">View all blogs</Link>
        </div>

        <div style={{height:12}} />
        <div style={{display:"grid", gridTemplateColumns:"repeat(3, minmax(0, 1fr))", gap:12}}>
          {blogs.map(b => (
            <Link key={b.id} to={`/blog/${b.slug}`} className="card" style={{padding:12, background:"rgba(17,17,26,.25)"}}>
              <div style={{
                height:160, borderRadius:16,
                backgroundImage:`url(${b.image || "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80"})`,
                backgroundSize:"cover", backgroundPosition:"center",
                border:"1px solid rgba(212,175,55,.14)"
              }} />
              <div style={{height:10}} />
              <div style={{fontWeight:900}}>{b.title}</div>
              <div className="muted" style={{fontSize:12, marginTop:6}}>{b.excerpt}</div>
              <div className="muted" style={{fontSize:12, marginTop:6}}>Read more →</div>
            </Link>
          ))}
        </div>

        <style>{`
          @media (max-width: 980px){
            div[style*="grid-template-columns:repeat(3"]{ grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>

      <div style={{height:14}} />

      {/* REVIEWS */}
      <div className="card" style={{padding:16}}>
        <div style={{fontWeight:900}}>Customer Reviews</div>
        <div className="muted" style={{fontSize:13, marginTop:6}}>Real feedback builds trust.</div>

        <div style={{height:12}} />
        <div style={{display:"grid", gridTemplateColumns:"repeat(3, minmax(0, 1fr))", gap:12}}>
          {reviews.map(r => (
            <div key={r.id} className="card" style={{padding:12, background:"rgba(17,17,26,.25)"}}>
              <div style={{fontWeight:900}}>{r.name}</div>
              <div className="muted" style={{fontSize:12, marginTop:6}}>
                {"★".repeat(r.rating)}{"☆".repeat(Math.max(0, 5 - r.rating))}
              </div>
              <div className="muted" style={{fontSize:13, marginTop:8, lineHeight:1.6}}>
                “{r.comment}”
              </div>
            </div>
          ))}
        </div>

        <style>{`
          @media (max-width: 980px){
            div[style*="grid-template-columns:repeat(3"]{ grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>

      <div style={{height:14}} />

      {/* CONTACT CTA */}
      <div className="card" style={{padding:16}}>
        <div style={{display:"flex", justifyContent:"space-between", gap:12, flexWrap:"wrap", alignItems:"center"}}>
          <div>
            <div style={{fontWeight:900, fontSize:18}}>Need help choosing?</div>
            <div className="muted" style={{fontSize:13, marginTop:6}}>
              Send us a message and we’ll reply as soon as possible.
            </div>
          </div>
          <Link className="btn primary" to="/contact">Contact Us</Link>
        </div>
      </div>
    </div>
  );
}


/* ---------------- SHOP ---------------- */
function Shop({ cart, setCart }){
  const [category, setCategory] = useState("All");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("Featured");
  const [products, setProducts] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api.products({ category, q, sort })
      .then(setProducts)
      .catch(e => setMsg(e.message));
  }, [category, q, sort]);

  const addToCart = (p, size, qty) => {
    setCart(prev => {
      const key = `${p.id}:${size}`;
      const i = prev.findIndex(x => x.key === key);
      if (i >= 0) {
        const n = prev.slice();
        n[i] = { ...n[i], qty: n[i].qty + qty };
        return n;
      }
      return [...prev, { key, id:p.id, name:p.name, price:p.price, image:p.image, size, qty }];
    });
    setMsg("Added to cart ✅");
    setTimeout(()=>setMsg(""), 1200);
  };

  return (
    <div style={{padding:"18px 0 26px"}}>
      <div className="card" style={{padding:16}}>
        <div style={{display:"flex", justifyContent:"space-between", gap:12, flexWrap:"wrap", alignItems:"center"}}>
          <div>
            <div style={{fontWeight:900, fontSize:18}}>Golden Theme Store</div>
            <div className="muted" style={{fontSize:13}}>Flip cards • Add to cart • Cart page • Checkout page</div>
          </div>

          <div className="row">
            {["All","Men","Women","Kid"].map(c => (
              <button key={c} className={"chip" + (category===c ? " active":"")} onClick={()=>setCategory(c)}>
                {c}
              </button>
            ))}
          </div>

          <div className="row">
            <input className="input" value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search…" />
            <select className="input" value={sort} onChange={(e)=>setSort(e.target.value)}>
              <option>Featured</option>
              <option>Top Rated</option>
              <option>Price: Low</option>
              <option>Price: High</option>
            </select>
          </div>
        </div>

        {msg && <div className="muted" style={{marginTop:10}}>{msg}</div>}
      </div>

      <div className="grid">
        {products.map(p => <ProductCard key={p.id} p={p} onAdd={addToCart} />)}
      </div>
    </div>
  );
}

function ProductCard({ p, onAdd }){
  const [size, setSize] = useState(p.sizes?.[0] || "M");
  const [qty, setQty] = useState(1);

  return (
    <div className="flip">
      <div className="flipInner">
        <div className="face">
          <div className="frontImg" style={{backgroundImage:`url(${p.image})`}}></div>
          <div className="pad">
            <div style={{display:"flex", justifyContent:"space-between", gap:10}}>
              <div style={{fontWeight:900}}>{p.name}</div>
              <span className="chip" style={{cursor:"default"}}>{p.category}</span>
            </div>
            <div className="muted" style={{fontSize:12, marginTop:6}}>
              ★ {Number(p.rating).toFixed(1)} • <span className="price">{money(p.price)}</span>
            </div>
            <div className="muted" style={{fontSize:12, marginTop:6}}>Hover to flip</div>
          </div>
        </div>

        <div className="face back">
          <div style={{fontWeight:900}}>{p.name}</div>
          <div className="muted" style={{fontSize:13, lineHeight:1.5}}>{p.description}</div>

          <div>
            <div className="muted" style={{fontSize:12, fontWeight:900}}>Sizes</div>
            <div className="sizes" style={{marginTop:8}}>
              {(p.sizes||[]).map(s => (
                <button key={s} className={"size"+(s===size?" active":"")} onClick={()=>setSize(s)}>{s}</button>
              ))}
            </div>
          </div>

          <div style={{display:"flex", justifyContent:"space-between", gap:10, marginTop:"auto"}}>
            <div className="row">
              <button className="btn" onClick={()=>setQty(q=>Math.max(1,q-1))}>-</button>
              <span style={{fontWeight:900}}>{qty}</span>
              <button className="btn" onClick={()=>setQty(q=>q+1)}>+</button>
            </div>
            <Link to={`/product/${p.id}`} className="btn" style={{marginTop:10, display:"inline-block"}}>
              View Product
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
function CategoryPage({ setCart }){
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    setErr(""); setData(null);
    api.categoryProducts(slug)
      .then(setData)
      .catch(e => setErr(e.message));
  }, [slug]);

  const addQuick = (p) => {
    const size = p.sizes?.[0] || "M";
    setCart(prev => {
      const key = `${p.id}:${size}`;
      const i = prev.findIndex(x => x.key === key);
      if (i >= 0) {
        const n = prev.slice();
        n[i] = { ...n[i], qty: n[i].qty + 1 };
        return n;
      }
      return [...prev, { key, id:p.id, name:p.name, price:p.price, image:p.image, size, qty:1 }];
    });
  };

  if (err) return <div style={{padding:"18px 0"}} className="muted">{err}</div>;
  if (!data) return <div style={{padding:"18px 0"}} className="muted">Loading category...</div>;

  return (
    <div style={{padding:"18px 0 30px"}}>
      <div className="card" style={{padding:16}}>
        <div style={{display:"flex", justifyContent:"space-between", gap:10, flexWrap:"wrap", alignItems:"center"}}>
          <div>
            <div style={{fontWeight:900, fontSize:20}}>{data.category.name}</div>
            <div className="muted" style={{fontSize:13}}>All products in this category.</div>
          </div>
          <Link className="btn" to="/shop">Back to Shop</Link>
        </div>
      </div>

      <div style={{height:12}} />

      <div className="grid">
        {data.products.map(p => (
          <div key={p.id} className="card" style={{padding:12, background:"rgba(17,17,26,.25)"}}>
            <Link to={`/product/${p.id}`}>
              <div style={{
                height:210, borderRadius:16,
                backgroundImage:`url(${p.image})`,
                backgroundSize:"cover", backgroundPosition:"center",
                border:"1px solid rgba(212,175,55,.14)"
              }} />
            </Link>
            <div style={{height:10}} />
            <div style={{fontWeight:900}}>{p.name}</div>
            <div className="muted" style={{fontSize:12, marginTop:6}}>
              ★ {Number(p.rating).toFixed(1)} • <span className="price">{money(p.price)}</span>
            </div>
            <div style={{height:10}} />
            <div className="row" style={{justifyContent:"space-between"}}>
              <Link className="btn" to={`/product/${p.id}`}>View</Link>
              <button className="btn primary" onClick={() => addQuick(p)}>Add</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
function Blogs(){
  const [posts, setPosts] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    api.blogs().then(setPosts).catch(e => setErr(e.message));
  }, []);

  return (
    <div style={{padding:"18px 0 30px"}}>
      <div className="card" style={{padding:16}}>
        <div style={{fontWeight:900, fontSize:20}}>Blogs</div>
        <div className="muted" style={{fontSize:13, marginTop:6}}>Tips, styling, and updates.</div>
        {err && <div className="muted" style={{marginTop:10}}>{err}</div>}
      </div>

      <div style={{height:12}} />

      <div style={{display:"grid", gridTemplateColumns:"repeat(3, minmax(0,1fr))", gap:12}}>
        {posts.map(b => (
          <Link key={b.id} to={`/blog/${b.slug}`} className="card" style={{padding:12, background:"rgba(17,17,26,.25)"}}>
            <div style={{
              height:170, borderRadius:16,
              backgroundImage:`url(${b.image || "https://images.unsplash.com/photo-1520975685467-82f5f0c0d8a2?auto=format&fit=crop&w=1200&q=80"})`,
              backgroundSize:"cover", backgroundPosition:"center",
              border:"1px solid rgba(212,175,55,.14)"
            }} />
            <div style={{height:10}} />
            <div style={{fontWeight:900}}>{b.title}</div>
            <div className="muted" style={{fontSize:12, marginTop:6}}>{b.excerpt}</div>
            <div className="muted" style={{fontSize:12, marginTop:6}}>Read more →</div>
          </Link>
        ))}
      </div>

      <style>{`
        @media (max-width: 980px){
          div[style*="grid-template-columns:repeat(3"]{ grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
function BlogSingle(){
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    setErr(""); setPost(null);
    api.blogBySlug(slug).then(setPost).catch(e => setErr(e.message));
  }, [slug]);

  if (err) return <div style={{padding:"18px 0"}} className="muted">{err}</div>;
  if (!post) return <div style={{padding:"18px 0"}} className="muted">Loading...</div>;

  return (
    <div style={{padding:"18px 0 30px"}}>
      <div className="card" style={{padding:16}}>
        <Link className="btn" to="/blogs">← Back to Blogs</Link>

        <div style={{height:12}} />
        <div style={{fontWeight:900, fontSize:22}}>{post.title}</div>
        <div className="muted" style={{fontSize:12, marginTop:6}}>
          {new Date(post.created_at).toLocaleDateString()}
        </div>

        <div style={{height:12}} />
        <div className="card" style={{padding:0, overflow:"hidden", background:"rgba(17,17,26,.25)"}}>
          <div style={{
            height:320,
            backgroundImage:`url(${post.image || ""})`,
            backgroundSize:"cover", backgroundPosition:"center"
          }} />
        </div>

        <div style={{height:12}} />
        <div className="muted" style={{whiteSpace:"pre-wrap", lineHeight:1.8}}>
          {post.content}
        </div>
      </div>
    </div>
  );
}
function Contact(){
  const [form, setForm] = useState({ name:"", email:"", subject:"", message:"" });
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async () => {
    setMsg("");
    if (!form.name || !form.email || !form.subject || !form.message) {
      setMsg("Please fill all fields.");
      return;
    }
    setSending(true);
    try {
      await api.contact(form);
      setMsg("Message sent ✅ We will contact you soon.");
      setForm({ name:"", email:"", subject:"", message:"" });
    } catch (e) {
      setMsg(e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{padding:"18px 0 30px"}}>
      <div className="card" style={{padding:16, maxWidth:760, margin:"0 auto"}}>
        <div style={{fontWeight:900, fontSize:20}}>Contact Us</div>
        <div className="muted" style={{fontSize:13, marginTop:6}}>Send us your question or request.</div>

        <div style={{height:12}} />
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
          <input className="input" value={form.name} onChange={(e)=>setForm(f=>({...f,name:e.target.value}))} placeholder="Name" />
          <input className="input" value={form.email} onChange={(e)=>setForm(f=>({...f,email:e.target.value}))} placeholder="Email" />
          <input className="input" style={{gridColumn:"1/-1"}} value={form.subject} onChange={(e)=>setForm(f=>({...f,subject:e.target.value}))} placeholder="Subject" />
          <textarea
            className="input"
            style={{gridColumn:"1/-1", minHeight:140, resize:"vertical"}}
            value={form.message}
            onChange={(e)=>setForm(f=>({...f,message:e.target.value}))}
            placeholder="Message"
          />
        </div>

        <div style={{height:12}} />
        <button className="btn primary" onClick={submit} disabled={sending} style={{opacity:sending?.6:1}}>
          {sending ? "Sending..." : "Send Message"}
        </button>

        {msg && <div className="muted" style={{marginTop:10}}>{msg}</div>}

        <style>{`
          @media (max-width: 720px){
            div[style*="grid-template-columns:1fr 1fr"]{ grid-template-columns:1fr !important; }
          }
        `}</style>
      </div>
    </div>
  );
}

function ProductPage({ cart, setCart }){
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [err, setErr] = useState("");
  const [size, setSize] = useState("");
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setErr(""); setP(null);
    api.productById(id)
      .then(prod => {
        setP(prod);
        setSize(prod.sizes?.[0] || "M");
      })
      .catch(e => setErr(e.message));
  }, [id]);

  const addToCart = () => {
    if (!p) return;
    const chosenSize = size || (p.sizes?.[0] || "M");

    setCart(prev => {
      const key = `${p.id}:${chosenSize}`;
      const i = prev.findIndex(x => x.key === key);
      if (i >= 0) {
        const n = prev.slice();
        n[i] = { ...n[i], qty: n[i].qty + qty };
        return n;
      }
      return [...prev, { key, id:p.id, name:p.name, price:p.price, image:p.image, size: chosenSize, qty }];
    });
  };

  if (err) {
    return <div style={{padding:"18px 0"}} className="muted">{err}</div>;
  }
  if (!p) {
    return <div style={{padding:"18px 0"}} className="muted">Loading product...</div>;
  }

  return (
    <div style={{padding:"18px 0 30px"}}>
      <div className="card" style={{padding:16}}>
        <div className="row" style={{justifyContent:"space-between"}}>
          <Link className="btn" to="/shop">← Back to Shop</Link>
          <Link className="btn" to="/cart">Go to Cart</Link>
        </div>

        <div style={{height:14}} />

        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:14}}>
          <div
            className="card"
            style={{
              padding:0,
              overflow:"hidden",
              background:"rgba(17,17,26,.25)"
            }}
          >
            <div
              style={{
                height:420,
                backgroundImage:`url(${p.image})`,
                backgroundSize:"cover",
                backgroundPosition:"center"
              }}
            />
          </div>

          <div className="card" style={{padding:14, background:"rgba(17,17,26,.25)"}}>
            <div style={{display:"flex", justifyContent:"space-between", gap:10, flexWrap:"wrap"}}>
              <div>
                <div style={{fontWeight:900, fontSize:20}}>{p.name}</div>
                <div className="muted" style={{marginTop:6}}>
                  Category: <b style={{color:"var(--gold2)"}}>{p.category}</b>
                </div>
                <div className="muted" style={{marginTop:6}}>
                  ★ {Number(p.rating).toFixed(1)}
                </div>
              </div>
              <div style={{fontWeight:900, fontSize:18}} className="price">{money(p.price)}</div>
            </div>

            <div style={{height:12}} />
            <div className="muted" style={{lineHeight:1.6}}>{p.description}</div>

            <div style={{height:12}} />

            <div style={{fontWeight:900, marginBottom:8}}>Choose Size</div>
            <div className="sizes">
              {(p.sizes || []).map(s => (
                <button key={s} className={"size" + (s===size ? " active":"")} onClick={()=>setSize(s)}>
                  {s}
                </button>
              ))}
            </div>

            <div style={{height:14}} />

            <div style={{display:"flex", justifyContent:"space-between", gap:10, flexWrap:"wrap", alignItems:"center"}}>
              <div className="row">
                <button className="btn" onClick={()=>setQty(q=>Math.max(1,q-1))}>-</button>
                <span style={{fontWeight:900}}>{qty}</span>
                <button className="btn" onClick={()=>setQty(q=>q+1)}>+</button>
              </div>

              <button className="btn primary" onClick={addToCart}>
                Add to Cart
              </button>
            </div>

            <div className="muted" style={{fontSize:12, marginTop:10}}>
              Tip: After adding, go to Cart → Checkout (WooCommerce style).
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 900px){
            div[style*="grid-template-columns:1fr 1fr"]{
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}

/* ---------------- CART PAGE ---------------- */
function CartPage({ user, cart, setCart }){
  const nav = useNavigate();

  const totals = useMemo(() => {
    const subtotal = cart.reduce((s,it)=>s + it.price*it.qty, 0);
    const shipping = cart.length ? 15 : 0;
    return { subtotal, shipping, total: subtotal + shipping };
  }, [cart]);

  const changeQty = (key, delta) => {
    setCart(prev => prev.map(it => it.key===key ? ({...it, qty: Math.max(1, it.qty+delta)}) : it));
  };
  const remove = (key) => setCart(prev => prev.filter(it => it.key!==key));
  const clear = () => setCart([]);

  return (
    <div style={{padding:"18px 0 30px"}}>
      <div className="card" style={{padding:16}}>
        <div style={{display:"flex", justifyContent:"space-between", gap:10, flexWrap:"wrap", alignItems:"center"}}>
          <div>
            <div style={{fontWeight:900, fontSize:18}}>Cart</div>
            <div className="muted" style={{fontSize:13}}>Review items before checkout.</div>
          </div>
          <div className="row">
            <button className="btn" onClick={()=>nav("/")}>Continue Shopping</button>
            <button className="btn" onClick={clear} disabled={!cart.length} style={{opacity:cart.length?1:.6}}>Clear Cart</button>
          </div>
        </div>

        <div style={{height:12}} />

        {cart.length === 0 ? (
          <div className="muted">Your cart is empty.</div>
        ) : (
          <div style={{display:"grid", gap:10}}>
            {cart.map(it => (
              <div key={it.key} className="card" style={{padding:12, background:"rgba(17,17,26,.30)"}}>
                <div style={{display:"grid", gridTemplateColumns:"72px 1fr auto", gap:12, alignItems:"center"}}>
                  <div style={{
                    width:72,height:72,borderRadius:16,
                    backgroundImage:`url(${it.image})`, backgroundSize:"cover", backgroundPosition:"center",
                    border:"1px solid rgba(212,175,55,.18)"
                  }} />
                  <div>
                    <div style={{fontWeight:900}}>{it.name}</div>
                    <div className="muted" style={{fontSize:12}}>
                      Size <b style={{color:"var(--gold2)"}}>{it.size}</b> • {money(it.price)}
                    </div>
                    <div className="muted" style={{fontSize:12}}>
                      Line total: <b style={{color:"var(--gold2)"}}>{money(it.price * it.qty)}</b>
                    </div>
                  </div>
                  <div className="row" style={{justifyContent:"flex-end"}}>
                    <button className="btn" onClick={()=>changeQty(it.key,-1)}>-</button>
                    <span style={{fontWeight:900}}>{it.qty}</span>
                    <button className="btn" onClick={()=>changeQty(it.key, +1)}>+</button>
                    <button className="btn" onClick={()=>remove(it.key)}>Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{height:14}} />

        <div className="card" style={{padding:14, background:"rgba(17,17,26,.25)"}}>
          <div style={{display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:10}}>
            <div className="muted">Subtotal: <b style={{color:"var(--gold2)"}}>{money(totals.subtotal)}</b></div>
            <div className="muted">Shipping: <b style={{color:"var(--gold2)"}}>{cart.length ? money(totals.shipping) : "—"}</b></div>
            <div style={{fontWeight:900}}>Total: <span className="price">{money(totals.total)}</span></div>
          </div>

          <div style={{height:12}} />

          <button
            className="btn primary"
            onClick={() => {
              if (!cart.length) return;
              nav("/checkout");
            }}
            disabled={!cart.length}
            style={{opacity:cart.length?1:.6, width:"100%"}}
          >
            Proceed to Checkout
          </button>

          {!user && (
            <div className="muted" style={{marginTop:10, fontSize:12}}>
              You’ll need to <Link to="/login" style={{color:"var(--gold2)", fontWeight:900}}>login</Link> before placing an order.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- CHECKOUT PAGE ---------------- */
function CheckoutPage({ user, cart, setCart }){
  const nav = useNavigate();

  const totals = useMemo(() => {
    const subtotal = cart.reduce((s,it)=>s + it.price*it.qty, 0);
    const shipping = cart.length ? 15 : 0;
    return { subtotal, shipping, total: subtotal + shipping };
  }, [cart]);

  const [form, setForm] = useState({
    name: "", phone: "", line: "", city: ""
  });
  const [payment, setPayment] = useState("cod"); // cod | card-demo
  const [placing, setPlacing] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!cart.length) {
      nav("/cart");
    }
  }, [cart.length, nav]);

  const valid =
    form.name.trim() && form.phone.trim() && form.line.trim() && form.city.trim() &&
    cart.length && user;

  const placeOrder = async () => {
    setErr("");
    if (!user) { nav("/login"); return; }
    if (!valid) return;

    setPlacing(true);
    try {
      // payment is demo here - backend simulates success
      const payload = {
        items: cart,
        address: { ...form },
        totals,
        paymentMethod: payment
      };
      const res = await api.placeOrder(payload);

      // clear cart, go thank you with order id
      setCart([]);
      nav("/thank-you", { state: { orderId: res.id } });
    } catch (e) {
      setErr(e.message);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div style={{padding:"18px 0 30px"}}>
      <div className="card" style={{padding:16}}>
        <div style={{display:"flex", justifyContent:"space-between", gap:10, flexWrap:"wrap", alignItems:"center"}}>
          <div>
            <div style={{fontWeight:900, fontSize:18}}>Checkout</div>
            <div className="muted" style={{fontSize:13}}>Billing details + order summary (WooCommerce style)</div>
          </div>
          <div className="row">
            <button className="btn" onClick={()=>nav("/cart")}>Back to Cart</button>
          </div>
        </div>

        {!user && (
          <div className="card" style={{padding:12, marginTop:12, background:"rgba(212,175,55,.08)"}}>
            <div className="muted">
              You must <Link to="/login" style={{color:"var(--gold2)", fontWeight:900}}>login</Link> to place an order.
            </div>
          </div>
        )}

        <div style={{height:14}} />

        <div style={{display:"grid", gridTemplateColumns:"1.1fr .9fr", gap:14}}>
          {/* Billing */}
          <div className="card" style={{padding:14, background:"rgba(17,17,26,.25)"}}>
            <div style={{fontWeight:900, marginBottom:10}}>Billing details</div>

            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
              <div>
                <div className="muted" style={{fontSize:12, fontWeight:900, marginBottom:6}}>Full name</div>
                <input className="input" value={form.name} onChange={(e)=>setForm(f=>({...f,name:e.target.value}))} />
              </div>
              <div>
                <div className="muted" style={{fontSize:12, fontWeight:900, marginBottom:6}}>Phone</div>
                <input className="input" value={form.phone} onChange={(e)=>setForm(f=>({...f,phone:e.target.value}))} />
              </div>
              <div style={{gridColumn:"1 / -1"}}>
                <div className="muted" style={{fontSize:12, fontWeight:900, marginBottom:6}}>Address</div>
                <input className="input" value={form.line} onChange={(e)=>setForm(f=>({...f,line:e.target.value}))} />
              </div>
              <div style={{gridColumn:"1 / -1"}}>
                <div className="muted" style={{fontSize:12, fontWeight:900, marginBottom:6}}>City</div>
                <input className="input" value={form.city} onChange={(e)=>setForm(f=>({...f,city:e.target.value}))} />
              </div>
            </div>

            <div style={{height:12}} />

            <div style={{fontWeight:900, marginBottom:8}}>Payment</div>
            <div style={{display:"grid", gap:8}}>
              <label className="card" style={{padding:12, background:"rgba(17,17,26,.20)", cursor:"pointer"}}>
                <input type="radio" name="pay" checked={payment==="cod"} onChange={()=>setPayment("cod")} />
                <span style={{marginLeft:8, fontWeight:900}}>Cash on Delivery</span>
                <div className="muted" style={{fontSize:12, marginTop:6}}>Pay when you receive the items.</div>
              </label>

              <label className="card" style={{padding:12, background:"rgba(17,17,26,.20)", cursor:"pointer"}}>
                <input type="radio" name="pay" checked={payment==="card-demo"} onChange={()=>setPayment("card-demo")} />
                <span style={{marginLeft:8, fontWeight:900}}>Card (Demo)</span>
                <div className="muted" style={{fontSize:12, marginTop:6}}>This demo simulates card payment success.</div>
              </label>
            </div>
          </div>

          {/* Order summary */}
          <div className="card" style={{padding:14, background:"rgba(17,17,26,.25)"}}>
            <div style={{fontWeight:900, marginBottom:10}}>Your order</div>

            <div style={{display:"grid", gap:10}}>
              {cart.map(it => (
                <div key={it.key} className="card" style={{padding:10, background:"rgba(17,17,26,.22)"}}>
                  <div style={{display:"flex", justifyContent:"space-between", gap:10}}>
                    <div style={{fontWeight:900, fontSize:13}}>
                      {it.name} <span className="muted">× {it.qty}</span>
                      <div className="muted" style={{fontSize:12}}>Size: <b style={{color:"var(--gold2)"}}>{it.size}</b></div>
                    </div>
                    <div style={{fontWeight:900, color:"var(--gold2)"}}>
                      {money(it.price * it.qty)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{height:12}} />

            <div className="card" style={{padding:12, background:"rgba(17,17,26,.22)"}}>
              <div className="muted" style={{display:"flex", justifyContent:"space-between"}}>
                <span>Subtotal</span><b style={{color:"var(--gold2)"}}>{money(totals.subtotal)}</b>
              </div>
              <div className="muted" style={{display:"flex", justifyContent:"space-between", marginTop:6}}>
                <span>Shipping</span><b style={{color:"var(--gold2)"}}>{money(totals.shipping)}</b>
              </div>
              <div style={{display:"flex", justifyContent:"space-between", marginTop:10, fontWeight:900}}>
                <span>Total</span><span className="price">{money(totals.total)}</span>
              </div>
            </div>

            {err && <div className="muted" style={{marginTop:10}}>{err}</div>}

            <div style={{height:12}} />

            <button
              className="btn primary"
              onClick={placeOrder}
              disabled={!valid || placing}
              style={{opacity:(!valid || placing)? .6 : 1, width:"100%"}}
            >
              {placing ? "Placing order..." : "Place order"}
            </button>

            {!user && (
              <div className="muted" style={{marginTop:10, fontSize:12}}>
                Login required to place order.
              </div>
            )}
          </div>
        </div>

        <style>{`
          @media (max-width: 900px){
            .container > div > .card > div[style*="grid-template-columns:1.1fr .9fr"]{
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}

/* ---------------- THANK YOU ---------------- */
function ThankYou(){
  const loc = useLocation();
  const nav = useNavigate();
  const orderId = loc.state?.orderId;

  return (
    <div style={{padding:"18px 0 30px"}}>
      <div className="card" style={{padding:16}}>
        <div style={{fontWeight:900, fontSize:18}}>Order received 🎉</div>
        <div className="muted" style={{fontSize:13, marginTop:6}}>
          Thank you. Your order has been placed successfully.
        </div>

        <div style={{height:12}} />

        <div className="card" style={{padding:12, background:"rgba(212,175,55,.08)"}}>
          <div className="muted" style={{fontSize:12, fontWeight:900}}>Order ID</div>
          <div style={{fontWeight:900, color:"var(--gold2)", fontSize:16}}>
            {orderId || "—"}
          </div>
          <div className="muted" style={{fontSize:12, marginTop:6}}>
            Copy this Order ID and track it from the tracking page.
          </div>
        </div>

        <div style={{height:12}} />

        <div className="row">
          <button className="btn primary" onClick={()=>nav("/track")}>Track Order</button>
          <button className="btn" onClick={()=>nav("/")}>Back to Shop</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- LOGIN / TRACK / ADMIN / NOTFOUND (same as before) ---------------- */
function Login({ setUserState }){
  const nav = useNavigate();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  const submit = async () => {
    setErr("");
    try {
      const res = mode === "login"
        ? await api.login(email, pass)
        : await api.register(name, email, pass);

      setToken(res.token);
      setUser(res.user);
      setUserState(res.user);
      nav("/");
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <div style={{padding:"18px 0 30px"}}>
      <div className="card" style={{padding:16, maxWidth:520, margin:"0 auto"}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", gap:10, flexWrap:"wrap"}}>
          <div style={{fontWeight:900, fontSize:18}}>{mode==="login" ? "Login" : "Register"}</div>
          <button className="chip" onClick={()=>setMode(mode==="login"?"register":"login")}>
            Switch to {mode==="login"?"Register":"Login"}
          </button>
        </div>

        <div style={{height:10}} />

        {mode==="register" && (
          <>
            <div className="muted" style={{fontSize:12, fontWeight:900, marginBottom:6}}>Full name</div>
            <input className="input" value={name} onChange={(e)=>setName(e.target.value)} style={{width:"100%"}} />
            <div style={{height:10}} />
          </>
        )}

        <div className="muted" style={{fontSize:12, fontWeight:900, marginBottom:6}}>Email</div>
        <input className="input" value={email} onChange={(e)=>setEmail(e.target.value)} style={{width:"100%"}} />

        <div style={{height:10}} />
        <div className="muted" style={{fontSize:12, fontWeight:900, marginBottom:6}}>Password</div>
        <input className="input" value={pass} onChange={(e)=>setPass(e.target.value)} type="password" style={{width:"100%"}} />

        <div style={{height:12}} />
        <button className="btn primary" onClick={submit} style={{width:"100%"}}>
          {mode==="login" ? "Login" : "Create account"}
        </button>

        {err && <div className="muted" style={{marginTop:10}}>{err}</div>}

        <div className="muted" style={{marginTop:12, fontSize:12, lineHeight:1.5}}>
          Admin demo account:<br/>
          <b style={{color:"var(--gold2)"}}>admin@golden.local</b> / <b style={{color:"var(--gold2)"}}>admin123</b>
        </div>
      </div>
    </div>
  );
}

function Track(){
  const [id, setId] = useState("");
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  const track = async () => {
    setErr(""); setData(null);
    try {
      const res = await api.trackOrder(id.trim().toUpperCase());
      setData(res);
    } catch (e) {
      setErr(e.message);
    }
  };

  const steps = ["Placed","Packed","Shipped","Delivered"];
  const rank = (s) => steps.indexOf(s);

  return (
    <div style={{padding:"18px 0 30px"}}>
      <div className="card" style={{padding:16}}>
        <div style={{display:"flex",justifyContent:"space-between",gap:10,flexWrap:"wrap",alignItems:"center"}}>
          <div style={{fontWeight:900, fontSize:18}}>Order Tracking</div>
          <div className="row">
            <input className="input" value={id} onChange={(e)=>setId(e.target.value)} placeholder="GT-XXXX-XXXX-XXXX" />
            <button className="btn primary" onClick={track}>Track</button>
          </div>
        </div>

        {err && <div className="muted" style={{marginTop:10}}>{err}</div>}
        {data && (
          <div style={{marginTop:14}}>
            <div className="muted">Order ID: <b style={{color:"var(--gold2)"}}>{data.id}</b></div>
            <div className="muted">Status: <b style={{color:"var(--gold2)"}}>{data.status}</b></div>
            <div className="muted">Total: <b style={{color:"var(--gold2)"}}>{money(data.totals.total)}</b></div>

            <div style={{height:10}} />
            {steps.map(s => (
              <div key={s} className="card" style={{
                padding:12, marginBottom:10,
                borderColor: rank(data.status) >= rank(s) ? "rgba(242,210,122,.6)" : "rgba(212,175,55,.18)"
              }}>
                <div style={{fontWeight:900}}>{s}</div>
                <div className="muted" style={{fontSize:12}}>
                  {rank(data.status) >= rank(s) ? "Completed" : "Pending"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Admin({ user }){
  const [tab, setTab] = useState("orders"); // orders | categories | addProduct
 // orders | addProduct

  if (!user) return <div style={{padding:"18px 0"}} className="muted">Login first.</div>;
  if (user.role !== "admin") return <div style={{padding:"18px 0"}} className="muted">Admin only.</div>;

  return (
    <div style={{padding:"18px 0 30px"}}>
      <div className="card" style={{padding:16}}>
        <div style={{display:"flex", justifyContent:"space-between", gap:10, flexWrap:"wrap", alignItems:"center"}}>
          <div>
            <div style={{fontWeight:900, fontSize:18}}>Admin Panel</div>
            <div className="muted" style={{fontSize:13}}>Manage orders + products</div>
          </div>

          <div className="row">
            <button className={"chip" + (tab==="orders" ? " active":"")} onClick={()=>setTab("orders")}>Orders</button>
            <button className={"chip" + (tab==="categories" ? " active":"")} onClick={()=>setTab("categories")}>Categories</button>
            <button className={"chip" + (tab==="addProduct" ? " active":"")} onClick={()=>setTab("addProduct")}>Add Product</button>

          </div>
        </div>
      </div>

      <div style={{height:12}} />

      {tab === "orders" ? <AdminOrders /> : tab === "categories" ? <AdminCategories /> : <AdminAddProduct />}

    </div>
  );
}
function AdminCategories(){
  const [list, setList] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    image: ""
  });

  const load = async () => {
    setLoading(true);
    setMsg("");
    try {
      const cats = await api.adminCategories();
      setList(cats);
    } catch (e) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const makeSlug = (s) =>
    s.toLowerCase().trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  const submit = async () => {
    setMsg("");
    const name = form.name.trim();
    const slug = (form.slug.trim() || makeSlug(name));

    if (!name) { setMsg("Category name required."); return; }
    if (!slug) { setMsg("Slug required."); return; }

    try {
      await api.adminCreateCategory({
        name,
        slug,
        image: form.image.trim() || null
      });
      setMsg("Category created ✅");
      setForm({ name:"", slug:"", image:"" });
      await load();
      setTimeout(()=>setMsg(""), 1200);
    } catch (e) {
      setMsg(e.message);
    }
  };

  return (
    <div className="card" style={{padding:16}}>
      <div style={{display:"flex", justifyContent:"space-between", gap:10, flexWrap:"wrap", alignItems:"center"}}>
        <div>
          <div style={{fontWeight:900, fontSize:18}}>Categories</div>
          <div className="muted" style={{fontSize:13}}>Create categories and use them on homepage + category pages.</div>
        </div>
        <button className="btn" onClick={load}>{loading ? "Refreshing..." : "Refresh"}</button>
      </div>

      {msg && <div className="muted" style={{marginTop:10}}>{msg}</div>}

      <div style={{height:12}} />

      <div className="card" style={{padding:12, background:"rgba(17,17,26,.25)"}}>
        <div style={{fontWeight:900, marginBottom:10}}>Add Category</div>

        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
          <input
            className="input"
            value={form.name}
            onChange={(e)=>setForm(f=>({...f, name:e.target.value, slug: makeSlug(e.target.value)}))}
            placeholder="Category name (e.g. Hoodies)"
          />
          <input
            className="input"
            value={form.slug}
            onChange={(e)=>setForm(f=>({...f, slug:e.target.value}))}
            placeholder="Slug (e.g. hoodies)"
          />
          <input
            className="input"
            style={{gridColumn:"1/-1"}}
            value={form.image}
            onChange={(e)=>setForm(f=>({...f, image:e.target.value}))}
            placeholder="Image URL (optional)"
          />
        </div>

        <div style={{height:12}} />
        <button className="btn primary" onClick={submit}>Create Category</button>

        <style>{`
          @media (max-width: 720px){
            div[style*="grid-template-columns:1fr 1fr"]{ grid-template-columns:1fr !important; }
          }
        `}</style>
      </div>

      <div style={{height:12}} />

      <div style={{fontWeight:900, marginBottom:8}}>All Categories</div>
      {list.length === 0 ? (
        <div className="muted">No categories found.</div>
      ) : (
        <div style={{display:"grid", gap:10}}>
          {list.map(c => (
            <div key={c.id} className="card" style={{padding:12, background:"rgba(17,17,26,.22)"}}>
              <div style={{display:"flex", justifyContent:"space-between", gap:10, flexWrap:"wrap"}}>
                <div>
                  <div style={{fontWeight:900}}>{c.name}</div>
                  <div className="muted" style={{fontSize:12}}>Slug: <b style={{color:"var(--gold2)"}}>{c.slug}</b></div>
                </div>
                <div className="muted" style={{fontSize:12}}>
                  {c.image ? "Has image" : "No image"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminOrders(){
  const [orders, setOrders] = useState([]);
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [detail, setDetail] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setMsg("");
    try {
      const list = await api.adminOrders();
      setOrders(list);
    } catch (e) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openOrder = async (id) => {
    setSelectedId(id);
    setDetail(null);
    setMsg("");
    try {
      const d = await api.adminOrderDetails(id);
      setDetail(d);
    } catch (e) {
      setMsg(e.message);
    }
  };

  const updateStatus = async (status) => {
    if (!detail) return;
    setMsg("");
    try {
      await api.adminUpdateOrderStatus(detail.id, status);
      // reload detail + list
      await openOrder(detail.id);
      await load();
      setMsg("Status updated ✅");
      setTimeout(()=>setMsg(""), 1200);
    } catch (e) {
      setMsg(e.message);
    }
  };

  const filtered = orders.filter(o => {
    const s = q.trim().toLowerCase();
    if (!s) return true;
    return (
      o.id.toLowerCase().includes(s) ||
      (o.customer?.name || "").toLowerCase().includes(s) ||
      (o.customer?.email || "").toLowerCase().includes(s) ||
      (o.customer?.phone || "").toLowerCase().includes(s)
    );
  });

  return (
    <div style={{display:"grid", gridTemplateColumns:"1.05fr .95fr", gap:12}}>
      {/* Left: orders list */}
      <div className="card" style={{padding:16}}>
        <div style={{display:"flex", justifyContent:"space-between", gap:10, flexWrap:"wrap", alignItems:"center"}}>
          <div style={{fontWeight:900}}>Orders</div>
          <div className="row">
            <input className="input" value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search Order ID / customer..." />
            <button className="btn" onClick={load}>{loading ? "Refreshing..." : "Refresh"}</button>
          </div>
        </div>

        {msg && <div className="muted" style={{marginTop:10}}>{msg}</div>}

        <div style={{height:12}} />

        {filtered.length === 0 ? (
          <div className="muted">No orders found.</div>
        ) : (
          <div style={{display:"grid", gap:10}}>
            {filtered.map(o => (
              <button
                key={o.id}
                className="card"
                onClick={() => openOrder(o.id)}
                style={{
                  padding:12,
                  textAlign:"left",
                  cursor:"pointer",
                  background: selectedId === o.id ? "rgba(212,175,55,.10)" : "rgba(17,17,26,.25)",
                  borderColor: selectedId === o.id ? "rgba(242,210,122,.6)" : "rgba(212,175,55,.18)"
                }}
              >
                <div style={{display:"flex", justifyContent:"space-between", gap:10, flexWrap:"wrap"}}>
                  <div>
                    <div style={{fontWeight:900}}>{o.id}</div>
                    <div className="muted" style={{fontSize:12}}>
                      {o.customer?.name} • {o.customer?.city} • {o.customer?.email || "—"}
                    </div>
                    <div className="muted" style={{fontSize:12}}>
                      {new Date(o.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontWeight:900, color:"var(--gold2)"}}>{money(o.total)}</div>
                    <div className="muted" style={{fontSize:12}}>
                      Status: <b style={{color:"var(--gold2)"}}>{o.status}</b>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: selected order detail */}
      <div className="card" style={{padding:16}}>
        <div style={{fontWeight:900}}>Order Details</div>
        <div className="muted" style={{fontSize:13, marginTop:6}}>
          Select an order to view items, address, totals, and update status.
        </div>

        <div style={{height:12}} />

        {!detail ? (
          <div className="muted">No order selected.</div>
        ) : (
          <>
            <div className="card" style={{padding:12, background:"rgba(17,17,26,.22)"}}>
              <div className="muted" style={{fontSize:12, fontWeight:900}}>Order ID</div>
              <div style={{fontWeight:900, color:"var(--gold2)"}}>{detail.id}</div>

              <div style={{height:8}} />
              <div className="muted" style={{fontSize:12}}>
                Created: <b style={{color:"var(--gold2)"}}>{new Date(detail.createdAt).toLocaleString()}</b>
              </div>
              <div className="muted" style={{fontSize:12}}>
                Current status: <b style={{color:"var(--gold2)"}}>{detail.status}</b>
              </div>
            </div>

            <div style={{height:10}} />

            <div className="card" style={{padding:12, background:"rgba(17,17,26,.22)"}}>
              <div style={{fontWeight:900, marginBottom:8}}>Update Status</div>
              <div className="row">
                {["Placed","Packed","Shipped","Delivered"].map(s => (
                  <button key={s} className="btn" onClick={() => updateStatus(s)}>{s}</button>
                ))}
              </div>
              <div className="muted" style={{fontSize:12, marginTop:8}}>
                (Demo note) Your public tracking endpoint still shows derived timeline; admin status saves too.
              </div>
            </div>

            <div style={{height:10}} />

            <div className="card" style={{padding:12, background:"rgba(17,17,26,.22)"}}>
              <div style={{fontWeight:900}}>Customer & Address</div>
              <div className="muted" style={{fontSize:12, marginTop:6}}>
                <b style={{color:"var(--gold2)"}}>{detail.address.name}</b> • {detail.address.phone}
              </div>
              <div className="muted" style={{fontSize:12}}>{detail.address.line}</div>
              <div className="muted" style={{fontSize:12}}>{detail.address.city}</div>
            </div>

            <div style={{height:10}} />

            <div className="card" style={{padding:12, background:"rgba(17,17,26,.22)"}}>
              <div style={{fontWeight:900, marginBottom:8}}>Items</div>
              <div style={{display:"grid", gap:8}}>
                {detail.items.map((it) => (
                  <div key={it.key} className="card" style={{padding:10, background:"rgba(17,17,26,.18)"}}>
                    <div style={{display:"flex", justifyContent:"space-between", gap:10}}>
                      <div style={{fontWeight:900, fontSize:13}}>
                        {it.name} <span className="muted">× {it.qty}</span>
                        <div className="muted" style={{fontSize:12}}>
                          Size: <b style={{color:"var(--gold2)"}}>{it.size}</b>
                        </div>
                      </div>
                      <div style={{fontWeight:900, color:"var(--gold2)"}}>
                        {money(it.price * it.qty)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{height:10}} />

              <div className="muted" style={{display:"flex", justifyContent:"space-between"}}>
                <span>Subtotal</span><b style={{color:"var(--gold2)"}}>{money(detail.totals.subtotal)}</b>
              </div>
              <div className="muted" style={{display:"flex", justifyContent:"space-between", marginTop:6}}>
                <span>Shipping</span><b style={{color:"var(--gold2)"}}>{money(detail.totals.shipping)}</b>
              </div>
              <div style={{display:"flex", justifyContent:"space-between", marginTop:10, fontWeight:900}}>
                <span>Total</span><span className="price">{money(detail.totals.total)}</span>
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        @media (max-width: 980px){
          div[style*="grid-template-columns:1.05fr .95fr"]{
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

// Keep your previous Add Product UI as a separate component:
function AdminAddProduct(){
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    name:"", category:"Men", price:"", rating:"4.7", image:"", description:"",
    sizes:"S,M,L,XL"
  });

  const submit = async () => {
    setMsg("");
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        rating: Number(form.rating),
        sizes: form.sizes.split(",").map(s=>s.trim()).filter(Boolean)
      };
      await api.addProduct(payload);
      setMsg("Product added ✅ Go to Shop to see it.");
      setForm({ name:"", category:"Men", price:"", rating:"4.7", image:"", description:"", sizes:"S,M,L,XL" });
    } catch (e) {
      setMsg(e.message);
    }
  };

  return (
    <div className="card" style={{padding:16}}>
      <div style={{fontWeight:900, fontSize:18}}>Admin: Add Product</div>
      <div className="muted" style={{fontSize:13, marginTop:6}}>Use an image URL (e.g. Unsplash).</div>

      <div style={{height:10}} />
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
        <input className="input" value={form.name} onChange={(e)=>setForm(f=>({...f,name:e.target.value}))} placeholder="Product name" />
        <select className="input" value={form.category} onChange={(e)=>setForm(f=>({...f,category:e.target.value}))}>
          <option>Men</option><option>Women</option><option>Kid</option>
        </select>
        <input className="input" value={form.price} onChange={(e)=>setForm(f=>({...f,price:e.target.value}))} placeholder="Price (AED)" />
        <input className="input" value={form.rating} onChange={(e)=>setForm(f=>({...f,rating:e.target.value}))} placeholder="Rating" />
        <input className="input" style={{gridColumn:"1/-1"}} value={form.image} onChange={(e)=>setForm(f=>({...f,image:e.target.value}))} placeholder="Image URL" />
        <input className="input" style={{gridColumn:"1/-1"}} value={form.description} onChange={(e)=>setForm(f=>({...f,description:e.target.value}))} placeholder="Description" />
        <input className="input" style={{gridColumn:"1/-1"}} value={form.sizes} onChange={(e)=>setForm(f=>({...f,sizes:e.target.value}))} placeholder="Sizes (comma separated)" />
      </div>

      <div style={{height:12}} />
      <button className="btn primary" onClick={submit}>Add Product</button>
      {msg && <div className="muted" style={{marginTop:10}}>{msg}</div>}
    </div>
  );
}


function NotFound(){
  return <div style={{padding:"18px 0"}} className="muted">Page not found.</div>;
}
