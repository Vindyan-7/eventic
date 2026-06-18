-- =========================================
-- ENABLE EXTENSIONS
-- =========================================

create extension if not exists "uuid-ossp";

-- =========================================
-- USER ROLE ENUM
-- =========================================

create type public.user_role as enum (
  'user',
  'org_admin',
  'super_admin'
);

-- =========================================
-- EVENT STATUS ENUM
-- =========================================

create type public.event_status as enum (
  'draft',
  'published',
  'completed',
  'cancelled'
);

-- =========================================
-- PAYMENT STATUS ENUM
-- =========================================

create type public.payment_status as enum (
  'pending',
  'paid',
  'failed',
  'refunded'
);

-- =========================================
-- PROFILES TABLE
-- =========================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,

  email text unique not null,

  full_name text,

  avatar_url text,

  role public.user_role not null default 'user',

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);

-- =========================================
-- ORGANIZATIONS TABLE
-- =========================================

create table public.organizations (
  id uuid primary key default uuid_generate_v4(),

  owner_id uuid not null references public.profiles(id) on delete cascade,

  name text not null,

  slug text unique not null,

  description text,

  logo_url text,

  website text,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);

-- =========================================
-- EVENTS TABLE
-- =========================================

create table public.events (
  id uuid primary key default uuid_generate_v4(),

  organization_id uuid not null references public.organizations(id) on delete cascade,

  title text not null,

  slug text unique not null,

  description text,

  banner_url text,

  venue text,

  starts_at timestamptz not null,

  ends_at timestamptz,

  max_attendees integer,

  is_paid boolean not null default false,

  ticket_price numeric(10,2) default 0,

  status public.event_status not null default 'draft',

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);

-- =========================================
-- EVENT REGISTRATIONS TABLE
-- =========================================

create table public.event_registrations (
  id uuid primary key default uuid_generate_v4(),

  event_id uuid not null references public.events(id) on delete cascade,

  user_id uuid not null references public.profiles(id) on delete cascade,

  created_at timestamptz not null default now(),

  unique(event_id, user_id)
);

-- =========================================
-- PAYMENTS TABLE
-- =========================================

create table public.payments (
  id uuid primary key default uuid_generate_v4(),

  registration_id uuid not null references public.event_registrations(id) on delete cascade,

  razorpay_order_id text,

  razorpay_payment_id text,

  amount numeric(10,2) not null,

  status public.payment_status not null default 'pending',

  created_at timestamptz not null default now()
);

-- =========================================
-- UPDATED_AT FUNCTION
-- =========================================

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========================================
-- UPDATED_AT TRIGGERS
-- =========================================

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute procedure public.handle_updated_at();

create trigger set_organizations_updated_at
before update on public.organizations
for each row
execute procedure public.handle_updated_at();

create trigger set_events_updated_at
before update on public.events
for each row
execute procedure public.handle_updated_at();

-- =========================================
-- AUTO CREATE PROFILE ON SIGNUP
-- =========================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    full_name
  )
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();

-- =========================================
-- INDEXES
-- =========================================

create index idx_events_organization_id
on public.events(organization_id);

create index idx_registrations_event_id
on public.event_registrations(event_id);

create index idx_registrations_user_id
on public.event_registrations(user_id);

create index idx_payments_registration_id
on public.payments(registration_id);