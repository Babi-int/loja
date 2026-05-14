import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import DataTable from "../components/DataTable";
import PageHeader from "../components/PageHeader";
import SupplierPurchaseHistoryModal from "../components/SupplierPurchaseHistoryModal";

export default function SupplierList() {
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [historySupplier, setHistorySupplier] = useState(null);

  useEffect(() => {
    api.get("/suppliers").then(({ data }) => setSuppliers(data));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return suppliers;
    return suppliers.filter((s) =>
      `${s.razaoSocial} ${s.cnpjCpf || ""} ${s.setor || ""} ${s.observacao || ""}`.toLowerCase().includes(q)
    );
  }, [suppliers, search]);

  return (
    <>
      <PageHeader
        title="Fornecedor"
        description="Cadastro de fornecedores: razao social, CNPJ ou CPF (somente numeros), setor e observacoes."
        action={
          <Link className="btn-primary" to="/fornecedores/novo">
            Novo fornecedor
          </Link>
        }
      />

      <div className="card mb-5">
        <input
          className="input"
          placeholder="Buscar por razao social, documento, setor ou observacao"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <p className="mt-2 text-xs text-slate-500">Busca instantanea na lista ja carregada.</p>
      </div>

      <SupplierPurchaseHistoryModal
        open={historySupplier != null}
        supplier={historySupplier}
        onClose={() => setHistorySupplier(null)}
      />

      <DataTable
        data={filtered}
        columns={[
          { key: "razaoSocial", label: "Razao social" },
          { key: "cnpjCpf", label: "CNPJ / CPF", render: (row) => row.cnpjCpf || "-" },
          { key: "setor", label: "Setor", render: (row) => row.setor || "-" },
          {
            key: "observacao",
            label: "Observacao",
            render: (row) =>
              row.observacao ? (
                <span className="line-clamp-2 max-w-xs" title={row.observacao}>
                  {row.observacao}
                </span>
              ) : (
                "-"
              )
          },
          {
            key: "actions",
            label: "Acoes",
            render: (row) => (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <Link className="font-semibold text-pink-500" to={`/fornecedores/${row.id}`}>
                  Editar
                </Link>
                <button
                  type="button"
                  className="font-semibold text-pink-500 hover:underline"
                  onClick={() => setHistorySupplier(row)}
                >
                  Histórico de compra
                </button>
              </div>
            )
          }
        ]}
      />
    </>
  );
}
