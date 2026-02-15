
-- Add extra fields to team_members for manually added people
ALTER TABLE public.team_members 
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS position text;

-- Make user_id nullable so we can add non-registered members
ALTER TABLE public.team_members 
  ALTER COLUMN user_id DROP NOT NULL;
