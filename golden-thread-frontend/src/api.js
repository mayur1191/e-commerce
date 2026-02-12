const API = "http://localhost:5050/api";

export function getToken() {
  return localStorage.getItem("gt_token") || "";
}
export function setToken(t) {
  if (t) localStorage.setItem("gt_token", t);
  else localStorage.removeItem("gt_token");
}
export function getUser() {
  try { return JSON.parse(localStorage.getItem("gt_user") || "null"); } catch { return null; }
}
export function setUser(u) {
  if (u) localStorage.setItem("gt_user", JSON.stringify(u));
  else localStorage.removeItem("gt_user");
}

async function req(path, { method="GET", body, auth=false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) headers.Authorization = `Bearer ${getToken()}`;
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(()=> ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const api = {
  health: () => req("/health"),
  products: (params={}) => {
    const sp = new URLSearchParams(params);
    return req(`/products?${sp.toString()}`);
  },
  categories: () => req("/categories"),
  login: (email, password) => req("/auth/login", { method:"POST", body:{ email, password } }),
  register: (name, email, password) => req("/auth/register", { method:"POST", body:{ name, email, password } }),
  addProduct: (p) => req("/products", { method:"POST", body:p, auth:true }),
  placeOrder: (payload) => req("/orders", { method:"POST", body:payload, auth:true }),
  myOrders: () => req("/orders/my", { auth:true }),
  trackOrder: (id) => req(`/orders/${encodeURIComponent(id)}`),
  adminOrders: () => req("/admin/orders", { auth: true }),
adminOrderDetails: (id) => req(`/admin/orders/${encodeURIComponent(id)}`, { auth: true }),
adminUpdateOrderStatus: (id, status) =>
  req(`/admin/orders/${encodeURIComponent(id)}/status`, { method: "PATCH", body: { status }, auth: true }),
productById: (id) => req(`/products/${encodeURIComponent(id)}`),  
categories: () => req("/categories"),
categoryProducts: (slug) => req(`/category/${encodeURIComponent(slug)}/products`),

blogs: () => req("/blogs"),
blogBySlug: (slug) => req(`/blogs/${encodeURIComponent(slug)}`),

reviews: () => req("/reviews"),

contact: (payload) => req("/contact", { method: "POST", body: payload }),

adminContact: () => req("/admin/contact", { auth: true }),
adminCreateCategory: (payload) =>
  req("/admin/categories", { method: "POST", body: payload, auth: true }),
adminCategories: () => req("/categories"),
};

