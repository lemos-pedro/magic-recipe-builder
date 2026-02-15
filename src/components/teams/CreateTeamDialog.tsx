import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

export function CreateTeamDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: projects } = useQuery({
    queryKey: ['projects-list'],
    queryFn: async () => {
      const { data, error } = await supabase.from('projects').select('id, name').order('name');
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim()) return;

    setLoading(true);
    const { error } = await supabase.from('teams').insert({
      name: name.trim(),
      description: description.trim() || null,
      project_id: projectId || null,
      created_by: user.id,
    });

    if (error) {
      toast.error('Erro ao criar equipa: ' + error.message);
    } else {
      toast.success('Equipa criada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['teams-with-members'] });
      queryClient.invalidateQueries({ queryKey: ['teams-stats'] });
      setName('');
      setDescription('');
      setProjectId('');
      setOpen(false);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Nova Equipa
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Nova Equipa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="team-name">Nome da Equipa *</Label>
            <Input id="team-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Equipa de Desenvolvimento" required maxLength={100} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="team-desc">Descrição</Label>
            <Textarea id="team-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição da equipa..." maxLength={500} />
          </div>
          <div className="space-y-2">
            <Label>Projecto (opcional)</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar projecto" />
              </SelectTrigger>
              <SelectContent>
                {projects?.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading || !name.trim()}>{loading ? 'A criar...' : 'Criar Equipa'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
