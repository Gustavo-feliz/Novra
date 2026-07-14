-- Multi-tenant: cada nutricionista vê e gerencia APENAS seus próprios pacientes.
--
-- Problema anterior: is_admin() = qualquer admin vê TUDO no banco.
-- Correção: politicas "own" usam created_by = auth.uid() ou is_my_patient().
--
-- AVISO: aplique este arquivo no SQL Editor do Supabase antes de adicionar
-- um segundo admin (allowed_admins). Com só um admin no sistema, o
-- comportamento visual não muda — a isolação só ativa ao segundo admin.

-- ── Helper ────────────────────────────────────────────────────────────────────
-- Retorna true quando o paciente de id=pid foi criado por este admin.
-- security definer: lê patients ignorando RLS, sem recursão.
create or replace function is_my_patient(pid uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from patients
    where id = pid and created_by = auth.uid()
  );
$$;

-- ── profiles ──────────────────────────────────────────────────────────────────
-- Antes: qualquer admin via o profile de qualquer outro usuário.
-- Agora:  cada um vê só o próprio + os profiles dos seus pacientes.
drop policy if exists profiles_self_select on profiles;
create policy profiles_self_select on profiles
  for select using (
    id = auth.uid()
    or (patient_id is not null and is_my_patient(patient_id))
  );

-- ── patients ──────────────────────────────────────────────────────────────────
drop policy if exists patients_admin_all on patients;
create policy patients_own on patients
  for all
  using     (created_by = auth.uid())
  with check (created_by = auth.uid());

-- ── plans ─────────────────────────────────────────────────────────────────────
-- plans não tem created_by próprio; a propriedade vem do paciente.
drop policy if exists plans_admin_all on plans;
create policy plans_own on plans
  for all
  using     (is_my_patient(patient_id))
  with check (is_my_patient(patient_id));

-- ── appointments ──────────────────────────────────────────────────────────────
-- patient_id pode ser NULL (on delete set null) — fallback para created_by.
drop policy if exists appointments_admin_all on appointments;
create policy appointments_own on appointments
  for all
  using (
    (patient_id is not null and is_my_patient(patient_id))
    or (patient_id is null  and created_by = auth.uid())
  )
  with check (
    (patient_id is not null and is_my_patient(patient_id))
    or (patient_id is null  and created_by = auth.uid())
  );

-- ── diaries ───────────────────────────────────────────────────────────────────
drop policy if exists diaries_admin_all on diaries;
create policy diaries_own on diaries
  for all
  using     (is_my_patient(patient_id))
  with check (is_my_patient(patient_id));

-- Política de INSERT do paciente (0002) continua existindo e funciona em OR.

-- ── questionnaires ────────────────────────────────────────────────────────────
-- Templates: sem patient_id, usa created_by diretamente.
drop policy if exists questionnaires_admin_all on questionnaires;
create policy questionnaires_own on questionnaires
  for all
  using     (created_by = auth.uid())
  with check (created_by = auth.uid());

-- ── finance_tx ────────────────────────────────────────────────────────────────
drop policy if exists finance_tx_admin_all on finance_tx;
create policy finance_tx_own on finance_tx
  for all
  using (
    (patient_id is not null and is_my_patient(patient_id))
    or (patient_id is null  and created_by = auth.uid())
  )
  with check (
    (patient_id is not null and is_my_patient(patient_id))
    or (patient_id is null  and created_by = auth.uid())
  );

-- ── patient_goals (0002) ──────────────────────────────────────────────────────
drop policy if exists patient_goals_admin_all on patient_goals;
create policy patient_goals_own on patient_goals
  for all
  using     (is_my_patient(patient_id))
  with check (is_my_patient(patient_id));

-- ── patient_instructions (0002) ───────────────────────────────────────────────
drop policy if exists patient_instructions_admin_all on patient_instructions;
create policy patient_instructions_own on patient_instructions
  for all
  using     (is_my_patient(patient_id))
  with check (is_my_patient(patient_id));

-- ── appointment_requests (0002) ───────────────────────────────────────────────
drop policy if exists appointment_requests_admin_all on appointment_requests;
create policy appointment_requests_own on appointment_requests
  for all
  using     (is_my_patient(patient_id))
  with check (is_my_patient(patient_id));

-- ── questionnaire_responses (0002) ───────────────────────────────────────────
drop policy if exists questionnaire_responses_admin_all on questionnaire_responses;
create policy questionnaire_responses_own on questionnaire_responses
  for all
  using     (is_my_patient(patient_id))
  with check (is_my_patient(patient_id));

-- ── allowed_admins ────────────────────────────────────────────────────────────
-- Mantém is_admin(): a lista de e-mails autorizados é global (qualquer admin
-- pode adicionar outros). Não muda com multi-tenancy — é controle de signup.

-- ── NOTA: auto-cadastro de pacientes ─────────────────────────────────────────
-- O trigger handle_new_user (0005) cria patients sem created_by quando o
-- paciente se auto-cadastra (sem link de convite). Isso é intencional agora:
-- o admin "reivindica" o paciente executando UPDATE patients SET created_by = auth.uid()
-- WHERE email = 'paciente@email.com', ou via UI futura de "aceitar paciente".
-- Para links de convite com clinic_id embutido, atualizar o trigger para ler
-- new.raw_user_meta_data->>'invited_by' e usar como created_by.
