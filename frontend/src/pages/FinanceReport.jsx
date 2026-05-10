import { useEffect, useState } from "react";
import api from "../api/client";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import { formatCurrency } from "../utils/formatters";

export default function FinanceReport() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    api.get("/finance/summary").then(({ data }) => setSummary(data));
  }, []);

  return (
    <>
      <PageHeader title="Relatorio financeiro" description="Resumo de vendas, lucro estimado, descontos e formas de pagamento." />

      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total vendido hoje" value={formatCurrency(summary?.totalSoldToday)} tone="pink" />
        <StatCard title="Total vendido no mes" value={formatCurrency(summary?.totalSoldMonth)} tone="mint" />
        <StatCard title="Lucro estimado" value={formatCurrency(summary?.estimatedProfit)} tone="yellow" />
        <StatCard title="Descontos aplicados" value={formatCurrency(summary?.totalDiscounts)} tone="blue" />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-4 text-lg font-bold">Produtos mais vendidos</h2>
          <div className="grid gap-3">
            {(summary?.topProducts || []).map((product) => (
              <div key={product.name} className="flex justify-between rounded-2xl bg-pink-50 px-4 py-3">
                <span>{product.name}</span>
                <strong>{product.quantity} un.</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="mb-4 text-lg font-bold">Formas de pagamento</h2>
          <div className="grid gap-3">
            {(summary?.paymentMethods || []).map((payment) => (
              <div key={payment.method} className="flex justify-between rounded-2xl bg-blue-50 px-4 py-3">
                <span>{payment.method}</span>
                <strong>{payment.count} vendas</strong>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
