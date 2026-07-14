-- Convite de paciente com vínculo automático à clínica.
--
-- Fluxo:
--   1. Nutricionista cria um convite (patient_invites) e envia o link
--      /convite?token=<uuid> ao paciente.
--   2. Paciente abre o link, vê o nome da clínica, preenche e envia o formulário.
--   3. signUpPatient() passa invited_by no metadata → trigger seta created_by.
--   4. Se confirmação de e-mail estiver ativa, use_invite() é chamado após login.

-- ── patient_invites ────────────────────────────────────────────────────────────
create table patient_invites (
  id            uuid primary key default gen_random_uuid(),
  token         uuid not null unique default gen_random_uuid(),
  invited_by    uuid not null references auth.users(id) on delete cascade,
  patient_email text,
  patient_name  text,
  used_at       timestamptz,
  expires_at    timestamptz not null default (now() + interval '7 days'),
  created_at    timestamptz not null default now()
);

alter table patient_invites enable row level security;

-- Nutricionista gerencia apenas seus próprios convites
create policy invites_own on patient_invites
  for all
  using     (invited_by = auth.uid())
  with check (invited_by = auth.uid());

-- ── get_invite_info ────────────────────────────────────────────────────────────
-- Lê dados de um convite pelo token SEM autenticação (security definer).
-- Retorna null (sem linhas) quando o token não existe.
create or replace function get_invite_info(p_token uuid)
returns jsonb
language sql security definer stable as $$
  select jsonb_build_object(
    'id',            i.id,
    'invited_by',    i.invited_by,
    'patient_name',  i.patient_name,
    'patient_email', i.patient_email,
    'expires_at',    i.expires_at,
    'used_at',       i.used_at,
    'clinic_name',   coalesce(
      (select pr.name from profiles pr where pr.id = i.invited_by limit 1),
      'Nutricionista'
    )
  )
  from patient_invites i
  where i.token = p_token
  limit 1;
$$;

-- ── use_invite ─────────────────────────────────────────────────────────────────
-- Vincula o paciente autenticado à clínica do convite.
-- Chamado como fallback quando confirmação de e-mail está ativa (o trigger
-- não consegue marcar o convite porque a sessão ainda não existe).
-- Idempotente: se already vinculado à mesma clínica, retorna ok=true.
create or replace function use_invite(p_token uuid)
returns jsonb
language plpgsql security definer as $$
declare
  v_invite     patient_invites%rowtype;
  v_patient_id uuid;
begin
  select * into v_invite
  from patient_invites
  where token = p_token
    and used_at is null
    and expires_at > now()
  for update skip locked;

  if not found then
    -- Verifica se é convite já usado (idempotência)
    if exists (select 1 from patient_invites where token = p_token and used_at is not null) then
      return jsonb_build_object('ok', true, 'already_used', true);
    end if;
    return jsonb_build_object('ok', false, 'error', 'invite_invalid_or_expired');
  end if;

  select patient_id into v_patient_id from profiles where id = auth.uid();

  if v_patient_id is null then
    return jsonb_build_object('ok', false, 'error', 'patient_profile_not_found');
  end if;

  update patients
  set created_by = v_invite.invited_by
  where id = v_patient_id
    and (created_by is null or created_by = v_invite.invited_by);

  update patient_invites set used_at = now() where id = v_invite.id;

  return jsonb_build_object('ok', true);
end;
$$;

-- ── Trigger: handle_new_user atualizado ───────────────────────────────────────
-- Adiciona leitura de invited_by no metadata do paciente.
-- Com invited_by: created_by é setado e o convite é marcado como usado.
-- Sem invited_by: comportamento original (created_by = null).
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_patient_id uuid;
  v_invited_by   uuid;
begin
  if new.raw_user_meta_data->>'role' = 'patient' then
    -- Extrai invited_by do metadata (null se não veio via convite)
    v_invited_by := nullif(trim(new.raw_user_meta_data->>'invited_by'), '')::uuid;

    insert into public.patients (nome, email, telefone, data_nascimento, sexo, status, created_by)
    values (
      coalesce(nullif(trim(new.raw_user_meta_data->>'name'), ''), split_part(new.email, '@', 1)),
      new.email,
      nullif(trim(coalesce(new.raw_user_meta_data->>'telefone', '')), ''),
      nullif(trim(coalesce(new.raw_user_meta_data->>'data_nascimento', '')), ''),
      nullif(trim(coalesce(new.raw_user_meta_data->>'sexo', '')), ''),
      'ativo',
      v_invited_by
    )
    returning id into new_patient_id;

    insert into public.profiles (id, name, email, role, patient_id)
    values (
      new.id,
      coalesce(nullif(trim(new.raw_user_meta_data->>'name'), ''), split_part(new.email, '@', 1)),
      new.email,
      'patient',
      new_patient_id
    )
    on conflict (id) do nothing;

    -- Marca o convite como usado quando invited_by está presente
    if v_invited_by is not null then
      update public.patient_invites
      set used_at = now()
      where invited_by = v_invited_by
        and used_at is null
        and expires_at > now()
        and (patient_email is null or lower(patient_email) = lower(new.email))
      ;
    end if;

  else
    if not exists (select 1 from allowed_admins where lower(email) = lower(new.email)) then
      raise exception 'E-mail não autorizado a criar conta de administrador.';
    end if;

    insert into public.profiles (id, name, email, role)
    values (
      new.id,
      coalesce(nullif(trim(new.raw_user_meta_data->>'name'), ''), split_part(new.email, '@', 1)),
      new.email,
      'admin'
    )
    on conflict (id) do nothing;
  end if;

  return new;
end;
$$;
