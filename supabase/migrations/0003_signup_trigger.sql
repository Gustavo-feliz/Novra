-- Cria automaticamente um profile quando um novo usuário se cadastra no Auth.
-- O role vem do metadata enviado no signUp (padrão 'admin' = nutricionista).
-- security definer: o trigger ignora RLS para conseguir inserir em profiles.

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
