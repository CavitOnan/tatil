-- Tracks each user's free-trial window. A row is created automatically for
-- every new auth.users row (password sign-up or first magic-link use) via
-- the trigger below, so trial eligibility can't be skipped by any client.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  trial_ends_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, trial_ends_at)
  values (new.id, now() + interval '14 days');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
