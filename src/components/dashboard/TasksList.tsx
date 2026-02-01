import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

interface Task {
  id: string;
  title: string;
  project: string;
  dueDate?: string;
  priority: number;
  status: string;
}

interface TasksListProps {
  tasks: Task[];
  title?: string;
  onTaskToggle?: (taskId: string) => void;
}

const priorityColors = {
  1: 'bg-gray-100 text-gray-600',
  2: 'bg-blue-100 text-blue-600',
  3: 'bg-amber-100 text-amber-600',
  4: 'bg-orange-100 text-orange-600',
  5: 'bg-red-100 text-red-600',
};

const priorityLabels = {
  1: 'Baixa',
  2: 'Normal',
  3: 'Média',
  4: 'Alta',
  5: 'Crítica',
};

export function TasksList({ tasks, title = 'Minhas Tarefas', onTaskToggle }: TasksListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card p-6"
    >
      <h3 className="text-lg font-semibold mb-4">{title}</h3>

      <div className="space-y-3">
        {tasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.05 }}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
          >
            <Checkbox
              checked={task.status === 'completed'}
              onCheckedChange={() => onTaskToggle?.(task.id)}
              className="border-muted-foreground data-[state=checked]:bg-accent data-[state=checked]:border-accent"
            />
            
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                {task.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {task.project}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {task.dueDate && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{task.dueDate}</span>
                </div>
              )}
              <Badge className={`text-xs ${priorityColors[task.priority as keyof typeof priorityColors] || priorityColors[1]}`}>
                {priorityLabels[task.priority as keyof typeof priorityLabels] || 'Normal'}
              </Badge>
            </div>
          </motion.div>
        ))}

        {tasks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>Todas as tarefas concluídas!</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
