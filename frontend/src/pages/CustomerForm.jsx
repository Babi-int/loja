import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/client";
import PageHeader from "../components/PageHeader";

const initial = {
  name: "",
  phone: "",
  email: "",
  childName: "",
  childBirthDate: ""
};

export default function CustomerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    api
      .get("/customers")
      .then(({ data }) => {
        const found = data.find((c) => c.id === id);
        if (found) setForm({ ...initial, ...found });
      })
      .catch(() => setError("Nao foi possivel carregar o cliente."));
  }, [id]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      if (id) {
        await api.put(`/customers/${id}`, form);
        setMessage("Cliente atualizado com sucesso.");
      } else {
        await api.post("/customers", form);
        setMessage("Cliente cadastrado com sucesso.");
        setForm(initial);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Nao foi possivel salvar.");
    }
  }

  return (
    <>
      <PageHeader
        title={id ? "Editar cliente" : "Novo cliente"}
        description="Dados da mae ou responsavel e da crianca. A data de nascimento ajuda em mensagens de aniversario no futuro."
      />

      <form className="card grid max-w-2xl gap-4" onSubmit={handleSubmit}>
        {message && (
          <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div>
        )}
        {error && <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

        <fieldset className="grid gap-4 rounded-3xl border border-pink-100 bg-pink-50/40 p-5">
          <legend className="px-2 text-sm font-bold text-maricota-text">Responsavel (mae)</legend>

          <label>
            <span className="mb-2 block text-sm font-semibold">Nome *</span>
            <input
              className="input"
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Nome completo"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-semibold">Telefone</span>
            <input
              className="input"
              type="tel"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="(11) 99999-9999"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-semibold">E-mail</span>
            <input
              className="input"
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="email@exemplo.com"
            />
          </label>
        </fieldset>

        <fieldset className="grid gap-4 rounded-3xl border border-pink-100 bg-blue-50/30 p-5">
          <legend className="px-2 text-sm font-bold text-maricota-text">Crianca</legend>

          <label>
            <span className="mb-2 block text-sm font-semibold">Nome da crianca</span>
            <input
              className="input"
              value={form.childName}
              onChange={(e) => update("childName", e.target.value)}
              placeholder="Como chamar na mensagem de aniversario"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-semibold">Data de nascimento</span>
            <input
              className="input"
              type="date"
              value={form.childBirthDate || ""}
              onChange={(e) => update("childBirthDate", e.target.value)}
            />
            <span className="mt-1 block text-xs text-slate-500">
              Opcional hoje; obrigatorio quando for usar disparo de aniversario.
            </span>
          </label>
        </fieldset>

        <div className="flex flex-wrap gap-3">
          <button className="btn-primary" type="submit">
            Salvar
          </button>
          <button className="btn-secondary" type="button" onClick={() => navigate("/clientes")}>
            Voltar
          </button>
        </div>
      </form>
    </>
  );
}
