-- =========================================
-- SPRINT A1 - ORGANIZATION WORKSPACE FOUNDATION
-- =========================================

-- 1. Create organization_members table
CREATE TABLE IF NOT EXISTS public.organization_members (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  display_title varchar(100) NOT NULL DEFAULT 'Member',
  permissions jsonb NOT NULL DEFAULT '{}'::jsonb,
  status varchar(50) NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'inactive')),
  is_owner boolean NOT NULL DEFAULT false,
  joined_at timestamptz,
  last_active_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- Trigger updated_at on organization_members
CREATE TRIGGER set_organization_members_updated_at
BEFORE UPDATE ON public.organization_members
FOR EACH ROW
EXECUTE PROCEDURE public.handle_updated_at();

-- 2. Create organization_invitations table
CREATE TABLE IF NOT EXISTS public.organization_invitations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email varchar(255) NOT NULL,
  display_title varchar(100) NOT NULL DEFAULT 'Member',
  permissions jsonb NOT NULL DEFAULT '{}'::jsonb,
  invited_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  token varchar(255) NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON public.organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_invitations_email ON public.organization_invitations(email);
CREATE INDEX IF NOT EXISTS idx_org_invitations_token ON public.organization_invitations(token);

-- 3. RLS for workspace tables
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow members to view workspace details" ON public.organization_members
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow members to view workspace invitations" ON public.organization_invitations
  FOR SELECT TO authenticated USING (true);

-- 4. OWNER MIGRATION
-- Migrate every existing organization owner to organization_members as Owner
INSERT INTO public.organization_members (
  organization_id,
  user_id,
  display_title,
  permissions,
  status,
  is_owner,
  joined_at
)
SELECT 
  o.id as organization_id,
  o.owner_id as user_id,
  'Owner' as display_title,
  '{
    "workspace": {
      "manage": true,
      "settings": true,
      "members": true
    },
    "events": {
      "create": true,
      "edit": true,
      "delete": true,
      "publish": true
    },
    "attendees": {
      "view": true,
      "export": true,
      "checkin": true
    },
    "analytics": {
      "view": true
    },
    "scanner": {
      "access": true
    },
    "certificates": {
      "manage": true
    },
    "finance": {
      "billing": true,
      "payouts": true
    }
  }'::jsonb as permissions,
  'active' as status,
  true as is_owner,
  o.created_at as joined_at
FROM public.organizations o
ON CONFLICT (organization_id, user_id) DO NOTHING;
