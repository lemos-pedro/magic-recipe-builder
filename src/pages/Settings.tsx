import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  User, 
  CreditCard, 
  Bell, 
  Shield, 
  MessageSquare,
  Video,
  ExternalLink,
  Check,
  Crown,
  Sparkles,
  Settings2,
  RefreshCw,
  AlertCircle,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { STRIPE_PLANS, formatPrice } from '@/lib/stripe-plans';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function Settings() {
  const { user, profile, signOut } = useAuth();
  const { subscribed, plan, subscriptionEnd, isLoading: subLoading, createCheckout, openCustomerPortal, checkSubscription } = useSubscription();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  
  const defaultTab = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Check for success/cancel from Stripe
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success('Subscrição activada com sucesso!');
      checkSubscription();
    } else if (searchParams.get('canceled') === 'true') {
      toast.info('Checkout cancelado.');
    }
  }, [searchParams, checkSubscription]);

  // Profile form
  const [profileForm, setProfileForm] = useState({
    display_name: profile?.display_name || '',
    phone: profile?.phone || '',
    department: profile?.department || '',
  });

  useEffect(() => {
    if (profile) {
      setProfileForm({
        display_name: profile.display_name || '',
        phone: profile.phone || '',
        department: profile.department || '',
      });
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof profileForm) => {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Perfil actualizado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao actualizar perfil: ' + (error as Error).message);
    },
  });

  const handlePlanSelect = async (priceId: string) => {
    try {
      await createCheckout(priceId, 1);
    } catch (error) {
      toast.error('Erro ao iniciar checkout');
    }
  };

  const handleManageSubscription = async () => {
    try {
      await openCustomerPortal();
    } catch (error) {
      toast.error('Erro ao abrir portal de gestão');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-display font-bold">Configurações</h1>
          <p className="text-muted-foreground mt-1">
            Gerir perfil, subscrição, notificações e integrações
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="subscription" className="gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Subscrição</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notificações</span>
            </TabsTrigger>
            <TabsTrigger value="communication" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Comunicação</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid gap-6"
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Informações do Perfil
                  </CardTitle>
                  <CardDescription>
                    Actualize as suas informações pessoais
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xl">
                        {(profile?.display_name || user?.email || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {profile?.display_name || 'Utilizador'}
                      </h3>
                      <p className="text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="display_name">Nome de Exibição</Label>
                      <Input
                        id="display_name"
                        value={profileForm.display_name}
                        onChange={(e) => setProfileForm({ ...profileForm, display_name: e.target.value })}
                        placeholder="O seu nome"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={user?.email || ''}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        placeholder="+244 xxx xxx xxx"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Departamento</Label>
                      <Input
                        id="department"
                        value={profileForm.department}
                        onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                        placeholder="Ex: Engenharia"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => signOut()}>
                      Terminar Sessão
                    </Button>
                    <Button 
                      onClick={() => updateProfileMutation.mutate(profileForm)}
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? 'A guardar...' : 'Guardar Alterações'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Current Plan */}
              {subscribed && plan && (
                <Card className="glass-card border-primary/50">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Crown className="h-5 w-5 text-primary" />
                        Plano Actual
                      </span>
                      <Badge className="bg-primary/10 text-primary">Activo</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold">{plan.name}</h3>
                        <p className="text-muted-foreground">{plan.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          {formatPrice(plan.price)}
                        </p>
                        <p className="text-sm text-muted-foreground">/mês</p>
                      </div>
                    </div>
                    {subscriptionEnd && (
                      <p className="text-sm text-muted-foreground">
                        Próxima renovação: {new Date(subscriptionEnd).toLocaleDateString('pt-AO')}
                      </p>
                    )}
                    <Button variant="outline" onClick={handleManageSubscription} className="gap-2">
                      <Settings2 className="h-4 w-4" />
                      Gerir Subscrição
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Available Plans */}
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  {subscribed ? 'Alterar Plano' : 'Escolha o seu Plano'}
                </h2>
                <div className="grid gap-6 md:grid-cols-3">
                  {Object.values(STRIPE_PLANS).map((planOption) => {
                    const isCurrentPlan = plan?.id === planOption.id;
                    return (
                      <Card 
                        key={planOption.id}
                        className={`glass-card relative ${planOption.popular ? 'border-primary shadow-lg' : ''} ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}
                      >
                        {planOption.popular && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <Badge className="bg-primary text-primary-foreground gap-1">
                              <Sparkles className="h-3 w-3" />
                              Popular
                            </Badge>
                          </div>
                        )}
                        {isCurrentPlan && (
                          <div className="absolute -top-3 right-4">
                            <Badge variant="outline" className="bg-background">
                              Seu Plano
                            </Badge>
                          </div>
                        )}
                        <CardHeader className="pt-6">
                          <CardTitle>{planOption.name}</CardTitle>
                          <CardDescription>{planOption.description}</CardDescription>
                          <div className="pt-4">
                            <span className="text-3xl font-bold">{formatPrice(planOption.price, false)}</span>
                            <span className="text-muted-foreground">/utilizador/mês</span>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <ul className="space-y-2">
                            {planOption.features.map((feature, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                          <Button 
                            className="w-full" 
                            variant={isCurrentPlan ? 'outline' : planOption.popular ? 'default' : 'secondary'}
                            disabled={isCurrentPlan || subLoading}
                            onClick={() => handlePlanSelect(planOption.priceId)}
                          >
                            {isCurrentPlan ? 'Plano Actual' : 'Seleccionar'}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Facturação por Utilizador</AlertTitle>
                <AlertDescription>
                  A factura é calculada automaticamente com base no número de membros 
                  adicionados à sua equipa. Cada novo membro aumenta o valor mensal.
                </AlertDescription>
              </Alert>
            </motion.div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    Preferências de Notificação
                  </CardTitle>
                  <CardDescription>
                    Configure como pretende receber notificações
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { id: 'email_tasks', label: 'Notificações de Tarefas', description: 'Receber emails sobre tarefas atribuídas e actualizações' },
                    { id: 'email_projects', label: 'Actualizações de Projectos', description: 'Ser notificado sobre alterações nos projectos' },
                    { id: 'email_team', label: 'Actividade da Equipa', description: 'Notificações sobre membros e actividades da equipa' },
                    { id: 'email_reports', label: 'Relatórios Semanais', description: 'Receber resumo semanal de actividades' },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2">
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Communication Tab */}
          <TabsContent value="communication">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>Segurança e Privacidade</AlertTitle>
                <AlertDescription>
                  Escolha a opção de comunicação que melhor se adapta às suas necessidades de segurança.
                  Cada opção tem vantagens específicas explicadas abaixo.
                </AlertDescription>
              </Alert>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Internal Chat Option */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      Chat Interno
                    </CardTitle>
                    <CardDescription>
                      Sistema de mensagens integrado na plataforma
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-emerald-600 dark:text-emerald-400">✓ Vantagens</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Dados armazenados localmente</li>
                        <li>• Controlo total sobre as mensagens</li>
                        <li>• Sem dependência de terceiros</li>
                        <li>• Integração directa com projectos</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-amber-600 dark:text-amber-400">⚠ Considerações</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Requer plano Profissional ou superior</li>
                        <li>• Funcionalidades limitadas vs Teams</li>
                      </ul>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-600">Recomendado para Segurança</Badge>
                  </CardContent>
                </Card>

                {/* External Integration Option */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Video className="h-5 w-5 text-blue-600" />
                      Integrações Externas
                    </CardTitle>
                    <CardDescription>
                      Microsoft Teams, Google Meet, Zoom
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-emerald-600 dark:text-emerald-400">✓ Vantagens</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Funcionalidades completas de videochamada</li>
                        <li>• Gravação de reuniões</li>
                        <li>• Partilha de ecrã avançada</li>
                        <li>• Compatível com equipas existentes</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-amber-600 dark:text-amber-400">⚠ Considerações</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Dados em servidores externos</li>
                        <li>• Requer contas nas plataformas</li>
                        <li>• Possíveis custos adicionais</li>
                      </ul>
                    </div>
                    <Badge className="bg-blue-500/10 text-blue-600">Recomendado para Funcionalidades</Badge>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Acções Rápidas</CardTitle>
                  <CardDescription>
                    Configure as suas preferências de comunicação
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Button variant="outline" className="gap-2 h-auto py-4" asChild>
                      <a href="https://teams.microsoft.com" target="_blank" rel="noopener noreferrer">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center">
                            <Video className="h-5 w-5 text-blue-600" />
                          </div>
                          <span>Microsoft Teams</span>
                          <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        </div>
                      </a>
                    </Button>
                    <Button variant="outline" className="gap-2 h-auto py-4" asChild>
                      <a href="https://meet.google.com" target="_blank" rel="noopener noreferrer">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-10 h-10 rounded-lg bg-emerald-600/10 flex items-center justify-center">
                            <Video className="h-5 w-5 text-emerald-600" />
                          </div>
                          <span>Google Meet</span>
                          <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        </div>
                      </a>
                    </Button>
                    <Button variant="outline" className="gap-2 h-auto py-4" asChild>
                      <a href="https://zoom.us" target="_blank" rel="noopener noreferrer">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <Video className="h-5 w-5 text-blue-500" />
                          </div>
                          <span>Zoom</span>
                          <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        </div>
                      </a>
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Activar Chat Interno</p>
                      <p className="text-sm text-muted-foreground">
                        Disponível nos planos Profissional e Enterprise
                      </p>
                    </div>
                    <Switch disabled={!plan || plan.id === 'basic'} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
