-- ── appointments: data real + contato ─────────────────────────────────────────
-- Antes, o link público de agendamento gravava `dia` como dia-do-mês, enquanto o
-- restante do app sempre tratou `dia` como índice de dia da semana (0=Seg … 5=Sáb).
-- Isso fazia consultas do booking caírem na coluna errada (ou em coluna nenhuma)
-- da agenda. A partir daqui:
--   • `data`    guarda a DATA real da consulta (YYYY-MM-DD)
--   • `dia`     é sempre derivado da data (índice de semana) — consistente no app
--   • `contato` guarda telefone/e-mail informado no agendamento público
alter table appointments add column if not exists data    date;
alter table appointments add column if not exists contato text;

-- ── get_booking_public: passa a devolver confirm_auto ─────────────────────────
-- O frontend já lê confirm_auto do retorno; antes o RPC não o devolvia e caía
-- sempre no default `true`.
create or replace function get_booking_public(p_slug text)
returns jsonb language sql security definer stable as $$
  select jsonb_build_object(
    'slug',         b.slug,
    'ativo',        b.ativo,
    'confirm_auto', b.confirm_auto,
    'servicos',     b.servicos,
    'horarios',     b.horarios
  )
  from booking_config b
  where lower(b.slug) = lower(p_slug)
  limit 1;
$$;

-- ── request_appointment: recebe DATA real + contato ───────────────────────────
-- O índice de dia da semana (`dia`) é calculado no servidor a partir da data
-- (isodow: 1=Seg … 7=Dom → 0=Seg … 5=Sáb), então a consulta cai na coluna certa
-- da agenda automaticamente. A assinatura antiga (com p_dia integer) é removida
-- para não deixar duas sobrecargas ambíguas.
drop function if exists request_appointment(text, text, text, text, text, integer, integer);

create or replace function request_appointment(
  p_slug    text,
  p_nome    text,
  p_hora    text,
  p_tipo    text,
  p_modo    text,
  p_dur     integer,
  p_data    date,
  p_contato text default null
) returns jsonb language plpgsql security definer as $$
declare
  v_clinic_id uuid;
  v_dia       integer;
begin
  select created_by into v_clinic_id
  from booking_config
  where lower(slug) = lower(p_slug) and ativo = true;

  if v_clinic_id is null then
    return jsonb_build_object('ok', false, 'error', 'clinic_not_found_or_inactive');
  end if;

  -- isodow: 1=Seg … 7=Dom → índice 0=Seg … 5=Sáb (domingo viraria 6, mas o
  -- agendamento público não oferece fins de semana)
  v_dia := extract(isodow from p_data)::int - 1;

  insert into appointments (paciente, contato, hora, dur, tipo, modo, dia, data, created_by)
  values (p_nome, p_contato, p_hora, p_dur, p_tipo, p_modo, v_dia, p_data, v_clinic_id);

  return jsonb_build_object('ok', true);
end;
$$;
