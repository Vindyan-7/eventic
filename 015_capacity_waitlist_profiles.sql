-- =========================================
-- SPRINT A4 - PUBLIC PROFILES, CAPACITY & SMART WAITLIST
-- =========================================

-- 1. Add profile details to public.organizations
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS banner_url text,
ADD COLUMN IF NOT EXISTS instagram_url text,
ADD COLUMN IF NOT EXISTS linkedin_url text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS location text;

-- 2. Create organization_follows table
CREATE TABLE IF NOT EXISTS public.organization_follows (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, organization_id)
);

CREATE INDEX IF NOT EXISTS idx_org_follows_user_id ON public.organization_follows(user_id);
CREATE INDEX IF NOT EXISTS idx_org_follows_org_id ON public.organization_follows(organization_id);

-- Enable RLS
ALTER TABLE public.organization_follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view follows count" ON public.organization_follows;
CREATE POLICY "Anyone can view follows count" ON public.organization_follows
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Users can manage own follows" ON public.organization_follows;
CREATE POLICY "Users can manage own follows" ON public.organization_follows
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3. Create event_waitlists table
CREATE TABLE IF NOT EXISTS public.event_waitlists (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  position integer NOT NULL,
  status varchar(50) NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'offered', 'claimed', 'expired')),
  offered_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_waitlists_event_id ON public.event_waitlists(event_id);
CREATE INDEX IF NOT EXISTS idx_event_waitlists_user_id ON public.event_waitlists(user_id);

-- Enable RLS
ALTER TABLE public.event_waitlists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can select waitlist status" ON public.event_waitlists;
CREATE POLICY "Anyone can select waitlist status" ON public.event_waitlists
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Users can manage own waitlist entries" ON public.event_waitlists;
CREATE POLICY "Users can manage own waitlist entries" ON public.event_waitlists
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title varchar(255) NOT NULL,
  message text NOT NULL,
  type varchar(50) NOT NULL, -- WAITLIST_JOINED, SEAT_RESERVED, RESERVATION_EXPIRING, RESERVATION_EXPIRED, TICKET_CLAIMED
  event_id uuid REFERENCES public.events(id) ON DELETE SET NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
