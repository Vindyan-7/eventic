-- =========================================================================
-- MIGRATION: ADD TICKET_NUMBER TO EVENT_REGISTRATIONS
-- =========================================================================

-- 1. Add column as nullable initially
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS ticket_number VARCHAR;

-- 2. Create index on ticket_number
CREATE INDEX IF NOT EXISTS idx_event_registrations_ticket_number ON public.event_registrations(ticket_number);

-- 3. Populate existing rows with a calculated ticket number
DO $$
DECLARE
  r RECORD;
  v_org_id uuid;
  v_org_slug text;
  v_prefix text;
  v_year integer;
  v_seq integer;
  v_ticket_number text;
BEGIN
  FOR r IN (
    SELECT id, event_id, created_at 
    FROM public.event_registrations 
    WHERE ticket_number IS NULL 
    ORDER BY created_at ASC
  ) LOOP
    -- Fetch organization details for the event
    SELECT e.organization_id, o.slug
    INTO v_org_id, v_org_slug
    FROM public.events e
    JOIN public.organizations o ON o.id = e.organization_id
    WHERE e.id = r.event_id;

    -- Format the prefix from the slug
    v_prefix := UPPER(REGEXP_REPLACE(v_org_slug, '[^a-zA-Z0-9]', '', 'g'));
    IF v_prefix = '' OR v_prefix IS NULL THEN
      v_prefix := 'ORG';
    END IF;

    -- Extract year
    v_year := EXTRACT(YEAR FROM COALESCE(r.created_at, now()));

    -- Find the next sequence number for this org + year combination
    SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_number FROM '-([0-9]{4})$') AS integer)), 0) + 1
    INTO v_seq
    FROM public.event_registrations er
    JOIN public.events e ON e.id = er.event_id
    WHERE e.organization_id = v_org_id
      AND EXTRACT(YEAR FROM er.created_at) = v_year
      AND er.ticket_number LIKE v_prefix || '-' || v_year || '-%';

    -- Generate ticket number string
    v_ticket_number := v_prefix || '-' || v_year || '-' || LPAD(v_seq::text, 4, '0');

    -- Update row
    UPDATE public.event_registrations
    SET ticket_number = v_ticket_number
    WHERE id = r.id;
  END LOOP;
END;
$$;

-- 4. Set column to NOT NULL and add UNIQUE constraint
ALTER TABLE public.event_registrations ALTER COLUMN ticket_number SET NOT NULL;

ALTER TABLE public.event_registrations DROP CONSTRAINT IF EXISTS event_registrations_ticket_number_key;
ALTER TABLE public.event_registrations ADD CONSTRAINT event_registrations_ticket_number_key UNIQUE (ticket_number);

-- 5. Create Trigger function to auto-generate ticket numbers for new inserts
CREATE OR REPLACE FUNCTION public.tg_generate_ticket_number()
RETURNS TRIGGER AS $$
DECLARE
  v_org_id uuid;
  v_org_slug text;
  v_prefix text;
  v_year integer;
  v_seq integer;
  v_ticket_number text;
  v_lock_key bigint;
BEGIN
  -- Fetch organization details for the event
  SELECT e.organization_id, o.slug
  INTO v_org_id, v_org_slug
  FROM public.events e
  JOIN public.organizations o ON o.id = e.organization_id
  WHERE e.id = NEW.event_id;

  -- Clean slug to form organization prefix
  v_prefix := UPPER(REGEXP_REPLACE(v_org_slug, '[^a-zA-Z0-9]', '', 'g'));
  IF v_prefix = '' OR v_prefix IS NULL THEN
    v_prefix := 'ORG';
  END IF;

  -- Get year of registration
  v_year := EXTRACT(YEAR FROM COALESCE(NEW.created_at, now()));

  -- Lock transaction scope per (org, year) to ensure serial sequence generation
  -- using a hash of the org UUID and year.
  v_lock_key := ('x' || substring(md5(v_org_id::text || v_year::text) from 1 for 15))::bit(60)::bigint;
  PERFORM pg_advisory_xact_lock(v_lock_key);

  -- Determine next sequence increment
  SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_number FROM '-([0-9]{4})$') AS integer)), 0) + 1
  INTO v_seq
  FROM public.event_registrations er
  JOIN public.events e ON e.id = er.event_id
  WHERE e.organization_id = v_org_id
    AND EXTRACT(YEAR FROM er.created_at) = v_year
    AND er.ticket_number LIKE v_prefix || '-' || v_year || '-%';

  -- Build ticket number
  v_ticket_number := v_prefix || '-' || v_year || '-' || LPAD(v_seq::text, 4, '0');

  -- Assign back to column
  NEW.ticket_number := v_ticket_number;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Attach trigger
DROP TRIGGER IF EXISTS trg_generate_ticket_number ON public.event_registrations;
CREATE TRIGGER trg_generate_ticket_number
BEFORE INSERT ON public.event_registrations
FOR EACH ROW
EXECUTE FUNCTION public.tg_generate_ticket_number();
