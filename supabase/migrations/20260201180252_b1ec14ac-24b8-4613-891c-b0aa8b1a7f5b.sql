-- =============================================
-- NGOLA SUITE DATABASE SCHEMA
-- Corporate Project Management Platform
-- =============================================

-- 1. Create app_role enum for role-based access
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'member');

-- 2. Create project_status enum
CREATE TYPE public.project_status AS ENUM ('planning', 'in_progress', 'on_hold', 'completed', 'cancelled');

-- 3. Create task_status enum
CREATE TYPE public.task_status AS ENUM ('pending', 'in_progress', 'review', 'completed', 'blocked');

-- 4. Create resource_type enum
CREATE TYPE public.resource_type AS ENUM ('financial', 'material', 'human');

-- =============================================
-- PROFILES TABLE (User data)
-- =============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =============================================
-- USER ROLES TABLE (Separate from profiles for security)
-- =============================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE (user_id, role)
);

-- =============================================
-- PROJECT TEMPLATES TABLE
-- =============================================
CREATE TABLE public.project_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'folder',
  color TEXT DEFAULT '#F59E0B',
  phases JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =============================================
-- PROJECTS TABLE
-- =============================================
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  template_id UUID REFERENCES public.project_templates(id),
  status project_status DEFAULT 'planning' NOT NULL,
  priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
  start_date DATE,
  end_date DATE,
  budget DECIMAL(15, 2),
  location TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =============================================
-- TEAMS TABLE
-- =============================================
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =============================================
-- TEAM MEMBERS TABLE
-- =============================================
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role DEFAULT 'member' NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE (team_id, user_id)
);

-- =============================================
-- TASKS TABLE
-- =============================================
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status task_status DEFAULT 'pending' NOT NULL,
  priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
  phase TEXT,
  assignee_id UUID REFERENCES auth.users(id),
  dependency_id UUID REFERENCES public.tasks(id),
  due_date DATE,
  estimated_hours DECIMAL(8, 2),
  actual_hours DECIMAL(8, 2),
  custom_fields JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =============================================
-- RESOURCES TABLE
-- =============================================
CREATE TABLE public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  type resource_type NOT NULL,
  quantity DECIMAL(15, 2) DEFAULT 0,
  unit TEXT,
  cost_per_unit DECIMAL(15, 2),
  assigned_to UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =============================================
-- COMMENTS TABLE (for tasks/projects)
-- =============================================
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT check_parent CHECK (project_id IS NOT NULL OR task_id IS NOT NULL)
);

-- =============================================
-- ACTIVITY LOG TABLE
-- =============================================
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =============================================
-- HELPER FUNCTIONS FOR RLS
-- =============================================

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- Check if user is member of a project team
CREATE OR REPLACE FUNCTION public.is_project_member(_project_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.team_members tm
    JOIN public.teams t ON t.id = tm.team_id
    WHERE t.project_id = _project_id
      AND tm.user_id = auth.uid()
  )
$$;

-- Check if user can manage a project (admin, creator, or manager)
CREATE OR REPLACE FUNCTION public.can_manage_project(_project_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.projects 
      WHERE id = _project_id AND created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.team_members tm
      JOIN public.teams t ON t.id = tm.team_id
      WHERE t.project_id = _project_id
        AND tm.user_id = auth.uid()
        AND tm.role IN ('admin', 'manager')
    )
$$;

-- Check if user can view a project
CREATE OR REPLACE FUNCTION public.can_view_project(_project_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.projects 
      WHERE id = _project_id AND created_by = auth.uid()
    )
    OR public.is_project_member(_project_id)
$$;

-- Check if user is assignee of a task
CREATE OR REPLACE FUNCTION public.is_task_assignee(_task_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tasks
    WHERE id = _task_id
      AND assignee_id = auth.uid()
  )
$$;

-- =============================================
-- ENABLE RLS ON ALL TABLES
-- =============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES: PROFILES
-- =============================================
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- =============================================
-- RLS POLICIES: USER ROLES
-- =============================================
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Only admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.is_admin());

-- =============================================
-- RLS POLICIES: PROJECT TEMPLATES
-- =============================================
CREATE POLICY "Everyone can view templates"
  ON public.project_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage templates"
  ON public.project_templates FOR ALL
  TO authenticated
  USING (public.is_admin());

-- =============================================
-- RLS POLICIES: PROJECTS
-- =============================================
CREATE POLICY "Users can view accessible projects"
  ON public.projects FOR SELECT
  TO authenticated
  USING (public.can_view_project(id));

CREATE POLICY "Authenticated users can create projects"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Project managers can update"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (public.can_manage_project(id));

CREATE POLICY "Project managers can delete"
  ON public.projects FOR DELETE
  TO authenticated
  USING (public.can_manage_project(id));

