import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: string;
  color: 'primary' | 'secondary' | 'accent';
}

const colorClasses = {
  primary: 'from-primary to-primary-hover',
  secondary: 'from-secondary to-secondary-hover',
  accent: 'from-accent to-[hsl(160,70%,55%)]',
};

export const StatsCard = ({ title, value, icon: Icon, trend, color }: StatsCardProps) => {
  return (
    <Card className="p-6 card-hover border-none shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium mb-2">{title}</p>
          <h3 className="text-3xl font-bold text-foreground mb-1">{value}</h3>
          {trend && (
            <p className="text-xs text-muted-foreground">{trend}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-md`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  );
};
