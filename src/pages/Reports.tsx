import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FolderKanban
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#EF4444'];

const statusLabels: Record<string, string> = {
  planning: 'Planeamento',
  in_progress: 'Em Progresso',
  on_hold: 'Em Pausa',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};

const taskStatusLabels: Record<string, string> = {
  pending: 'Pendente',
  in_progress: 'Em Progresso',
  review: 'Em Revisão',
  completed: 'Concluído',
  blocked: 'Bloqueado',
};

export default function Reports() {
  const { data: projectStats, isLoading: loadingProjects } = useQuery({
    queryKey: ['reports-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('status, budget, created_at');
      
      if (error) throw error;
      
      const byStatus = data?.reduce((acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};
      
      const totalBudget = data?.reduce((acc, p) => acc + (p.budget || 0), 0) || 0;
      
      return {
        total: data?.length || 0,
        byStatus,
        totalBudget,
        chartData: Object.entries(byStatus).map(([status, count]) => ({
          name: statusLabels[status] || status,
          value: count,
        })),
      };
    },
  });

  const { data: taskStats, isLoading: loadingTasks } = useQuery({
    queryKey: ['reports-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('status, priority, due_date, created_at');
      
      if (error) throw error;
      
      const byStatus = data?.reduce((acc, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};
      
      const byPriority = data?.reduce((acc, t) => {
        const label = t.priority === 1 ? 'Baixa' : t.priority === 2 ? 'Média' : t.priority === 3 ? 'Alta' : 'Urgente';
        acc[label] = (acc[label] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};
      
      const overdue = data?.filter(t => {
        if (!t.due_date || t.status === 'completed') return false;
        return new Date(t.due_date) < new Date();
      }).length || 0;
      
      const completed = data?.filter(t => t.status === 'completed').length || 0;
      const completionRate = data?.length ? Math.round((completed / data.length) * 100) : 0;
      
      return {
        total: data?.length || 0,
        byStatus,
        byPriority,
        overdue,
        completed,
        completionRate,
        statusChartData: Object.entries(byStatus).map(([status, count]) => ({
          name: taskStatusLabels[status] || status,
          value: count,
        })),
        priorityChartData: Object.entries(byPriority).map(([priority, count]) => ({
          name: priority,
          count,
        })),
      };
    },
  });

  const { data: teamStats } = useQuery({
    queryKey: ['reports-teams'],
    queryFn: async () => {
      const [teams, members] = await Promise.all([
        supabase.from('teams').select('*', { count: 'exact', head: true }),
        supabase.from('team_members').select('*', { count: 'exact', head: true }),
      ]);
      
      return {
        totalTeams: teams.count || 0,
        totalMembers: members.count || 0,
      };
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  };

  const isLoading = loadingProjects || loadingTasks;
  const hasData = (projectStats?.total || 0) > 0 || (taskStats?.total || 0) > 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-display font-bold">Relatórios</h1>
          <p className="text-muted-foreground mt-1">
            Dashboards macro e micro com visão geral dos projectos
          </p>
        </motion.div>

        {isLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="glass-card">
                  <CardContent className="pt-6">
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Skeleton className="h-80 w-full" />
              <Skeleton className="h-80 w-full" />
            </div>
          </div>
        ) : hasData ? (
          <>
            {/* KPI Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <Card className="glass-card">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FolderKanban className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{projectStats?.total || 0}</p>
                      <p className="text-sm text-muted-foreground">Projectos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-card">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{taskStats?.completionRate || 0}%</p>
                      <p className="text-sm text-muted-foreground">Taxa Conclusão</p>
                    </div>
                  </div>
                  <Progress value={taskStats?.completionRate || 0} className="mt-3 h-2" />
                </CardContent>
              </Card>
              
              <Card className="glass-card">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{taskStats?.overdue || 0}</p>
                      <p className="text-sm text-muted-foreground">Tarefas Atrasadas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-card">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {formatCurrency(projectStats?.totalBudget || 0)}
                      </p>
                      <p className="text-sm text-muted-foreground">Orçamento Total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Charts Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Projects by Status */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5 text-primary" />
                    Projectos por Estado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {projectStats?.chartData && projectStats.chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={projectStats.chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {projectStats.chartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                      Sem dados de projectos
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tasks by Priority */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Tarefas por Prioridade
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {taskStats?.priorityChartData && taskStats.priorityChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={taskStats.priorityChartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="name" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip />
                        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                      Sem dados de tarefas
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Task Status Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Distribuição de Tarefas por Estado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    {Object.entries(taskStats?.byStatus || {}).map(([status, count], index) => (
                      <div
                        key={status}
                        className="text-center p-4 rounded-xl bg-muted/50"
                      >
                        <p className="text-2xl font-bold" style={{ color: COLORS[index % COLORS.length] }}>
                          {count}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {taskStatusLabels[status] || status}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Summary Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <Card className="glass-card border-l-4 border-l-primary">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total de Tarefas</p>
                      <p className="text-3xl font-bold mt-1">{taskStats?.total || 0}</p>
                    </div>
                    <Badge className="bg-primary/10 text-primary">
                      {taskStats?.completed || 0} concluídas
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-card border-l-4 border-l-accent">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Equipas Activas</p>
                      <p className="text-3xl font-bold mt-1">{teamStats?.totalTeams || 0}</p>
                    </div>
                    <Badge className="bg-accent/10 text-accent">
                      {teamStats?.totalMembers || 0} membros
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-card border-l-4 border-l-emerald-500">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Projectos em Progresso</p>
                      <p className="text-3xl font-bold mt-1">
                        {projectStats?.byStatus?.in_progress || 0}
                      </p>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-600">
                      de {projectStats?.total || 0} total
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mb-6">
              <BarChart3 className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Sem Dados para Relatórios</h2>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Os relatórios serão gerados automaticamente quando criar projectos e tarefas.
              Comece por criar um projecto para ver as estatísticas e gráficos.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full">
                <PieChartIcon className="h-4 w-4 text-primary" />
                Gráficos por Estado
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full">
                <BarChart3 className="h-4 w-4 text-accent" />
                Análise de Prioridades
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                Métricas de Desempenho
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
