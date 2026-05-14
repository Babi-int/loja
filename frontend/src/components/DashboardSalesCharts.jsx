import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { formatCurrency } from "../utils/formatters";

const GRID_LIGHT = "#dbeef8";
const BAR_PRIMARY = "#57a0d2";
const BAR_SECONDARY = "#8ad0f0";
const LINE_ACCENT = "#2d7aae";
const AXIS_PRIMARY = "#7eb8dc";
const AXIS_SECONDARY = "#5a9ecb";

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  return (
    <div className="rounded-xl border border-pink-100 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold text-maricota-text">{label}</p>
      <p className="text-slate-600">
        Faturamento: <strong className="text-maricota-text">{formatCurrency(row?.revenue)}</strong>
      </p>
      <p className="text-slate-600">
        Qtd. pecas: <strong className="text-maricota-text">{row?.pieces ?? 0}</strong>
      </p>
    </div>
  );
}

function formatAxisMoney(v) {
  if (v >= 1000) return `R$ ${(v / 1000).toFixed(1).replace(".", ",")}k`;
  return `R$ ${Math.round(v)}`;
}

export default function DashboardSalesCharts({ daily = [], monthly = [] }) {
  return (
    <section className="mt-8 grid gap-6 lg:grid-cols-2">
      <div className="card shadow-sm ring-1 ring-pink-100/60">
        <h2 className="mb-1 flex items-center gap-2 text-base font-bold text-maricota-text">
          <span
            className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-maricota-blue/50 text-[10px] text-maricota-text"
            aria-hidden
          >
            30d
          </span>
          Faturamento diario — Ultimos 30 dias
        </h2>
        <p className="mb-4 text-xs text-slate-500">
          Barras: total vendido no dia. Linha: pecas liquidas (devolucoes ja descontam).
        </p>
        <div className="h-[300px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={daily} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_LIGHT} vertical={false} />
              <XAxis dataKey="shortLabel" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 10 }}
                tickFormatter={formatAxisMoney}
                width={52}
                axisLine={{ stroke: AXIS_PRIMARY }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 10 }}
                width={36}
                axisLine={{ stroke: AXIS_SECONDARY }}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: "12px" }}
                formatter={(value) => <span className="text-slate-600">{value}</span>}
              />
              <Bar
                yAxisId="left"
                dataKey="revenue"
                name="Faturamento (R$)"
                fill={BAR_PRIMARY}
                radius={[4, 4, 0, 0]}
                maxBarSize={36}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="pieces"
                name="Qtd. pecas"
                stroke={LINE_ACCENT}
                strokeWidth={2}
                dot={{ r: 3, fill: LINE_ACCENT }}
                activeDot={{ r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card shadow-sm ring-1 ring-pink-100/60">
        <h2 className="mb-1 flex items-center gap-2 text-base font-bold text-maricota-text">
          <span
            className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-maricota-blue/60 text-[10px] text-maricota-text"
            aria-hidden
          >
            12m
          </span>
          Faturamento mensal — Ultimos 12 meses
        </h2>
        <p className="mb-4 text-xs text-slate-500">
          Somatorio por mes civil: faturamento (barras) e volume de pecas (linha).
        </p>
        <div className="h-[300px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={monthly} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_LIGHT} vertical={false} />
              <XAxis dataKey="shortLabel" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={56} />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 10 }}
                tickFormatter={formatAxisMoney}
                width={52}
                axisLine={{ stroke: AXIS_PRIMARY }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 10 }}
                width={36}
                axisLine={{ stroke: AXIS_SECONDARY }}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: "12px" }}
                formatter={(value) => <span className="text-slate-600">{value}</span>}
              />
              <Bar
                yAxisId="left"
                dataKey="revenue"
                name="Faturamento (R$)"
                fill={BAR_SECONDARY}
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="pieces"
                name="Qtd. pecas"
                stroke={BAR_PRIMARY}
                strokeWidth={2}
                dot={{ r: 3, fill: BAR_PRIMARY }}
                activeDot={{ r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
