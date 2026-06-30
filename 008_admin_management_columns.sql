-- =========================================
-- SPRINT 2 - PLATFORM MANAGEMENT SCHEMA UPGRADE
-- =========================================

-- 1. Add is_suspended to public.profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_suspended boolean NOT NULL DEFAULT false;

-- 2. Add verification_status and is_suspended to public.organizations
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS verification_status varchar(50) NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS is_suspended boolean NOT NULL DEFAULT false;

-- 3. Add is_featured to public.events
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;

-- Indexes for fast query sorting & filtering
CREATE INDEX IF NOT EXISTS idx_profiles_is_suspended ON public.profiles(is_suspended);
CREATE INDEX IF NOT EXISTS idx_organizations_verification_status ON public.organizations(verification_status);
CREATE INDEX IF NOT EXISTS idx_organizations_is_suspended ON public.organizations(is_suspended);
CREATE INDEX IF NOT EXISTS idx_events_is_featured ON public.events(is_featured);
