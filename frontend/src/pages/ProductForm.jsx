import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/client";
import PageHeader from "../components/PageHeader";
import RequiredFieldLabel from "../components/RequiredFieldLabel";
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
      <PageHeader
        title={id ? "Editar produto" : "Novo produto"}
        description="Defina compra, margem e estoque. O preco de venda e calculado no servidor ao salvar; a caixa rosa mostra apenas uma previa. Apenas produtos ativos aparecem no PDV."
      />

      <form className="card grid gap-4 lg:grid-cols-2" onSubmit={handleSubmit}>
        {message && <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700 lg:col-span-2">{message}</div>}

        <label>
          <RequiredFieldLabel tip="Nome que aparece na lista, no PDV e no cupom. Use algo claro, ex.: Vestido floral P.">
            Nome do produto
          </RequiredFieldLabel>
          <input className="input" required value={form.name} onChange={(event) => updateField("name", event.target.value)} />
        </label>

        <label>
          <RequiredFieldLabel tip="Que tipo de peca e: calca, vestido, conjunto, etc. Ajuda na busca e na organizacao.">
            Tipo de roupa
          </RequiredFieldLabel>
          <input className="input" required value={form.clothingType} onChange={(event) => updateField("clothingType", event.target.value)} />
        </label>

        <label>
          <RequiredFieldLabel tip="Publico do produto (menino, menina, adulto...). Assim voce filtra e relatorios ficam coerentes.">
            Categoria
          </RequiredFieldLabel>
          <select className="input" required value={form.category} onChange={(event) => updateField("category", event.target.value)}>
            <option value="MENINO">Menino</option>
            <option value="MENINA">Menina</option>
            <option value="ADULTO">Adulto</option>
            <option value="CROCS">Crocs</option>
            <option value="OUTROS">Outros</option>
          </select>
        </label>

        <label>
          <RequiredFieldLabel tip="Numeracao ou letra do tamanho (P, M, 4, 6...). Cada variacao vira um SKU separado.">
            Tamanho
          </RequiredFieldLabel>
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
          <RequiredFieldLabel tip="Quantas unidades existem agora na loja. Use zero se ainda nao chegou mercadoria. Vendas e ajustes mudam esse numero depois.">
            Quantidade em estoque
          </RequiredFieldLabel>
          <input className="input" required min="0" type="number" value={form.stockQuantity} onChange={(event) => updateField("stockQuantity", event.target.value)} />
          <span className="mt-1 block text-xs text-slate-500">
            Alteracoes por vendas e ajustes na lista de produtos entram automaticamente no total.
          </span>
        </label>

        <label>
          <RequiredFieldLabel tip="Quanto voce pagou por uma unidade no fornecedor. Base para lucro estimado e para bloquear venda muito barata, se a loja configurar.">
            Valor de compra
          </RequiredFieldLabel>
          <input className="input" required min="0" step="0.01" type="number" value={form.purchasePrice} onChange={(event) => updateField("purchasePrice", event.target.value)} />
          <span className="mt-1 block text-xs text-slate-500">Custo unitario pago ao fornecedor; usado no lucro estimado e nas regras de preco minimo.</span>
        </label>

        <label>
          <RequiredFieldLabel tip="Margem em cima do custo. Ex.: 40 significa que o preco de venda considera 40% sobre o que voce pagou (regra tambem aplicada no servidor).">
            Lucro (%)
          </RequiredFieldLabel>
          <input className="input" required min="0" step="0.01" type="number" value={form.profitPercentage} onChange={(event) => updateField("profitPercentage", event.target.value)} />
          <span className="mt-1 block text-xs text-slate-500">Margem sobre o custo; ex.: 40% aplica markup sobre a compra.</span>
        </label>

        <label>
          <RequiredFieldLabel tip="Ativo entra no PDV. Inativo ou esgotado esconde da venda. Escolha o que combina com a situacao real da peca.">
            Status
          </RequiredFieldLabel>
          <select className="input" required value={form.status} onChange={(event) => updateField("status", event.target.value)}>
            <option value="ATIVO">Ativo</option>
            <option value="INATIVO">Inativo</option>
            <option value="ESGOTADO">Esgotado</option>
          </select>
          <span className="mt-1 block text-xs text-slate-500">Inativo ou esgotado some do PDV; o dashboard pode contar esgotados pelo estoque ou pelo status.</span>
        </label>

        <div className="rounded-3xl bg-maricota-rose p-5">
          <span className="text-sm font-semibold text-slate-500">Valor de venda calculado</span>
          <strong className="mt-2 block text-3xl text-maricota-text">{formatCurrency(salePrice)}</strong>
          <p className="mt-2 text-xs text-slate-500">Previa local; o valor gravado segue a mesma regra no backend.</p>
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
