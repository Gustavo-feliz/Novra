-- ── slides ────────────────────────────────────────────────────────────────────
create table slides (
  id         uuid primary key default gen_random_uuid(),
  titulo     text not null,
  categoria  text not null,
  cor        text[] not null default '{}',
  laminas    jsonb not null default '[]',
  created_by uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table slides enable row level security;
create policy slides_own on slides for all
  using (created_by = auth.uid()) with check (created_by = auth.uid());

-- ── whats_automations ─────────────────────────────────────────────────────────
create table whats_automations (
  id         uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete cascade,
  nome       text not null,
  icon       text not null default 'bell',
  gatilho    text not null,
  quando     text not null,
  template   text not null,
  ativo      boolean not null default true,
  enviadas   integer not null default 0,
  created_at timestamptz not null default now()
);
alter table whats_automations enable row level security;
create policy whats_own on whats_automations for all
  using (created_by = auth.uid()) with check (created_by = auth.uid());

-- ── booking_config ────────────────────────────────────────────────────────────
-- Uma linha por nutricionista (unique created_by).
create table booking_config (
  id           uuid primary key default gen_random_uuid(),
  created_by   uuid not null unique references auth.users(id) on delete cascade,
  slug         text not null unique,
  ativo        boolean not null default true,
  confirm_auto boolean not null default true,
  servicos     jsonb not null default '[]',
  horarios     text[] not null default '{}',
  updated_at   timestamptz not null default now()
);
alter table booking_config enable row level security;
create policy booking_own on booking_config for all
  using (created_by = auth.uid()) with check (created_by = auth.uid());

-- ── get_booking_public ────────────────────────────────────────────────────────
-- Leitura pública do link de agendamento (paciente sem login).
create or replace function get_booking_public(p_slug text)
returns jsonb language sql security definer stable as $$
  select jsonb_build_object(
    'slug',         b.slug,
    'ativo',        b.ativo,
    'servicos',     b.servicos,
    'horarios',     b.horarios
  )
  from booking_config b
  where lower(b.slug) = lower(p_slug)
  limit 1;
$$;

-- ── request_appointment ───────────────────────────────────────────────────────
-- Cria consulta na agenda do nutricionista via link público (sem autenticação).
create or replace function request_appointment(
  p_slug  text,
  p_nome  text,
  p_hora  text,
  p_tipo  text,
  p_modo  text,
  p_dur   integer,
  p_dia   integer
) returns jsonb language plpgsql security definer as $$
declare
  v_clinic_id uuid;
begin
  select created_by into v_clinic_id
  from booking_config
  where lower(slug) = lower(p_slug) and ativo = true;

  if v_clinic_id is null then
    return jsonb_build_object('ok', false, 'error', 'clinic_not_found_or_inactive');
  end if;

  insert into appointments (paciente, hora, dur, tipo, modo, dia, created_by)
  values (p_nome, p_hora, p_dur, p_tipo, p_modo, p_dia, v_clinic_id);

  return jsonb_build_object('ok', true);
end;
$$;
