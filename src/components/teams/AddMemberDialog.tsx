import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const roleOptions = [
  { value: 'member', label: 'Membro' },
  { value: 'manager', label: 'Gestor' },
  { value: 'admin', label: 'Admin' },
] as const;

interface AddMemberDialogProps {
  teamId: string;
  teamName: string;
}

export function AddMemberDialog({ teamId, teamName }: AddMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [role, setRole] = useState<'admin' | 'manager' | 'member'>('member');
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setPosition('');
    setRole('member');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setLoading(true);
    const { error } = await supabase.from('team_members').insert({
      team_id: teamId,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || null,
      position: position.trim() || null,
      role,
      user_id: null,
    } as any);

    if (error) {
      toast.error('Erro ao adicionar membro: ' + error.message);
    } else {
      toast.success(`${name.trim()} adicionado à equipa!`);
      queryClient.invalidateQueries({ queryKey: ['teams-with-members'] });
      queryClient.invalidateQueries({ queryKey: ['teams-stats'] });
      resetForm();
      setOpen(false);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <UserPlus className="h-3.5 w-3.5" />
          Adicionar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Membro — {teamName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="member-name">Nome *</Label>
            <Input id="member-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome completo" required maxLength={100} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="member-email">Email *</Label>
            <Input id="member-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" required maxLength={255} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="member-phone">Telefone</Label>
            <Input id="member-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+244 9XX XXX XXX" maxLength={20} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="member-position">Função / Cargo</Label>
            <Input id="member-position" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Ex: Engenheiro Civil" maxLength={100} />
          </div>
          <div className="space-y-2">
            <Label>Permissão na Equipa</Label>
            <Select value={role} onValueChange={(v) => setRole(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading || !name.trim() || !email.trim()}>{loading ? 'A adicionar...' : 'Adicionar Membro'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
