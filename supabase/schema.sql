-- CulturasCheck — schema principal
-- Executar no SQL Editor do Supabase (projeto dedicado, isolado de outros apps)

-- ============================================================
-- EXTENSÕES
-- ============================================================
create extension if not exists "pgcrypto";

-- ============================================================
-- PERFIS (vinculado a auth.users, só nome/e-mail de exibição)
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  crm text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

create policy "profiles_insert_self"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "profiles_update_self"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- cria o profile automaticamente no signup, a partir do metadata full_name
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- TIPOS DE EXAME (catálogo com prazo padrão de checagem, editável)
-- ============================================================
create table if not exists public.exam_types (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  category text not null, -- 'bacteriologia' | 'micobacteria' | 'fungos'
  default_turnaround_days int not null,
  notes text,
  sort_order int not null default 0
);

alter table public.exam_types enable row level security;

create policy "exam_types_select_authenticated"
  on public.exam_types for select
  to authenticated
  using (true);

insert into public.exam_types (code, name, category, default_turnaround_days, notes, sort_order) values
  ('hemocultura',        'Hemocultura',                              'bacteriologia', 3,  'Automatizada; checar em ~3 dias. Positiva pode sinalizar antes.', 1),
  ('urocultura',         'Urocultura',                               'bacteriologia', 3,  'Resultado usual em 48–72h.', 2),
  ('cultura_vigilancia', 'Cultura de vigilância (swab retal/KPC)',   'bacteriologia', 3,  'Rastreio de multirresistentes, 48–72h.', 3),
  ('cultura_secrecao',   'Cultura de secreção/ferida',                'bacteriologia', 3,  '48–72h.', 4),
  ('cultura_liquor',     'Cultura de líquor',                         'bacteriologia', 5,  '~5 dias.', 5),
  ('pcr_tb_lavado',      'PCR tuberculose — lavado gástrico',        'micobacteria',  5,  'GeneXpert; checar em ~5 dias.', 6),
  ('pcr_tb_escarro',     'PCR tuberculose — escarro',                 'micobacteria',  5,  'GeneXpert; checar em ~5 dias.', 7),
  ('baar_escarro',       'Baciloscopia (BAAR) — escarro',             'micobacteria',  1,  '24–48h.', 8),
  ('cultura_bk',         'Cultura para BK (Löwenstein-Jensen)',       'micobacteria',  42, 'Lenta: 6–8 semanas.', 9),
  ('cultura_fungos',     'Cultura para fungos',                       'fungos',        10, 'Checar em ~10 dias.', 10)
on conflict (code) do nothing;

-- ============================================================
-- PACIENTES
-- ============================================================
create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  bed text,
  medical_record text,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived boolean not null default false
);

alter table public.patients enable row level security;

create policy "patients_select_authenticated"
  on public.patients for select
  to authenticated
  using (true);

create policy "patients_insert_authenticated"
  on public.patients for insert
  to authenticated
  with check (auth.uid() = created_by);

create policy "patients_update_authenticated"
  on public.patients for update
  to authenticated
  using (true)
  with check (true);

create policy "patients_delete_authenticated"
  on public.patients for delete
  to authenticated
  using (true);

-- ============================================================
-- CULTURAS / EXAMES SOLICITADOS
-- ============================================================
create table if not exists public.cultures (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  exam_type_id uuid not null references public.exam_types (id),
  custom_label text, -- descrição livre, ex.: "cultura de ponta de cateter"

  request_date date not null,
  collection_date date,
  expected_result_date date not null,
  expected_result_edited boolean not null default false,
  delay_reason text,

  partial_result text,
  partial_result_date date,
  final_result text,
  final_result_date date,

  conduct text not null default 'sem_conduta', -- 'sem_conduta' | 'aguarda_conduta' | 'antibiotico'
  conduct_detail text, -- ex. nome do antibiótico
  conduct_updated_at timestamptz,

  created_by uuid not null references public.profiles (id),
  updated_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint conduct_valid check (conduct in ('sem_conduta', 'aguarda_conduta', 'antibiotico'))
);

