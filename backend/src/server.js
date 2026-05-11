const app = require("./app");

const port = process.env.PORT || 3333;
/** 0.0.0.0 aceita conexoes de outros PCs na mesma rede (Wi-Fi / LAN). */
const host = process.env.HOST || "0.0.0.0";

app.listen(port, host, () => {
  console.log(`API Maricota Kids ouvindo em http://${host}:${port}`);
  if (host === "0.0.0.0") {
    console.log("Rede local: outro computador usa VITE_API_URL=http://<IP-DESTA-MAQUINA>:" + port + "/api");
  }
});
