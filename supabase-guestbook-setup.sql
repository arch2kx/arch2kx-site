-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query)

create table if not exists guestbook (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) <= 50),
  message text not null check (char_length(message) <= 280),
  created_at timestamptz not null default now(),
  tz_offset integer not null default 0
);

alter table guestbook enable row level security;

-- Anyone (anon key) can read entries
create policy "guestbook_select_anon"
  on guestbook for select
  to anon
  using (true);

-- Anyone (anon key) can insert entries, but not update/delete
create policy "guestbook_insert_anon"
  on guestbook for insert
  to anon
  with check (true);
