-- =========================================
-- SPRINT 1.5 - PLATFORM ADMIN PRIVILEGE BOOTSTRAP
-- =========================================

-- 1. Add last_login_at timestamp tracking to public.admin_users
ALTER TABLE public.admin_users 
ADD COLUMN IF NOT EXISTS last_login_at timestamptz;

-- 2. Bootstrap the first profiles entry as super_admin if no admin exists
INSERT INTO public.admin_users (user_id, role, is_active)
SELECT id, 'super_admin', true
FROM public.profiles
ORDER BY created_at ASC
LIMIT 1
ON CONFLICT (user_id) DO NOTHING;
