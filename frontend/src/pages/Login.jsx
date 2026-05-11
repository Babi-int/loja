import { useState } from "react";
import { Navigate } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";
import RequiredFieldLabel from "../components/RequiredFieldLabel";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3333/api";

function isLocalApiUrl() {
  return /localhost|127\.0\.0\.1/i.test(API_BASE);
}

/** API publica (HTTPS), nao o PC local. */
function isRemoteHostedApi() {
  return /^https:\/\//i.test(API_BASE) && !isLocalApiUrl();
}

/** Build de producao com API em localhost — no Netlify o navegador do visitante nao alcanca seu PC. */
const PROD_API_MISCONFIGURED =
  import.meta.env.PROD && /localhost|127\.0\.0\.1/i.test(API_BASE);

function getRemoteApiNetworkHelp() {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const apiBase = API_BASE.replace(/\/$/, "");
  const host = apiBase.replace(/\/api\/?$/i, "");
  const healthApi = `${apiBase}/health`;
  const healthRoot = `${host}/health`;
  return [
    `Nao foi possivel conectar a API em ${API_BASE}.`,
    "",
    "O painel esta aberto no seu navegador, mas a chamada a API nao chegou ao servidor (ou demorou demais).",
    "",
    "1) Render (plano gratuito): o servico dorme. O primeiro acesso pode levar 1-2 minutos. Clique em Entrar de novo apos esperar.",
    `2) Teste no navegador (nova aba): ${healthApi} ou ${healthRoot} — deve aparecer JSON com "status":"ok". Se nao abrir, o problema e no deploy/host, nao no login.`,
    "3) CORS: no backend na Render, defina FRONTEND_URL com a origem deste site, por exemplo:",
    `   ${origin || "http://localhost:5173"}`,
    "   Se usar mais de um link (localhost + Netlify + IP na rede), separe por virgula, sem espacos.",
    "4) No Render → Logs: veja se o servico sobe sem erro (Firebase, JWT_SECRET, etc.)."
  ].join("\n");
}

function getNetworkErrorMessage() {
  const host = typeof window !== "undefined" ? window.location.hostname : "";
  const runningOnDevMachine =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "[::1]" ||
    host.endsWith(".local") ||
    /^192\.168\.\d{1,3}\.\d{1,3}$/.test(host) ||
    /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host);

  const builtWithLocalhostApi = isLocalApiUrl();

  if (runningOnDevMachine && isRemoteHostedApi()) {
    return getRemoteApiNetworkHelp();
  }

  if (runningOnDevMachine) {
    const lanHint =
      /^192\.168\.|^10\./.test(host) && builtWithLocalhostApi
        ? [
            "",
            "Voce abriu o painel pelo IP da rede (ex.: celular). Com VITE_API_URL em localhost, o navegador tenta a API no proprio aparelho — nao funciona.",
            "No frontend/.env use o IP do computador onde o backend esta rodando, ex.: VITE_API_URL=\"http://192.168.0.10:3333/api\". Reinicie o npm run dev do frontend."
          ].join("\n")
        : "";

    return [
      `Nao foi possivel conectar a API em ${API_BASE}.`,
      "",
      "No seu PC: em outro terminal rode na pasta do projeto:",
      "  cd backend",
      "  npm run dev",
      "A API deve subir na porta 3333 (ou ajuste a porta no backend e no arquivo frontend/.env).",
      "",
      "Depois de mudar frontend/.env, pare e rode de novo: npm run dev no frontend.",
      lanHint
    ]
      .filter(Boolean)
      .join("\n");
  }

  const lines = [
    `Nao foi possivel conectar a API (${API_BASE}).`,
    "",
    "Site publicado (ex.: Netlify): em Variaveis de ambiente / Build, defina VITE_API_URL com a URL https da sua API terminando em /api. Salve, faca um novo deploy do frontend.",
    "No servidor da API: defina FRONTEND_URL com a URL exata do site (sem barra no final) para o CORS liberar o navegador."
  ];

  if (builtWithLocalhostApi) {
    lines.push(
      "",
      "Aviso: este site parece ter sido gerado com VITE_API_URL apontando para localhost. Em producao precisa da URL real da API no build."
    );
  }

  return lines.join("\n");
}

