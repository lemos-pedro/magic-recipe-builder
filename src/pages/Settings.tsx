import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { Construction } from 'lucide-react';

export default function Settings() {
  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
            <Construction className="w-12 h-12 text-accent" />
          </div>
          <h1 className="text-3xl font-display font-bold mb-4">Configurações</h1>
          <p className="text-muted-foreground max-w-md">
            A página de configurações está em desenvolvimento.
            Em breve poderá personalizar o seu perfil, preferências e integrações.
          </p>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
