import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import PageHeader from "../components/PageHeader";
import { formatCurrency } from "../utils/formatters";

/** PDV: carrinho em memória; envio final registra venda e delega estoque/consistência ao backend. */
export default function SaleForm() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [barcode, setBarcode] = useState("");
  const [cart, setCart] = useState([]);
  const [picker, setPicker] = useState({
    productId: "",
    quantity: 1
  });
  const [checkout, setCheckout] = useState({
    discount: 0,
    paymentMethod: "PIX",
    isInstallment: false,
    installments: 1,
    paidAmount: 0,
    observation: ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/products").then(({ data }) => setProducts(data.filter((product) => product.status === "ATIVO")));
    api.get("/customers").then(({ data }) => setCustomers(data));
  }, []);

  const selectedProduct = products.find((product) => product.id === picker.productId);

  const cartSubtotal = useMemo(
    () => cart.reduce((sum, line) => sum + Number(line.unitSalePrice) * Number(line.quantity), 0),
    [cart]
  );

  const total = Math.max(cartSubtotal - Number(checkout.discount || 0), 0);
  const installmentValue = total / Number(checkout.installments || 1);
  const change =
    checkout.paymentMethod === "DINHEIRO" ? Number(checkout.paidAmount || 0) - total : 0;

  function updateCheckout(field, value) {
    setCheckout((current) => ({ ...current, [field]: value }));
  }

  function updatePicker(field, value) {
    setPicker((current) => ({ ...current, [field]: value }));
  }

  function handleBarcodeSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    const code = barcode.trim();
    const product = products.find((item) => item.barcode === code);

    if (!code) {
      setError("Informe ou leia um codigo de barras.");
      return;
    }

    if (!product) {
      setError("Produto nao encontrado para este codigo de barras.");
      return;
    }

    setPicker((current) => ({ productId: product.id, quantity: current.quantity || 1 }));
    setMessage(`${product.name} selecionado pelo codigo de barras. Clique em Adicionar ao carrinho.`);
  }

  function quantityInCartForProduct(productId) {
    const line = cart.find((l) => l.productId === productId);
    return line ? line.quantity : 0;
  }

  function addToCart(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!selectedProduct) {
      setError("Selecione um produto antes de adicionar ao carrinho.");
      return;
    }

    const addQty = Math.max(1, Number(picker.quantity) || 1);
    const already = quantityInCartForProduct(selectedProduct.id);
    const maxAllowed = Number(selectedProduct.stockQuantity);

    if (already + addQty > maxAllowed) {
      setError(
        `Estoque insuficiente. Disponivel: ${maxAllowed}. No carrinho: ${already}.`
      );
      return;
    }

    const unitSalePrice = Number(selectedProduct.salePrice);

    setCart((current) => {
      const idx = current.findIndex((l) => l.productId === selectedProduct.id);
      if (idx === -1) {
        return [
          ...current,
          {
            productId: selectedProduct.id,
            name: selectedProduct.name,
            size: selectedProduct.size,
            unitSalePrice,
            quantity: addQty
          }
        ];
      }
      const next = [...current];
      next[idx] = { ...next[idx], quantity: next[idx].quantity + addQty };
      return next;
    });

    setMessage(`${selectedProduct.name} adicionado ao carrinho (${addQty} un.).`);
  }

  function removeLine(productId) {
    setCart((current) => current.filter((l) => l.productId !== productId));
    setMessage("");
  }

  function updateLineQuantity(productId, rawQty) {
    const qty = Math.max(1, Number(rawQty) || 1);
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    if (qty > product.stockQuantity) {
      setError(`Quantidade maxima em estoque para ${product.name}: ${product.stockQuantity}.`);
      return;
    }
    setError("");
    setCart((current) =>
      current.map((l) => (l.productId === productId ? { ...l, quantity: qty } : l))
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (cart.length === 0) {
      setError("Adicione pelo menos um produto ao carrinho.");
      return;
    }

    try {
      // Itens com preço unitário capturado no momento da venda (histórico fiel mesmo se o produto mudar depois).
      await api.post("/sales", {
        customerId: customerId || undefined,
        items: cart.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
          unitSalePrice: line.unitSalePrice
        })),
        discount: Number(checkout.discount || 0),
        paymentMethod: checkout.paymentMethod,
        isInstallment: Boolean(checkout.isInstallment),
        installments: Number(checkout.installments || 1),
        paidAmount:
          checkout.paymentMethod === "DINHEIRO" ? Number(checkout.paidAmount || 0) : total,
        observation: checkout.observation
      });

      setMessage("Venda registrada com sucesso e estoque atualizado.");
      setCart([]);
      setCustomerId("");
      setBarcode("");
      setPicker({ productId: "", quantity: 1 });
      setCheckout({
        discount: 0,
        paymentMethod: "PIX",
        isInstallment: false,
        installments: 1,
        paidAmount: 0,
        observation: ""
      });
      const { data } = await api.get("/products");
      setProducts(data.filter((product) => product.status === "ATIVO"));
    } catch (err) {
      setError(err.response?.data?.message || "Nao foi possivel registrar a venda.");
    }
  }

  return (
    <>
      <PageHeader
        title="Registrar venda"
        description="PDV: precos ficam congelados no carrinho no momento da venda. Estoque e validado antes de finalizar; cliente opcional amarra ao historico."
      />

      <form className="card grid gap-4 lg:grid-cols-2" onSubmit={handleSubmit}>
        {message && (
          <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700 lg:col-span-2">
            {message}
          </div>
        )}
        {error && (
          <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600 lg:col-span-2">
            {error}
          </div>
        )}

        <label className="lg:col-span-2">
          <span className="mb-2 block text-sm font-semibold">Cliente (opcional)</span>
          <select className="input" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            <option value="">Sem cliente</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.childName ? ` — ${c.childName}` : ""}
              </option>
            ))}
          </select>
          <span className="mt-1 block text-xs text-slate-500">
            Vincula a venda ao cadastro (historico e campanhas). Cadastre em Clientes.
          </span>
        </label>

        <label className="lg:col-span-2">
          <span className="mb-2 block text-sm font-semibold">Codigo de barras</span>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              className="input"
              inputMode="numeric"
              placeholder="Aponte o leitor para selecionar o produto"
              value={barcode}
              onChange={(event) => setBarcode(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleBarcodeSubmit(event);
                }
              }}
            />
            <button className="btn-secondary whitespace-nowrap" type="button" onClick={handleBarcodeSubmit}>
              Buscar codigo
            </button>
          </div>
          <span className="mt-2 block text-xs text-slate-400">
            Opcional. Depois use Adicionar ao carrinho.
          </span>
        </label>

        <label>
          <span className="mb-2 block text-sm font-semibold">Produto</span>
          <select
            className="input"
            value={picker.productId}
            onChange={(event) => updatePicker("productId", event.target.value)}
          >
            <option value="">Selecione</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} - {product.size} - estoque {product.stockQuantity}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="mb-2 block text-sm font-semibold">Quantidade</span>
          <input
            className="input"
            min="1"
            max={selectedProduct?.stockQuantity || undefined}
            type="number"
            value={picker.quantity}
            onChange={(event) => updatePicker("quantity", event.target.value)}
          />
        </label>

        <div className="flex items-end lg:col-span-2">
          <button className="btn-secondary w-full sm:w-auto" type="button" onClick={addToCart}>
            Adicionar ao carrinho
          </button>
        </div>

        <div className="lg:col-span-2">
          <h3 className="mb-3 text-sm font-bold text-maricota-text">Carrinho</h3>
          {cart.length === 0 ? (
            <p className="rounded-2xl border border-pink-100 bg-pink-50/50 px-4 py-6 text-center text-sm text-slate-500">
              Nenhum item ainda. Adicione produtos acima.
            </p>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-pink-100 bg-white">
              <table className="min-w-full divide-y divide-pink-50 text-left text-sm">
                <thead className="bg-maricota-rose text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Produto</th>
                    <th className="px-4 py-3">Qtd</th>
                    <th className="px-4 py-3">Unitario</th>
                    <th className="px-4 py-3">Subtotal</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-50">
                  {cart.map((line) => (
                    <tr key={line.productId}>
                      <td className="px-4 py-3">
                        <span className="font-medium">{line.name}</span>
                        {line.size && (
                          <span className="ml-1 text-xs text-slate-400">tam. {line.size}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          className="input max-w-[5rem] py-2"
                          min={1}
                          type="number"
                          value={line.quantity}
                          onChange={(e) => updateLineQuantity(line.productId, e.target.value)}
                        />
                      </td>
                      <td className="px-4 py-3">{formatCurrency(line.unitSalePrice)}</td>
                      <td className="px-4 py-3 font-semibold">
                        {formatCurrency(line.unitSalePrice * line.quantity)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          className="text-sm font-semibold text-red-500 hover:underline"
                          type="button"
                          onClick={() => removeLine(line.productId)}
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <label>
          <span className="mb-2 block text-sm font-semibold">Desconto (sobre o total)</span>
          <input
            className="input"
            min="0"
            step="0.01"
            type="number"
            value={checkout.discount}
            onChange={(event) => updateCheckout("discount", event.target.value)}
          />
          <span className="mt-1 block text-xs text-slate-500">
            Valor fixo em reais retirado do subtotal do carrinho; confira limites em Configuracoes.
          </span>
        </label>

        <label>
          <span className="mb-2 block text-sm font-semibold">Metodo de pagamento</span>
          <select
            className="input"
            value={checkout.paymentMethod}
            onChange={(event) => updateCheckout("paymentMethod", event.target.value)}
          >
            <option value="PIX">Pix</option>
            <option value="DINHEIRO">Dinheiro</option>
            <option value="DEBITO">Debito</option>
            <option value="CREDITO">Credito</option>
          </select>
          <span className="mt-1 block text-xs text-slate-500">Em dinheiro, informe o valor recebido para exibir o troco.</span>
        </label>

        <label className="flex flex-col gap-2 rounded-2xl bg-pink-50 p-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={checkout.isInstallment}
              onChange={(event) => updateCheckout("isInstallment", event.target.checked)}
            />
            <span className="text-sm font-semibold">Venda parcelada</span>
          </div>
          <span className="text-xs text-slate-500 pl-7 sm:pl-0">
            Marque para registrar quantas parcelas; o valor por parcela aparece no resumo.
          </span>
        </label>

        <label>
          <span className="mb-2 block text-sm font-semibold">Quantidade de parcelas</span>
          <input
            className="input"
            disabled={!checkout.isInstallment}
            min="1"
            type="number"
            value={checkout.installments}
            onChange={(event) => updateCheckout("installments", event.target.value)}
          />
          <span className="mt-1 block text-xs text-slate-500">Ativo apenas com parcelamento marcado.</span>
        </label>

        {checkout.paymentMethod === "DINHEIRO" && (
          <label className="lg:col-span-2">
            <span className="mb-2 block text-sm font-semibold">Valor pago pelo cliente</span>
            <input
              className="input"
              min="0"
              step="0.01"
              type="number"
              value={checkout.paidAmount}
              onChange={(event) => updateCheckout("paidAmount", event.target.value)}
            />
          </label>
        )}

        <label className="lg:col-span-2">
          <span className="mb-2 block text-sm font-semibold">Observacao</span>
          <textarea
            className="input min-h-28"
            value={checkout.observation}
            onChange={(event) => updateCheckout("observation", event.target.value)}
          />
          <span className="mt-1 block text-xs text-slate-500">Nota interna (troca combinada, combinado com cliente, etc.).</span>
        </label>

        <div className="grid gap-3 rounded-3xl bg-maricota-rose p-5 lg:col-span-2 sm:grid-cols-2 lg:grid-cols-5">
          <Summary label="Subtotal carrinho" value={formatCurrency(cartSubtotal)} />
          <Summary label="Desconto" value={formatCurrency(checkout.discount || 0)} />
          <Summary label="Total a pagar" value={formatCurrency(total)} />
          <Summary label="Parcela" value={formatCurrency(installmentValue)} />
          <Summary label="Troco" value={formatCurrency(Math.max(change, 0))} />
        </div>

        <div className="lg:col-span-2">
          <button className="btn-primary w-full sm:w-auto" disabled={cart.length === 0} type="submit">
            Finalizar venda
          </button>
          <p className="mt-2 text-xs text-slate-500">
            Ao confirmar, o estoque baixa e a venda entra no historico e nos relatorios.
          </p>
        </div>
      </form>
    </>
  );
}

function Summary({ label, value }) {
  return (
    <div>
      <span className="text-xs font-semibold uppercase text-slate-500">{label}</span>
      <strong className="block text-xl text-maricota-text">{value}</strong>
    </div>
  );
}
