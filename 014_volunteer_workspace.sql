-- =========================================
-- SPRINT A3 - VOLUNTEER WORKSPACE & OFFLINE SCANNER
-- =========================================

-- 1. Create table for tracking volunteer activity logs
CREATE TABLE IF NOT EXISTS public.organization_activity_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  temporary_volunteer_code varchar(6),
  action_type varchar(50) NOT NULL, -- LOGIN, LOGOUT, OFFLINE_START, OFFLINE_END, QUEUE_SYNC, MANUAL_CHECKIN, QR_CHECKIN, FAILED_SYNC
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_org_activity_logs_org_id ON public.organization_activity_logs(organization_id);

-- Enable RLS
ALTER TABLE public.organization_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow members to view activity logs" ON public.organization_activity_logs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow insertions of logs" ON public.organization_activity_logs
  FOR INSERT TO authenticated WITH CHECK (true);
