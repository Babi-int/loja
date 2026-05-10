import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/client";
import PageHeader from "../components/PageHeader";
import { calculateSalePrice, formatCurrency } from "../utils/formatters";

const initialForm = {
  name: "",
  clothingType: "",
  category: "MENINA",
  size: "",
  brand: "",
  barcode: "",
  stockQuantity: 0,
  purchasePrice: 0,
  profitPercentage: 40,
  status: "ATIVO"
};

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!id) return;

    api.get("/products").then(({ data }) => {
      const product = data.find((item) => item.id === id);
      if (product) setForm(product);
    });
  }, [id]);

  /** Prévia igual à regra do servidor; valor persistido é calculado no backend ao salvar. */
  const salePrice = useMemo(
    () => calculateSalePrice(form.purchasePrice, form.profitPercentage),
    [form.purchasePrice, form.profitPercentage]
  );

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    const payload = {
      ...form,
      stockQuantity: Number(form.stockQuantity),
      purchasePrice: Number(form.purchasePrice),
      profitPercentage: Number(form.profitPercentage)
    };

    if (id) {
      await api.put(`/products/${id}`, payload);
      setMessage("Produto atualizado com sucesso.");
    } else {
      await api.post("/products", payload);
      setMessage("Produto cadastrado com sucesso.");
      setForm(initialForm);
    }
  }

  return (
    <>
      <PageHeader title={id ? "Editar produto" : "Novo produto"} description="Campos obrigatorios com calculo automatico do valor de venda." />

      <form className="card grid gap-4 lg:grid-cols-2" onSubmit={handleSubmit}>
        {message && <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700 lg:col-span-2">{message}</div>}

        <label>
          <span className="mb-2 block text-sm font-semibold">Nome do produto *</span>
          <input className="input" required value={form.name} onChange={(event) => updateField("name", event.target.value)} />
        </label>

        <label>
          <span className="mb-2 block text-sm font-semibold">Tipo de roupa *</span>
          <input className="input" required value={form.clothingType} onChange={(event) => updateField("clothingType", event.target.value)} />
        </label>

        <label>
          <span className="mb-2 block text-sm font-semibold">Categoria *</span>
          <select className="input" required value={form.category} onChange={(event) => updateField("category", event.target.value)}>
            <option value="MENINO">Menino</option>
            <option value="MENINA">Menina</option>
            <option value="ADULTO">Adulto</option>
            <option value="CROCS">Crocs</option>
            <option value="OUTROS">Outros</option>
          </select>
        </label>

        <label>
          <span className="mb-2 block text-sm font-semibold">Tamanho *</span>
          <input className="input" required value={form.size} onChange={(event) => updateField("size", event.target.value)} />
        </label>

        <label>
          <span className="mb-2 block text-sm font-semibold">Marca</span>
          <input className="input" value={form.brand || ""} onChange={(event) => updateField("brand", event.target.value)} />
        </label>

        <label>
          <span className="mb-2 block text-sm font-semibold">Codigo de barras</span>
          <input
            className="input"
            inputMode="numeric"
            placeholder="Use o leitor ou digite o codigo"
            value={form.barcode || ""}
            onChange={(event) => updateField("barcode", event.target.value)}
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-semibold">Quantidade em estoque *</span>
          <input className="input" required min="0" type="number" value={form.stockQuantity} onChange={(event) => updateField("stockQuantity", event.target.value)} />
        </label>

        <label>
          <span className="mb-2 block text-sm font-semibold">Valor de compra *</span>
          <input className="input" required min="0" step="0.01" type="number" value={form.purchasePrice} onChange={(event) => updateField("purchasePrice", event.target.value)} />
        </label>

        <label>
          <span className="mb-2 block text-sm font-semibold">Lucro (%) *</span>
          <input className="input" required min="0" step="0.01" type="number" value={form.profitPercentage} onChange={(event) => updateField("profitPercentage", event.target.value)} />
        </label>

        <label>
          <span className="mb-2 block text-sm font-semibold">Status *</span>
          <select className="input" value={form.status} onChange={(event) => updateField("status", event.target.value)}>
            <option value="ATIVO">Ativo</option>
            <option value="INATIVO">Inativo</option>
            <option value="ESGOTADO">Esgotado</option>
          </select>
        </label>

        <div className="rounded-3xl bg-maricota-rose p-5">
          <span className="text-sm font-semibold text-slate-500">Valor de venda calculado</span>
          <strong className="mt-2 block text-3xl text-maricota-text">{formatCurrency(salePrice)}</strong>
        </div>

        <div className="flex gap-3 lg:col-span-2">
          <button className="btn-primary" type="submit">
            Salvar produto
          </button>
          <button className="btn-secondary" type="button" onClick={() => navigate("/produtos")}>
            Voltar
          </button>
        </div>
      </form>
    </>
  );
}
