alter table public.guestbook enable row level security;
alter table public.guestbook force row level security;

do $$
declare p record;
begin
  for p in select policyname from pg_policies where schemaname = 'public' and tablename = 'guestbook' loop
    execute format('drop policy %I on public.guestbook', p.policyname);
  end loop;
end $$;

revoke all on table public.guestbook from anon, authenticated;
grant select (id, name, message, created_at, tz_offset) on table public.guestbook to anon, authenticated;

alter table public.guestbook alter column created_at set default now();
alter table public.guestbook alter column created_at set not null;
alter table public.guestbook alter column name set not null;
alter table public.guestbook alter column message set not null;
alter table public.guestbook alter column tz_offset set default 0;
alter table public.guestbook alter column tz_offset set not null;

alter table public.guestbook drop constraint if exists guestbook_name_len;
alter table public.guestbook drop constraint if exists guestbook_message_len;
alter table public.guestbook drop constraint if exists guestbook_tz_offset_range;
alter table public.guestbook add constraint guestbook_name_len
  check (char_length(btrim(name)) between 1 and 50);
alter table public.guestbook add constraint guestbook_message_len
  check (char_length(btrim(message)) between 1 and 280);
alter table public.guestbook add constraint guestbook_tz_offset_range
  check (tz_offset between -720 and 840);

create or replace function public.guestbook_before_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.created_at := now();
  if (select count(*) from public.guestbook where created_at > now() - interval '1 minute') >= 10 then
    raise exception 'guestbook rate limit exceeded' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

revoke all on function public.guestbook_before_insert() from public, anon, authenticated;

drop trigger if exists guestbook_before_insert on public.guestbook;
create trigger guestbook_before_insert
  before insert on public.guestbook
  for each row execute function public.guestbook_before_insert();

create policy guestbook_public_read
  on public.guestbook
  for select
  to anon, authenticated
  using (true);