/** Mensagem do backend em varios formatos + fallbacks por status HTTP. */
function getApiErrorMessage(err) {
  if (err.code === "ECONNABORTED") {
    return "Tempo esgotado ao contatar a API. No Render gratuito o servico pode estar iniciando: espere ~1-2 min e tente de novo.";
  }
  const data = err.response?.data;
  if (typeof data === "string" && data.trim()) {
    const t = data.trim();
    if (!t.startsWith("<")) return t;
  }
  if (data && typeof data === "object" && data.message) return String(data.message);
  if (data && typeof data === "object" && data.error) {
    return typeof data.error === "string" ? data.error : String(data.error?.message || "");
  }
  const status = err.response?.status;
  if (status === 401) {
    return "E-mail ou senha invalidos. Confira maiusculas, espacos no e-mail, ou peca ao administrador para conferir o cadastro.";
  }
  if (status === 403) {
    return "Acesso negado. Se a API esta na Render, confira FRONTEND_URL com a URL exata deste site (CORS).";
  }
  if (status === 404) {
    return "Rota de login nao encontrada. Verifique VITE_API_URL (deve terminar em /api, sem barra duplicada).";
  }
  if (status === 400) {
    return "Dados invalidos enviados ao servidor. Confira e-mail e senha.";
  }
  if (status === 500) {
    return "Erro no servidor ao entrar. Veja os Logs no Render (Firebase, JWT_SECRET, etc.).";
  }
  if (status === 502 || status === 503 || status === 504) {
    return "API indisponivel ou reiniciando (HTTP " + status + "). No Render gratuito espere ~1-2 min e tente de novo.";
  }
  if (status) {
    return `O servidor respondeu com erro HTTP ${status}. Abra os Logs da API ou teste ${API_BASE.replace(/\/$/, "")}/health no navegador.`;
  }
  return "";
}

function getLoginFallbackMessage(err) {
  const parts = [];
  const status = err.response?.status;
  const code = err.code ? ` (${String(err.code)})` : "";
  if (status) parts.push(`HTTP ${status}`);
  if (err.message && err.message !== "Network Error") parts.push(err.message);
  const tail = parts.length ? ` Detalhe: ${parts.join(" — ")}${code}.` : "";
  return (
    "Nao foi possivel entrar." +
    tail +
    "\n\nSe o site e o Netlify: confira VITE_API_URL no build e FRONTEND_URL na Render (origem exata, sem / no fim). Teste a API: " +
    API_BASE.replace(/\/$/, "") +
    "/health"
  );
}

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
      await login(form.email.trim(), form.password);
    } catch (err) {
      const apiMsg = getApiErrorMessage(err);
      if (apiMsg) {
        setError(apiMsg);
      } else if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
        setError(getNetworkErrorMessage());
      } else if (err.request && !err.response) {
        setError(
          "Sem resposta da API (rede, CORS ou servidor offline).\n\n" + getNetworkErrorMessage()
        );
      } else {
        setError(getLoginFallbackMessage(err));
      }
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
          <p className="mt-2 text-sm text-slate-500">
            Controle de estoque, vendas e financeiro. Use o e-mail e senha fornecidos pelo administrador da loja.
          </p>
        </div>

        {PROD_API_MISCONFIGURED && (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            <p className="font-bold">O site online nao esta apontando para a API publica.</p>
            <p className="mt-2 text-amber-900/95">
              No <strong>Netlify</strong> (Site configuration → Environment variables), crie{" "}
              <code className="rounded bg-white/80 px-1">VITE_API_URL</code> com a URL{" "}
              <strong>https</strong> do seu backend, terminando em <strong>/api</strong>, por exemplo{" "}
              <code className="rounded bg-white/80 px-1">https://seu-app.onrender.com/api</code>. Depois:{" "}
              <strong>Deploys → Trigger deploy → Clear cache and deploy site</strong>.
            </p>
            <p className="mt-2">
              No <strong>servidor da API</strong> (Render, Railway, etc.), defina{" "}
              <code className="rounded bg-white/80 px-1">FRONTEND_URL</code> exatamente como:{" "}
              <code className="rounded bg-white/80 px-1">https://loja-maricota-32c1db.netlify.app</code>{" "}
              (sem barra no final), para o CORS aceitar este site.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 whitespace-pre-line rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        <label className="mb-4 block">
          <RequiredFieldLabel tip="E-mail cadastrado no sistema (o mesmo que o administrador criou para voce). Ex.: nome@loja.com.">
            E-mail
          </RequiredFieldLabel>
          <input
            className="input"
            required
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />
        </label>

        <label className="mb-6 block">
          <RequiredFieldLabel tip="Senha secreta da sua conta. Nao compartilhe. Se esquecer, peca ao administrador para redefinir.">
            Senha
          </RequiredFieldLabel>
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
