import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { Package, DollarSign, Users, Wrench, Plus, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { CreateResourceDialog } from '@/components/resources/CreateResourceDialog';

type ResourceWithProject = {
  id: string;
  name: string;
  type: 'financial' | 'material' | 'human';
  quantity: number | null;
  unit: string | null;
  cost_per_unit: number | null;
  notes: string | null;
  project_id: string;
  projects: { name: string } | null;
};

const typeConfig = {
  financial: {
    icon: DollarSign,
    label: 'Financeiro',
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    bgColor: 'bg-emerald-500/10',
  },
  material: {
    icon: Wrench,
    label: 'Material',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
  human: {
    icon: Users,
    label: 'Humano',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    bgColor: 'bg-purple-500/10',
  },
};

export default function Resources() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: resources, isLoading } = useQuery({
    queryKey: ['resources-with-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resources')
        .select(`
          *,
          projects(name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as unknown as ResourceWithProject[];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['resources-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resources')
        .select('type, quantity, cost_per_unit');
      
      if (error) throw error;
      
      const financial = data?.filter(r => r.type === 'financial') || [];
      const material = data?.filter(r => r.type === 'material') || [];
      const human = data?.filter(r => r.type === 'human') || [];
      
      const totalBudget = financial.reduce((acc, r) => acc + ((r.quantity || 0) * (r.cost_per_unit || 1)), 0);
      
      return {
        total: data?.length || 0,
        financial: financial.length,
        material: material.length,
        human: human.length,
        totalBudget,
      };
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
    }).format(value);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-display font-bold">Recursos</h1>
            <p className="text-muted-foreground mt-1">
              Gestão de recursos financeiros, materiais e humanos
            </p>
          </div>
          <Button className="gap-2" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Novo Recurso
          </Button>
        </motion.div>

        {/* Stats Grid */}
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
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.total || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Recursos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.financial || 0}</p>
                  <p className="text-sm text-muted-foreground">Financeiros</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Wrench className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.material || 0}</p>
                  <p className="text-sm text-muted-foreground">Materiais</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.human || 0}</p>
                  <p className="text-sm text-muted-foreground">Humanos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Budget Overview */}
        {stats && stats.totalBudget > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Orçamento Total Alocado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-primary">
                    {formatCurrency(stats.totalBudget)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Resources List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="glass-card">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-6 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : resources && resources.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {/* Group by project */}
            {Object.entries(
              resources.reduce((acc, resource) => {
                const projectName = resource.projects?.name || 'Sem Projecto';
                if (!acc[projectName]) acc[projectName] = [];
                acc[projectName].push(resource);
                return acc;
              }, {} as Record<string, ResourceWithProject[]>)
            ).map(([projectName, projectResources], groupIndex) => (
              <motion.div
                key={projectName}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.1 }}
              >
                <Card className="glass-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>{projectName}</span>
                      <Badge variant="outline">
                        {projectResources.length} recurso{projectResources.length !== 1 ? 's' : ''}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {projectResources.map((resource) => {
                        const config = typeConfig[resource.type];
                        const Icon = config.icon;
                        const totalCost = (resource.quantity || 0) * (resource.cost_per_unit || 0);
                        
                        return (
                          <div
                            key={resource.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg ${config.bgColor} flex items-center justify-center`}>
                                <Icon className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-medium">{resource.name}</p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  {resource.quantity && (
                                    <span>
                                      {resource.quantity} {resource.unit || 'unid.'}
                                    </span>
                                  )}
                                  {resource.cost_per_unit && (
                                    <>
                                      <span>•</span>
                                      <span>{formatCurrency(resource.cost_per_unit)}/unid.</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {totalCost > 0 && (
                                <span className="font-semibold text-primary">
                                  {formatCurrency(totalCost)}
                                </span>
                              )}
                              <Badge className={config.color}>
                                {config.label}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mb-6">
              <Package className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Nenhum Recurso Registado</h2>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Adicione recursos aos seus projectos para acompanhar orçamentos, 
              materiais e pessoas envolvidas.
            </p>
            <Button className="gap-2" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Criar Primeiro Recurso
            </Button>
          </motion.div>
        )}
      </div>

      <CreateResourceDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen} 
      />
    </DashboardLayout>
  );
}
