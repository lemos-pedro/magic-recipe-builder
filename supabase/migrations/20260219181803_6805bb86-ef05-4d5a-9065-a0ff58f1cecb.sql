
-- Fix infinite recursion: team_members SELECT policy references teams which has SELECT policy referencing team_members
-- Solution: use a security definer function to break the recursion

DROP POLICY IF EXISTS "Users can view team members" ON public.team_members;
DROP POLICY IF EXISTS "Users can manage team members" ON public.team_members;
DROP POLICY IF EXISTS "Users can view teams" ON public.teams;
DROP POLICY IF EXISTS "Users can manage their teams" ON public.teams;

-- Helper function: check if current user created a team (no recursion)
CREATE OR REPLACE FUNCTION public.is_team_creator(_team_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.teams WHERE id = _team_id AND created_by = auth.uid()
  );
$$;

-- Teams: view policy (no reference to team_members to avoid recursion)
CREATE POLICY "Users can view teams" ON public.teams
  FOR SELECT
  USING (
    created_by = auth.uid()
    OR (project_id IS NOT NULL AND can_view_project(project_id))
  );

-- Teams: manage policy
CREATE POLICY "Users can manage their teams" ON public.teams
  FOR ALL
  USING (
    created_by = auth.uid()
    OR (project_id IS NOT NULL AND can_manage_project(project_id))
  );

-- Team members: view (uses security definer function to avoid recursion)
CREATE POLICY "Users can view team members" ON public.team_members
  FOR SELECT
  USING (
    is_team_creator(team_id)
    OR user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = team_id
        AND t.project_id IS NOT NULL
        AND can_view_project(t.project_id)
    )
  );

-- Team members: manage
CREATE POLICY "Users can manage team members" ON public.team_members
  FOR ALL
  USING (
    is_team_creator(team_id)
    OR EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = team_id
        AND t.project_id IS NOT NULL
        AND can_manage_project(t.project_id)
    )
  );
