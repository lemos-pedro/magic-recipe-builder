
-- Fix RLS policies for teams: allow creator to always view and manage their teams
-- even when project_id is NULL

DROP POLICY IF EXISTS "Users can view teams of their projects" ON public.teams;
DROP POLICY IF EXISTS "Project managers can manage teams" ON public.teams;

-- Allow viewing: creator OR member OR project member
CREATE POLICY "Users can view teams" ON public.teams
  FOR SELECT
  USING (
    created_by = auth.uid()
    OR (project_id IS NOT NULL AND can_view_project(project_id))
    OR EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = id AND tm.user_id = auth.uid()
    )
  );

-- Allow full management: creator OR project manager
CREATE POLICY "Users can manage their teams" ON public.teams
  FOR ALL
  USING (
    created_by = auth.uid()
    OR (project_id IS NOT NULL AND can_manage_project(project_id))
  );

-- Fix RLS policies for team_members: allow team creator to manage members
DROP POLICY IF EXISTS "Project managers can manage team members" ON public.team_members;
DROP POLICY IF EXISTS "Users can view team members" ON public.team_members;

-- Allow viewing team members: if user can view the team
CREATE POLICY "Users can view team members" ON public.team_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = team_id
        AND (
          t.created_by = auth.uid()
          OR (t.project_id IS NOT NULL AND can_view_project(t.project_id))
          OR EXISTS (
            SELECT 1 FROM public.team_members tm2
            WHERE tm2.team_id = t.id AND tm2.user_id = auth.uid()
          )
        )
    )
  );

-- Allow managing team members: if user created the team or is a project manager
CREATE POLICY "Users can manage team members" ON public.team_members
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = team_id
        AND (
          t.created_by = auth.uid()
          OR (t.project_id IS NOT NULL AND can_manage_project(t.project_id))
        )
    )
  );
