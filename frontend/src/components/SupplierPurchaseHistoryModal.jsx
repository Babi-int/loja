import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import { formatDate } from "../utils/formatters";

/** yyyy-mm-dd local para novo registro */
function todayInputDate() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Historico de compras da loja junto ao fornecedor + registro rapido (entrada em estoque).
 */
export default function SupplierPurchaseHistoryModal({ open, onClose, supplier }) {
  const [rows, setRows] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [formBusy, setFormBusy] = useState(false);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [purchaseDate, setPurchaseDate] = useState(todayInputDate());

  const supplierLabel = supplier?.razaoSocial || supplier?.name || "";

  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => String(a.name).localeCompare(String(b.name), "pt-BR")),
    [products]
  );

  function loadPurchases() {
    if (!supplier?.id) return;
    setLoading(true);
    setError("");
    api
      .get(`/suppliers/${supplier.id}/purchases`)
      .then(({ data }) => setRows(Array.isArray(data) ? data : []))
      .catch(() => setError("Nao foi possivel carregar o historico de compras."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!open || !supplier?.id) return undefined;
    setProductId("");
    setQuantity("1");
    setPurchaseDate(todayInputDate());
    setFormError("");
    loadPurchases();
    setProductsLoading(true);
    api
      .get("/products")
      .then(({ data }) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
      .finally(() => setProductsLoading(false));
    return undefined;
  }, [open, supplier?.id]);

  useEffect(() => {
    if (!open) return undefined;
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!supplier?.id) return;
    setFormError("");
    setFormBusy(true);
    try {
      await api.post(`/suppliers/${supplier.id}/purchases`, {
        productId,
        quantity: Number(quantity),
        purchasedAt: purchaseDate
      });
      setQuantity("1");
      setPurchaseDate(todayInputDate());
      loadPurchases();
    } catch (err) {
      setFormError(err.response?.data?.message || "Nao foi possivel registrar a compra.");
    } finally {
      setFormBusy(false);
    }
  }

  if (!open || !supplier) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-soft"
        role="dialog"
        aria-modal="true"
        aria-labelledby="supplier-purchase-history-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-pink-100 px-5 py-4">
          <div className="min-w-0">
            <h2 id="supplier-purchase-history-title" className="text-lg font-bold text-maricota-text">
              Histórico de compra
            </h2>
            <p className="mt-1 truncate text-sm text-slate-600">{supplierLabel}</p>
          </div>
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xl font-light leading-10 text-slate-500 transition hover:bg-pink-50 hover:text-maricota-text"
            aria-label="Fechar"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="border-b border-pink-100 bg-maricota-rose/30 px-5 py-4">
          <p className="mb-3 text-xs text-slate-600">
            Registrar uma compra atualiza o estoque do produto selecionado e aparece na lista abaixo.
          </p>
          <form className="grid gap-3 sm:grid-cols-12 sm:items-end" onSubmit={handleSubmit}>
            <label className="sm:col-span-5">
              <span className="mb-1 block text-xs font-semibold text-maricota-text">Produto</span>
              <select
                className="input py-2.5 text-sm"
                required
                disabled={productsLoading || formBusy}
                value={productId}
                onChange={(ev) => setProductId(ev.target.value)}
              >
                <option value="">{productsLoading ? "Carregando..." : "Selecione o produto"}</option>
                {sortedProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="sm:col-span-2">
              <span className="mb-1 block text-xs font-semibold text-maricota-text">Quantidade</span>
              <input
                className="input py-2.5 text-sm"
                min={1}
                required
                step={1}
                type="number"
                disabled={formBusy}
                value={quantity}
                onChange={(ev) => setQuantity(ev.target.value)}
              />
            </label>
            <label className="sm:col-span-3">
              <span className="mb-1 block text-xs font-semibold text-maricota-text">Data da compra</span>
              <input
                className="input py-2.5 text-sm"
                required
                type="date"
                disabled={formBusy}
                value={purchaseDate}
                onChange={(ev) => setPurchaseDate(ev.target.value)}
              />
            </label>
            <div className="sm:col-span-2">
              <button className="btn-primary w-full py-2.5 text-sm" disabled={formBusy || productsLoading} type="submit">
                {formBusy ? "Salvando..." : "Registrar"}
              </button>
            </div>
          </form>
          {formError && <p className="mt-2 text-sm text-red-600">{formError}</p>}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {loading && <p className="py-8 text-center text-sm text-slate-500">Carregando historico...</p>}
          {!loading && error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
          {!loading && !error && rows.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-500">Nenhuma compra registrada para este fornecedor.</p>
          )}
          {!loading && !error && rows.length > 0 && (
            <div className="overflow-x-auto rounded-2xl border border-pink-100">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-maricota-rose/50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Data da compra</th>
                    <th className="px-4 py-3 font-semibold">Produto</th>
                    <th className="px-4 py-3 text-right font-semibold">Quantidade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-100 text-slate-700">
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td className="px-4 py-2.5 whitespace-nowrap tabular-nums">{formatDate(r.purchasedAt)}</td>
                      <td className="px-4 py-2.5">{r.productName || r.productId || "—"}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{r.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
