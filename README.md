# CulturasCheck

Monitoramento de datas de checagem de culturas microbiológicas e PCR de tuberculose (lavado gástrico, escarro, etc.) para a enfermaria de transplantados.

## Stack

- Vite + React + TypeScript
- Tailwind CSS (estilo "Apple 2026")
- Supabase (Postgres + Auth + RLS)

## Setup

1. Crie um projeto no [Supabase](https://supabase.com) (isolado, dedicado a este app).
2. No SQL Editor do Supabase, execute o conteúdo de [`supabase/schema.sql`](supabase/schema.sql).
3. Em **Authentication > Providers**, mantenha apenas e-mail/senha habilitado. Recomendado:
   restringir o domínio de e-mails aceitos ou desabilitar signup público e convidar cada médico
   manualmente (**Authentication > Users > Invite**), para evitar acesso indevido a dados de pacientes.
4. Copie `.env.example` para `.env` e preencha com a URL e a `anon key` do projeto:
   ```bash
   cp .env.example .env
   ```
5. Instale as dependências e rode localmente:
   ```bash
   npm install
   npm run dev
   ```

## Como funciona

- Cada exame (hemocultura, urocultura, PCR TB, cultura de BK, etc.) tem um prazo padrão de
  checagem (`exam_types.default_turnaround_days`), usado para calcular a data prevista de
  checagem a partir da data de coleta.
- A data prevista pode ser editada manualmente a qualquer momento (ex.: laboratório atrasou),
  ficando marcada como "ajustada".
- O dashboard agrupa as culturas por status: **Atrasado**, **Checar hoje**, **Resultado parcial**,
  **Em andamento**, **Aguardando coleta**, **Concluído** — sempre com os mais urgentes no topo.
- Resultado parcial, resultado final e conduta (sem conduta / aguarda conduta / antibiótico) ficam
  registrados por cultura, com histórico de alterações em `cultures_audit_log`.
- Todos os médicos autenticados têm as mesmas permissões: inserir paciente, inserir cultura,
  editar datas e registrar resultados/conduta.

## Segurança e LGPD

- RLS habilitado em todas as tabelas — nenhum dado é acessível sem autenticação.
- Nunca exponha a `service_role key` no frontend; use apenas a `anon key`.
- Trilha de auditoria (`cultures_audit_log`) registra quem alterou o quê e quando.
- Recomenda-se revisar periodicamente a lista de usuários com acesso (`Authentication > Users`)
  e remover contas de profissionais que deixaram a equipe.

## Logo

O ícone em `public/logo.svg` é um placeholder gerado localmente. Substitua pelo arquivo de logo
oficial (PNG/SVG fornecido pela equipe) mantendo o nome `public/logo.svg` — ou ajuste as
referências em `index.html`, `public/manifest.webmanifest` e `src/components/Login.tsx` se usar
outro nome/formato.

## Deploy

Build de produção:
```bash
npm run build
```
O diretório `dist/` gerado pode ser publicado em qualquer host estático (Railway, Vercel, Oracle, etc.),
desde que as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` sejam configuradas no ambiente de build.
