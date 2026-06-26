-- Restringe o "Criar conta" (signup) a uma lista de e-mails autorizados.
-- Sem isso, qualquer pessoa que se cadastrasse virava admin e via todos
-- os pacientes da clínica (modelo hoje é de clínica única).

create table allowed_admins (
  email text primary key,
  created_at timestamptz not null default now()
);

alter table allowed_admins enable row level security;
create policy allowed_admins_admin_all on allowed_admins for all using (is_admin()) with check (is_admin());

-- Seu e-mail já liberado. Para autorizar outras pessoas depois, basta:
-- insert into allowed_admins (email) values ('outro@email.com');
insert into allowed_admins (email) values ('gu.luz.oliveira@gmail.com');

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.raw_user_meta_data->>'role' is distinct from 'patient'
     and not exists (select 1 from allowed_admins where email = new.email) then
    raise exception 'E-mail não autorizado a criar conta de administrador.';
  end if;

  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'name', ''), split_part(new.email, '@', 1)),
    new.email,
    case
      when new.raw_user_meta_data->>'role' = 'patient' then 'patient'
      else 'admin'
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
