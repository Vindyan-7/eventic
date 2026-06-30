-- =========================================
-- SPRINT 3 - PLATFORM MODERATION & OPERATIONAL CONTROLS
-- =========================================

-- 1. Alter public.profiles to add suspension_reason
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspension_reason text;

-- 2. Alter public.events to add is_hidden, moderation_reason, is_pinned, and featured_order
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS moderation_reason text,
ADD COLUMN IF NOT EXISTS is_pinned boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS featured_order integer NOT NULL DEFAULT 0;

-- 3. Alter platform_settings for Maintenance Mode
ALTER TABLE public.platform_settings 
ADD COLUMN IF NOT EXISTS maintenance_mode boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS maintenance_message text,
ADD COLUMN IF NOT EXISTS maintenance_estimated_end timestamptz,
ADD COLUMN IF NOT EXISTS maintenance_banner_color varchar(50) DEFAULT 'amber';

-- 4. Create platform_cms table
CREATE TABLE IF NOT EXISTS public.platform_cms (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  hero_heading text NOT NULL DEFAULT 'Find Nearby Events',
  hero_subheading text NOT NULL DEFAULT 'Discover workshops, hackathons and campus events happening around you.',
  cta_text text NOT NULL DEFAULT 'Discover Events',
  stats_data jsonb NOT NULL DEFAULT '[]'::jsonb,
  faq_data jsonb NOT NULL DEFAULT '[]'::jsonb,
  testimonials_data jsonb NOT NULL DEFAULT '[]'::jsonb,
  sponsors_data jsonb NOT NULL DEFAULT '[]'::jsonb,
  footer_links jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Seed default CMS content if empty
INSERT INTO public.platform_cms (hero_heading, hero_subheading, cta_text)
SELECT 'Find Nearby Events', 'Discover workshops, hackathons and campus events happening around you.', 'Discover Events'
WHERE NOT EXISTS (SELECT 1 FROM public.platform_cms);

-- 5. Create platform_reports table
CREATE TABLE IF NOT EXISTS public.platform_reports (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  reported_item_type varchar(50) NOT NULL CHECK (reported_item_type IN ('event', 'organization', 'user')),
  reported_item_id uuid NOT NULL,
  reporter_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason varchar(100) NOT NULL,
  description text,
  status varchar(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'dismissed', 'resolved')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS for platform_reports
ALTER TABLE public.platform_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view reports" ON public.platform_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can update reports" ON public.platform_reports FOR UPDATE TO authenticated USING (true);

-- 6. Create announcements table
CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title varchar(255) NOT NULL,
  content text NOT NULL,
  type varchar(50) NOT NULL CHECK (type IN ('info', 'warning', 'success', 'maintenance', 'emergency')),
  visibility varchar(50) NOT NULL CHECK (visibility IN ('all', 'organizers', 'admins', 'staff')),
  starts_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS for announcements
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view announcements" ON public.announcements FOR SELECT TO public USING (true);
CREATE POLICY "Admins can modify announcements" ON public.announcements FOR ALL TO authenticated USING (true);

-- 7. Create platform_banners table
CREATE TABLE IF NOT EXISTS public.platform_banners (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title varchar(255) NOT NULL,
  content text NOT NULL,
  type varchar(50) NOT NULL,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  priority integer NOT NULL DEFAULT 0,
  is_dismissible boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS for platform_banners
ALTER TABLE public.platform_banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view banners" ON public.platform_banners FOR SELECT TO public USING (true);
CREATE POLICY "Admins can modify banners" ON public.platform_banners FOR ALL TO authenticated USING (true);
