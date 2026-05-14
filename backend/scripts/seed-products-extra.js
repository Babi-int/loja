/**
 * Insere 20 produtos extras de teste (Maricota Kids). Pula se o codigo de barras ja existir.
 *
 * Uso: npm run seed:products:extra   (pasta backend, .env com Firebase)
 */
require("dotenv").config();

const { db } = require("../src/database/firebase");
const productService = require("../src/services/productService");

const extraProducts = [
  {
    name: "Body regata listrado marinheiro",
    clothingType: "Body",
    category: "MENINO",
    size: "P",
    brand: "Tip Top",
    barcode: "7891000110016",
    stockQuantity: 22,
    purchasePrice: 32.5,
    profitPercentage: 44,
    status: "ATIVO"
  },
  {
    name: "Vestido poá com cinto",
    clothingType: "Vestido",
    category: "MENINA",
    size: "3",
    brand: "Marisol",
    barcode: "7891000110017",
    stockQuantity: 9,
    purchasePrice: 72,
    profitPercentage: 41,
    status: "ATIVO"
  },
  {
    name: "Calça jogger moletom",
    clothingType: "Calça",
    category: "MENINO",
    size: "6",
    brand: "Malwee",
    barcode: "7891000110018",
    stockQuantity: 16,
    purchasePrice: 54.902,
    profitPercentage: 37,
    status: "ATIVO"
  },
  {
    name: "Blusa manga bufete laço",
    clothingType: "Blusa",
    category: "MENINA",
    size: "4",
    brand: "Livy",
    barcode: "7891000110019",
    stockQuantity: 11,
    purchasePrice: 45,
    profitPercentage: 46,
    status: "ATIVO"
  },
  {
    name: "Kit 3 bodies neutros",
    clothingType: "Body",
    category: "MENINA",
    size: "RN",
    brand: "Puket",
    barcode: "7891000110020",
    stockQuantity: 28,
    purchasePrice: 59.9,
    profitPercentage: 35,
    status: "ATIVO"
  },
  {
    name: "Camiseta estampa skate",
    clothingType: "Camiseta",
    category: "MENINO",
    size: "8",
    brand: "Tigor",
    barcode: "7891000110021",
    stockQuantity: 19,
    purchasePrice: 35,
    profitPercentage: 48,
    status: "ATIVO"
  },
  {
    name: "Legging cotton básica",
    clothingType: "Legging",
    category: "MENINA",
    size: "10",
    brand: "Hering Kids",
    barcode: "7891000110022",
    stockQuantity: 25,
    purchasePrice: 28,
    profitPercentage: 52,
    status: "ATIVO"
  },
  {
    name: "Jaqueta jeans escura",
    clothingType: "Jaqueta",
    category: "MENINO",
    size: "12",
    brand: "Zara Kids",
    barcode: "7891000110023",
    stockQuantity: 4,
    purchasePrice: 110,
    profitPercentage: 32,
    status: "ATIVO"
  },
  {
    name: "Macaquinho alça florido",
    clothingType: "Macaquinho",
    category: "MENINA",
    size: "2",
    brand: "Carter's",
    barcode: "7891000110024",
    stockQuantity: 13,
    purchasePrice: 68,
    profitPercentage: 39,
    status: "ATIVO"
  },
  {
    name: "Short tactel esportivo",
    clothingType: "Short",
    category: "MENINO",
    size: "14",
    brand: "Adidas Kids",
    barcode: "7891000110025",
    stockQuantity: 17,
    purchasePrice: 49.99,
    profitPercentage: 36,
    status: "ATIVO"
  },
  {
    name: "Touca e cachecol tricot kit",
    clothingType: "Acessório",
    category: "OUTROS",
    size: "Único",
    brand: "C&A Kids",
    barcode: "7891000110026",
    stockQuantity: 32,
    purchasePrice: 34.5,
    profitPercentage: 45,
    status: "ATIVO"
  },
  {
    name: "Sandália fechada couro sintético",
    clothingType: "Calçado",
    category: "MENINA",
    size: "26",
    brand: "Klin",
    barcode: "7891000110027",
    stockQuantity: 8,
    purchasePrice: 82,
    profitPercentage: 28,
    status: "ATIVO"
  },
  {
    name: "Tênis velcro colorido",
    clothingType: "Calçado",
    category: "MENINO",
    size: "30",
    brand: "Bibi",
    barcode: "7891000110028",
    stockQuantity: 6,
    purchasePrice: 95,
    profitPercentage: 26,
    status: "ATIVO"
  },
  {
    name: "Colete puffer leve",
    clothingType: "Colete",
    category: "MENINA",
    size: "6",
    brand: "Kyly",
    barcode: "7891000110029",
    stockQuantity: 5,
    purchasePrice: 88,
    profitPercentage: 33,
    status: "ATIVO"
  },
  {
    name: "Cueiro fralda bordado",
    clothingType: "Acessório",
    category: "OUTROS",
    size: "Único",
    brand: "Papi Baby",
    barcode: "7891000110030",
    stockQuantity: 50,
    purchasePrice: 42,
    profitPercentage: 40,
    status: "ATIVO"
  },
  {
    name: "Camisa xadrez flanela",
    clothingType: "Camisa",
    category: "MENINO",
    size: "10",
    brand: "Colcci",
    barcode: "7891000110031",
    stockQuantity: 7,
    purchasePrice: 76.5,
    profitPercentage: 31,
    status: "ATIVO"
  },
  {
    name: "Saia midi plissada",
    clothingType: "Saia",
    category: "MENINA",
    size: "12",
    brand: "Zara Kids",
    barcode: "7891000110032",
    stockQuantity: 10,
    purchasePrice: 62,
    profitPercentage: 43,
    status: "ATIVO"
  },
  {
    name: "Sunga boxer com proteção UV",
    clothingType: "Sunga",
    category: "MENINO",
    size: "8",
    brand: "Lupo",
    barcode: "7891000110033",
    stockQuantity: 21,
    purchasePrice: 38,
    profitPercentage: 47,
    status: "ATIVO"
  },
  {
    name: "Manta soft estrelinhas",
    clothingType: "Acessório",
    category: "OUTROS",
    size: "Único",
    brand: "Papi Baby",
    barcode: "7891000110034",
    stockQuantity: 14,
    purchasePrice: 55,
    profitPercentage: 38,
    status: "ATIVO"
  },
  {
    name: "Óculos de sol flexível infantil",
    clothingType: "Acessório",
    category: "OUTROS",
    size: "Único",
    brand: "Livy",
    barcode: "7891000110035",
    stockQuantity: 23,
    purchasePrice: 29.9,
    profitPercentage: 60,
    status: "ATIVO"
  }
];

async function barcodeExists(code) {
  const normalized = String(code || "").trim();
  if (!normalized) return false;
  const snap = await db.collection("products").where("barcode", "==", normalized).limit(1).get();
  return !snap.empty;
}

async function main() {
  let created = 0;
  let skipped = 0;
  for (const data of extraProducts) {
    if (await barcodeExists(data.barcode)) {
      skipped++;
      console.log("Pular (ja existe):", data.barcode, "-", data.name);
      continue;
    }
    const p = await productService.createProduct(data);
    created++;
    console.log("OK", p.name, "-", p.id);
  }
  console.log(`\nConcluido: ${created} produto(s) criado(s), ${skipped} ignorado(s) (codigo ja cadastrado).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
