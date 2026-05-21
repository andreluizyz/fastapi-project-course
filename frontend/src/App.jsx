import { useMemo, useState } from "react";

function parseBoolean(value) {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

export default function App() {
  const [baseUrl, setBaseUrl] = useState("http://127.0.0.1:8000");
  const [token, setToken] = useState(localStorage.getItem("access_token") || "");
  const [output, setOutput] = useState("Aguardando requisicao...");

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    number: "",
    password: "",
    status: "true",
    admin: "false"
  });

  const [loginJsonForm, setLoginJsonForm] = useState({ email: "", password: "" });
  const [loginFormData, setLoginFormData] = useState({ username: "", password: "" });
  const [createOrderForm, setCreateOrderForm] = useState({ user: "" });
  const [cancelOrderId, setCancelOrderId] = useState("");
  const [addItemOrderId, setAddItemOrderId] = useState("");
  const [addItemForm, setAddItemForm] = useState({
    quantity: "",
    flavor: "",
    size: "",
    unit_price: ""
  });
  const [removeItemId, setRemoveItemId] = useState("");
  const [finishOrderId, setFinishOrderId] = useState("");
  const [viewOrderId, setViewOrderId] = useState("");

  const authHeaders = useMemo(() => {
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  }, [token]);

  async function requestApi(path, options = {}, needsAuth = false) {
    const url = `${baseUrl}${path}`;
    const headers = {
      ...(options.headers || {}),
      ...(needsAuth ? authHeaders : {})
    };

    const response = await fetch(url, { ...options, headers });
    const contentType = response.headers.get("content-type") || "";
    const body = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    const data = {
      method: options.method || "GET",
      url,
      status: response.status,
      ok: response.ok,
      body
    };

    setOutput(JSON.stringify(data, null, 2));

    if (!response.ok) {
      throw new Error(`Falha na requisicao: ${response.status}`);
    }

    return body;
  }

  function saveToken(nextToken) {
    setToken(nextToken);
    if (nextToken) {
      localStorage.setItem("access_token", nextToken);
    } else {
      localStorage.removeItem("access_token");
    }
  }

  async function getAuthHome() {
    await requestApi("/auth/");
  }

  async function createUser() {
    const payload = {
      name: userForm.name,
      email: userForm.email,
      number: userForm.number,
      password: userForm.password,
      status: parseBoolean(userForm.status),
      admin: parseBoolean(userForm.admin)
    };

    await requestApi("/auth/create_user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  }

  async function loginJson() {
    const data = await requestApi("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginJsonForm)
    });

    if (data.access_token) {
      saveToken(data.access_token);
    }
  }

  async function loginWithForm() {
    const params = new URLSearchParams();
    params.set("username", loginFormData.username);
    params.set("password", loginFormData.password);

    const data = await requestApi("/auth/login-form", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString()
    });

    if (data.access_token) {
      saveToken(data.access_token);
    }
  }

  async function refreshToken() {
    const data = await requestApi("/auth/refresh", {}, true);
    if (data.access_token) {
      saveToken(data.access_token);
    }
  }

  async function getOrdersHome() {
    await requestApi("/orders/", {}, true);
  }

  async function createOrder() {
    await requestApi(
      "/orders/order",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: Number(createOrderForm.user) })
      },
      true
    );
  }

  async function cancelOrder() {
    await requestApi(`/orders/order/cancel/${cancelOrderId}`, { method: "POST" }, true);
  }

  async function listAllOrders() {
    await requestApi("/orders/list", {}, true);
  }

  async function addItemToOrder() {
    const payload = {
      quantity: Number(addItemForm.quantity),
      flavor: addItemForm.flavor,
      size: addItemForm.size,
      unit_price: Number(addItemForm.unit_price)
    };

    await requestApi(
      `/orders/order/add-item/${addItemOrderId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      },
      true
    );
  }

  async function removeItemFromOrder() {
    await requestApi(`/orders/order/remove-item/${removeItemId}`, { method: "POST" }, true);
  }

  async function finishOrder() {
    await requestApi(`/orders/order/finish/${finishOrderId}`, { method: "POST" }, true);
  }

  async function listMyOrders() {
    await requestApi("/orders/order/orders-user", {}, true);
  }

  async function viewOrderById() {
    await requestApi(`/orders/order/${viewOrderId}`, {}, true);
  }

  return (
    <div className="page">
      <header className="hero">
        <h1>Frontend React para FastAPI</h1>
        <p>
          Interface simples para testar todos os endpoints e entender na pratica o consumo da API.
        </p>
      </header>

      <section className="card">
        <h2>Configuracao</h2>
        <div className="grid two">
          <label>
            Base URL da API
            <input
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="http://127.0.0.1:8000"
            />
          </label>
          <label>
            Access Token (Bearer)
            <input
              value={token}
              onChange={(e) => saveToken(e.target.value)}
              placeholder="cole o access_token"
            />
          </label>
        </div>
        <div className="actions">
          <button className="btn danger" onClick={() => saveToken("")}>Limpar token</button>
          <button className="btn" onClick={refreshToken}>/auth/refresh</button>
        </div>
      </section>

      <section className="card">
        <h2>Auth</h2>
        <div className="actions">
          <button className="btn" onClick={getAuthHome}>GET /auth/</button>
        </div>

        <h3>Criar usuario - POST /auth/create_user</h3>
        <div className="grid three">
          <input placeholder="name" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} />
          <input placeholder="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} />
          <input placeholder="number" value={userForm.number} onChange={(e) => setUserForm({ ...userForm, number: e.target.value })} />
          <input placeholder="password" type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} />
          <select value={userForm.status} onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}>
            <option value="true">status true</option>
            <option value="false">status false</option>
          </select>
          <select value={userForm.admin} onChange={(e) => setUserForm({ ...userForm, admin: e.target.value })}>
            <option value="false">admin false</option>
            <option value="true">admin true</option>
          </select>
        </div>
        <div className="actions">
          <button className="btn" onClick={createUser}>Criar usuario</button>
        </div>

        <h3>Login JSON - POST /auth/login</h3>
        <div className="grid two">
          <input placeholder="email" value={loginJsonForm.email} onChange={(e) => setLoginJsonForm({ ...loginJsonForm, email: e.target.value })} />
          <input placeholder="password" type="password" value={loginJsonForm.password} onChange={(e) => setLoginJsonForm({ ...loginJsonForm, password: e.target.value })} />
        </div>
        <div className="actions">
          <button className="btn" onClick={loginJson}>Login JSON</button>
        </div>

        <h3>Login Form - POST /auth/login-form</h3>
        <div className="grid two">
          <input placeholder="username = email" value={loginFormData.username} onChange={(e) => setLoginFormData({ ...loginFormData, username: e.target.value })} />
          <input placeholder="password" type="password" value={loginFormData.password} onChange={(e) => setLoginFormData({ ...loginFormData, password: e.target.value })} />
        </div>
        <div className="actions">
          <button className="btn" onClick={loginWithForm}>Login Form</button>
        </div>
      </section>

      <section className="card">
        <h2>Orders</h2>
        <p className="hint">Todos endpoints de /orders exigem Authorization: Bearer token.</p>

        <div className="actions">
          <button className="btn" onClick={getOrdersHome}>GET /orders/</button>
          <button className="btn" onClick={listAllOrders}>GET /orders/list</button>
          <button className="btn" onClick={listMyOrders}>GET /orders/order/orders-user</button>
        </div>

        <h3>Criar pedido - POST /orders/order</h3>
        <div className="grid two">
          <input placeholder="user id" value={createOrderForm.user} onChange={(e) => setCreateOrderForm({ user: e.target.value })} />
        </div>
        <div className="actions">
          <button className="btn" onClick={createOrder}>Criar pedido</button>
        </div>

        <h3>Cancelar pedido - POST /orders/order/cancel/{'{id_order}'}</h3>
        <div className="grid two">
          <input placeholder="id_order" value={cancelOrderId} onChange={(e) => setCancelOrderId(e.target.value)} />
        </div>
        <div className="actions">
          <button className="btn" onClick={cancelOrder}>Cancelar pedido</button>
        </div>

        <h3>Adicionar item - POST /orders/order/add-item/{'{id_order}'}</h3>
        <div className="grid three">
          <input placeholder="id_order" value={addItemOrderId} onChange={(e) => setAddItemOrderId(e.target.value)} />
          <input placeholder="quantity" value={addItemForm.quantity} onChange={(e) => setAddItemForm({ ...addItemForm, quantity: e.target.value })} />
          <input placeholder="flavor" value={addItemForm.flavor} onChange={(e) => setAddItemForm({ ...addItemForm, flavor: e.target.value })} />
          <input placeholder="size" value={addItemForm.size} onChange={(e) => setAddItemForm({ ...addItemForm, size: e.target.value })} />
          <input placeholder="unit_price" value={addItemForm.unit_price} onChange={(e) => setAddItemForm({ ...addItemForm, unit_price: e.target.value })} />
        </div>
        <div className="actions">
          <button className="btn" onClick={addItemToOrder}>Adicionar item</button>
        </div>

        <h3>Remover item - POST /orders/order/remove-item/{'{id_item_order}'}</h3>
        <div className="grid two">
          <input placeholder="id_item_order" value={removeItemId} onChange={(e) => setRemoveItemId(e.target.value)} />
        </div>
        <div className="actions">
          <button className="btn" onClick={removeItemFromOrder}>Remover item</button>
        </div>

        <h3>Finalizar pedido - POST /orders/order/finish/{'{id_order}'}</h3>
        <div className="grid two">
          <input placeholder="id_order" value={finishOrderId} onChange={(e) => setFinishOrderId(e.target.value)} />
        </div>
        <div className="actions">
          <button className="btn" onClick={finishOrder}>Finalizar pedido</button>
        </div>

        <h3>Ver pedido - GET /orders/order/{'{id_order}'}</h3>
        <div className="grid two">
          <input placeholder="id_order" value={viewOrderId} onChange={(e) => setViewOrderId(e.target.value)} />
        </div>
        <div className="actions">
          <button className="btn" onClick={viewOrderById}>Ver pedido</button>
        </div>
      </section>

      <section className="card output">
        <h2>Resposta da API</h2>
        <pre>{output}</pre>
      </section>
    </div>
  );
}
