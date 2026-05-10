require("dotenv").config();

const productService = require("../src/services/productService");

const sampleProducts = [
  {
    name: "Body manga curta estampado",
    clothingType: "Body",
    category: "MENINO",
    size: "RN",
    brand: "Tip Top",
    barcode: "7891000110001",
    stockQuantity: 24,
    purchasePrice: 28.9,
    profitPercentage: 45,
    status: "ATIVO"
  },
  {
    name: "Vestido floral festa",
    clothingType: "Vestido",
    category: "MENINA",
    size: "2",
    brand: "Marisol",
    barcode: "7891000110002",
    stockQuantity: 12,
    purchasePrice: 89.5,
    profitPercentage: 40,
    status: "ATIVO"
  },
  {
    name: "Conjunto moletom capuz",
    clothingType: "Conjunto",
    category: "MENINO",
    size: "4",
    brand: "Kyly",
    barcode: "7891000110003",
    stockQuantity: 8,
    purchasePrice: 65,
    profitPercentage: 38,
    status: "ATIVO"
  },
  {
    name: "Saia tutu com calça",
    clothingType: "Saia",
    category: "MENINA",
    size: "6",
    brand: "Livy",
    barcode: "7891000110004",
    stockQuantity: 15,
    purchasePrice: 42,
    profitPercentage: 42,
    status: "ATIVO"
  },
  {
    name: "Camiseta básica lisa",
    clothingType: "Camiseta",
    category: "MENINA",
    size: "8",
    brand: "Hering Kids",
    barcode: "7891000110005",
    stockQuantity: 30,
    purchasePrice: 22,
    profitPercentage: 50,
    status: "ATIVO"
  },
  {
    name: "Bermuda jeans",
    clothingType: "Bermuda",
    category: "MENINO",
    size: "10",
    brand: "Tigor",
    barcode: "7891000110006",
    stockQuantity: 18,
    purchasePrice: 48,
    profitPercentage: 35,
    status: "ATIVO"
  },
  {
    name: "Pijama longo dinossauro",
    clothingType: "Pijama",
    category: "MENINO",
    size: "3",
    brand: "Puket",
    barcode: "7891000110007",
    stockQuantity: 6,
    purchasePrice: 55,
    profitPercentage: 40,
    status: "ATIVO"
  },
  {
    name: "Macacão jeans feminino",
    clothingType: "Macacão",
    category: "MENINA",
    size: "1",
    brand: "Carter's",
    barcode: "7891000110008",
    stockQuantity: 10,
    purchasePrice: 78,
    profitPercentage: 36,
    status: "ATIVO"
  },
  {
    name: "Camisa social manga longa",
    clothingType: "Camisa",
    category: "ADULTO",
    size: "M",
    brand: "Colcci",
    barcode: "7891000110009",
    stockQuantity: 4,
    purchasePrice: 95,
    profitPercentage: 30,
    status: "ATIVO"
  },
  {
    name: "Crocs clássica infantil",
    clothingType: "Calçado",
    category: "CROCS",
    size: "C9",
    brand: "Crocs",
    barcode: "7891000110010",
    stockQuantity: 14,
    purchasePrice: 120,
    profitPercentage: 25,
    status: "ATIVO"
  },
  {
    name: "Meia cano alto 3 pares",
    clothingType: "Acessório",
    category: "OUTROS",
    size: "Único",
    brand: "Lupo",
    barcode: "7891000110011",
    stockQuantity: 40,
    purchasePrice: 18.5,
    profitPercentage: 55,
    status: "ATIVO"
  },
  {
    name: "Jaqueta nylon corta-vento",
    clothingType: "Jaqueta",
    category: "MENINO",
    size: "12",
    brand: "Malwee",
    barcode: "7891000110012",
    stockQuantity: 5,
    purchasePrice: 72,
    profitPercentage: 40,
    status: "ATIVO"
  },
  {
    name: "Short saia jeans",
    clothingType: "Short saia",
    category: "MENINA",
    size: "14",
    brand: "Zara Kids",
    barcode: "7891000110013",
    stockQuantity: 7,
    purchasePrice: 58,
    profitPercentage: 42,
    status: "ATIVO"
  },
  {
    name: "Casaco tricot",
    clothingType: "Casaco",
    category: "MENINA",
    size: "4",
    brand: "C&A Kids",
    barcode: "7891000110014",
    stockQuantity: 3,
    purchasePrice: 64,
    profitPercentage: 38,
    status: "ATIVO"
  },
  {
    name: "Chinelo slide infantil",
    clothingType: "Chinelo",
    category: "OUTROS",
    size: "28",
    brand: "Ipanema",
    barcode: "7891000110015",
    stockQuantity: 20,
    purchasePrice: 25,
    profitPercentage: 48,
    status: "ATIVO"
  }
];

async function main() {
  for (const data of sampleProducts) {
    const created = await productService.createProduct(data);
    console.log("OK", created.name, "-", created.id);
  }
  console.log("\n15 produtos de teste cadastrados no Firestore.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