create index if not exists cultures_patient_id_idx on public.cultures (patient_id);
create index if not exists cultures_expected_result_date_idx on public.cultures (expected_result_date);

alter table public.cultures enable row level security;

create policy "cultures_select_authenticated"
  on public.cultures for select
  to authenticated
  using (true);

create policy "cultures_insert_authenticated"
  on public.cultures for insert
  to authenticated
  with check (auth.uid() = created_by);

create policy "cultures_update_authenticated"
  on public.cultures for update
  to authenticated
  using (true)
  with check (true);

create policy "cultures_delete_authenticated"
  on public.cultures for delete
  to authenticated
  using (true);

-- updated_at automático
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists patients_touch_updated_at on public.patients;
create trigger patients_touch_updated_at
  before update on public.patients
  for each row execute procedure public.touch_updated_at();

drop trigger if exists cultures_touch_updated_at on public.cultures;
create trigger cultures_touch_updated_at
  before update on public.cultures
  for each row execute procedure public.touch_updated_at();

-- ============================================================
-- AUDITORIA (LGPD — trilha de quem alterou o quê)
-- ============================================================
create table if not exists public.cultures_audit_log (
  id bigint generated always as identity primary key,
  culture_id uuid not null,
  changed_by uuid references public.profiles (id),
  changed_at timestamptz not null default now(),
  old_row jsonb,
  new_row jsonb
);

alter table public.cultures_audit_log enable row level security;

create policy "audit_select_authenticated"
  on public.cultures_audit_log for select
  to authenticated
  using (true);

create or replace function public.log_culture_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.cultures_audit_log (culture_id, changed_by, old_row, new_row)
  values (new.id, auth.uid(), to_jsonb(old), to_jsonb(new));
  return new;
end;
$$;

drop trigger if exists cultures_audit_trigger on public.cultures;
create trigger cultures_audit_trigger
  after update on public.cultures
  for each row execute procedure public.log_culture_change();

-- registra também as EXCLUSÕES (LGPD): quem apagou e o conteúdo apagado.
-- Também dispara em cascata quando um paciente é excluído.
create or replace function public.log_culture_delete()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.cultures_audit_log (culture_id, changed_by, old_row, new_row)
  values (old.id, auth.uid(), to_jsonb(old), null);
  return old;
end;
$$;

drop trigger if exists cultures_audit_delete_trigger on public.cultures;
create trigger cultures_audit_delete_trigger
  after delete on public.cultures
  for each row execute procedure public.log_culture_delete();

-- ============================================================
-- PRIVILÉGIOS DE TABELA (GRANTs)
-- ============================================================
-- O RLS (policies acima) só é avaliado DEPOIS que o papel tem privilégio
-- na tabela. Em alguns projetos Supabase os grants padrão para 'authenticated'
-- não vêm aplicados — sem estes GRANTs o app falha mesmo com o usuário logado.
-- Concedemos acesso apenas a 'authenticated'; 'anon' (não logado) fica sem
-- acesso a dados de pacientes, por segurança/LGPD.

grant usage on schema public to authenticated;

grant select, insert, update on public.profiles          to authenticated;
grant select                  on public.exam_types        to authenticated;
grant select, insert, update, delete on public.patients          to authenticated;
grant select, insert, update, delete on public.cultures          to authenticated;
grant select                         on public.cultures_audit_log to authenticated;

-- ============================================================
-- NOTAS DE SEGURANÇA / LGPD
-- ============================================================
-- 1. No dashboard do Supabase, restrinja o cadastro de contas (Auth > Providers)
--    a e-mails do domínio institucional do hospital, se possível, ou desative
--    "Enable email signups" e crie os usuários por convite (Auth > Users > Invite).
-- 2. Nunca exponha a service_role key no frontend — apenas a anon key,
--    protegida pelas policies de RLS acima.
-- 3. Todas as tabelas exigem autenticação (to authenticated) — não há acesso
--    público/anônimo a dados de pacientes.
-- 4. cultures_audit_log preserva histórico de alterações para rastreabilidade,
--    sem exigir novo insert manual: dispara automaticamente em UPDATE.
