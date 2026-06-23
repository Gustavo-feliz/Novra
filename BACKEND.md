# Backend NutriFlow

API local segura para o prototipo do NutriFlow.

## Rodando

1. Crie `.env` a partir de `.env.example`.
2. Troque `JWT_SECRET` por uma string longa e aleatoria.
3. Configure `OPENAI_API_KEY` para usar o Creator com GPT-4o.
4. Rode:

```bash
npm run api
npm run dev
```

A API sobe em `http://localhost:8787` e o Vite encaminha `/api/*` para ela.

## Rotas principais

- `POST /api/auth/login`
- `GET /api/me`
- `GET /api/dashboard`
- `GET|POST /api/patients`
- `GET|PATCH|DELETE /api/patients/:id`
- `GET|PUT /api/plans/:patientId`
- `GET|POST /api/appointments`
- `GET|POST /api/diaries`
- `GET|POST /api/questionnaires`
- `POST /api/generate-meal-plan`

## Seguranca aplicada

- API key da OpenAI fica somente no backend.
- Autenticacao por token assinado HMAC com expiracao.
- Senhas com PBKDF2 + salt.
- CORS por allowlist.
- Rate limit por IP e rota.
- Limite de tamanho de payload.
- Headers de seguranca basicos.
- Auditoria em `server/data/audit.log`.
- Dados locais em `server/data/db.json`, ignorados pelo git.

Este backend ainda e um backend de prototipo. Para producao, troque o JSON local por Postgres/Supabase, adicione migrations, backup, refresh tokens, RBAC mais granular, TLS no proxy e monitoramento.
