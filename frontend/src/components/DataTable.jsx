export default function DataTable({ columns, data, emptyMessage = "Nenhum registro encontrado." }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-pink-100 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-pink-50 text-left text-sm">
          <thead className="bg-maricota-rose text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 font-semibold">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-pink-50">
            {data.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-slate-400" colSpan={columns.length}>
                  {emptyMessage}
                </td>
              </tr>
            )}
            {data.map((row) => (
              <tr key={row.id} className="hover:bg-pink-50/50">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
