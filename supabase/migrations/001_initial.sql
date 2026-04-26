-- TOK Exhibition helper schema
-- Run this in your Supabase project SQL editor after creating the project.

create table tok_exhibitions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  prompt_id integer check (prompt_id between 1 and 35) not null,
  created_at timestamptz default now() not null
);

create table tok_objects (
  id uuid primary key default gen_random_uuid(),
  exhibition_id uuid references tok_exhibitions(id) on delete cascade not null,
  title text not null,
  description text,
  object_type text,
  scores jsonb default '{}',
  created_at timestamptz default now() not null
);

alter table tok_exhibitions enable row level security;
alter table tok_objects enable row level security;

create policy "Users own exhibitions" on tok_exhibitions
  for all using (auth.uid() = user_id);

create policy "Users own objects via exhibition" on tok_objects
  for all using (
    exhibition_id in (select id from tok_exhibitions where user_id = auth.uid())
  );
