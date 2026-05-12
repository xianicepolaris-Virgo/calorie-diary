create table if not exists public.health_diary (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.health_diary enable row level security;

drop policy if exists "allow anonymous read health diary" on public.health_diary;
create policy "allow anonymous read health diary"
on public.health_diary
for select
to anon
using (true);

drop policy if exists "allow anonymous write health diary" on public.health_diary;
create policy "allow anonymous write health diary"
on public.health_diary
for insert
to anon
with check (true);

drop policy if exists "allow anonymous update health diary" on public.health_diary;
create policy "allow anonymous update health diary"
on public.health_diary
for update
to anon
using (true)
with check (true);
