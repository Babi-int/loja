import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import DataTable from "../components/DataTable";
import PageHeader from "../components/PageHeader";
import { formatDate } from "../utils/formatters";

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/customers").then(({ data }) => setCustomers(data));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return customers;
    return customers.filter((c) =>
      `${c.name} ${c.phone} ${c.email} ${c.childName || ""}`.toLowerCase().includes(q)
    );
  }, [customers, search]);

  return (
    <>
      <PageHeader
        title="Clientes"
        description="Cadastro da responsavel, contato e dados da crianca para campanhas futuras, como aniversario."
        action={
          <Link className="btn-primary" to="/clientes/novo">
            Novo cliente
          </Link>
        }
      />

      <div className="card mb-5">
        <input
          className="input"
          placeholder="Buscar por nome, telefone, e-mail ou nome da crianca"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <DataTable
        data={filtered}
        columns={[
          { key: "name", label: "Nome (mae/responsavel)" },
          { key: "phone", label: "Telefone", render: (row) => row.phone || "-" },
          { key: "email", label: "E-mail", render: (row) => row.email || "-" },
          { key: "childName", label: "Crianca", render: (row) => row.childName || "-" },
          {
            key: "childBirthDate",
            label: "Nascimento",
            render: (row) => (row.childBirthDate ? formatDate(row.childBirthDate) : "-")
          },
          {
            key: "actions",
            label: "Acoes",
            render: (row) => (
              <Link className="font-semibold text-pink-500" to={`/clientes/${row.id}`}>
                Editar
              </Link>
            )
          }
        ]}
      />
    </>
  );
}
