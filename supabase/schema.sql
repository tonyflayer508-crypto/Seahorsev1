-- ============================================================
-- BUILDER AI DATABASE
-- Supabase / PostgreSQL
-- ============================================================

-- ============================================================
-- 1. EXTENSIONS
-- ============================================================

create extension if not exists pgcrypto;


-- ============================================================
-- 2. USERS TABLE
-- ============================================================

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),

  name text not null,

  email text not null unique,

  -- IMPORTANT:
  -- Store a bcrypt/argon2 HASH here, never a plain password.
  password text not null,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);


-- ============================================================
-- 3. PROJECTS TABLE
-- ============================================================

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),

  -- Basic project information
  name text not null default 'Untitled Project',

  description text not null default '',


  -- ========================================================
  -- Generated project files
  --
  -- Example:
  -- {
  --   "package.json": "...",
  --   "src/App.jsx": "...",
  --   "src/main.jsx": "..."
  -- }
  -- ========================================================

  files jsonb not null default '{}'::jsonb,


  -- ========================================================
  -- AI conversation messages
  -- ========================================================

  messages jsonb not null default '[]'::jsonb,


  -- ========================================================
  -- Project version
  -- ========================================================

  version text not null default '0',


  -- ========================================================
  -- PROJECT OWNER
  -- ========================================================

  owner uuid not null
    references public.users(id)
    on delete cascade,


  -- ========================================================
  -- PUBLISHING
  -- ========================================================

  published boolean not null default false,


  -- ========================================================
  -- AI GENERATION STATUS
  --
  -- pending
  -- planning
  -- generating
  -- completed
  -- failed
  -- ========================================================

  status text not null default 'pending',


  -- ========================================================
  -- AI FILE PLAN
  --
  -- Example:
  -- [
  --   "package.json",
  --   "src/App.jsx",
  --   "src/main.jsx"
  -- ]
  -- ========================================================

  "filePlanned" jsonb not null default '[]'::jsonb,


  -- ========================================================
  -- FILES ALREADY GENERATED
  -- ========================================================

  "filesGenerated" jsonb not null default '[]'::jsonb,


  -- ========================================================
  -- FILE CURRENTLY BEING GENERATED
  -- ========================================================

  "currentFile" text,


  -- ========================================================
  -- AI ERROR MESSAGE
  -- ========================================================

  error text,


  -- ========================================================
  -- TIMESTAMPS
  -- ========================================================

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);


-- ============================================================
-- 4. HANDLE OLD currentfile COLUMN
-- ============================================================
-- PostgreSQL treats quoted and unquoted identifiers differently.
-- This safely converts an old "currentfile" column to "currentFile".

do $$
begin

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'projects'
      and column_name = 'currentfile'
  )
  and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'projects'
      and column_name = 'currentFile'
  ) then

    alter table public.projects
      rename column currentfile to "currentFile";

  end if;

end $$;


-- ============================================================
-- 5. ADD MISSING COLUMNS TO EXISTING PROJECTS TABLE
-- ============================================================

alter table public.projects

  add column if not exists "filePlanned"
    jsonb not null default '[]'::jsonb,

  add column if not exists "filesGenerated"
    jsonb not null default '[]'::jsonb,

  add column if not exists "currentFile"
    text,

  add column if not exists error
    text;


-- ============================================================
-- 6. PROJECT STATUS VALIDATION
-- ============================================================
-- Allows only valid generation states and repairs older constraint names.

do $$
declare
  constraint_record record;
begin

  for constraint_record in
    select conname
    from pg_constraint
    where conrelid = 'public.projects'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%status%'
  loop
    execute format(
      'alter table public.projects drop constraint %I',
      constraint_record.conname
    );
  end loop;

  alter table public.projects
    add constraint projects_status_check
    check (
      status in (
        'pending',
        'planning',
        'generating',
        'revising',
        'completed',
        'failed'
      )
    );


end $$;


-- ============================================================
-- 7. INDEXES
-- ============================================================

-- Find projects belonging to a user quickly
create index if not exists projects_owner_idx
on public.projects(owner);


-- Sort user's projects by newest update
create index if not exists projects_owner_updated_at_idx
on public.projects(owner, updated_at desc);


-- Find projects by generation status
create index if not exists projects_status_idx
on public.projects(status);


-- Find published projects
create index if not exists projects_published_idx
on public.projects(published);


-- ============================================================
-- 8. UPDATED_AT FUNCTION
-- ============================================================
-- Automatically updates updated_at whenever a row changes.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin

  new.updated_at = now();

  return new;

end;
$$;


-- ============================================================
-- 9. USERS UPDATED_AT TRIGGER
-- ============================================================

drop trigger if exists users_updated_at
on public.users;

create trigger users_updated_at

before update on public.users

for each row

execute function public.set_updated_at();


-- ============================================================
-- 10. PROJECTS UPDATED_AT TRIGGER
-- ============================================================

drop trigger if exists projects_updated_at
on public.projects;

create trigger projects_updated_at

before update on public.projects

for each row

execute function public.set_updated_at();


-- ============================================================
-- 11. OPTIONAL: NORMALIZE EMAIL
-- ============================================================
-- Makes email comparisons safer by preventing accidental
-- leading/trailing spaces during updates.
--
-- Your Node.js backend should ALSO use:
-- email.trim().toLowerCase()
--
-- before creating/logging in users.


-- ============================================================
-- 12. ENABLE ROW LEVEL SECURITY
-- ============================================================
-- IMPORTANT:
-- Because you're using your own public.users + JWT backend,
-- DO NOT create Supabase auth.uid() policies here unless
-- your JWT is configured to work with Supabase Auth.
--
-- Service-role requests from your Express backend bypass RLS.

alter table public.users enable row level security;

alter table public.projects enable row level security;


-- ============================================================
-- 13. REMOVE OLD POLICIES IF THEY EXIST
-- ============================================================

drop policy if exists
  "Users service role access"
on public.users;

drop policy if exists
  "Projects service role access"
on public.projects;


-- ============================================================
-- 14. SERVICE ROLE POLICIES
-- ============================================================
-- Your Express backend uses SUPABASE_SERVICE_ROLE_KEY.
--
-- The service role bypasses RLS anyway, but these policies
-- make the intended database access explicit.


create policy
  "Users service role access"

on public.users

for all

to service_role

using (true)

with check (true);


create policy
  "Projects service role access"

on public.projects

for all

to service_role

using (true)

with check (true);


-- ============================================================
-- 15. RELOAD SUPABASE API SCHEMA
-- ============================================================

notify pgrst, 'reload schema';


-- ============================================================
-- DONE
-- ============================================================

select 'Builder AI database setup completed successfully.' as message;