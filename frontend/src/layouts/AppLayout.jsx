import { NavLink, Outlet } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/vendas/nova", label: "Registrar venda" },
  { to: "/produtos", label: "Produtos" },
  { to: "/clientes", label: "Clientes" },
  { to: "/vendas", label: "Histórico" },
  { to: "/financeiro", label: "Financeiro" },
  { to: "/fornecedores", label: "Fornecedor" },
  { to: "/configuracoes", label: "Configurações" }
];

export default function AppLayout() {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen lg:flex">
      <aside className="border-r border-white/70 bg-white/80 p-5 backdrop-blur lg:w-72">
        <div className="mb-8 flex flex-col items-center rounded-3xl bg-white p-4 ring-1 ring-pink-100 shadow-soft">
          <BrandLogo variant="sidebar" className="drop-shadow-sm" />
          <p className="mt-3 text-center text-xs text-slate-500">Estoque e financeiro</p>
        </div>

        <nav className="grid gap-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  isActive ? "bg-maricota-pink text-white shadow-soft" : "text-slate-600 hover:bg-maricota-rose"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/70 bg-white/70 px-6 py-4 backdrop-blur">
          <div className="flex min-w-0 items-center gap-4">
            <BrandLogo variant="compact" className="shrink-0 hidden sm:block" />
            <div>
              <p className="text-sm text-slate-500">Bem-vinda,</p>
              <strong className="text-maricota-text">{user?.name || "Administrador"}</strong>
            </div>
          </div>
          <button className="btn-secondary" type="button" onClick={logout}>
            Sair
          </button>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
