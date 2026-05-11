/**
 * Rotulo para campo obrigatorio: asterisco + botao "?" com tooltip (hover ou foco).
 * Textos curtos e didaticos no prop tip.
 */
export default function RequiredFieldLabel({ children, tip }) {
  return (
    <span className="mb-2 flex flex-wrap items-center gap-2 text-sm font-semibold text-maricota-text">
      <span>{children}</span>
      <span className="text-pink-500" aria-hidden="true">
        *
      </span>
      <span className="group relative inline-flex shrink-0 align-middle">
        <button
          type="button"
          className="flex h-5 w-5 cursor-help items-center justify-center rounded-full border border-pink-200 bg-pink-50 text-[10px] font-bold text-pink-600 shadow-sm outline-none hover:bg-pink-100 focus-visible:ring-2 focus-visible:ring-pink-400"
          aria-label={tip}
        >
          ?
        </button>
        <span
          role="tooltip"
          className="pointer-events-none absolute left-0 top-full z-[100] mt-1.5 w-[min(22rem,calc(100vw-2rem))] invisible rounded-xl border border-pink-100 bg-white px-3 py-2 text-left text-xs font-normal leading-relaxed text-slate-600 opacity-0 shadow-lg ring-1 ring-black/5 transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 sm:left-1/2 sm:-translate-x-1/2"
        >
          {tip}
        </span>
      </span>
    </span>
  );
}
