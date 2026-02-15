import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { Users, Building2, Crown, Shield, User, Phone, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { CreateTeamDialog } from '@/components/teams/CreateTeamDialog';
import { AddMemberDialog } from '@/components/teams/AddMemberDialog';

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
    user_id: string | null;
    name: string | null;
    email: string | null;
    phone: string | null;
    position: string | null;
    profiles: {
      display_name: string | null;
      email: string;
      avatar_url: string | null;
    } | null;
  }[];
};

const roleIcons = { admin: Crown, manager: Shield, member: User };
const roleColors = {
  admin: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  member: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400',
};
const roleLabels = { admin: 'Admin', manager: 'Gestor', member: 'Membro' };

function getMemberDisplay(member: TeamWithMembers['team_members'][0]) {
  const displayName = member.name || member.profiles?.display_name || member.email || member.profiles?.email || 'Sem nome';
  const displayEmail = member.email || member.profiles?.email || '';
  const avatarUrl = member.profiles?.avatar_url || undefined;
  return { displayName, displayEmail, avatarUrl };
}

export default function Teams() {
  const { data: teams, isLoading } = useQuery({
    queryKey: ['teams-with-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select(`*, projects(name), team_members(id, role, user_id, name, email, phone, position, profiles:user_id(display_name, email, avatar_url))`)
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
      return { totalTeams: teamsCount.count || 0, totalMembers: membersCount.count || 0 };
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Equipas</h1>
            <p className="text-muted-foreground mt-1">Gerir equipas e membros dos projectos</p>
          </div>
          <CreateTeamDialog />
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
                <CardContent><div className="space-y-3">{[1, 2, 3].map((j) => <Skeleton key={j} className="h-12 w-full" />)}</div></CardContent>
              </Card>
            ))}
          </div>
        ) : teams && teams.length > 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {teams.map((team, index) => (
              <motion.div key={team.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <Card className="glass-card hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{team.name}</CardTitle>
                        {team.projects && <p className="text-sm text-muted-foreground mt-1">Projecto: {team.projects.name}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-primary/5">{team.team_members?.length || 0} membros</Badge>
                        <AddMemberDialog teamId={team.id} teamName={team.name} />
                      </div>
                    </div>
                    {team.description && <p className="text-sm text-muted-foreground mt-2">{team.description}</p>}
                  </CardHeader>
                  <CardContent>
                    {team.team_members && team.team_members.length > 0 ? (
                      <div className="space-y-3">
                        {team.team_members.map((member) => {
                          const RoleIcon = roleIcons[member.role];
                          const { displayName, displayEmail, avatarUrl } = getMemberDisplay(member);
                          return (
                            <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                              <div className="flex items-center gap-3 min-w-0">
                                <Avatar className="h-9 w-9 shrink-0">
                                  <AvatarImage src={avatarUrl} />
                                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                    {displayName.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium truncate">{displayName}</p>
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    {displayEmail && <span className="truncate">{displayEmail}</span>}
                                    {member.phone && (
                                      <span className="flex items-center gap-1 shrink-0">
                                        <Phone className="h-3 w-3" />
                                        {member.phone}
                                      </span>
                                    )}
                                  </div>
                                  {member.position && (
                                    <span className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                      <Briefcase className="h-3 w-3" />
                                      {member.position}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Badge className={`gap-1 shrink-0 ml-2 ${roleColors[member.role]}`}>
                                <RoleIcon className="h-3 w-3" />
                                {roleLabels[member.role]}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">Nenhum membro adicionado</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="flex flex-col items-center justify-center py-16">
            <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mb-6">
              <Users className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Nenhuma Equipa Criada</h2>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Comece por criar uma equipa e adicione membros com nome, email, telefone e cargo.
            </p>
            <CreateTeamDialog />
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
