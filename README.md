# Projexa — Fase 0 a 10 (roadmap original completo)

**Login de teste após rodar o seed:** `admin@projexa.com.br` / `projexa123`
**Segundo usuário (equipe):** `equipe@projexa.com.br` / `projexa123`

Esta entrega fecha o roadmap original (PROJEXA-ARQUITETURA.md, Fases 0 a 10).

Novidades desta entrega (Fase 10):
- **Dados de demonstração completos**: 3 clientes, 5 orçamentos (em todos os status: rascunho, enviado, aprovado, recusado), 3 projetos (planejamento, em andamento, concluído), 5 lançamentos financeiros (pagos, pendentes) e 2 usuários — tudo consistente e interligado
- **Teste guiado de ponta a ponta**, rodado com navegador automatizado, cobrindo: login → cadastro de cliente → criação e aprovação de orçamento → conversão em projeto → geração e assinatura eletrônica de contrato → geração e acesso ao portal do cliente → financeiro → relatórios → pendências → log de atividades. 18 de 18 verificações passaram.

## O que existe hoje no Projexa

- Autenticação com sessão em cookie
- Clientes: cadastro, edição, histórico, portal público por cliente
- Orçamentos/Propostas: itens detalhados, escopo, condições, aprovação eletrônica pelo cliente, geração de contrato
- Contratos: assinatura eletrônica com registro de nome, CPF, data e IP
- Projetos: kanban por status, progresso, documentos com controle de versão, arquivamento, duplicação
- Financeiro: receitas/despesas, status de atraso automático
- Relatórios exportáveis em CSV, busca global, log de atividades, central de pendências
- Numeração sequencial configurável por tipo de documento
- Identidade visual (logomarca) refletida em toda a aplicação e nos documentos gerados
- Responsivo, testado visualmente em viewport de celular

## O que ainda não existe (fora do roadmap original ou fica para depois)

- Cláusulas contratuais configuráveis e biblioteca de modelos de proposta
- Versionamento formal de propostas (histórico de alterações comerciais)
- Projetos recorrentes (cobrança e tarefas automáticas)
- Checklists por tipo de projeto
- Lixeira genérica (hoje só documentos têm exclusão suave por versão)
- Multiempresa com múltiplos registros de "companies" (hoje o sistema funciona com uma empresa por instalação)
- Notificações por e-mail/push (sem infraestrutura de envio configurada)


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
