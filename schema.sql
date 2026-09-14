create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.family_members (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  date_of_birth date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bp_readings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  member_id uuid not null references public.family_members(id) on delete cascade,
  reading_at timestamptz not null,
  systolic integer not null check (systolic between 60 and 300),
  diastolic integer not null check (diastolic between 30 and 200),
  pulse integer check (pulse is null or pulse between 30 and 250),
  arm text not null default 'Left',
  position text not null default 'Sitting',
  context text not null default 'Other',
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists family_members_owner_idx on public.family_members(owner_id);
create index if not exists bp_readings_owner_member_date_idx on public.bp_readings(owner_id, member_id, reading_at desc);

alter table public.profiles enable row level security;
alter table public.family_members enable row level security;
alter table public.bp_readings enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles for select to authenticated using ((select auth.uid()) = id);
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists "Users can view own family members" on public.family_members;
create policy "Users can view own family members" on public.family_members for select to authenticated using ((select auth.uid()) = owner_id);
drop policy if exists "Users can create own family members" on public.family_members;
create policy "Users can create own family members" on public.family_members for insert to authenticated with check ((select auth.uid()) = owner_id);
drop policy if exists "Users can update own family members" on public.family_members;
create policy "Users can update own family members" on public.family_members for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
drop policy if exists "Users can delete own family members" on public.family_members;
create policy "Users can delete own family members" on public.family_members for delete to authenticated using ((select auth.uid()) = owner_id);

drop policy if exists "Users can view own readings" on public.bp_readings;
create policy "Users can view own readings" on public.bp_readings for select to authenticated using ((select auth.uid()) = owner_id);
drop policy if exists "Users can create own readings" on public.bp_readings;
create policy "Users can create own readings" on public.bp_readings for insert to authenticated with check ((select auth.uid()) = owner_id and exists (select 1 from public.family_members fm where fm.id = member_id and fm.owner_id = (select auth.uid())));
drop policy if exists "Users can update own readings" on public.bp_readings;
create policy "Users can update own readings" on public.bp_readings for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id and exists (select 1 from public.family_members fm where fm.id = member_id and fm.owner_id = (select auth.uid())));
drop policy if exists "Users can delete own readings" on public.bp_readings;
create policy "Users can delete own readings" on public.bp_readings for delete to authenticated using ((select auth.uid()) = owner_id);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id,email) values (new.id,new.email) on conflict (id) do update set email=excluded.email;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at=now(); return new; end; $$;
drop trigger if exists family_members_set_updated_at on public.family_members;
create trigger family_members_set_updated_at before update on public.family_members for each row execute procedure public.set_updated_at();

-- The browser must use only the Supabase publishable/anon key. Never expose service_role/secret keys.
