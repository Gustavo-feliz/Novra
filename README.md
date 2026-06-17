# NutriFlow

SaaS de gestão para nutricionistas — plano alimentar, avaliações antropométricas, cálculo energético, anamnese, consultas virtuais, diário alimentar, agenda, metas, link de agendamento, WhatsApp automático e IA de prescrição. Tema claro/escuro nativo e identidade visual autoral (paleta sálvia / petróleo / terracota sobre neutros quentes).

Protótipo de produto em **React + TypeScript + Vite + Tailwind**, com design system centralizado, command palette (⌘K), animações (Framer Motion), gráficos (Recharts) e dados mockados realistas em pt-BR.

## Stack

- **React 18** + **TypeScript** (strict) · **Vite 5**
- **Tailwind CSS 3** com tokens via CSS variables (canais RGB → tema claro/escuro)
- **React Router 6** · **Recharts** · **Framer Motion** · **lucide-react**
- Pensado para backend **Supabase** e IA via **Claude API** (camada de dados isolada em `lib/`)

## Rodando

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc --noEmit + vite build
npm run preview  # serve o build
```

## Arquitetura de navegação

A navegação espelha fielmente a estrutura de um produto de gestão para nutricionistas, em dois níveis.

**Sidebar principal (nível clínica)** — `components/Shell.tsx`

| Principal | Ferramentas |
|---|---|
| Dashboard · Pacientes · Diários · Questionários · Financeiro · Meus favoritos · Videochamada · Lâminas | Agenda · Link de agendamento · NutriFlow Creator · WhatsApp |

**Sidebar secundária (dentro do paciente)** — `pages/PatientProfile.tsx` substitui a navegação principal por 18 seções: Perfil · Antropometria · Cálculo energético · Plano alimentar · Acompanhamento gestacional · Manipulado · Exame · Anamnese · Questionário · Diário alimentar · Instrução nutricional · Prontuário · Financeiro e recibo · Metas · Atestado · Questionários de saúde · Pasta do paciente.

No mobile, a sidebar principal vira **bottom nav** com ícones + um sheet "Mais"; a sidebar do paciente vira um bottom sheet de seções.

## Telas (27)

```
Nível clínica          Dashboard, Pacientes, Diários, Questionários, Financeiro,
                       Meus favoritos, Videochamada (lobby + sala), Lâminas
Ferramentas            Agenda, Link de agendamento (config + preview público),
                       NutriFlow Creator (IA), WhatsApp automático
Dentro do paciente     Perfil, Antropometria, Cálculo energético, Plano alimentar,
                       Acompanhamento gestacional, Manipulado, Exame, Anamnese,
                       Questionário, Diário alimentar, Instrução nutricional,
                       Prontuário, Financeiro e recibo, Metas, Atestado,
                       Questionários de saúde, Pasta do paciente
```

## Estrutura

```
src/
  index.css            Design system: tokens (CSS vars) + camada de componentes (.btn, .card, .chip…)
  main.tsx             Bootstrap (ThemeProvider > ToastProvider > Router > App)
  App.tsx              Rotas + Command Palette global
  lib/
    theme.tsx          ThemeProvider / useTheme (claro/escuro, persistido)
    utils.ts           cx, brl, num, uid, pct, initials
    types.ts           Patient, Appointment, DiaryPost, QuestionnaireTemplate, FinanceTx, SlideTemplate, WhatsAutomation
    mock.ts            Dados de demonstração (pacientes, agenda, diários, financeiro, questionários, lâminas, booking, IA, WhatsApp)
  components/
    Shell.tsx          Layout do app (sidebar Principal + Ferramentas, topbar, bottom nav + sheet "Mais")
    CommandPalette.tsx  Busca global (⌘K) — todas as telas, pacientes e ações
    ThemeToggle.tsx
    ui/                Button, Card, Chip, Input, Modal, Segmented, Toggle, Skeleton, Stat/Delta, Avatar, Toast
  pages/
    Dashboard.tsx        Indicadores, próximos atendimentos, aniversariantes, tarefas
    Patients.tsx         Busca, filtro de status, Lista/Kanban, cadastro rápido
    Diaries.tsx          Visão geral dos diários de todos os pacientes (reagir/comentar)
    Questionnaires.tsx   Banco de questionários reutilizáveis + construtor
    Financial.tsx        Visão do consultório: receita, formas de pagamento, lançamentos
    Favorites.tsx        Alimentos, planos, instruções e questionários favoritados
    Slides.tsx           Lâminas — galeria de modelos visuais + modo apresentação
    VideoCall.tsx        Lobby de videochamada (teste de dispositivos + salas)
    Consultation.tsx     Sala de teleconsulta (vídeo + anotações → prontuário)
    Agenda.tsx           Agenda Dia / Semana / Mês
    BookingLink.tsx      Link de agendamento: configuração + preview da página pública
    Creator.tsx          NutriFlow Creator — IA que monta refeições e define macros
    WhatsApp.tsx         Automações (aniversário, confirmação, lembrete) + preview
    PatientProfile.tsx   Perfil do paciente com as 18 seções (módulo central autocontido)
    Login.tsx / Onboarding.tsx / Settings.tsx
```

## Sistema de tokens (tema claro/escuro)

A fonte da verdade são variáveis CSS em `src/index.css`, definidas como **canais RGB**:

```css
:root               { --c-sage: 78 110 87;   --c-surface: 251 251 248; /* … */ }
[data-theme="dark"] { --c-sage: 134 169 140; --c-surface: 23 28 24;    /* … */ }
```

Expostas ao Tailwind em `tailwind.config.ts` com suporte a opacidade (`rgb(var(--c-sage) / <alpha-value>)`). Classes utilitárias e do design system trocam de tema automaticamente quando `data-theme` muda no `<html>`. O `ThemeProvider` cuida disso e persiste a escolha no `localStorage`.

## Como estender

- **Nova tela:** crie em `pages/`, adicione a rota em `App.tsx` (dentro de `<Shell>` para telas do app; fora para full-screen como perfil/consulta) e registre na sidebar (`Shell.tsx`) e no Command Palette.
- **Dados reais:** `lib/mock.ts` isola os dados — a intenção é trocar por Supabase mantendo os tipos de `lib/types.ts`. O NutriFlow Creator e a extração de exames são os pontos de integração com a Claude API.
- **Novo componente do DS:** crie em `components/ui/` e exporte no `index.ts`, reaproveitando as variáveis (`var(--surface)`, `var(--sage)`…).

## Observações

- O **perfil do paciente** é um módulo autocontido (estilo próprio escopado em `.nf`) com as 18 seções funcionais; as demais telas consomem o design system de `index.css`.
- Protótipo de front-end: dados são mockados e ações (enviar, assinar, cobrar, gerar com IA) disparam toasts/estados simulados em vez de efeitos reais.
```
