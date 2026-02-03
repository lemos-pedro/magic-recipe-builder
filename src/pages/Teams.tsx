import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { Users, UserPlus, Building2, Crown, Shield, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

type TeamWithMembers = {
  id: string;
  name: string;
  description: string | null;
  project_id: string | null;
  created_at: string;
  projects: { name: string } | null;
  team_members: {
    id: string;
    role: 'admin' | 'manager' | 'member';
    user_id: string;
    profiles: {
      display_name: string | null;
      email: string;
      avatar_url: string | null;
    } | null;
  }[];
};

const roleIcons = {
  admin: Crown,
  manager: Shield,
  member: User,
};

const roleColors = {
  admin: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  member: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400',
};

const roleLabels = {
  admin: 'Admin',
  manager: 'Gestor',
  member: 'Membro',
};

export default function Teams() {
  const { data: teams, isLoading } = useQuery({
    queryKey: ['teams-with-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          projects(name),
          team_members(
            id,
            role,
            user_id,
            profiles:user_id(display_name, email, avatar_url)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as unknown as TeamWithMembers[];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['teams-stats'],
    queryFn: async () => {
      const [teamsCount, membersCount] = await Promise.all([
        supabase.from('teams').select('*', { count: 'exact', head: true }),
        supabase.from('team_members').select('*', { count: 'exact', head: true }),
      ]);
      
      return {
        totalTeams: teamsCount.count || 0,
        totalMembers: membersCount.count || 0,
      };
    },
  });

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
            <h1 className="text-3xl font-display font-bold">Equipas</h1>
            <p className="text-muted-foreground mt-1">
              Gerir equipas e membros dos projectos
            </p>
          </div>
          <Button className="gap-2" disabled>
            <UserPlus className="h-4 w-4" />
            Nova Equipa
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.totalTeams || 0}</p>
                  <p className="text-sm text-muted-foreground">Equipas Criadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.totalMembers || 0}</p>
                  <p className="text-sm text-muted-foreground">Membros Totais</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Teams List */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <Card key={i} className="glass-card">
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[1, 2, 3].map((j) => (
                      <Skeleton key={j} className="h-12 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : teams && teams.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {teams.map((team, index) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-card hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{team.name}</CardTitle>
                        {team.projects && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Projecto: {team.projects.name}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="bg-primary/5">
                        {team.team_members?.length || 0} membros
                      </Badge>
                    </div>
                    {team.description && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {team.description}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    {team.team_members && team.team_members.length > 0 ? (
                      <div className="space-y-3">
                        {team.team_members.map((member) => {
                          const RoleIcon = roleIcons[member.role];
                          return (
                            <div
                              key={member.id}
                              className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                            >
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={member.profiles?.avatar_url || undefined} />
                                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                    {(member.profiles?.display_name || member.profiles?.email || 'U')
                                      .charAt(0)
                                      .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium">
                                    {member.profiles?.display_name || member.profiles?.email}
                                  </p>
                                  {member.profiles?.display_name && (
                                    <p className="text-xs text-muted-foreground">
                                      {member.profiles.email}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <Badge className={`gap-1 ${roleColors[member.role]}`}>
                                <RoleIcon className="h-3 w-3" />
                                {roleLabels[member.role]}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nenhum membro adicionado
                      </p>
                    )}
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
              <Users className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Nenhuma Equipa Criada</h2>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              As equipas serão criadas automaticamente quando adicionar membros aos seus projectos.
              Comece por criar um projecto para poder formar equipas.
            </p>
            <Button variant="outline" className="gap-2" disabled>
              <UserPlus className="h-4 w-4" />
              Criar Primeira Equipa
            </Button>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
