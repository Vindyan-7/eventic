-- =========================================
-- SPRINT 5 - PLATFORM SETTINGS & INTEGRATIONS
-- =========================================

-- 1. Create platform_general_settings table
CREATE TABLE IF NOT EXISTS public.platform_general_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform_name varchar(100) NOT NULL DEFAULT 'Eventic',
  platform_description text DEFAULT 'Trusted event ticket discovery & gate scanning infrastructure',
  support_email varchar(255) DEFAULT 'support@eventic.co',
  support_phone varchar(50) DEFAULT '+91 99999 99999',
  timezone varchar(100) DEFAULT 'UTC',
  date_format varchar(50) DEFAULT 'YYYY-MM-DD',
  time_format varchar(50) DEFAULT '12h',
  platform_url varchar(255) DEFAULT 'https://eventic.co',
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.platform_general_settings (platform_name)
SELECT 'Eventic' WHERE NOT EXISTS (SELECT 1 FROM public.platform_general_settings);

-- 2. Create platform_branding_settings table
CREATE TABLE IF NOT EXISTS public.platform_branding_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  logo_url text,
  dark_logo_url text,
  footer_logo_url text,
  copyright_text varchar(255) DEFAULT '© 2026 Eventic. All rights reserved.',
  primary_color varchar(50) DEFAULT '#000000',
  default_banner_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.platform_branding_settings (copyright_text)
SELECT '© 2026 Eventic. All rights reserved.' WHERE NOT EXISTS (SELECT 1 FROM public.platform_branding_settings);

-- 3. Create platform_smtp_settings table
CREATE TABLE IF NOT EXISTS public.platform_smtp_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  smtp_host varchar(255) DEFAULT 'smtp.mailtrap.io',
  smtp_port integer DEFAULT 2525,
  smtp_username varchar(255) DEFAULT '',
  smtp_password varchar(255) DEFAULT '',
  sender_name varchar(100) DEFAULT 'Eventic Platform',
  sender_email varchar(255) DEFAULT 'noreply@eventic.co',
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.platform_smtp_settings (smtp_host)
SELECT 'smtp.mailtrap.io' WHERE NOT EXISTS (SELECT 1 FROM public.platform_smtp_settings);

-- 4. Create platform_email_templates table
CREATE TABLE IF NOT EXISTS public.platform_email_templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_key varchar(100) UNIQUE NOT NULL,
  subject varchar(255) NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Seed default templates
INSERT INTO public.platform_email_templates (template_key, subject, body) VALUES
('welcome', 'Welcome to Eventic, {{name}}!', 'Hi {{name}},\n\nWelcome to Eventic! Discover workshops, hackathons and campus events happening around you.\n\nBest,\nEventic Team'),
('ticket_issued', 'Your Ticket for {{event}} is Ready!', 'Hi {{name}},\n\nYour registration for {{event}} is confirmed. Ticket: {{ticket}}\nDate: {{date}}\nTime: {{time}}\n\nShow your QR code at the entrance for verification.\n\nBest,\nEventic Team')
ON CONFLICT (template_key) DO NOTHING;

-- 5. Create platform_security_settings table
CREATE TABLE IF NOT EXISTS public.platform_security_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  min_password_length integer DEFAULT 8,
  require_uppercase boolean DEFAULT true,
  require_number boolean DEFAULT true,
  require_symbol boolean DEFAULT false,
  session_timeout integer DEFAULT 120, -- minutes
  max_login_attempts integer DEFAULT 5,
  lockout_duration integer DEFAULT 15, -- minutes
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.platform_security_settings (min_password_length)
SELECT 8 WHERE NOT EXISTS (SELECT 1 FROM public.platform_security_settings);

-- 6. Create platform_feature_flags table
CREATE TABLE IF NOT EXISTS public.platform_feature_flags (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  flag_key varchar(100) UNIQUE NOT NULL,
  description text,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.platform_feature_flags (flag_key, description, is_enabled) VALUES
('org_registration', 'Allow new organizations to sign up', true),
('event_creation', 'Allow fests and hackathons to be created by hosts', true),
('scanner_login', 'Allow gate checkin staff access keys verification', true)
ON CONFLICT (flag_key) DO NOTHING;

-- 7. Create platform_webhooks table
CREATE TABLE IF NOT EXISTS public.platform_webhooks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  url text NOT NULL,
  secret varchar(255),
  events varchar(100)[] NOT NULL, -- e.g. ['user.registered', 'event.published']
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 8. Create platform_api_keys table
CREATE TABLE IF NOT EXISTS public.platform_api_keys (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  key_hint varchar(20) NOT NULL,
  key_hash varchar(255) NOT NULL,
  name varchar(100) NOT NULL,
  permissions varchar(100)[] NOT NULL DEFAULT '{}',
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
