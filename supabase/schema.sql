-- =============================================================================
-- FORJA · ARKA Fitness AI — Esquema Oficial de Base de Datos y Seguridad (RLS)
-- Motor: Supabase (PostgreSQL 15+)
-- Instrucciones: Copia todo este archivo en Supabase -> SQL Editor -> New Query -> Run
-- =============================================================================

create extension if not exists pgcrypto;

-- 1. TABLA DE CÓDIGOS DE CORTESÍA (Exclusividad por invitación)
create table if not exists public.courtesy_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  label text not null default 'Cortesía Cliente Exclusivo',
  max_uses integer not null default 1 check (max_uses >= 1 and max_uses <= 10000),
  uses_count integer not null default 0 check (uses_count >= 0),
  is_active boolean not null default true,
  expires_at timestamptz null,
  created_by uuid null references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint courtesy_codes_format_chk check (code ~ '^[A-Z0-9_-]{4,32}$'),
  constraint courtesy_codes_uses_chk check (uses_count <= max_uses)
);

-- 2. AUDITORÍA DE CANJE DE CÓDIGOS
create table if not exists public.courtesy_redemptions (
  id uuid primary key default gen_random_uuid(),
  code_id uuid not null references public.courtesy_codes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  redeemed_at timestamptz not null default now(),
  unique (code_id, user_id)
);

-- 3. PERFILES DE ALUMNOS Y ADMINISTRADORES
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'member' check (role in ('member', 'admin')),
  is_active boolean not null default true,
  courtesy_code_used text null,
  onboarding_completed boolean not null default false,
  profile_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. HISTORIAL DE SESIONES DE ENTRENAMIENTO
create table if not exists public.workout_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id text not null check (char_length(session_id) <= 80),
  session_name text not null check (char_length(session_name) <= 160),
  sets_done integer not null check (sets_done >= 0 and sets_done <= 200),
  completed_at timestamptz not null default now()
);

create index if not exists idx_workout_history_user_date
  on public.workout_history (user_id, completed_at desc);

create index if not exists idx_courtesy_codes_code
  on public.courtesy_codes (code);

-- =============================================================================
-- TRIGGERS DE INTEGRIDAD Y ANTI-ESCALACIÓN DE PRIVILEGIOS
-- =============================================================================

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.touch_updated_at();

-- Impide que un usuario autenticado modifique su propio rol, estado activo o correo
create or replace function public.prevent_profile_privilege_escalation()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if current_setting('request.jwt.claim.role', true) = 'authenticated' then
    new.role := old.role;
    new.is_active := old.is_active;
    new.email := old.email;
    new.courtesy_code_used := old.courtesy_code_used;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_profiles_no_escalation on public.profiles;
create trigger trg_profiles_no_escalation
  before update on public.profiles
  for each row
  execute function public.prevent_profile_privilege_escalation();

-- =============================================================================
-- FUNCIÓN ATÓMICA DE CANJE DE CÓDIGO DE CORTESÍA (PREVIENE RACE CONDITIONS)
-- Solo ejecutable con SUPABASE_SERVICE_ROLE_KEY desde el servidor de FORJA
-- =============================================================================

create or replace function public.consume_courtesy_code(
  p_code text,
  p_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_clean text := upper(btrim(p_code));
  v_row public.courtesy_codes%rowtype;
begin
  select *
    into v_row
    from public.courtesy_codes
   where code = v_clean
   for update;

  if not found then
    return jsonb_build_object('ok', false, 'reason', 'NOT_FOUND');
  end if;

  if not v_row.is_active then
    return jsonb_build_object('ok', false, 'reason', 'INACTIVE');
  end if;

  if v_row.expires_at is not null and v_row.expires_at <= now() then
    return jsonb_build_object('ok', false, 'reason', 'EXPIRED');
  end if;

  if v_row.uses_count >= v_row.max_uses then
    return jsonb_build_object('ok', false, 'reason', 'EXHAUSTED');
  end if;

  update public.courtesy_codes
     set uses_count = uses_count + 1
   where id = v_row.id;

  insert into public.courtesy_redemptions (code_id, user_id)
  values (v_row.id, p_user_id)
  on conflict (code_id, user_id) do nothing;

  return jsonb_build_object(
    'ok', true,
    'code', v_row.code,
    'label', v_row.label
  );
end;
$$;

revoke all on function public.consume_courtesy_code(text, uuid) from public, anon, authenticated;
grant execute on function public.consume_courtesy_code(text, uuid) to service_role;

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) ESTRICTO — PRINCIPIO DE MÍNIMO PRIVILEGIO
-- =============================================================================

alter table public.courtesy_codes enable row level security;
alter table public.courtesy_redemptions enable row level security;
alter table public.profiles enable row level security;
alter table public.workout_history enable row level security;

-- courtesy_codes y courtesy_redemptions: CERO políticas para anon/authenticated
-- (Solo accesibles desde el backend servidor de FORJA con service_role)

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id and is_active = true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id and is_active = true)
  with check (auth.uid() = id and is_active = true);

drop policy if exists "history_select_own" on public.workout_history;
create policy "history_select_own"
  on public.workout_history
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "history_insert_own" on public.workout_history;
create policy "history_insert_own"
  on public.workout_history
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- =============================================================================
-- CÓDIGO FUNDADOR INICIAL AUTOGENERADO (SIN SECRETOS QUEMADOS EN GIT)
-- Consulta tu código inicial en: Table Editor -> courtesy_codes
-- =============================================================================

insert into public.courtesy_codes (code, label, max_uses, is_active)
select
  'FORJA-ADMIN-' || upper(encode(gen_random_bytes(4), 'hex')),
  'Acceso Inicial Fundador / Administrador (1 uso)',
  1,
  true
where not exists (select 1 from public.courtesy_codes);
