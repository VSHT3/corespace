-- Create profiles table + auto-create trigger on auth.users insert
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique,
  updated_at timestamptz default now() not null
);

alter table profiles enable row level security;

create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Trigger: auto-create profile when auth user signs up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (
    NEW.id,
    NEW.raw_user_meta_data ->> 'username'
  );
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
