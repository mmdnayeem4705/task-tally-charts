import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CalendarDays, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { TOTAL_POSSIBLE_POINTS } from '@/types/task';

interface MonthlyProgressProps {
  getMonthlyData: (month: Date) => Array<{ earned: number; total: number }>;
}

export const MonthlyProgress = ({ getMonthlyData }: MonthlyProgressProps) => {
  const now = new Date();
  
  // Get data for last 6 months
  const monthsData = Array.from({ length: 6 }, (_, i) => {
    const monthDate = subMonths(now, 5 - i);
    const data = getMonthlyData(monthDate);
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);
    const daysInMonth = eachDayOfInterval({ start, end }).length;
    
    const totalEarned = data.reduce((sum, d) => sum + d.earned, 0);
    const totalPossible = daysInMonth * TOTAL_POSSIBLE_POINTS;
    const activeDays = data.filter(d => d.earned > 0).length;
    const avgPercentage = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;
    const perfectDays = data.filter(d => d.earned === TOTAL_POSSIBLE_POINTS).length;

    return {
      month: format(monthDate, 'MMM'),
      fullMonth: format(monthDate, 'MMMM yyyy'),
      totalEarned,
      totalPossible,
      avgPercentage,
      activeDays,
      perfectDays,
      daysInMonth,
    };
  });

  const getBarColor = (percentage: number) => {
    if (percentage >= 70) return 'hsl(var(--accent))';
    if (percentage >= 40) return 'hsl(var(--primary))';
    if (percentage > 0) return 'hsl(var(--chart-6))';
    return 'hsl(var(--secondary))';
  };

  const getTrend = (current: number, previous: number) => {
    if (current > previous) return { icon: TrendingUp, color: 'text-accent', label: 'Up' };
    if (current < previous) return { icon: TrendingDown, color: 'text-destructive', label: 'Down' };
    return { icon: Minus, color: 'text-muted-foreground', label: 'Same' };
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">Monthly Progress</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Monthly Bar Chart */}
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `${value}%`}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
                formatter={(value: number) => [`${value}%`, 'Completion Rate']}
                labelFormatter={(_, payload) => {
                  if (payload && payload[0]) {
                    return payload[0].payload.fullMonth;
                  }
                  return '';
                }}
              />
              <Bar dataKey="avgPercentage" radius={[6, 6, 0, 0]}>
                {monthsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.avgPercentage)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Details Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2 font-medium text-muted-foreground">Month</th>
                <th className="text-center py-2 px-2 font-medium text-muted-foreground">Points</th>
                <th className="text-center py-2 px-2 font-medium text-muted-foreground">Rate</th>
                <th className="text-center py-2 px-2 font-medium text-muted-foreground">Active</th>
                <th className="text-center py-2 px-2 font-medium text-muted-foreground">Perfect</th>
                <th className="text-center py-2 px-2 font-medium text-muted-foreground">Trend</th>
              </tr>
            </thead>
            <tbody>
              {monthsData.slice().reverse().map((month, idx) => {
                const prevMonth = monthsData[monthsData.length - 1 - idx - 1];
                const trend = prevMonth
                  ? getTrend(month.avgPercentage, prevMonth.avgPercentage)
                  : { icon: Minus, color: 'text-muted-foreground', label: '-' };

                return (
                  <tr key={month.month} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-2 font-medium">{month.fullMonth}</td>
                    <td className="py-3 px-2 text-center">
                      <span className="font-semibold">{month.totalEarned}</span>
                      <span className="text-muted-foreground text-xs">/{month.totalPossible}</span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: `${getBarColor(month.avgPercentage)}20`,
                          color: getBarColor(month.avgPercentage),
                        }}
                      >
                        {month.avgPercentage}%
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center text-muted-foreground">
                      {month.activeDays}/{month.daysInMonth}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className="text-accent font-medium">{month.perfectDays}</span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <trend.icon className={`w-4 h-4 mx-auto ${trend.color}`} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
