-- =========================================
-- SPRINT A4.1 — UNIFIED NOTIFICATION CENTER
-- =========================================
-- Run this in Supabase SQL editor AFTER 015_capacity_waitlist_profiles.sql
-- Strategy: ALTER existing notifications table (non-destructive), add new tables

-- ─── 1. Extend the existing notifications table ───────────────────────────────

ALTER TABLE public.notifications
  -- Rename user_id → recipient_id via new column (keep user_id for zero downtime)
  ADD COLUMN IF NOT EXISTS recipient_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS sender_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS category varchar(50) NOT NULL DEFAULT 'Platform',
  ADD COLUMN IF NOT EXISTS icon varchar(50),
  ADD COLUMN IF NOT EXISTS color varchar(50),
  ADD COLUMN IF NOT EXISTS priority varchar(20) NOT NULL DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS data jsonb,
  ADD COLUMN IF NOT EXISTS action_url text,
  ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS read_at timestamptz,
  ADD COLUMN IF NOT EXISTS expires_at timestamptz;

-- Back-fill recipient_id from user_id for existing rows
UPDATE public.notifications SET recipient_id = user_id WHERE recipient_id IS NULL;

-- Rename read → is_read via new column
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS is_read boolean NOT NULL DEFAULT false;

UPDATE public.notifications SET is_read = read WHERE true;

-- Add constraint on new columns
ALTER TABLE public.notifications
  ALTER COLUMN recipient_id SET NOT NULL;

-- Add check constraints
ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_priority_check,
  DROP CONSTRAINT IF EXISTS notifications_category_check;

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_priority_check
    CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  ADD CONSTRAINT notifications_category_check
    CHECK (category IN ('Events', 'Tickets', 'Workspace', 'Volunteer', 'Certificates', 'Waitlist', 'Platform', 'Admin'));

-- ─── 2. Performance indexes ────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON public.notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_category ON public.notifications(category);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON public.notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_is_archived ON public.notifications(is_archived);

-- Composite index for the most common query pattern
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_read_created
  ON public.notifications(recipient_id, is_read, created_at DESC);

-- ─── 3. Update RLS policies ────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;

-- Users can only see their own notifications (not archived by default, fetched separately)
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT TO authenticated
  USING (auth.uid() = recipient_id);

-- Users can update their own notifications (mark read, archive)
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE TO authenticated
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications" ON public.notifications
  FOR DELETE TO authenticated
  USING (auth.uid() = recipient_id);

-- Service role can INSERT (used by NotificationService via adminClient)
-- (service role bypasses RLS by default, no explicit policy needed)

-- ─── 4. notification_preferences table ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  website_enabled boolean NOT NULL DEFAULT true,
  email_enabled boolean NOT NULL DEFAULT true,
  pref_events boolean NOT NULL DEFAULT true,
  pref_registrations boolean NOT NULL DEFAULT true,
  pref_workspace_invites boolean NOT NULL DEFAULT true,
  pref_volunteer_invites boolean NOT NULL DEFAULT true,
  pref_certificates boolean NOT NULL DEFAULT true,
  pref_waitlist boolean NOT NULL DEFAULT true,
  pref_platform boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences" ON public.notification_preferences
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own preferences" ON public.notification_preferences
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── 5. notification_broadcasts log table ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.notification_broadcasts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  title varchar(255) NOT NULL,
  message text NOT NULL,
  category varchar(50) NOT NULL DEFAULT 'Platform',
  priority varchar(20) NOT NULL DEFAULT 'normal',
  target_type varchar(50) NOT NULL, -- 'everyone' | 'users' | 'organizers' | 'volunteers' | 'organization' | 'event'
  target_id uuid, -- organization_id or event_id when target_type is specific
  recipient_count integer NOT NULL DEFAULT 0,
  action_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_broadcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage broadcasts" ON public.notification_broadcasts
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role::text IN ('super_admin', 'platform_admin', 'moderator')
    )
  );

CREATE INDEX IF NOT EXISTS idx_broadcasts_created_at ON public.notification_broadcasts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_broadcasts_sender_id ON public.notification_broadcasts(sender_id);
