import { useCallback, useEffect, useState } from "react";
import api from "../api/client";
import DataTable from "../components/DataTable";
import PageHeader from "../components/PageHeader";
import RequiredFieldLabel from "../components/RequiredFieldLabel";
import { formatCurrency, formatDate } from "../utils/formatters";

function returnedQtyForProduct(sale, productId) {
  let n = 0;
  for (const ret of sale.returns || []) {
    for (const l of ret.lines || []) {
      if (l.productId === productId) n += Number(l.quantity);
    }
  }
  return n;
}

function saleStatus(sale) {
  return sale.status || "COMPLETED";
}

export default function SaleHistory() {
  const [sales, setSales] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [cancelTarget, setCancelTarget] = useState(null);
  const [returnTarget, setReturnTarget] = useState(null);
  const [returnReason, setReturnReason] = useState("");
  const [returnQty, setReturnQty] = useState({});

  const load = useCallback(() => {
    api.get("/sales").then(({ data }) => setSales(data));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function confirmCancel() {
    if (!cancelTarget) return;
    setError("");
    setMessage("");
    try {
      await api.post(`/sales/${cancelTarget.id}/cancel`);
      setMessage("Venda cancelada e estoque restaurado.");
      setCancelTarget(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Nao foi possivel cancelar.");
    }
  }

  function openReturn(sale) {
    setReturnTarget(sale);
    setReturnReason("");
    const initial = {};
    for (const item of sale.items || []) {
      initial[item.productId] = 0;
    }
    setReturnQty(initial);
    setError("");
    setMessage("");
  }

  async function confirmReturn() {
    if (!returnTarget) return;
    const items = [];
    for (const item of returnTarget.items || []) {
      const max = item.quantity - returnedQtyForProduct(returnTarget, item.productId);
      let q = Math.floor(Number(String(returnQty[item.productId] ?? "").replace(",", ".") || 0));
      q = Math.max(0, Math.min(max, q));
      if (q > 0) items.push({ productId: item.productId, quantity: q });
    }
    if (!returnReason.trim()) {
      setError("Informe o motivo da devolucao.");
      return;
    }
    if (items.length === 0) {
      setError("Informe a quantidade devolvida em ao menos um item.");
      return;
    }
    setError("");
    try {
      await api.post(`/sales/${returnTarget.id}/returns`, { reason: returnReason.trim(), items });
      setMessage("Devolucao registrada e estoque atualizado.");
      setReturnTarget(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Nao foi possivel registrar a devolucao.");
    }
  }

  return (
    <>
      <PageHeader
        title="Historico de vendas"
        description="Auditoria completa. Cancelar reverte itens ainda nao devolvidos; devolucao parcial ajusta estoque item a item com motivo obrigatorio."
      />

      {message && (
        <div className="mb-4 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div>
      )}
      {error && <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      <DataTable
        data={sales}
        columns={[
          { key: "soldAt", label: "Data", render: (row) => formatDate(row.soldAt) },
          {
            key: "customer",
            label: "Cliente",
            render: (row) => row.customer?.name || "—"
          },
          {
            key: "status",
            label: "Status",
            render: (row) => (
              <span className="text-xs font-semibold uppercase text-slate-600">{saleStatus(row)}</span>
            )
          },
          {
            key: "items",
            label: "Itens",
            render: (row) => row.items.map((item) => `${item.product?.name} (${item.quantity})`).join(", ")
          },
          { key: "payment", label: "Pagamento", render: (row) => row.payment?.method },
          { key: "discount", label: "Desconto", render: (row) => formatCurrency(row.discount) },
          { key: "totalAmount", label: "Total", render: (row) => formatCurrency(row.totalAmount) },
          { key: "observation", label: "Observacao", render: (row) => row.observation || "-" },
          {
            key: "actions",
            label: "Acoes",
            render: (row) => {
              if (saleStatus(row) !== "COMPLETED") {
                return <span className="text-xs text-slate-400">—</span>;
              }
              return (
                <div className="flex flex-wrap gap-2">
                  <button
                    className="text-xs font-semibold text-red-600 hover:underline"
                    type="button"
                    onClick={() => {
                      setCancelTarget(row);
                      setError("");
                      setMessage("");
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    className="text-xs font-semibold text-pink-600 hover:underline"
                    type="button"
                    onClick={() => openReturn(row)}
                  >
                    Devolver
                  </button>
                </div>
              );
            }
          }
        ]}
      />

      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-maricota-text">Cancelar venda</h3>
            <p className="mt-2 text-sm text-slate-600">
              O estoque sera restaurado conforme itens ainda nao devolvidos. Esta acao nao pode ser desfeita pelo
              sistema.
            </p>
            <p className="mt-3 text-sm font-semibold">{formatCurrency(cancelTarget.totalAmount)}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button className="btn-primary" type="button" onClick={confirmCancel}>
                Confirmar cancelamento
              </button>
              <button className="btn-secondary" type="button" onClick={() => setCancelTarget(null)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {returnTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-maricota-text">Devolucao parcial</h3>
            <p className="mt-2 text-sm text-slate-600">Informe as quantidades devolvidas por item e o motivo.</p>

            <label className="mt-4 block">
              <RequiredFieldLabel tip="Obrigatorio: descreva o motivo da devolucao (defeito, arrependimento, tamanho errado...). Ajuda a loja e o historico a ficarem claros.">
                Motivo
              </RequiredFieldLabel>
              <textarea
                className="input min-h-24"
                required
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
              />
            </label>

            <ul className="mt-4 grid gap-3">
              {(returnTarget.items || []).map((item) => {
                const max = item.quantity - returnedQtyForProduct(returnTarget, item.productId);
                return (
                  <li key={item.productId} className="rounded-2xl border border-pink-100 px-3 py-3">
                    <div className="text-sm font-semibold">{item.product?.name}</div>
                    <div className="text-xs text-slate-500">
                      Vendido: {item.quantity} | Ja devolvido: {returnedQtyForProduct(returnTarget, item.productId)} |
                      Maximo agora: {max}
                    </div>
                    <input
                      className="input mt-2 max-w-[8rem]"
                      min={0}
                      max={max}
                      type="number"
                      disabled={max <= 0}
                      value={String(returnQty[item.productId] ?? "")}
                      onChange={(e) =>
                        setReturnQty((cur) => ({
                          ...cur,
                          [item.productId]: e.target.value
                        }))
                      }
                    />
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 flex flex-wrap gap-3">
              <button className="btn-primary" type="button" onClick={confirmReturn}>
                Registrar devolucao
              </button>
              <button className="btn-secondary" type="button" onClick={() => setReturnTarget(null)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
