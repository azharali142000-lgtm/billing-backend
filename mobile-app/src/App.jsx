import React, { useEffect, useMemo, useState } from "react";

const apiOrigin = (import.meta.env.VITE_API_URL || "https://billing-backend-2v0w.onrender.com").replace(/\/$/, "");
const API_BASE_URL = apiOrigin.endsWith("/api") ? apiOrigin : `${apiOrigin}/api`;
const TOKEN_KEY = "billr_web_token";
const SESSION_KEY = "billr_web_session";
const REQUEST_TIMEOUT_MS = 15000;

function currency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(Number(value || 0));
}

function invoiceCode(invoice) {
  return `INV-${String(invoice.id).padStart(4, "0")}`;
}

function resolveFriendlyError(error, payloadMessage = "") {
  const combined = String(payloadMessage || error?.message || "").trim();
  if (
    combined === "Failed to fetch" ||
    combined.includes("NetworkError") ||
    combined.includes("Load failed") ||
    combined.includes("fetch") ||
    combined.toLowerCase().includes("timeout")
  ) {
    return "Server waking up, please try again";
  }
  return combined || "Request failed";
}

export default function App() {
  const [session, setSession] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    } catch (_error) {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [mode, setMode] = useState("login");
  const [authForm, setAuthForm] = useState({
    companyName: "",
    name: "",
    email: "",
    password: ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [screen, setScreen] = useState("bills");
  const [company, setCompany] = useState(session?.company || null);
  const [user, setUser] = useState(session?.user || null);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [users, setUsers] = useState([]);
  const [invoiceForm, setInvoiceForm] = useState({
    customerId: "",
    items: [{ productId: "", quantity: 1 }]
  });
  const [customerForm, setCustomerForm] = useState({ name: "", phone: "", address: "" });
  const [productForm, setProductForm] = useState({ name: "", price: "", stock: "0", unit: "" });
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", role: "STAFF" });

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [token]);

  useEffect(() => {
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [session]);

  const authHeaders = useMemo(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }),
    [token]
  );

  async function api(path, options = {}) {
    let lastError = null;

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(new Error("Request timeout")), REQUEST_TIMEOUT_MS);

      try {
        const response = await fetch(`${API_BASE_URL}${path}`, {
          ...options,
          signal: controller.signal
        });
        clearTimeout(timeout);
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(resolveFriendlyError(new Error(payload?.message || ""), payload?.message || ""));
        }
        return payload;
      } catch (requestError) {
        clearTimeout(timeout);
        console.error(requestError);
        lastError = new Error(resolveFriendlyError(requestError));
        const retryable =
          requestError?.name === "AbortError" ||
          String(requestError?.message || "").includes("Failed to fetch") ||
          String(requestError?.message || "").toLowerCase().includes("timeout");

        if (!retryable || attempt === 1) {
          throw lastError;
        }

        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }

    throw lastError || new Error("Request failed");
  }

  async function refreshData(currentUser = user) {
    if (!token) {
      return;
    }

    const [customersResponse, productsResponse, invoicesResponse] = await Promise.all([
      api("/customers", { headers: authHeaders }),
      api("/products", { headers: authHeaders }),
      api("/invoices?limit=20", { headers: authHeaders })
    ]);

    setCustomers(customersResponse.data || []);
    setProducts(productsResponse.data || []);
    setInvoices(invoicesResponse.data || []);

    if ((currentUser?.role || "").toLowerCase() === "admin") {
      const usersResponse = await api("/users", { headers: authHeaders });
      setUsers(usersResponse.data || []);
    } else {
      setUsers([]);
    }
  }

  useEffect(() => {
    if (!token) {
      return;
    }
    refreshData().catch((loadError) => setError(loadError.message));
  }, [token]);

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const endpoint = mode === "register" ? "/auth/signup" : "/auth/login";
      const payload =
        mode === "register"
          ? {
              companyName: authForm.companyName,
              name: authForm.name,
              email: authForm.email,
              password: authForm.password
            }
          : {
              email: authForm.email,
              password: authForm.password
            };

      const response = await api(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      setToken(response.data.token);
      setSession(response.data);
      setCompany(response.data.company);
      setUser(response.data.user);
      setScreen("bills");
      setMessage(mode === "register" ? "Company created. Trial access is ready." : "Welcome back.");
    } catch (authError) {
      setError(authError.message);
    } finally {
      setLoading(false);
    }
  }

  async function createCustomer(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api("/customers", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(customerForm)
      });
      setCustomerForm({ name: "", phone: "", address: "" });
      await refreshData();
      setMessage("Customer created.");
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setLoading(false);
    }
  }

  async function createProduct(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api("/products", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          ...productForm,
          price: Number(productForm.price),
          stock: Number(productForm.stock || 0)
        })
      });
      setProductForm({ name: "", price: "", stock: "0", unit: "" });
      await refreshData();
      setMessage("Product created.");
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setLoading(false);
    }
  }

  async function createUser(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api("/users", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(userForm)
      });
      setUserForm({ name: "", email: "", password: "", role: "STAFF" });
      await refreshData();
      setMessage("User created.");
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setLoading(false);
    }
  }

  function updateInvoiceItem(index, key, value) {
    setInvoiceForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item))
    }));
  }

  function addInvoiceRow() {
    setInvoiceForm((current) => ({
      ...current,
      items: [...current.items, { productId: "", quantity: 1 }]
    }));
  }

  const invoiceTotal = useMemo(
    () =>
      invoiceForm.items.reduce((sum, item) => {
        const product = products.find((entry) => String(entry.id) === String(item.productId));
        return sum + (product ? Number(product.price) * Number(item.quantity || 0) : 0);
      }, 0),
    [invoiceForm, products]
  );

  async function saveBill() {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const payload = {
        customerId: Number(invoiceForm.customerId),
        items: invoiceForm.items
          .filter((item) => item.productId && Number(item.quantity) > 0)
          .map((item) => ({
            productId: Number(item.productId),
            quantity: Number(item.quantity)
          }))
      };

      if (!payload.customerId || !payload.items.length) {
        throw new Error("Choose a customer and at least one item.");
      }

      const response = await api("/invoices", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(payload)
      });

      setInvoiceForm({ customerId: "", items: [{ productId: "", quantity: 1 }] });
      await refreshData();
      setMessage(`Invoice ${invoiceCode(response.data)} saved.`);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setToken("");
    setSession(null);
    setCompany(null);
    setUser(null);
    setCustomers([]);
    setProducts([]);
    setInvoices([]);
    setUsers([]);
    setMessage("");
    setError("");
    setMode("login");
  }

  if (!token || !user) {
    return (
      <main className="mobile-app auth-shell">
        <section className="card auth-card">
          <p className="eyebrow">Billr Cloud</p>
          <h1>{mode === "register" ? "Create Company" : "Login"}</h1>
          <p className="muted">Email and password only. Backend is API-only.</p>
          <form className="stack" onSubmit={handleAuthSubmit}>
            {mode === "register" ? (
              <>
                <input placeholder="Company name" required value={authForm.companyName} onChange={(event) => setAuthForm({ ...authForm, companyName: event.target.value })} />
                <input placeholder="Your name" required value={authForm.name} onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })} />
              </>
            ) : null}
            <input placeholder="Email" required type="email" value={authForm.email} onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })} />
            <input placeholder="Password" required type="password" value={authForm.password} onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })} />
            <button className="primary-btn" disabled={loading} type="submit">
              {loading ? "Please wait..." : mode === "register" ? "Create Company" : "Login"}
            </button>
          </form>
          {error ? <p className="error-text">{error}</p> : null}
          {message ? <p className="success-text">{message}</p> : null}
          <button className="text-btn" onClick={() => setMode(mode === "register" ? "login" : "register")} type="button">
            {mode === "register" ? "Already have an account? Login" : "New company? Create account"}
          </button>
        </section>
      </main>
    );
  }

  const tabs = [
    ["bills", "Bills"],
    ["customers", "Customers"],
    ["products", "Products"],
    ["users", "Users"]
  ].filter(([key]) => key !== "users" || String(user.role || "").toLowerCase() === "admin");

  return (
    <main className="mobile-app">
      <header className="topbar">
        <div>
          <p className="eyebrow">{company?.name}</p>
          <h1>Billr</h1>
        </div>
        <button className="ghost-btn" onClick={logout} type="button">Logout</button>
      </header>

      <nav className="tabs">
        {tabs.map(([key, label]) => (
          <button key={key} className={screen === key ? "tab active" : "tab"} onClick={() => setScreen(key)} type="button">
            {label}
          </button>
        ))}
      </nav>

      {message ? <p className="success-text">{message}</p> : null}
      {error ? <p className="error-text">{error}</p> : null}

      {screen === "bills" ? (
        <section className="stack">
          <article className="card">
            <p className="eyebrow">New Bill</p>
            <select value={invoiceForm.customerId} onChange={(event) => setInvoiceForm({ ...invoiceForm, customerId: event.target.value })}>
              <option value="">Select customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>{customer.name}</option>
              ))}
            </select>
            <div className="stack">
              {invoiceForm.items.map((item, index) => (
                <div className="row" key={`${index}-${item.productId}`}>
                  <select value={item.productId} onChange={(event) => updateInvoiceItem(index, "productId", event.target.value)}>
                    <option value="">Product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>{product.name || `Product #${product.id}`}</option>
                    ))}
                  </select>
                  <input min="1" type="number" value={item.quantity} onChange={(event) => updateInvoiceItem(index, "quantity", event.target.value)} />
                </div>
              ))}
            </div>
            <button className="ghost-btn" onClick={addInvoiceRow} type="button">+ Add Item</button>
            <div className="summary-row">
              <span>Total</span>
              <strong>{currency(invoiceTotal)}</strong>
            </div>
            <button className="primary-btn" onClick={saveBill} type="button" disabled={loading}>Save Bill</button>
          </article>

          <article className="card">
            <p className="eyebrow">Recent Bills</p>
            <div className="stack">
              {invoices.map((invoice) => (
                <div className="list-row" key={invoice.id}>
                  <div>
                    <strong>{invoiceCode(invoice)}</strong>
                    <p className="muted">{invoice.customer?.name || "Customer"} • {new Date(invoice.createdAt).toLocaleDateString()}</p>
                  </div>
                  <strong>{currency(invoice.total)}</strong>
                </div>
              ))}
            </div>
          </article>
        </section>
      ) : null}

      {screen === "customers" ? (
        <section className="stack">
          <article className="card">
            <p className="eyebrow">New Customer</p>
            <form className="stack" onSubmit={createCustomer}>
              <input placeholder="Name" required value={customerForm.name} onChange={(event) => setCustomerForm({ ...customerForm, name: event.target.value })} />
              <input placeholder="Phone" value={customerForm.phone} onChange={(event) => setCustomerForm({ ...customerForm, phone: event.target.value })} />
              <textarea placeholder="Address" value={customerForm.address} onChange={(event) => setCustomerForm({ ...customerForm, address: event.target.value })} />
              <button className="primary-btn" disabled={loading} type="submit">Save Customer</button>
            </form>
          </article>
          <article className="card">
            <p className="eyebrow">Ledger</p>
            {customers.map((customer) => (
              <div className="list-row" key={customer.id}>
                <div>
                  <strong>{customer.name}</strong>
                  <p className="muted">{customer.phone || "No phone"}</p>
                </div>
                <strong>{currency(customer.balance)}</strong>
              </div>
            ))}
          </article>
        </section>
      ) : null}

      {screen === "products" ? (
        <section className="stack">
          <article className="card">
            <p className="eyebrow">New Product</p>
            <form className="stack" onSubmit={createProduct}>
              <input placeholder="Name" value={productForm.name} onChange={(event) => setProductForm({ ...productForm, name: event.target.value })} />
              <input placeholder="Price" required type="number" value={productForm.price} onChange={(event) => setProductForm({ ...productForm, price: event.target.value })} />
              <div className="row">
                <input placeholder="Stock" type="number" value={productForm.stock} onChange={(event) => setProductForm({ ...productForm, stock: event.target.value })} />
                <input placeholder="Unit" value={productForm.unit} onChange={(event) => setProductForm({ ...productForm, unit: event.target.value })} />
              </div>
              <button className="primary-btn" disabled={loading} type="submit">Save Product</button>
            </form>
          </article>
          <article className="card">
            <p className="eyebrow">Inventory</p>
            {products.map((product) => (
              <div className="list-row" key={product.id}>
                <div>
                  <strong>{product.name || `Product #${product.id}`}</strong>
                  <p className="muted">{product.unit || "Unit not set"} • Stock {product.stock}</p>
                </div>
                <strong>{currency(product.price)}</strong>
              </div>
            ))}
          </article>
        </section>
      ) : null}

      {screen === "users" ? (
        <section className="stack">
          <article className="card">
            <p className="eyebrow">Add Team Member</p>
            <form className="stack" onSubmit={createUser}>
              <input placeholder="Name" required value={userForm.name} onChange={(event) => setUserForm({ ...userForm, name: event.target.value })} />
              <input placeholder="Email" required type="email" value={userForm.email} onChange={(event) => setUserForm({ ...userForm, email: event.target.value })} />
              <input placeholder="Password" required type="password" value={userForm.password} onChange={(event) => setUserForm({ ...userForm, password: event.target.value })} />
              <select value={userForm.role} onChange={(event) => setUserForm({ ...userForm, role: event.target.value })}>
                <option value="STAFF">Staff</option>
                <option value="ADMIN">Admin</option>
              </select>
              <button className="primary-btn" disabled={loading} type="submit">Save User</button>
            </form>
          </article>
          <article className="card">
            <p className="eyebrow">Company Team</p>
            {users.map((entry) => (
              <div className="list-row" key={entry.id}>
                <div>
                  <strong>{entry.name}</strong>
                  <p className="muted">{entry.email}</p>
                </div>
                <strong>{entry.role}</strong>
              </div>
            ))}
          </article>
        </section>
      ) : null}
    </main>
  );
}
