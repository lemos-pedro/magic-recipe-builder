import { motion } from 'framer-motion';
import { Calendar, Users, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

interface ProjectCardProps {
  name: string;
  description?: string;
  status: string;
  progress: number;
  dueDate?: string;
  location?: string;
  teamMembers?: Array<{ name: string; avatar?: string }>;
  templateColor?: string;
  onClick?: () => void;
  delay?: number;
}

const statusStyles: Record<string, string> = {
  planning: 'badge-planning',
  in_progress: 'badge-in-progress',
  completed: 'badge-completed',
  on_hold: 'badge-on-hold',
  cancelled: 'badge-cancelled',
};

const statusLabels: Record<string, string> = {
  planning: 'Planeamento',
  in_progress: 'Em Progresso',
  completed: 'Concluído',
  on_hold: 'Em Espera',
  cancelled: 'Cancelado',
};

export function ProjectCard({
  name,
  description,
  status,
  progress,
  dueDate,
  location,
  teamMembers = [],
  templateColor = '#F59E0B',
  onClick,
  delay = 0,
}: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="project-card"
      onClick={onClick}
    >
      {/* Color bar */}
      <div
        className="h-1 -mx-5 -mt-5 mb-4 rounded-t-xl"
        style={{ backgroundColor: templateColor }}
      />

      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{name}</h3>
            {description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {description}
              </p>
            )}
          </div>
          <Badge className={`${statusStyles[status] || statusStyles.planning} shrink-0`}>
            {statusLabels[status] || status}
          </Badge>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Meta info */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {dueDate && (
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{dueDate}</span>
            </div>
          )}
          {location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span className="truncate max-w-[100px]">{location}</span>
            </div>
          )}
        </div>

        {/* Team */}
        {teamMembers.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex -space-x-2">
              {teamMembers.slice(0, 4).map((member, i) => (
                <Avatar key={i} className="w-8 h-8 border-2 border-card">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback className="text-xs bg-accent text-accent-foreground">
                    {member.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {teamMembers.length > 4 && (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-card">
                  +{teamMembers.length - 4}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{teamMembers.length}</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