-- =============================================
-- RLS POLICIES: TEAMS
-- =============================================
CREATE POLICY "Users can view teams of their projects"
  ON public.teams FOR SELECT
  TO authenticated
  USING (public.can_view_project(project_id));

CREATE POLICY "Project managers can manage teams"
  ON public.teams FOR ALL
  TO authenticated
  USING (public.can_manage_project(project_id));

-- =============================================
-- RLS POLICIES: TEAM MEMBERS
-- =============================================
CREATE POLICY "Users can view team members"
  ON public.team_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = team_id
      AND public.can_view_project(t.project_id)
    )
  );

CREATE POLICY "Project managers can manage team members"
  ON public.team_members FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = team_id
      AND public.can_manage_project(t.project_id)
    )
  );

-- =============================================
-- RLS POLICIES: TASKS
-- =============================================
CREATE POLICY "Users can view accessible tasks"
  ON public.tasks FOR SELECT
  TO authenticated
  USING (
    public.can_view_project(project_id)
    OR assignee_id = auth.uid()
  );

CREATE POLICY "Project managers can create tasks"
  ON public.tasks FOR INSERT
  TO authenticated
  WITH CHECK (public.can_manage_project(project_id));

CREATE POLICY "Managers and assignees can update tasks"
  ON public.tasks FOR UPDATE
  TO authenticated
  USING (
    public.can_manage_project(project_id)
    OR assignee_id = auth.uid()
  );

CREATE POLICY "Project managers can delete tasks"
  ON public.tasks FOR DELETE
  TO authenticated
  USING (public.can_manage_project(project_id));

-- =============================================
-- RLS POLICIES: RESOURCES
-- =============================================
CREATE POLICY "Users can view project resources"
  ON public.resources FOR SELECT
  TO authenticated
  USING (public.can_view_project(project_id));

CREATE POLICY "Project managers can manage resources"
  ON public.resources FOR ALL
  TO authenticated
  USING (public.can_manage_project(project_id));

-- =============================================
-- RLS POLICIES: COMMENTS
-- =============================================
CREATE POLICY "Users can view comments on accessible items"
  ON public.comments FOR SELECT
  TO authenticated
  USING (
    (project_id IS NOT NULL AND public.can_view_project(project_id))
    OR (task_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.tasks t
      WHERE t.id = task_id
      AND (public.can_view_project(t.project_id) OR t.assignee_id = auth.uid())
    ))
  );

CREATE POLICY "Users can create comments"
  ON public.comments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own comments"
  ON public.comments FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own comments"
  ON public.comments FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

-- =============================================
-- RLS POLICIES: ACTIVITY LOGS
-- =============================================
CREATE POLICY "Users can view activity logs of accessible projects"
  ON public.activity_logs FOR SELECT
  TO authenticated
  USING (
    project_id IS NULL 
    OR public.can_view_project(project_id)
  );

CREATE POLICY "System can insert activity logs"
  ON public.activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =============================================
-- TRIGGERS: Updated at timestamp
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_templates_updated_at
  BEFORE UPDATE ON public.project_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON public.resources
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- TRIGGER: Auto-create profile on signup
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  
  -- Assign default 'member' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'member');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- INSERT DEFAULT TEMPLATES
-- =============================================
INSERT INTO public.project_templates (name, description, icon, color, phases) VALUES
  ('Survey', 'Levantamento e análise de terreno', 'map-pin', '#3B82F6', '["Preparação", "Execução", "Relatório"]'::jsonb),
  ('Negociação', 'Processo de negociação com proprietários', 'handshake', '#10B981', '["Contato Inicial", "Proposta", "Acordo", "Documentação"]'::jsonb),
  ('Licenças', 'Obtenção de licenças e autorizações', 'file-check', '#8B5CF6', '["Solicitação", "Análise", "Aprovação", "Emissão"]'::jsonb),
  ('Construção Civil', 'Obras de infraestrutura civil', 'building', '#F59E0B', '["Fundação", "Estrutura", "Acabamento", "Inspeção"]'::jsonb),
  ('Torres', 'Instalação de torres de telecomunicações', 'radio-tower', '#EF4444', '["Preparação", "Montagem", "Instalação Equipamentos", "Testes"]'::jsonb),
  ('Energia', 'Instalação de sistemas de energia', 'zap', '#06B6D4', '["Projeto", "Instalação", "Comissionamento", "Operação"]'::jsonb);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_projects_created_by ON public.projects(created_by);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX idx_tasks_assignee_id ON public.tasks(assignee_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX idx_resources_project_id ON public.resources(project_id);
CREATE INDEX idx_comments_project_id ON public.comments(project_id);
CREATE INDEX idx_comments_task_id ON public.comments(task_id);
CREATE INDEX idx_activity_logs_project_id ON public.activity_logs(project_id);