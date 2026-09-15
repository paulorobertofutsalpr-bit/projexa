# Projexa — Fase 0 + Fase 1 + Fase 2 (enriquecida) + Fase 3

**Login de teste após rodar o seed:** `admin@projexa.com.br` / `projexa123`

Novidades desta entrega (Fase 3 — Projetos):
- Módulo de Projetos com quadro kanban por status (Planejamento, Em andamento, Em revisão, Aguardando cliente, Pausado, Concluído)
- Mudança de status direto no card, com barra de progresso
- Página de detalhe do projeto
- Botão "Converter em projeto" no orçamento aprovado — cria o projeto automaticamente a partir do orçamento (cliente, objeto, prazo), e mostra no projeto de qual orçamento ele se originou
- Conversão é idempotente: clicar de novo não duplica o projeto


Base do sistema Projexa: Next.js 16 (App Router) + TypeScript + Tailwind CSS + Drizzle ORM + PostgreSQL.

Este é o esqueleto da **Fase 0** do roadmap (ver `PROJEXA-ARQUITETURA.md`): projeto rodando, conectado ao banco, com uma tabela de empresas e usuários. As próximas fases (clientes, orçamentos, projetos, financeiro etc.) devem ser construídas em cima desta base, seguindo o roadmap.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **TypeScript**
- **Tailwind CSS v4**
- **Drizzle ORM** + `pg` (driver nativo do PostgreSQL, sem binários nativos — funciona em qualquer ambiente, inclusive com restrição de rede)
- **PostgreSQL**

> Nota: o documento de arquitetura original recomendava Prisma. Trocamos para Drizzle ORM porque ele não depende de binários nativos baixados de servidores externos no momento do build — o que o torna mais confiável em ambientes de CI/CD com rede restrita. Funcionalmente, cumpre o mesmo papel.

## Rodando localmente

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Copie `.env.example` para `.env` e preencha `DATABASE_URL` com um Postgres local ou remoto.
3. Rode as migrations:
   ```bash
   npm run db:migrate
   ```
4. (Opcional) Popule dados de exemplo:
   ```bash
   npm run db:seed
   ```
5. Suba o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
6. Acesse `http://localhost:3000` — a página mostra o status da conexão com o banco e as empresas cadastradas.

Health check disponível em `/api/health`.

## Alterando o schema do banco

Edite `db/schema.ts` e depois gere uma nova migration:

```bash
npm run db:generate
```

Isso cria um novo arquivo SQL em `db/migrations/`. Rode `npm run db:migrate` para aplicá-lo.

## Deploy no Render

Este projeto está pronto para o fluxo GitHub → Render:

1. Suba este código para o repositório GitHub já conectado ao seu Web Service no Render.
2. Configurações do Web Service:
   - **Build Command:** `npm install && npm run db:migrate && npm run build`
   - **Start Command:** `npm start`
3. Variáveis de ambiente (aba Environment do Web Service):
   - `DATABASE_URL` → a Internal Database URL do seu Postgres no Render
4. Cada `git push` na branch `main` dispara um novo deploy automático, que já roda as migrations pendentes antes do build.

> No plano free do Render, o serviço "dorme" após 15 minutos sem acesso — a primeira requisição depois disso demora ~30-60s (cold start). Isso é esperado, não é erro.

## Próximos passos

Continue pelo roadmap em `PROJEXA-ARQUITETURA.md`, Fase 1 em diante (Clientes, Orçamentos/Propostas, Projetos, Financeiro, Documentos, Portal do Cliente).
