import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        toast.error('Erro ao enviar email', {
          description: error.message,
        });
      } else {
        setSubmitted(true);
        toast.success('Email enviado!', {
          description: 'Verifique o seu email para instruções de recuperação',
        });
      }
    } catch (error) {
      toast.error('Erro', {
        description: 'Ocorreu um erro ao processar o seu pedido',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-display font-bold text-2xl">N</span>
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl">Ngola Suite</h1>
            <p className="text-sm text-muted-foreground">Gestão de Projectos</p>
          </div>
        </Link>

        {/* Header */}
        <div>
          <h2 className="text-3xl font-display font-bold">Recuperar Senha</h2>
          <p className="text-muted-foreground mt-2">
            {submitted
              ? 'Verifique o seu email para as instruções'
              : 'Entre com o seu email para recuperar a senha'}
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 input-focus"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full btn-gold"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                  />
                  A enviar...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Enviar Link
                  <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </Button>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
              <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-foreground font-medium">Email enviado com sucesso!</p>
            <p className="text-sm text-muted-foreground">
              Clique no link no email para redefinir a sua senha.
            </p>
          </div>
        )}

        {/* Back to login */}
        <div className="text-center">
          <Link
            to="/login"
            className="text-accent hover:underline font-medium flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
