/**
 * Imprime URLs para abrir o painel em outro PC na mesma rede (LAN).
 * Uso: npm run share
 * Portas diferentes do padrao: SHARE_PANEL_PORT=5174 SHARE_API_PORT=3333 npm run share
 */
const os = require("os");

function isIpv4(net) {
  return net.family === "IPv4" || net.family === 4;
}

function listLanIpv4() {
  const nets = os.networkInterfaces();
  const rows = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net && isIpv4(net) && !net.internal && net.address) {
        rows.push({ name, address: net.address });
      }
    }
  }
  return rows;
}

const panelPort = process.env.SHARE_PANEL_PORT || "5173";
const apiPort = process.env.SHARE_API_PORT || "3333";

const addrs = listLanIpv4();
const primary = addrs[0]?.address || null;

console.log("");
console.log("=== Maricota Kids — link para outro notebook (mesma rede Wi-Fi / LAN) ===");
console.log("");

if (!primary) {
  console.log("Nao encontrei um IPv4 de rede local (Wi-Fi/Ethernet). Conecte-se a uma rede ou veja ipconfig.");
  console.log("");
  process.exitCode = 1;
  process.exit();
}

console.log("1) Neste PC, deixe rodando na raiz: npm run dev");
console.log(
  "   Se o Vite usar outra porta (ex.: 5174), rode este script de novo com a porta certa:"
);
console.log("   PowerShell:  $env:SHARE_PANEL_PORT=\"5174\"; npm run share");
console.log('   Bash:        SHARE_PANEL_PORT=5174 npm run share');
console.log("");
console.log("2) Copie o link abaixo e envie (WhatsApp, e-mail, etc.) para a outra pessoa:");
console.log("");

for (const { name, address } of addrs) {
  const panel = `http://${address}:${panelPort}/`;
  const api = `http://${address}:${apiPort}/api`;
  console.log(`   Interface: ${name}`);
  console.log(`   Painel:    ${panel}`);
  console.log(`   API:       ${api}`);
  console.log("");
}

console.log("3) No backend/.env (neste PC que hospeda o sistema), FRONTEND_URL deve incluir o painel por IP, ex.:");
console.log(
  `   FRONTEND_URL=http://localhost:${panelPort},http://${primary}:${panelPort}`
);
console.log("   (adicione mais origens separadas por virgula, sem espacos)");
console.log("");
console.log("4) No frontend/.env (neste PC):");
console.log("   Coloque isto para o navegador do outro notebook chamar sua API pelo IP:");
console.log(`   VITE_API_URL=http://${primary}:${apiPort}/api`);
console.log("   Reinicie npm run dev (na raiz ou no frontend) apos salvar.");
console.log("");
console.log("5) Firewall do Windows: permita entrada TCP nas portas " + panelPort + " e " + apiPort + ".");
console.log("");
console.log("--- Fora da sua casa/empresa (internet) ---");
console.log(
  "Um link publico estável precisa do front na Vercel e da API na Render (ou parecido),"
);
console.log("ou de um tinel temporario (ex.: Cloudflare Tunnel / ngrok) — ver README.");
console.log("");
