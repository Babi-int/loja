import { useCallback, useEffect, useState } from "react";
import api from "../api/client";
import PageHeader from "../components/PageHeader";
import RequiredFieldLabel from "../components/RequiredFieldLabel";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  storeName: "",
  lowStockThreshold: 5,
  disallowSaleBelowCost: true,
  maxDiscountPercentFromList: 50
};

const initialUserForm = {
  name: "",
  email: "",
  password: "",
  role: "STAFF"
};

export default function Settings() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userForm, setUserForm] = useState(initialUserForm);
  const [userBanner, setUserBanner] = useState({ type: "", text: "" });

  const loadUsers = useCallback(async () => {
    if (!isAdmin) return;
    setLoadingUsers(true);
    try {
      const { data } = await api.get("/users");
      setUsers(data);
    } catch {
      setUserBanner({ type: "err", text: "Nao foi possivel carregar a lista de usuarios." });
    } finally {
      setLoadingUsers(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    api
      .get("/settings")
      .then(({ data }) => {
        setForm({
          storeName: data.storeName ?? initialForm.storeName,
          lowStockThreshold: data.lowStockThreshold ?? initialForm.lowStockThreshold,
          disallowSaleBelowCost: data.disallowSaleBelowCost !== false,
          maxDiscountPercentFromList: data.maxDiscountPercentFromList ?? initialForm.maxDiscountPercentFromList
        });
      })
      .catch(() => setError("Nao foi possivel carregar as configuracoes."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  function updateField(field, value) {
    setForm((cur) => ({ ...cur, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    try {
      const { data } = await api.put("/settings", {
        storeName: form.storeName,
        lowStockThreshold: Number(form.lowStockThreshold),
        disallowSaleBelowCost: Boolean(form.disallowSaleBelowCost),
        maxDiscountPercentFromList: Number(form.maxDiscountPercentFromList)
      });
      setForm({
        storeName: data.storeName,
        lowStockThreshold: data.lowStockThreshold,
        disallowSaleBelowCost: data.disallowSaleBelowCost !== false,
        maxDiscountPercentFromList: data.maxDiscountPercentFromList
      });
      setMessage("Configuracoes salvas com sucesso.");
    } catch (err) {
      setError(err.response?.data?.message || "Nao foi possivel salvar.");
    }
  }

  async function handleCreateUser(event) {
    event.preventDefault();
    setUserBanner({ type: "", text: "" });
    try {
      await api.post("/users", {
        name: userForm.name.trim(),
        email: userForm.email.trim(),
        password: userForm.password,
        role: userForm.role
      });
      setUserForm(initialUserForm);
      setUserBanner({ type: "ok", text: "Usuario criado. A pessoa pode entrar com o e-mail e senha informados." });
      loadUsers();
    } catch (err) {
      setUserBanner({
        type: "err",
        text: err.response?.data?.message || "Nao foi possivel criar o usuario."
      });
    }
  }

  async function handleDeleteUser(id) {
    if (!window.confirm("Excluir este usuario? Ele nao podera mais entrar.")) return;
    setUserBanner({ type: "", text: "" });
    try {
      await api.delete(`/users/${id}`);
      setUserBanner({ type: "ok", text: "Usuario removido." });
      loadUsers();
    } catch (err) {
      setUserBanner({
        type: "err",
        text: err.response?.data?.message || "Nao foi possivel excluir."
      });
    }
  }

  return (
    <>
      <PageHeader
        title="Configuracoes"
        description="Parametros da loja, precos minimos nas vendas e usuarios com acesso ao sistema."
      />

      {loading ? (
        <p className="text-sm text-slate-500">Carregando...</p>
      ) : (
        <>
          <form className="card mb-6 grid gap-4 lg:grid-cols-2" onSubmit={handleSubmit}>
            {message && (
              <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700 lg:col-span-2">{message}</div>
            )}
            {error && (
              <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600 lg:col-span-2">{error}</div>
            )}

            <label>
              <RequiredFieldLabel tip="Nome da sua loja como voce quer que apareca no sistema e em impressoes futuras. Ex.: Maricota Kids.">
                Nome da loja
              </RequiredFieldLabel>
              <input
                className="input"
                required
                value={form.storeName}
                onChange={(e) => updateField("storeName", e.target.value)}
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold">Moeda</span>
              <input className="input" disabled value="Real brasileiro (BRL)" readOnly />
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold">Estoque baixo a partir de (unidades)</span>
              <input
                className="input"
                min={0}
                type="number"
                value={form.lowStockThreshold}
                onChange={(e) => updateField("lowStockThreshold", e.target.value)}
              />
              <span className="mt-1 block text-xs text-slate-500">
                Usado no dashboard para contar produtos com estoque acima de zero e ate esse limite.
              </span>
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold">Desconto maximo abaixo da tabela (%)</span>
              <input
                className="input"
                max={100}
                min={0}
                type="number"
                value={form.maxDiscountPercentFromList}
                onChange={(e) => updateField("maxDiscountPercentFromList", e.target.value)}
              />
              <span className="mt-1 block text-xs text-slate-500">
                Preco minimo por item = preco de tabela menos este percentual (ex.: 50% = no minimo metade da tabela).
              </span>
            </label>

            <label className="flex flex-col gap-2 rounded-2xl bg-pink-50 p-4 lg:col-span-2 sm:flex-row sm:items-start sm:gap-3">
              <div className="flex items-start gap-3">
                <input
                  className="mt-1"
                  type="checkbox"
                  checked={form.disallowSaleBelowCost}
                  onChange={(e) => updateField("disallowSaleBelowCost", e.target.checked)}
                />
                <span className="text-sm font-semibold">Nao permitir venda abaixo do custo de compra</span>
              </div>
              <span className="text-xs text-slate-600 sm:ml-7">
                Quando ativo, o PDV bloqueia precos unitarios que ficariam abaixo do valor de compra cadastrado (apos
                descontos).
              </span>
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold">Seu perfil</span>
              <input className="input" disabled readOnly value={user?.role === "ADMIN" ? "Administrador" : "Equipe"} />
            </label>

            <div className="flex items-end lg:col-span-2">
              <button className="btn-primary" type="submit">
                Salvar configuracoes
              </button>
            </div>

            <div className="rounded-3xl bg-maricota-rose p-5 lg:col-span-2">
              <strong className="block text-maricota-text">Troca de mercadoria</strong>
              <p className="mt-2 text-sm text-slate-600">
                Para troca, registre a devolucao parcial no historico de vendas e finalize uma nova venda com o produto
                desejado.
              </p>
            </div>
          </form>

          {isAdmin ? (
            <div className="card grid gap-6 lg:grid-cols-2">
              <div>
                <h2 className="mb-2 text-lg font-bold text-maricota-text">Novo usuario</h2>
                <p className="mb-4 text-sm text-slate-600">
                  Crie logins para outras pessoas usarem o mesmo sistema (mesmo link do painel). Informe e-mail e senha
                  iniciais; a pessoa entra na tela de login.
                </p>

                {userBanner.type === "ok" && (
                  <div className="mb-4 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">{userBanner.text}</div>
                )}
                {userBanner.type === "err" && (
                  <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{userBanner.text}</div>
                )}

                <form className="grid gap-3" onSubmit={handleCreateUser}>
                  <label>
                    <RequiredFieldLabel tip="Nome da pessoa que vai usar o sistema facil de reconhecer na lista de usuarios.">
                      Nome
                    </RequiredFieldLabel>
                    <input
                      className="input"
                      required
                      value={userForm.name}
                      onChange={(e) => setUserForm((f) => ({ ...f, name: e.target.value }))}
                    />
                  </label>
                  <label>
                    <RequiredFieldLabel tip="Sera o login: a pessoa digita esse e-mail na tela Entrar. Tem que ser unico no sistema.">
                      E-mail (login)
                    </RequiredFieldLabel>
                    <input
                      className="input"
                      autoComplete="off"
                      required
                      type="email"
                      value={userForm.email}
                      onChange={(e) => setUserForm((f) => ({ ...f, email: e.target.value }))}
                    />
                  </label>
                  <label>
                    <RequiredFieldLabel tip="Senha provisoria (no minimo 6 caracteres). A pessoa pode trocar depois se voce implementar essa tela; por ora e a senha inicial.">
                      Senha inicial (min. 6 caracteres)
                    </RequiredFieldLabel>
                    <input
                      className="input"
                      autoComplete="new-password"
                      minLength={6}
                      required
                      type="password"
                      value={userForm.password}
                      onChange={(e) => setUserForm((f) => ({ ...f, password: e.target.value }))}
                    />
                  </label>
                  <label>
                    <span className="mb-2 block text-sm font-semibold">Perfil</span>
                    <select
                      className="input"
                      value={userForm.role}
                      onChange={(e) => setUserForm((f) => ({ ...f, role: e.target.value }))}
                    >
                      <option value="STAFF">Equipe (acesso ao sistema)</option>
                      <option value="ADMIN">Administrador (acesso total + criar usuarios)</option>
                    </select>
                  </label>
                  <button className="btn-primary w-full sm:w-auto" type="submit">
                    Cadastrar usuario
                  </button>
                </form>
              </div>

              <div>
                <h2 className="mb-2 text-lg font-bold text-maricota-text">Usuarios cadastrados</h2>
                {loadingUsers ? (
                  <p className="text-sm text-slate-500">Carregando lista...</p>
                ) : users.length === 0 ? (
                  <p className="text-sm text-slate-500">Nenhum usuario além dos que ja existem no banco.</p>
                ) : (
                  <ul className="divide-y divide-pink-100 rounded-2xl border border-pink-100">
                    {users.map((u) => (
                      <li key={u.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                        <div>
                          <strong className="text-maricota-text">{u.name}</strong>
                          <div className="text-slate-600">{u.email}</div>
                          <span className="text-xs uppercase text-slate-400">{u.role}</span>
                        </div>
                        {u.id !== user?.id && (
                          <button
                            className="text-xs font-semibold text-red-600 hover:underline"
                            type="button"
                            onClick={() => handleDeleteUser(u.id)}
                          >
                            Excluir
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : (
            <div className="card rounded-3xl bg-pink-50/80 text-sm text-slate-600">
              Apenas <strong>administradores</strong> podem criar novos usuarios. Se precisar de acesso, peca ao admin da
              loja.
            </div>
          )}
        </>
      )}
    </>
  );
}
