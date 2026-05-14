import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import { formatCurrency } from "./formatters";

const PAYMENT_LABELS = {
  PIX: "Pix",
  DINHEIRO: "Dinheiro",
  DEBITO: "Debito",
  CREDITO: "Credito"
};

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

async function tryLoadLogoDataUrl() {
  if (typeof window === "undefined") return null;
  try {
    const url = `${window.location.origin}/logo-simplerp.png`;
    const res = await fetch(url);
    if (!res.ok) return null;
    return await blobToDataUrl(await res.blob());
  } catch {
    return null;
  }
}

/**
 * PDF espelho do registro de venda (carrinho atual + resumo).
 */
export async function generateSaleReceiptPdf({
  storeName,
  siteHost,
  customerLabel,
  cart,
  discount,
  paymentMethod,
  isInstallment,
  installments,
  observation,
  cartSubtotal,
  total,
  installmentValue,
  change,
  paidAmount
}) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 14;
  let y = 12;

  const logoDataUrl = await tryLoadLogoDataUrl();
  const maxLogoW = 52;
  if (logoDataUrl) {
    try {
      const dims = await new Promise((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve({ w: i.naturalWidth, h: i.naturalHeight });
        i.onerror = reject;
        i.src = logoDataUrl;
      });
      const ratio = dims.h / dims.w;
      const w = maxLogoW;
      const h = w * ratio;
      const x = (pageW - w) / 2;
      doc.addImage(logoDataUrl, "PNG", x, y, w, h);
      y += h + 6;
    } catch {
      y += 2;
    }
  } else {
    y += 2;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(String(storeName || "Maricota Kids"), pageW / 2, y, { align: "center" });
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 70, 80);
  const hostLine = siteHost || (typeof window !== "undefined" ? window.location.host : "");
  if (hostLine) {
    doc.text(hostLine, pageW / 2, y, { align: "center" });
    y += 5;
  }
  doc.setTextColor(0, 0, 0);

  doc.setDrawColor(247, 182, 200);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Nota de venda (espelho)", margin, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const issued = new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  doc.text(`Emitido em: ${issued}`, pageW - margin, y, { align: "right" });
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Cliente", margin, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const custLines = doc.splitTextToSize(String(customerLabel || "Nao informado / venda avulsa"), pageW - 2 * margin);
  doc.text(custLines, margin, y);
  y += custLines.length * 4.2 + 4;

  const tableBody = cart.map((line) => {
    const desc = line.size ? `${line.name} (tam. ${line.size})` : line.name;
    return [
      desc,
      String(line.quantity),
      formatCurrency(line.unitSalePrice),
      formatCurrency(Number(line.unitSalePrice) * Number(line.quantity))
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [["Produto", "Qtd", "Unitario", "Subtotal"]],
    body: tableBody,
    margin: { left: margin, right: margin },
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: {
      fillColor: [247, 182, 200],
      textColor: [60, 50, 60],
      fontStyle: "bold"
    },
    alternateRowStyles: { fillColor: [255, 248, 251] }
  });

  y = doc.lastAutoTable.finalY + 8;

  const payLabel = PAYMENT_LABELS[paymentMethod] || paymentMethod;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Resumo financeiro", margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  const rows = [
    ["Subtotal do carrinho", formatCurrency(cartSubtotal)],
    ["Desconto", formatCurrency(discount || 0)],
    ["Total a pagar", formatCurrency(total)],
    ["Forma de pagamento", payLabel]
  ];

  if (isInstallment) {
    const n = Math.max(1, Number(installments) || 1);
    rows.push(["Venda parcelada", "Sim"]);
    rows.push(["Quantidade de parcelas", String(n)]);
    rows.push(["Valor de cada parcela", formatCurrency(installmentValue)]);
  }

  if (paymentMethod === "DINHEIRO") {
    rows.push(["Valor recebido", formatCurrency(paidAmount || 0)]);
    rows.push(["Troco", formatCurrency(Math.max(change, 0))]);
  }

  rows.forEach(([k, v]) => {
    doc.setFont("helvetica", "normal");
    doc.text(k, margin, y);
    doc.text(v, pageW - margin, y, { align: "right" });
    y += 5;
  });

  const obs = String(observation || "").trim();
  if (obs) {
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.text("Observacao", margin, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    const obsLines = doc.splitTextToSize(obs, pageW - 2 * margin);
    doc.text(obsLines, margin, y);
    y += obsLines.length * 4.2 + 2;
  }

  y += 6;
  doc.setFontSize(8);
  doc.setTextColor(120, 110, 120);
  doc.text("Documento informativo gerado pelo sistema — nao substitui documento fiscal.", margin, y);
  doc.setTextColor(0, 0, 0);

  const safeDate = new Date()
    .toISOString()
    .slice(0, 16)
    .replace(/[-:T]/g, "");
  doc.save(`nota-venda-${safeDate}.pdf`);
}
