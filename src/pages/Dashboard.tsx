import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FolderKanban,
  ListTodo,
  Users,
  TrendingUp,
  Plus,
  Search,
  Bell,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { TasksList } from '@/components/dashboard/TasksList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export default function Dashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    projects: 0,
    tasks: 0,
    teams: 0,
    progress: 0,
  });
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*, project_templates(*)')
        .order('created_at', { ascending: false })
        .limit(6);

      // Fetch tasks
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*, projects(name)')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch counts
      const { count: projectCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true });

      const { count: taskCount } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true });

      const { count: teamCount } = await supabase
        .from('teams')
        .select('*', { count: 'exact', head: true });

      setStats({
        projects: projectCount || 0,
        tasks: taskCount || 0,
        teams: teamCount || 0,
        progress: 75,
      });

      setProjects(projectsData || []);
      setTasks(
        (tasksData || []).map((t: any) => ({
          id: t.id,
          title: t.title,
          project: t.projects?.name || 'Sem projecto',
          dueDate: t.due_date ? new Date(t.due_date).toLocaleDateString('pt-AO') : undefined,
          priority: t.priority,
          status: t.status,
        }))
      );
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const activities = [
    {
      id: '1',
      user: { name: 'João Baptista' },
      action: 'completou a tarefa',
      target: 'Survey Site #45',
      time: 'Há 5 minutos',
    },
    {
      id: '2',
      user: { name: 'Maria Silva' },
      action: 'adicionou comentário em',
      target: 'Projecto Luanda Norte',
      time: 'Há 15 minutos',
    },
    {
      id: '3',
      user: { name: 'Pedro Santos' },
      action: 'actualizou o status de',
      target: 'Torre #12',
      time: 'Há 1 hora',
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-display font-bold"
          >
            {getGreeting()}, {profile?.display_name?.split(' ')[0] || 'Utilizador'}!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground mt-1"
          >
            Aqui está o resumo dos seus projectos
          </motion.p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar..."
              className="pl-9 w-64 input-focus"
            />
          </div>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
          </Button>
          <Button className="btn-gold gap-2">
            <Plus className="w-4 h-4" />
            Novo Projecto
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Projectos Activos"
          value={stats.projects}
          change="+2 esta semana"
          changeType="positive"
          icon={FolderKanban}
          iconColor="bg-blue-500"
          delay={0}
        />
        <StatCard
          title="Tarefas Pendentes"
          value={stats.tasks}
          change="5 para hoje"
          changeType="neutral"
          icon={ListTodo}
          iconColor="bg-amber-500"
          delay={0.1}
        />
        <StatCard
          title="Membros da Equipa"
          value={stats.teams}
          changeType="neutral"
          icon={Users}
          iconColor="bg-green-500"
          delay={0.2}
        />
        <StatCard
          title="Progresso Geral"
          value={`${stats.progress}%`}
          change="+5% vs mês anterior"
          changeType="positive"
          icon={TrendingUp}
          iconColor="bg-purple-500"
          delay={0.3}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-semibold">Projectos Recentes</h2>
            <Button variant="ghost" className="text-accent">
              Ver todos
            </Button>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="glass-card p-5 h-48 animate-pulse bg-muted" />
              ))}
            </div>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((project, i) => (
                <ProjectCard
                  key={project.id}
                  name={project.name}
                  description={project.description}
                  status={project.status}
                  progress={Math.floor(Math.random() * 100)}
                  dueDate={project.end_date ? new Date(project.end_date).toLocaleDateString('pt-AO') : undefined}
                  location={project.location}
                  templateColor={project.project_templates?.color}
                  teamMembers={[{ name: 'J' }, { name: 'M' }]}
                  delay={0.1 + i * 0.05}
                />
              ))}
            </div>
          ) : (
            <div className="glass-card p-12 text-center">
              <FolderKanban className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Sem projectos</h3>
              <p className="text-muted-foreground mb-4">
                Comece criando o seu primeiro projecto
              </p>
              <Button className="btn-gold">
                <Plus className="w-4 h-4 mr-2" />
                Criar Projecto
              </Button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <TasksList tasks={tasks} />
          <RecentActivity activities={activities} />
        </div>
      </div>
    </DashboardLayout>
  );
}
