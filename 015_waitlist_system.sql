-- =================================================
-- SPRINT A4.2 - SMART WAITLIST & AUTOMATIC SEAT ALLOCATION
-- =================================================

-- 1. Drop old event_waitlists table if it exists
DROP TABLE IF EXISTS public.event_waitlists CASCADE;
DROP TABLE IF EXISTS public.event_waitlist CASCADE;

-- 2. Create the event_waitlist table (singular)
CREATE TABLE public.event_waitlist (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  position integer NOT NULL,
  status varchar(50) NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'reserved', 'claimed', 'expired', 'cancelled', 'skipped')),
  reservation_expires_at timestamptz,
  reservation_created_at timestamptz,
  joined_at timestamptz NOT NULL DEFAULT now(),
  claimed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- 3. Create performance indexes
CREATE INDEX idx_event_waitlist_event_id ON public.event_waitlist(event_id);
CREATE INDEX idx_event_waitlist_user_id ON public.event_waitlist(user_id);
CREATE INDEX idx_event_waitlist_position ON public.event_waitlist(position);
CREATE INDEX idx_event_waitlist_status ON public.event_waitlist(status);

-- Composite index for queue checking
CREATE INDEX idx_event_waitlist_event_status_position 
  ON public.event_waitlist(event_id, status, position);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.event_waitlist ENABLE ROW LEVEL SECURITY;

-- 5. Add Policies
CREATE POLICY "Anyone can select waitlist status" ON public.event_waitlist
  FOR SELECT TO public USING (true);

CREATE POLICY "Users can manage own waitlist entries" ON public.event_waitlist
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Organizer can manage all waitlist entries for their events
CREATE POLICY "Organizers can manage waitlists" ON public.event_waitlist
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.events e
      JOIN public.organizations o ON e.organization_id = o.id
      LEFT JOIN public.organization_members om ON o.id = om.organization_id
      WHERE e.id = event_waitlist.event_id
      AND (o.owner_id = auth.uid() OR (om.user_id = auth.uid() AND om.status = 'active'))
    )
  );
