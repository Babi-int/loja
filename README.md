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

### Inicio rapido (recomendado)

Na **raiz do repositorio**, apos configurar o `backend/.env` (Firebase) e rodar o seed uma vez:

```bash
npm install
npm run install:all
npm run dev
```

Isso sobe **API e frontend** ao mesmo tempo. O dashboard e demais telas precisam da API em `http://localhost:3333/api`. Para subir so o Vite: `npm run dev:web-only`.

### 1. Backend (se preferir terminais separados)

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

O frontend abre em `http://localhost:5173` e a API roda em `http://localhost:3333/api`. O comando `npm run dev` do frontend usa `--host` para o painel tambem ser acessivel pelo IP da maquina na rede local.

### Outro computador na mesma rede (Wi-Fi / LAN)

1. Descubra o **IP** do PC que roda backend e frontend (ex.: `ipconfig` no Windows → IPv4, algo como `192.168.0.15`).
2. No **backend** `.env`, defina `FRONTEND_URL` com **todas** as origens que o navegador pode usar, **separadas por virgula** (CORS), por exemplo:
   - `FRONTEND_URL=http://localhost:5173,http://192.168.0.15:5173`
3. No **frontend** `.env` da maquina que roda o `npm run dev`, aponte a API pelo **IP visivel na rede** (assim o JavaScript em qualquer PC usa a URL certa):
   - `VITE_API_URL=http://192.168.0.15:3333/api`
   Voce ainda pode abrir o painel em `http://localhost:5173` neste PC; chamadas a API seguem para esse IP e funcionam na propria maquina.
4. **Firewall do Windows**: permita entrada nas portas **3333** (API) e **5173** (Vite), ou a porta que o Vite mostrar no terminal.
5. Na outra maquina, abra `http://192.168.0.15:5173` (troque pelo seu IP). Crie usuarios em **Configuracoes** e compartilhe e-mail e senha.

**Link pronto:** com `npm run dev` rodando neste PC, na raiz execute `npm run share` — o script lista seu IPv4 na LAN, o URL do painel para colar na outra maquina e texto pronto para `FRONTEND_URL` / `VITE_API_URL`. Se o Vite nao estiver na 5173, no PowerShell use `$env:SHARE_PANEL_PORT="5174"; npm run share` (troque pela porta que o terminal do Vite mostrar).

Isso serve para **notebook** pelo **navegador** (Chrome, Edge, etc.). Nao e APK de Android; para celular como app instalavel seria outro projeto (ex.: Capacitor / PWA).

A API ja escuta em `0.0.0.0` por padrao (`HOST` no `.env` do backend; use `127.0.0.1` apenas se quiser bloquear acesso pela rede).

### Site na Vercel (frontend) + API na internet

1. **Hospede o backend** em algum servico com HTTPS (Render, Railway, Fly.io, etc.) e obtenha a URL publica da API (ex.: `https://maricota-api.onrender.com`).
2. Na **Vercel** → projeto → **Settings** → **Environment Variables**, escolha **uma** estrategia:
   - **Proxy (recomendado para menos dor com CORS):** `VERCEL_BACKEND_URL` = `https://SUA-API-DOMINIO.com` (sem `/api`). Ative para **Production** e **Preview** e garanta que a variavel esteja disponivel para **Edge Middleware**. Faca um novo deploy. O frontend em producao pode usar caminho relativo `/api` (sem definir `VITE_API_URL` no build).
   - **Chamadas diretas do navegador:** `VITE_API_URL` = `https://SUA-API-DOMINIO.com/api` (obrigatorio terminar em `/api`). Refaca o deploy para o valor entrar no bundle (`VITE_*` e fixo no build).
3. No `.env` (ou painel) do **backend**: `FRONTEND_URL=https://seu-projeto.vercel.app` (sem `/` no final). Se precisar de mais de uma origem, separe por virgula.
4. Firebase e demais variaveis do backend devem estar configurados no host da API.

Na raiz do repositorio existem `vercel.json` (build em `frontend/` e SPA fallback) e `middleware.js` (proxy `/api` quando `VERCEL_BACKEND_URL` esta definido). Ao conectar o Git na Vercel, use **Root Directory** na raiz do repo (onde esta o `vercel.json`), nao so a pasta `frontend`.

Se nem `VITE_API_URL` no build nem `VERCEL_BACKEND_URL` na Vercel estiverem corretos, o login no site publico falha.

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
