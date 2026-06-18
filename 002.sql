-- =========================================
-- ENABLE RLS
-- =========================================

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.events enable row level security;
alter table public.event_registrations enable row level security;
alter table public.payments enable row level security;

-- =========================================
-- PROFILES POLICIES
-- =========================================

create policy "Users can view own profile"
on public.profiles
for select
using (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles
for update
using (auth.uid() = id);

-- =========================================
-- ORGANIZATIONS POLICIES
-- =========================================

create policy "Anyone can view organizations"
on public.organizations
for select
using (true);

create policy "Org owners can insert organizations"
on public.organizations
for insert
with check (auth.uid() = owner_id);

create policy "Org owners can update organizations"
on public.organizations
for update
using (auth.uid() = owner_id);

create policy "Org owners can delete organizations"
on public.organizations
for delete
using (auth.uid() = owner_id);

-- =========================================
-- EVENTS POLICIES
-- =========================================

create policy "Anyone can view published events"
on public.events
for select
using (
  status = 'published'
);

create policy "Org owners can create events"
on public.events
for insert
with check (
  exists (
    select 1
    from public.organizations
    where organizations.id = organization_id
    and organizations.owner_id = auth.uid()
  )
);

create policy "Org owners can update events"
on public.events
for update
using (
  exists (
    select 1
    from public.organizations
    where organizations.id = organization_id
    and organizations.owner_id = auth.uid()
  )
);

create policy "Org owners can delete events"
on public.events
for delete
using (
  exists (
    select 1
    from public.organizations
    where organizations.id = organization_id
    and organizations.owner_id = auth.uid()
  )
);

-- =========================================
-- REGISTRATIONS POLICIES
-- =========================================

create policy "Users can view own registrations"
on public.event_registrations
for select
using (
  auth.uid() = user_id
);

create policy "Users can register themselves"
on public.event_registrations
for insert
with check (
  auth.uid() = user_id
);

create policy "Users can delete own registrations"
on public.event_registrations
for delete
using (
  auth.uid() = user_id
);

-- =========================================
-- PAYMENTS POLICIES
-- =========================================

create policy "Users can view own payments"
on public.payments
for select
using (
  exists (
    select 1
    from public.event_registrations
    where event_registrations.id = registration_id
    and event_registrations.user_id = auth.uid()
  )
);