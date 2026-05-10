import { useState } from "react";
import { Navigate } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { isAuthenticated, login } = useAuth();
  const [form, setForm] = useState({ email: "admin@maricotakids.com", password: "admin123" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(form.email, form.password);
    } catch (err) {
      setError(err.response?.data?.message || "Nao foi possivel entrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center p-4">
      <form className="card w-full max-w-md" onSubmit={handleSubmit}>
        <div className="mb-8 text-center">
          <div className="mb-6 flex justify-center rounded-2xl bg-white/80 p-4 ring-1 ring-pink-100">
            <BrandLogo />
          </div>
          <h1 className="text-2xl font-black text-maricota-text">Entrar no sistema</h1>
          <p className="mt-2 text-sm text-slate-500">Controle de estoque, vendas e financeiro.</p>
        </div>

        {error && <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

        <label className="mb-4 block">
          <span className="mb-2 block text-sm font-semibold">E-mail</span>
          <input
            className="input"
            required
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />
        </label>

        <label className="mb-6 block">
          <span className="mb-2 block text-sm font-semibold">Senha</span>
          <input
            className="input"
            required
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
        </label>

        <button className="btn-primary w-full" disabled={loading} type="submit">
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}
