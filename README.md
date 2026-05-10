# Maricota Kids

Sistema web para controle de estoque, vendas e financeiro de uma loja de roupa infantil.

## Arquitetura

- `frontend`: React.js com Vite, Tailwind CSS, rotas protegidas e telas administrativas.
- `backend`: Node.js com Express, JWT e Firebase Firestore.
- `backend/src/routes`: definicao das rotas HTTP.
- `backend/src/controllers`: entrada das requisicoes e respostas.
- `backend/src/services`: regras de negocio, como calculo de preco, baixa de estoque, troco e resumo financeiro.
- `backend/src/database`: conexao com Firebase Admin.
- Collections no Firestore: `users`, `products`, `sales`, `customers`, `settings` (documento `app`), `stock_movements` (historico de ajustes manuais).

**Vendas:** campo `status` (`COMPLETED` | `CANCELLED`), `customerId` / snapshot do cliente opcional, `returns[]` para devolucoes parciais. **Configuracoes:** `GET/PUT /api/settings` (nome da loja, limite de estoque baixo, regras de preco minimo na venda).

## Como rodar localmente

### 1. Backend

```bash
cd backend
npm install
copy .env.example .env
npm run seed
npm run dev
```

Configure as variaveis `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` e `FIREBASE_PRIVATE_KEY` no arquivo `.env` usando uma chave de conta de servico do Firebase.

Login inicial criado pelo seed:

- E-mail: `admin@maricotakids.com`
- Senha: `admin123`

### 2. Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

O frontend abre em `http://localhost:5173` e a API roda em `http://localhost:3333/api`.

## Hospedagem sugerida

- Frontend: Vercel.
- Backend: Render ou Railway.
- Banco de dados: Firebase Firestore.

## Modulos incluidos

- Cadastro de usuarios por administrador (`GET/POST/DELETE /api/users`): perfil Equipe ou Administrador; compartilhe o mesmo link do painel e o login criado.
- Configuracoes persistidas (`/api/settings`): nome da loja, limite de estoque baixo no dashboard, regra de preco minimo na venda (custo e desconto maximo abaixo da tabela).
- Dashboard com cards de estoque (usa o limite configurado), vendas, receita e lucro estimado (considera vendas canceladas e devolucoes parciais).
- Cadastro, edicao, listagem, busca e filtros de produtos.
- Registro de venda com cliente opcional, baixa de estoque e validacao de preco unitario.
- Cancelamento de venda (`POST /api/sales/:id/cancel`), devolucao parcial com motivo (`POST /api/sales/:id/returns`), ajuste manual de estoque com motivo (`POST /api/products/:id/stock-adjustment`).
- Validacao de estoque insuficiente no backend.
- Calculo de desconto, troco e valor de parcelas.
- Historico de vendas.
- Relatorio financeiro com produtos mais vendidos e formas de pagamento.
- Configuracoes basicas.
