import React, { useMemo, useState } from "react";

const MENU = [
  { id: 1, name: "Margherita", description: "Molho, queijo e manjericão", price: 25 },
  { id: 2, name: "Pepperoni", description: "Pepperoni e queijo extra", price: 32 },
  { id: 3, name: "Quatro Queijos", description: "Mozzarella, gorgonzola, parmesão e provolone", price: 38 },
  { id: 4, name: "Frango com Catupiry", description: "Frango desfiado e catupiry", price: 35 }
];

function useAuthStorage() {
  const [token, setToken] = useState(localStorage.getItem("access_token") || "");
  function save(t) {
    setToken(t);
    if (t) localStorage.setItem("access_token", t);
    else localStorage.removeItem("access_token");
  }
  return [token, save];
}

export default function App() {
  const [baseUrl, setBaseUrl] = useState("http://127.0.0.1:8000");
  const [token, saveToken] = useAuthStorage();
  const [cart, setCart] = useState([]);
  const [output, setOutput] = useState("Aguardando requisicao...");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerNumber, setCustomerNumber] = useState("");

  const authHeaders = useMemo(() => (token ? { Authorization: `Bearer ${token}` } : {}), [token]);

  async function requestApi(path, options = {}, needsAuth = false) {
    const url = `${baseUrl}${path}`;
    const headers = { ...(options.headers || {}), ...(needsAuth ? authHeaders : {}) };
    const res = await fetch(url, { ...options, headers });
    const ct = res.headers.get("content-type") || "";
    const body = ct.includes("application/json") ? await res.json() : await res.text();
    setOutput(JSON.stringify({ status: res.status, ok: res.ok, body }, null, 2));
    if (!res.ok) throw new Error("API error");
    return body;
  }

  function addToCart(item) {
    setCart((c) => {
      const found = c.find((x) => x.id === item.id);
      if (found) return c.map((x) => (x.id === item.id ? { ...x, qty: x.qty + 1 } : x));
      return [...c, { ...item, qty: 1 }];
    });
  }

  function removeFromCart(id) {
    setCart((c) => c.filter((x) => x.id !== id));
  }

  function changeQty(id, qty) {
    setCart((c) => c.map((x) => (x.id === id ? { ...x, qty } : x)));
  }

  function total() {
    return cart.reduce((s, i) => s + i.price * i.qty, 0);
  }

  async function registerCustomer() {
    await requestApi("/auth/create_user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: customerName, email, number: customerNumber, password, status: true, admin: false })
    });
  }

  async function login() {
    const data = await requestApi("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if (data.access_token) saveToken(data.access_token);
  }

  async function checkout() {
    if (!token) {
      setOutput("Necessita login para criar pedido. Faça login primeiro.");
      return;
    }

    // extrai user id do token (campo `sub`) para evitar conflitos com usuário hardcoded
    const userId = (() => {
      try {
        if (!token) return 0;
        const payload = token.split('.')[1];
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const json = JSON.parse(atob(base64));
        return Number(json.sub || json.user || json.id) || 0;
      } catch (e) {
        return 0;
      }
    })();

    if (!userId) {
      setOutput('Não foi possível detectar o user id a partir do token. Verifique o token ou faça login novamente.');
      return;
    }

    const order = await requestApi("/orders/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: userId })
    }, true);

    const orderId = order?.id || 1;
    for (const item of cart) {
      await requestApi(`/orders/order/add-item/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: item.qty, flavor: item.name, size: "M", unit_price: item.price })
      }, true);
    }

    await requestApi(`/orders/order/finish/${orderId}`, { method: "POST" }, true);
  }

  return (
    <div className="page">
      <header className="hero">
        <h1>Pizzaria - Frontend</h1>
        <p>Mini sistema: cardápio, carrinho e checkout integrado com sua API.</p>
      </header>

      <section className="card">
        <h2>Config</h2>
        <div className="grid two">
          <label>
            Base URL
            <input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} />
          </label>
          <label>
            Token
            <input value={token} onChange={(e) => saveToken(e.target.value)} placeholder="Cole o token aqui" />
          </label>
        </div>
      </section>

      <section className="card">
        <h2>Login / Cadastro</h2>
        <div className="grid three">
          <input placeholder="Nome (para cadastro)" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input placeholder="Telefone" value={customerNumber} onChange={(e) => setCustomerNumber(e.target.value)} />
          <input placeholder="Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="actions">
          <button className="btn" onClick={registerCustomer}>Criar conta</button>
          <button className="btn" onClick={login}>Login</button>
        </div>
      </section>

      <section className="card">
        <h2>Cardápio</h2>
        <div className="grid three">
          {MENU.map((item) => (
            <div key={item.id} style={{ border: "1px solid var(--line)", padding: 10, borderRadius: 8 }}>
              <h4>{item.name} - R$ {item.price}</h4>
              <p style={{ margin: "6px 0", color: "var(--muted)" }}>{item.description}</p>
              <div className="actions">
                <button className="btn" onClick={() => addToCart(item)}>Adicionar</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Carrinho</h2>
        {cart.length === 0 ? (
          <p>Seu carrinho está vazio.</p>
        ) : (
          <div>
            {cart.map((i) => (
              <div key={i.id} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                <div style={{ flex: 1 }}>{i.name} (R$ {i.price})</div>
                <input style={{ width: 60 }} type="number" value={i.qty} onChange={(e) => changeQty(i.id, Number(e.target.value || 1))} />
                <button className="btn danger" onClick={() => removeFromCart(i.id)}>Remover</button>
              </div>
            ))}
            <div style={{ marginTop: 12 }}>
              <strong>Total: R$ {total()}</strong>
            </div>
            <div className="actions" style={{ marginTop: 10 }}>
              <button className="btn" onClick={checkout}>Finalizar pedido</button>
            </div>
          </div>
        )}
      </section>

      <section className="card output">
        <h2>Resposta / Log</h2>
        <pre>{output}</pre>
      </section>
    </div>
  );
}
 

