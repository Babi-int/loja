import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/client";
import PageHeader from "../components/PageHeader";
import RequiredFieldLabel from "../components/RequiredFieldLabel";

const initial = {
  razaoSocial: "",
  cnpjCpf: "",
  setor: "",
  observacao: ""
};

function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

export default function SupplierForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    api
      .get("/suppliers")
      .then(({ data }) => {
        const found = data.find((s) => s.id === id);
        if (found) setForm({ ...initial, ...found });
      })
      .catch(() => setError("Nao foi possivel carregar o fornecedor."));
  }, [id]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const payload = {
        ...form,
        cnpjCpf: onlyDigits(form.cnpjCpf)
      };
      if (id) {
        await api.put(`/suppliers/${id}`, payload);
        setMessage("Fornecedor atualizado com sucesso.");
      } else {
        await api.post("/suppliers", payload);
        setMessage("Fornecedor cadastrado com sucesso.");
        setForm(initial);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Nao foi possivel salvar.");
    }
  }

  return (
    <>
      <PageHeader
        title={id ? "Editar fornecedor" : "Novo fornecedor"}
        description="Cadastro de fornecedor: razao social, documento (apenas numeros no CNPJ/CPF), setor e observacoes."
      />

      <form className="card grid max-w-2xl gap-4" onSubmit={handleSubmit}>
        {message && (
          <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div>
        )}
        {error && <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

        <label>
          <RequiredFieldLabel tip="Nome oficial da empresa ou do fornecedor (pode conter letras, numeros e simbolos).">
            Razão social
          </RequiredFieldLabel>
          <input
            className="input"
            required
            value={form.razaoSocial}
            onChange={(e) => update("razaoSocial", e.target.value)}
            placeholder="Nome da empresa ou fornecedor"
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-semibold">CNPJ / CPF</span>
          <input
            className="input"
            inputMode="numeric"
            autoComplete="off"
            value={form.cnpjCpf}
            onChange={(e) => update("cnpjCpf", onlyDigits(e.target.value))}
            placeholder="Somente numeros (sem pontos ou tracos)"
            maxLength={14}
          />
          <span className="mt-1 block text-xs text-slate-500">
            Aceita apenas digitos; caracteres especiais sao ignorados ao digitar.
          </span>
        </label>

        <label>
          <span className="mb-2 block text-sm font-semibold">Setor</span>
          <input
            className="input"
            value={form.setor}
            onChange={(e) => update("setor", e.target.value)}
            placeholder="Ex.: Malhas, acessorios, distribuicao"
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-semibold">Observacao</span>
          <textarea
            className="input min-h-[120px] resize-y"
            value={form.observacao}
            onChange={(e) => update("observacao", e.target.value)}
            placeholder="Anotacoes sobre prazos, qualidade, contato comercial, etc."
            rows={4}
          />
        </label>

        <div className="flex flex-wrap gap-3">
          <button className="btn-primary" type="submit">
            Salvar
          </button>
          <button className="btn-secondary" type="button" onClick={() => navigate("/fornecedores")}>
            Voltar
          </button>
        </div>
      </form>
    </>
  );
}
