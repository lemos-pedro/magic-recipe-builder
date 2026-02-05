-- Script de inicialização do banco de dados
-- Use este script para criar as tabelas necessárias

-- Habilitar extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabela de Perfis de Utilizadores
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  display_name varchar(255),
  avatar_url text,
  phone varchar(20),
  department varchar(100),
  bio text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Tabela de Projetos
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name varchar(255) NOT NULL,
  description text,
  status varchar(50) DEFAULT 'active',
  start_date date,
  end_date date,
  location varchar(255),
  color varchar(20),
  template_id uuid,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT projects_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Tabela de Tarefas
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  title varchar(255) NOT NULL,
  description text,
  priority varchar(50) DEFAULT 'medium',
  status varchar(50) DEFAULT 'todo',
  due_date date,
  completed_at timestamp with time zone,
  assignee_id uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT tasks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT tasks_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL
);

-- Tabela de Templates de Projetos
CREATE TABLE IF NOT EXISTS public.project_templates (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name varchar(255) NOT NULL,
  description text,
  color varchar(20),
  icon_name varchar(50),
  phases jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Tabela de Membros de Equipa
CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role varchar(50) DEFAULT 'member',
  joined_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT team_members_unique UNIQUE (project_id, user_id),
  CONSTRAINT team_members_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE,
  CONSTRAINT team_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_team_members_project_id ON public.team_members(project_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);

-- Ativar Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para Profiles
CREATE POLICY "Utilizadores podem ver seu próprio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Utilizadores podem atualizar seu próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Utilizadores podem inserir seu próprio perfil"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Políticas de RLS para Projects
CREATE POLICY "Utilizadores podem ver seus projetos"
  ON public.projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Utilizadores podem criar projetos"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utilizadores podem atualizar seus projetos"
  ON public.projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Utilizadores podem deletar seus projetos"
  ON public.projects FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas de RLS para Tasks
CREATE POLICY "Utilizadores podem ver suas tarefas"
  ON public.tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Utilizadores podem criar tarefas"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utilizadores podem atualizar suas tarefas"
  ON public.tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Utilizadores podem deletar suas tarefas"
  ON public.tasks FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas de RLS para Team Members
CREATE POLICY "Membros de projeto podem ver outros membros"
  ON public.team_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.project_id = team_members.project_id
      AND tm.user_id = auth.uid()
    )
  );

-- Dados de exemplo - Templates padrão
INSERT INTO public.project_templates (name, description, color, icon_name) VALUES
  ('Receita Simples', 'Para receitas básicas e rápidas', '#FF6B6B', 'BookOpen'),
  ('Receita Complexa', 'Para receitas com múltiplas fases', '#4ECDC4', 'Chef'),
  ('Evento Culinário', 'Para planejar eventos gastronómicos', '#FFD93D', 'CalendarEvent'),
  ('Restaurante', 'Para gerir um menu de restaurante', '#6BCB77', 'Store')
ON CONFLICT DO NOTHING;

-- Criar funções auxiliares
CREATE OR REPLACE FUNCTION public.get_user_dashboard_stats(user_id uuid)
RETURNS TABLE (
  total_projects bigint,
  active_projects bigint,
  total_tasks bigint,
  completed_tasks bigint,
  pending_tasks bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT p.id)::bigint,
    COUNT(DISTINCT CASE WHEN p.status = 'active' THEN p.id END)::bigint,
    COUNT(DISTINCT t.id)::bigint,
    COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END)::bigint,
    COUNT(DISTINCT CASE WHEN t.status IN ('todo', 'in_progress') THEN t.id END)::bigint
  FROM public.projects p
  LEFT JOIN public.tasks t ON p.id = t.project_id
  WHERE p.user_id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas as tabelas
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE
  ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE
  ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE
  ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE public.profiles IS 'Perfis de utilizadores com informações pessoais';
COMMENT ON TABLE public.projects IS 'Projetos de receitas e eventos culinários';
COMMENT ON TABLE public.tasks IS 'Tarefas relacionadas aos projetos';
COMMENT ON TABLE public.team_members IS 'Membros da equipa atribuídos aos projetos';
COMMENT ON TABLE public.project_templates IS 'Templates padrão para criação rápida de projetos';

-- Exibir informações sobre o que foi criado
\echo '✅ Tabelas criadas com sucesso!'
\echo '✅ Índices criados para melhor performance'
\echo '✅ Row Level Security (RLS) configurado'
\echo '✅ Dados de exemplo inseridos'
\echo ''
\echo 'Próximos passos:'
\echo '1. Criar utilizadores via Supabase Auth'
\echo '2. Os perfis serão criados automaticamente (trigger)'
\echo '3. Começar a adicionar projetos e tarefas'
