/**
 * Cria 15 clientes e 15 fornecedores de teste no Firestore.
 * Remove antes registros com seedDemo === true (mesma flag) para poder rodar de novo.
 *
 * Uso: npm run seed:demo   (pasta backend, .env com Firebase)
 */
require("dotenv").config();

const { db } = require("../src/database/firebase");

const now = () => new Date().toISOString();
const SEED_FLAG = true;

const customersData = [
  { name: "Ana Paula Ferreira", phone: "(11) 98765-1201", email: "ana.paula.ferreira@email.com", childName: "Laura Ferreira", childBirthDate: "2019-03-15" },
  { name: "Beatriz Santos Lima", phone: "(21) 97654-2202", email: "bia.santos@email.com", childName: "Miguel Lima", childBirthDate: "2020-07-22" },
  { name: "Carla Mendes Oliveira", phone: "(31) 96543-3303", email: "carla.mendes@email.com", childName: "Sophia Oliveira", childBirthDate: "2018-11-08" },
  { name: "Daniela Costa Ribeiro", phone: "(41) 95432-4404", email: "dani.costa@email.com", childName: "Helena Ribeiro", childBirthDate: "2021-01-30" },
  { name: "Eduarda Alves Martins", phone: "(51) 94321-5505", email: "duda.alves@email.com", childName: "Bernardo Martins", childBirthDate: "2017-09-12" },
  { name: "Fernanda Lima Souza", phone: "(61) 93210-6606", email: "fer.lima@email.com", childName: "Alice Souza", childBirthDate: "2019-05-25" },
  { name: "Gabriela Rocha Pereira", phone: "(71) 92109-7707", email: "gabi.rocha@email.com", childName: "Theo Pereira", childBirthDate: "2020-12-01" },
  { name: "Helena Dias Cardoso", phone: "(81) 91098-8808", email: "helena.dias@email.com", childName: "Isabella Cardoso", childBirthDate: "2018-04-18" },
  { name: "Isabela Nunes Teixeira", phone: "(85) 99987-9909", email: "isa.nunes@email.com", childName: "Enzo Teixeira", childBirthDate: "2022-02-14" },
  { name: "Juliana Campos Araújo", phone: "(11) 98876-1010", email: "ju.campos@email.com", childName: "Valentina Araújo", childBirthDate: "2019-08-07" },
  { name: "Karina Freitas Monteiro", phone: "(27) 97765-1111", email: "kari.freitas@email.com", childName: "Arthur Monteiro", childBirthDate: "2021-06-20" },
  { name: "Larissa Pinto Barbosa", phone: "(48) 96654-1212", email: "lari.pinto@email.com", childName: "Manuela Barbosa", childBirthDate: "2017-10-03" },
  { name: "Mariana Teixeira Dias", phone: "(19) 95543-1313", email: "mari.teixeira@email.com", childName: "Lucas Dias", childBirthDate: "2020-03-28" },
  { name: "Natália Guerra Lopes", phone: "(62) 94432-1414", email: "nat.guerra@email.com", childName: "Luiza Lopes", childBirthDate: "2018-12-11" },
  { name: "Patricia Melo Rezende", phone: "(92) 93321-1515", email: "pat.melo@email.com", childName: "Rafael Rezende", childBirthDate: "2019-01-05" }
];

const suppliersData = [
  { razaoSocial: "Malhas Nordeste Ltda", cnpjCpf: "11222333000181", setor: "Malhas e tricot", observacao: "Pagamento 30/60. Entrega em SP em 5 dias úteis." },
  { razaoSocial: "KidStyle Comércio de Vestuário ME", cnpjCpf: "22333444000172", setor: "Conjuntos infantis", observacao: "Pedido mínimo 20 peças." },
  { razaoSocial: "Tecidos Aurora S.A.", cnpjCpf: "33444555000163", setor: "Tecidos", observacao: "Mostruário digital por WhatsApp." },
  { razaoSocial: "Boutique Infantil Atacado BR", cnpjCpf: "44555666000154", setor: "Vestidos", observacao: "Representante regional Sul." },
  { razaoSocial: "Importadora Moda Kids EIRELI", cnpjCpf: "55666777000145", setor: "Importados", observacao: "NF-e complementar IPI conforme lei." },
  { razaoSocial: "Acessórios Fofurinha Ltda", cnpjCpf: "66777888000136", setor: "Acessórios", observacao: "Laços e tiaras; mix variado." },
  { razaoSocial: "Calçados Pezinho Certo ME", cnpjCpf: "77888999000127", setor: "Calçados", observacao: "Trocas em até 15 dias." },
  { razaoSocial: "Distribuidora Infantil Central", cnpjCpf: "88999000000118", setor: "Distribuição", observacao: "Caminhão próprio capital." },
  { razaoSocial: "Pijamas Soninho Comercial", cnpjCpf: "99000111000109", setor: "Pijamas", observacao: "Coleção inverno chega em março." },
  { razaoSocial: "Casa de Meias Arco-Íris Ltda", cnpjCpf: "10011222000190", setor: "Meias e collants", observacao: "Grade por idade 0–12." },
  { razaoSocial: "Bordados Encantado LTDA", cnpjCpf: "21022333000171", setor: "Personalização", observacao: "Prazo bordado 10 dias úteis." },
  { razaoSocial: "Plásticos Festa Kids ME", cnpjCpf: "32033444000162", setor: "Embalagens", observacao: "Sacos e fitas para presente." },
  { razaoSocial: "Higiene Baby Care Import", cnpjCpf: "43044555000153", setor: "Higiene", observacao: "Produtos dermatologicamente testados." },
  { razaoSocial: "Brinquedos Mundo Azul S.A.", cnpjCpf: "54055666000144", setor: "Brinquedos", observacao: "Somente B2B; não vende varejo." },
  { razaoSocial: "Etiquetas e Tags Maricota Parceiros", cnpjCpf: "65066777000135", setor: "Etiquetas", observacao: "Arte gratuita a partir de 500 un." }
];

async function removePreviousSeed(collection) {
  const snap = await db.collection(collection).where("seedDemo", "==", true).get();
  if (snap.empty) return 0;
  const batch = db.batch();
  snap.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
  return snap.size;
}

async function seedCollection(collection, rows, mapRow) {
  const t = now();
  let batch = db.batch();
  rows.forEach((row) => {
    const ref = db.collection(collection).doc();
    batch.set(ref, { ...mapRow(row), seedDemo: SEED_FLAG, createdAt: t, updatedAt: t });
  });
  await batch.commit();
}

async function main() {
  const deletedCustomers = await removePreviousSeed("customers");
  const deletedSuppliers = await removePreviousSeed("suppliers");
  if (deletedCustomers || deletedSuppliers) {
    console.log(`Removidos (seed anterior): ${deletedCustomers} clientes, ${deletedSuppliers} fornecedores.`);
  }

  await seedCollection("customers", customersData, (row) => ({
    name: row.name,
    phone: row.phone,
    email: row.email.toLowerCase(),
    childName: row.childName,
    childBirthDate: row.childBirthDate
  }));

  await seedCollection("suppliers", suppliersData, (row) => ({
    razaoSocial: row.razaoSocial,
    cnpjCpf: row.cnpjCpf.replace(/\D/g, ""),
    setor: row.setor,
    observacao: row.observacao
  }));

  console.log("Seed demo concluido: 15 clientes e 15 fornecedores criados.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
