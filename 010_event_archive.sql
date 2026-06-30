-- =========================================
-- SPRINT 2 - PLATFORM EVENTS ARCHIVING UPGRADE
-- =========================================

-- Add 'archived' status to public.event_status enum
ALTER TYPE public.event_status ADD VALUE IF NOT EXISTS 'archived';
