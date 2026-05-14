import { useEffect } from "react";

/**
 * Lista completa de produtos esgotados (dashboard).
 * Fecha com botão X, clique no fundo ou tecla Escape.
 */
export default function SoldOutProductsModal({ open, onClose, products }) {
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-soft"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sold-out-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-pink-100 px-5 py-4">
          <h2 id="sold-out-modal-title" className="text-lg font-bold text-maricota-text">
            Produtos esgotados
          </h2>
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
          {!products?.length ? (
            <p className="py-6 text-center text-sm text-slate-500">Nenhum produto esgotado.</p>
          ) : (
            <ul className="space-y-0 divide-y divide-pink-50 text-sm text-slate-700">
              {products.map((p, index) => (
                <li key={p.id || `sold-out-${index}`} className="flex gap-3 py-2.5 first:pt-0">
                  <span className="w-7 shrink-0 font-semibold text-slate-400">{index + 1}.</span>
                  <span className="min-w-0 break-words">{p.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
