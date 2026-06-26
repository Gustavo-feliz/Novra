-- Autocadastro do paciente via link de convite enviado pelo profissional.
-- Quando o metadata do signup tem role = 'patient', o trigger cria a linha
-- em patients (com os dados que o próprio paciente preencheu) e o profile
-- já nasce vinculado a esse patient_id — sem precisar do profissional
-- cadastrar o paciente manualmente antes.

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_patient_id uuid;
begin
  if new.raw_user_meta_data->>'role' = 'patient' then
    insert into public.patients (nome, email, telefone, data_nascimento, sexo, status)
    values (
      coalesce(nullif(new.raw_user_meta_data->>'name', ''), split_part(new.email, '@', 1)),
      new.email,
      new.raw_user_meta_data->>'telefone',
      new.raw_user_meta_data->>'data_nascimento',
      new.raw_user_meta_data->>'sexo',
      'ativo'
    )
    returning id into new_patient_id;

    insert into public.profiles (id, name, email, role, patient_id)
    values (
      new.id,
      coalesce(nullif(new.raw_user_meta_data->>'name', ''), split_part(new.email, '@', 1)),
      new.email,
      'patient',
      new_patient_id
    )
    on conflict (id) do nothing;
  else
    if not exists (select 1 from allowed_admins where email = new.email) then
      raise exception 'E-mail não autorizado a criar conta de administrador.';
    end if;

    insert into public.profiles (id, name, email, role)
    values (
      new.id,
      coalesce(nullif(new.raw_user_meta_data->>'name', ''), split_part(new.email, '@', 1)),
      new.email,
      'admin'
    )
    on conflict (id) do nothing;
  end if;
  return new;
end;
$$;
