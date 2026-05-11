import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import DataTable from "../components/DataTable";
import PageHeader from "../components/PageHeader";
import RequiredFieldLabel from "../components/RequiredFieldLabel";
import { formatCurrency } from "../utils/formatters";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [adjustProduct, setAdjustProduct] = useState(null);
  const [adjDelta, setAdjDelta] = useState("");
  const [adjReason, setAdjReason] = useState("");
  const [adjMessage, setAdjMessage] = useState({ error: "", success: "" });

  useEffect(() => {
    api.get("/products").then(({ data }) => setProducts(data));
  }, []);

  function openAdjust(row) {
    setAdjustProduct(row);
    setAdjDelta("");
    setAdjReason("");
    setAdjMessage({ error: "", success: "" });
  }

  function closeAdjust() {
    setAdjustProduct(null);
    setAdjMessage({ error: "", success: "" });
  }

  async function submitAdjust(event) {
    event.preventDefault();
    if (!adjustProduct) return;
    setAdjMessage({ error: "", success: "" });
    try {
      await api.post(`/products/${adjustProduct.id}/stock-adjustment`, {
        delta: Number(adjDelta),
        reason: adjReason.trim()
      });
      setAdjMessage({ error: "", success: "Estoque atualizado." });
      const { data } = await api.get("/products");
      setProducts(data);
      const updated = data.find((p) => p.id === adjustProduct.id);
      if (updated) setAdjustProduct(updated);
    } catch (err) {
      setAdjMessage({ error: err.response?.data?.message || "Falha no ajuste.", success: "" });
    }
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const text = `${product.name} ${product.clothingType} ${product.brand || ""} ${product.barcode || ""}`.toLowerCase();
      return text.includes(search.toLowerCase()) && (!status || product.status === status);
    });
  }, [products, search, status]);

  return (
    <>
      <PageHeader
        title="Produtos"
        description="Catalogo da loja: busque, filtre por status e ajuste estoque manualmente quando precisar corrigir divergencias (com motivo obrigatorio)."
        action={
          <Link className="btn-primary" to="/produtos/novo">
            Novo produto
          </Link>
        }
      />

      <div className="card mb-5 grid gap-3 md:grid-cols-3">
        <input
          className="input md:col-span-2"
          placeholder="Buscar por nome, tipo, marca ou codigo de barras"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <div>
          <select className="input w-full" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">Todos os status</option>
            <option value="ATIVO">Ativo</option>
            <option value="INATIVO">Inativo</option>
            <option value="ESGOTADO">Esgotado</option>
          </select>
          <span className="mt-1 block text-xs text-slate-500">Somente ativos entram na tela de registrar venda.</span>
        </div>
      </div>

      <DataTable
        data={filteredProducts}
        columns={[
          { key: "name", label: "Produto" },
          { key: "category", label: "Categoria" },
          { key: "size", label: "Tamanho" },
          { key: "barcode", label: "Codigo", render: (row) => row.barcode || "-" },
          { key: "stockQuantity", label: "Estoque" },
          { key: "salePrice", label: "Venda", render: (row) => formatCurrency(row.salePrice) },
          { key: "status", label: "Status" },
          {
            key: "stockAdj",
            label: "Ajuste",
            render: (row) => (
              <button
                className="text-sm font-semibold text-slate-700 hover:underline"
                type="button"
                onClick={() => openAdjust(row)}
              >
                Estoque
              </button>
            )
          },
          {
            key: "actions",
            label: "Acoes",
            render: (row) => (
              <Link className="font-semibold text-pink-500" to={`/produtos/${row.id}`}>
                Editar
              </Link>
            )
          }
        ]}
      />

      {adjustProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"
            onSubmit={submitAdjust}
          >
            <h3 className="text-lg font-bold text-maricota-text">Ajuste manual de estoque</h3>
            <p className="mt-1 text-sm text-slate-600">{adjustProduct.name}</p>
            <p className="text-xs text-slate-500">Estoque atual: {adjustProduct.stockQuantity}</p>
            <p className="mt-2 text-xs text-slate-500">
              Use para perdas, conferencia fisica ou correcao. Vendas e devolucoes ja atualizam o saldo sozinhas.
            </p>

            {adjMessage.success && (
              <div className="mt-3 rounded-2xl bg-green-50 px-3 py-2 text-sm text-green-700">{adjMessage.success}</div>
            )}
            {adjMessage.error && (
              <div className="mt-3 rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-600">{adjMessage.error}</div>
            )}

            <label className="mt-4 block">
              <RequiredFieldLabel tip="Numero de pecas que entram (positivo) ou saem (negativo) do estoque. Ex.: +1 chegou um; -2 faltou dois na conferencia.">
                Quantidade (+ entrada / - saida)
              </RequiredFieldLabel>
              <input
                className="input"
                required
                step="1"
                type="number"
                value={adjDelta}
                onChange={(e) => setAdjDelta(e.target.value)}
              />
            </label>
            <label className="mt-3 block">
              <RequiredFieldLabel tip="Explique em uma frase por que o estoque mudou (obrigatorio para auditoria: quem olhar depois entende o motivo).">
                Motivo
              </RequiredFieldLabel>
              <textarea
                className="input min-h-24"
                required
                value={adjReason}
                onChange={(e) => setAdjReason(e.target.value)}
              />
            </label>

            <div className="mt-6 flex flex-wrap gap-3">
              <button className="btn-primary" type="submit">
                Aplicar
              </button>
              <button className="btn-secondary" type="button" onClick={closeAdjust}>
                Fechar
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
