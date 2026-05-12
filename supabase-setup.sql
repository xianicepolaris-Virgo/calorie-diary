drop policy if exists "allow anonymous read health diary" on public.health_diary;
drop policy if exists "allow anonymous write health diary" on public.health_diary;
drop policy if exists "allow anonymous update health diary" on public.health_diary;
drop policy if exists "users can read own health diary" on public.health_diary;
drop policy if exists "users can insert own health diary" on public.health_diary;
drop policy if exists "users can update own health diary" on public.health_diary;

create table if not exists public.health_diary (
  user_id uuid references auth.users(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.health_diary add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.health_diary add column if not exists data jsonb;
alter table public.health_diary add column if not exists updated_at timestamptz not null default now();

create unique index if not exists health_diary_user_id_key on public.health_diary(user_id);

alter table public.health_diary enable row level security;

create policy "users can read own health diary"
on public.health_diary
for select
to authenticated
using (auth.uid() = user_id);

create policy "users can insert own health diary"
on public.health_diary
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "users can update own health diary"
on public.health_diary
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
