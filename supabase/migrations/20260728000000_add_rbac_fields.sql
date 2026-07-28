-- Migration: Add RBAC fields (permissions, status) and support super_admin role

-- Drop existing role constraint if it exists (automatically named profiles_role_check)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add updated check constraint to allow 'super_admin' role
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin', 'super_admin'));

-- Add permissions column (array of strings) if not exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS permissions TEXT[] DEFAULT '{}';

-- Add status column (active/inactive) with check constraint if not exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive'));

-- Designate umarfarookj06@gmail.com as the initial super_admin
UPDATE public.profiles SET role = 'super_admin' WHERE email = 'umarfarookj06@gmail.com';
