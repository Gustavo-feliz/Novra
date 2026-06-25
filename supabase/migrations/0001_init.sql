create extension if not exists pgcrypto;

create table patients (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  idade int,
  sexo text,
  objetivo text,
  status text,
  tags text[] default '{}',
  ultima_consulta text,
  proxima_acao text,
  adesao int,
  gestante boolean default false,
  cor text[2],
  email text,
  telefone text,
  cpf_cnpj text,
  data_nascimento text,
  observacao text,
  created_at timestamptz not null default now(),
  created_by uuid
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  role text not null check (role in ('admin', 'patient')),
  patient_id uuid references patients(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table patients add constraint patients_created_by_fkey foreign key (created_by) references profiles(id);

create table plans (
  patient_id uuid primary key references patients(id) on delete cascade,
  titulo text,
  periodo text,
  kcal int,
  agua_ml int,
  proteina_g int,
  refeicoes jsonb default '[]',
  substituicoes jsonb default '[]',
  updated_at timestamptz not null default now(),
  updated_by uuid references profiles(id)
);

create table appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete set null,
  paciente text,
  hora text,
  dur int,
  tipo text,
  modo text,
  dia int,
  created_at timestamptz not null default now(),
  created_by uuid references profiles(id)
);

create table diaries (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete cascade,
  paciente text,
  refeicao text,
  quando text,
  descricao text,
  cor text[2],
  reacoes int default 0,
  comentarios int default 0,
  curtido boolean default false,
  revisado boolean default false,
  mensagens jsonb default '[]',
  created_at timestamptz not null default now(),
  created_by uuid references profiles(id)
);

create table questionnaires (
  id uuid primary key default gen_random_uuid(),
  nome text,
  categoria text,
  perguntas int,
  respostas int,
  atualizado text,
  cor text,
  created_at timestamptz not null default now(),
  created_by uuid references profiles(id)
);

create table finance_tx (
  id uuid primary key default gen_random_uuid(),
  data date,
  patient_id uuid references patients(id) on delete set null,
  paciente text,
  descricao text,
  valor numeric,
  forma text,
  status text,
  created_at timestamptz not null default now(),
  created_by uuid references profiles(id)
);

create index on appointments (patient_id);
create index on diaries (patient_id);
create index on finance_tx (patient_id);

create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function my_patient_id()
returns uuid
language sql
security definer
stable
as $$
  select patient_id from profiles where id = auth.uid();
$$;

alter table profiles enable row level security;
alter table patients enable row level security;
alter table plans enable row level security;
alter table appointments enable row level security;
alter table diaries enable row level security;
alter table questionnaires enable row level security;
alter table finance_tx enable row level security;

create policy profiles_self_select on profiles for select using (id = auth.uid() or is_admin());
create policy profiles_self_update on profiles for update using (id = auth.uid());

create policy patients_admin_all on patients for all using (is_admin()) with check (is_admin());
create policy patients_patient_select on patients for select using (id = my_patient_id());

create policy plans_admin_all on plans for all using (is_admin()) with check (is_admin());
create policy plans_patient_select on plans for select using (patient_id = my_patient_id());

create policy appointments_admin_all on appointments for all using (is_admin()) with check (is_admin());
create policy appointments_patient_select on appointments for select using (patient_id = my_patient_id());

create policy diaries_admin_all on diaries for all using (is_admin()) with check (is_admin());
create policy diaries_patient_select on diaries for select using (patient_id = my_patient_id());

create policy questionnaires_admin_all on questionnaires for all using (is_admin()) with check (is_admin());

create policy finance_tx_admin_all on finance_tx for all using (is_admin()) with check (is_admin());
create policy finance_tx_patient_select on finance_tx for select using (patient_id = my_patient_id());
