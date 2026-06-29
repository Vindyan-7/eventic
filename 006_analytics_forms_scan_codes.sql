-- =========================================
-- CUSTOM QUESTIONS AND SCANNER ACCESS CODES
-- =========================================

-- 1. Add custom_questions to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS custom_questions JSONB DEFAULT '[]'::jsonb;

-- 2. Add custom_answers and source to event_registrations table
ALTER TABLE public.event_registrations 
ADD COLUMN IF NOT EXISTS custom_answers JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS source varchar(50) DEFAULT 'direct';

-- 3. Create event_scan_codes table for scanner-only access codes
CREATE TABLE IF NOT EXISTS public.event_scan_codes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  code varchar(6) NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index on code for fast lookup
CREATE INDEX IF NOT EXISTS idx_event_scan_codes_code ON public.event_scan_codes(code);
