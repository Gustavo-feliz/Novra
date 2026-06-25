# Backend NutriFlow

O NutriFlow usa Supabase (Postgres + Auth + RLS) como fonte unica de dados. O
backend Node local (`server/index.mjs`) so existe para esconder a chave da
OpenAI: ele expoe uma unica rota, `POST /api/generate-meal-plan`, usada pelo
Creator.

## Rodando

1. Crie `.env` a partir de `.env.example`.
2. Configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (usados pelo
   frontend) e `SUPABASE_SERVICE_ROLE_KEY` (usado só pelo backend, nunca
   exposto ao cliente).
3. Configure `OPENAI_API_KEY` para usar o Creator com GPT-4o.
4. Rode:

```bash
npm run api
npm run dev
```

A API sobe em `http://localhost:8787` e o Vite encaminha `/api/*` para ela.

## Dados e autenticacao

- Todo o CRUD (pacientes, agenda, financeiro, diarios, questionarios, planos
  alimentares) acontece direto do frontend via `supabase.from(...)`
  ([src/lib/db.ts](src/lib/db.ts)), sem passar pelo backend Node.
- Login/sessao usam Supabase Auth ([src/lib/auth.ts](src/lib/auth.ts)).
- Row Level Security garante que pacientes só vejam seus próprios dados;
  admin tem acesso total. Policies em `supabase/migrations/0001_init.sql`.

## Rota do backend Node

- `POST /api/generate-meal-plan` — recebe o `access_token` do Supabase no
  header `Authorization: Bearer <token>`, valida com
  `supabase.auth.getUser(token)` (usando a service role key) e só então chama
  a API da OpenAI.

## Seguranca aplicada

- API key da OpenAI fica somente no backend.
- Autenticacao da unica rota via token de sessao do Supabase (validado
  server-side com a service role key).
- CORS por allowlist.
- Rate limit por IP e rota.
- Limite de tamanho de payload.
- Headers de seguranca basicos.
