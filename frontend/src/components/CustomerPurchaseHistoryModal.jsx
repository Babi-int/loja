import { useEffect, useState } from "react";
import api from "../api/client";
import { formatCurrency, formatDate, formatPaymentMethod } from "../utils/formatters";

function saleStatus(sale) {
  return sale.status || "COMPLETED";
}

function paymentDescription(sale) {
  const p = sale.payment || {};
  let label = formatPaymentMethod(p.method);
  if (p.isInstallment && Number(p.installments) > 1) {
    label += ` (${Number(p.installments)}x ${formatCurrency(p.installmentValue || 0)})`;
  }
  return label;
}

function paidDisplay(sale) {
  const p = sale.payment || {};
  const v = p.paidAmount != null && p.paidAmount !== "" ? Number(p.paidAmount) : Number(sale.totalAmount || 0);
  return formatCurrency(v);
}

/**
 * Lista vendas da cliente com itens, data, valor pago e forma de pagamento.
 */
export default function CustomerPurchaseHistoryModal({ open, onClose, customer }) {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !customer?.id) return undefined;
    setLoading(true);
    setError("");
    setSales([]);
    api
      .get("/sales", { params: { customerId: customer.id } })
      .then(({ data }) => setSales(Array.isArray(data) ? data : []))
      .catch(() => setError("Nao foi possivel carregar o historico de compras."))
      .finally(() => setLoading(false));
  }, [open, customer?.id]);

  useEffect(() => {
    if (!open) return undefined;
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !customer) return null;

  const completedSales = sales.filter((s) => saleStatus(s) === "COMPLETED");

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
        aria-labelledby="customer-history-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-pink-100 px-5 py-4">
          <div className="min-w-0">
            <h2 id="customer-history-title" className="text-lg font-bold text-maricota-text">
              Historico do cliente
            </h2>
            <p className="mt-1 truncate text-sm text-slate-600">{customer.name}</p>
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

        <div className="min-h-0 overflow-y-auto px-5 py-4">
          {loading && (
            <p className="py-8 text-center text-sm text-slate-500">Carregando compras...</p>
          )}
          {!loading && error && (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
          )}
          {!loading && !error && completedSales.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-500">
              Nenhuma compra registrada para esta cliente nas vendas concluidas.
            </p>
          )}
          {!loading &&
            !error &&
            completedSales.map((sale) => (
              <article
                key={sale.id}
                className="mb-6 last:mb-0 rounded-2xl border border-pink-100 bg-maricota-rose/40 p-4"
              >
                <div className="mb-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  <div>
                    <span className="font-semibold text-maricota-text">Data da compra</span>
                    <p className="text-slate-700">{formatDate(sale.soldAt)}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-maricota-text">Valor pago</span>
                    <p className="text-slate-700">{paidDisplay(sale)}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-maricota-text">Forma de pagamento</span>
                    <p className="text-slate-700">{paymentDescription(sale)}</p>
                  </div>
                </div>
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="text-xs uppercase text-slate-500">
                    <tr>
                      <th className="border-b border-pink-100 py-2 pr-2 font-semibold">Produto</th>
                      <th className="border-b border-pink-100 py-2 pr-2 font-semibold text-right">Qtd</th>
                      <th className="border-b border-pink-100 py-2 font-semibold text-right">Total linha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(sale.items || []).map((line, idx) => (
                      <tr key={`${sale.id}-${line.productId}-${idx}`} className="text-slate-700">
                        <td className="border-b border-pink-50/80 py-2 pr-2 align-top">
                          {line.product?.name || line.productId || "Produto"}
                        </td>
                        <td className="border-b border-pink-50/80 py-2 pr-2 text-right tabular-nums">
                          {line.quantity}
                        </td>
                        <td className="border-b border-pink-50/80 py-2 text-right tabular-nums">
                          {formatCurrency(line.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </article>
            ))}
        </div>
      </div>
    </div>
  );
}
