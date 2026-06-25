-- Tabelas que faltavam para o Portal do paciente ter dados 100% reais
-- (metas, instruções, solicitações de horário e respostas de questionário).

create table patient_goals (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  titulo text,
  detalhe text,
  categoria text,
  progresso int not null default 0,
  copos_meta int,
  copo_ml int,
  copos_atuais int,
  created_at timestamptz not null default now(),
  created_by uuid references profiles(id)
);

create table patient_instructions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  categoria text,
  titulo text,
  resumo text,
  enviado_em text,
  tempo_leitura text,
  created_at timestamptz not null default now(),
  created_by uuid references profiles(id)
);

create table appointment_requests (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  paciente text,
  servico text,
  data text,
  hora text,
  modo text,
  status text not null default 'solicitado' check (status in ('solicitado', 'confirmado', 'recusado')),
  created_at timestamptz not null default now()
);

create table questionnaire_responses (
  id uuid primary key default gen_random_uuid(),
  questionnaire_id uuid not null references questionnaires(id) on delete cascade,
  patient_id uuid not null references patients(id) on delete cascade,
  titulo text,
  categoria text,
  prazo text,
  perguntas jsonb not null default '[]',
  status text not null default 'pendente' check (status in ('rascunho', 'pendente', 'respondido')),
  respostas jsonb not null default '{}',
  created_at timestamptz not null default now(),
  created_by uuid references profiles(id)
);

create index on patient_goals (patient_id);
create index on patient_instructions (patient_id);
create index on appointment_requests (patient_id);
create index on questionnaire_responses (patient_id);

alter table patient_goals enable row level security;
alter table patient_instructions enable row level security;
alter table appointment_requests enable row level security;
alter table questionnaire_responses enable row level security;

create policy patient_goals_admin_all on patient_goals for all using (is_admin()) with check (is_admin());
create policy patient_goals_patient_select on patient_goals for select using (patient_id = my_patient_id());
create policy patient_goals_patient_update on patient_goals for update using (patient_id = my_patient_id()) with check (patient_id = my_patient_id());

create policy patient_instructions_admin_all on patient_instructions for all using (is_admin()) with check (is_admin());
create policy patient_instructions_patient_select on patient_instructions for select using (patient_id = my_patient_id());

create policy appointment_requests_admin_all on appointment_requests for all using (is_admin()) with check (is_admin());
create policy appointment_requests_patient_select on appointment_requests for select using (patient_id = my_patient_id());
create policy appointment_requests_patient_insert on appointment_requests for insert with check (patient_id = my_patient_id());

create policy questionnaire_responses_admin_all on questionnaire_responses for all using (is_admin()) with check (is_admin());
create policy questionnaire_responses_patient_select on questionnaire_responses for select using (patient_id = my_patient_id());
create policy questionnaire_responses_patient_update on questionnaire_responses for update using (patient_id = my_patient_id()) with check (patient_id = my_patient_id());

-- Paciente também precisa poder postar no próprio diário e marcar a própria
-- fatura como paga (0001_init.sql só dava SELECT).
create policy diaries_patient_insert on diaries for insert with check (patient_id = my_patient_id());
create policy finance_tx_patient_update on finance_tx for update using (patient_id = my_patient_id()) with check (patient_id = my_patient_id());
