import { useState } from "react";

export default function StatCard({
  title,
  value,
  hint,
  tone = "pink",
  icon,
  iconHoverList,
  iconHoverFooter,
  iconHoverOnMaisClick
}) {
  const [iconHovered, setIconHovered] = useState(false);

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

  const hasHoverList = Array.isArray(iconHoverList) && iconHoverList.length > 0;

  const iconBoxClass = `flex h-12 w-12 items-center justify-center rounded-2xl ${toneBg[tone]} ${
    icon ? toneIcon[tone] : ""
  } ${hasHoverList ? "cursor-default" : ""}`;

  const iconInner = (
    <div className={iconBoxClass} aria-hidden title={hasHoverList ? "Ver nomes dos produtos esgotados" : undefined}>
      {icon ?? null}
    </div>
  );

  return (
    <div
      className={`card relative overflow-visible ${hasHoverList && iconHovered ? "z-50" : "z-0"}`}
    >
      {hasHoverList ? (
        <div
          className="relative mb-4 inline-block"
          onMouseEnter={() => setIconHovered(true)}
          onMouseLeave={() => setIconHovered(false)}
        >
          {iconInner}
          {iconHovered && (
            <div
              className="absolute left-0 top-[calc(100%+0.25rem)] z-[100] min-w-[220px] max-w-[min(100vw-2rem,20rem)] rounded-2xl border border-pink-100 bg-white py-2 pl-3 pr-3 shadow-lg"
              role="tooltip"
            >
              <p className="mb-1.5 text-xs font-bold text-maricota-text">Produtos esgotados</p>
              <ul className="space-y-1 text-xs text-slate-700">
                {iconHoverList.map((name, i) => (
                  <li key={`${name}-${i}`} className="flex gap-1.5 border-b border-pink-50/80 py-1 last:border-0">
                    <span className="shrink-0 font-semibold text-slate-400">{i + 1}.</span>
                    <span className="min-w-0 break-words" title={name}>
                      {name}
                    </span>
                  </li>
                ))}
              </ul>
              {iconHoverFooter ? (
                <p className="mt-2 border-t border-pink-100 pt-2 text-xs text-slate-500">{iconHoverFooter}</p>
              ) : null}
              {typeof iconHoverOnMaisClick === "function" ? (
                <button
                  type="button"
                  className="mt-2 flex w-full items-center justify-center gap-px rounded-xl border border-pink-200 bg-white py-2 text-xs font-bold text-maricota-text shadow-sm transition hover:bg-maricota-rose"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    iconHoverOnMaisClick();
                  }}
                >
                  <span>Mais</span>
                  <span className="text-base font-black leading-none text-pink-600">+</span>
                </button>
              ) : null}
            </div>
          )}
        </div>
      ) : (
        <div className="mb-4" aria-hidden>
          {iconInner}
        </div>
      )}
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <strong className="mt-2 block text-2xl text-maricota-text">{value}</strong>
      {hint && <span className="mt-2 block text-xs text-slate-400">{hint}</span>}
    </div>
  );
}
