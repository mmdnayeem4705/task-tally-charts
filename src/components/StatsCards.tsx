import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Flame, Target, TrendingUp } from 'lucide-react';
import { TOTAL_POSSIBLE_POINTS } from '@/types/task';

interface StatsCardsProps {
  monthlyData: Array<{ earned: number; total: number }>;
}

export const StatsCards = ({ monthlyData }: StatsCardsProps) => {
  const totalEarned = monthlyData.reduce((sum, d) => sum + d.earned, 0);
  const totalPossible = monthlyData.length * TOTAL_POSSIBLE_POINTS;
  const avgPercentage = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;
  
  const perfectDays = monthlyData.filter(d => d.earned === TOTAL_POSSIBLE_POINTS).length;
  const activeDays = monthlyData.filter(d => d.earned > 0).length;
  
  // Calculate streak (consecutive days with at least 50% completion)
  let currentStreak = 0;
  for (let i = monthlyData.length - 1; i >= 0; i--) {
    if (monthlyData[i].earned >= TOTAL_POSSIBLE_POINTS * 0.5) {
      currentStreak++;
    } else if (monthlyData[i].earned > 0) {
      break;
    }
  }

  const stats = [
    {
      label: 'Total Points',
      value: totalEarned,
      icon: Trophy,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Avg Completion',
      value: `${avgPercentage}%`,
      icon: TrendingUp,
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
    {
      label: 'Perfect Days',
      value: perfectDays,
      icon: Target,
      color: 'text-chart-3',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Active Days',
      value: activeDays,
      icon: Flame,
      color: 'text-chart-6',
      bg: 'bg-orange-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
