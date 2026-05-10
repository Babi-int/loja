export default function StatCard({ title, value, hint, tone = "pink", icon }) {
  const toneBg = {
    pink: "bg-maricota-rose",
    blue: "bg-blue-50",
    mint: "bg-green-50",
    yellow: "bg-yellow-50"
  };

  const toneIcon = {
    pink: "text-pink-600",
    blue: "text-blue-600",
    mint: "text-emerald-600",
    yellow: "text-amber-600"
  };

  return (
    <div className="card">
      <div
        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${toneBg[tone]} ${
          icon ? toneIcon[tone] : ""
        }`}
        aria-hidden
      >
        {icon ?? null}
      </div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <strong className="mt-2 block text-2xl text-maricota-text">{value}</strong>
      {hint && <span className="mt-2 block text-xs text-slate-400">{hint}</span>}
    </div>
  );
}
