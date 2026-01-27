import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3 } from 'lucide-react';

interface DayData {
  date: string;
  fullDate: string;
  earned: number;
  total: number;
}

interface MonthlyBarChartProps {
  data: DayData[];
}

export const MonthlyBarChart = ({ data }: MonthlyBarChartProps) => {
  const getBarColor = (earned: number, total: number) => {
    const percentage = (earned / total) * 100;
    if (percentage >= 80) return 'hsl(var(--accent))';
    if (percentage >= 50) return 'hsl(var(--primary))';
    if (percentage > 0) return 'hsl(var(--chart-6))';
    return 'hsl(var(--secondary))';
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          <CardTitle className="text-base md:text-lg">Daily Progress</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-3 md:p-6 pt-0">
        <div className="h-[180px] md:h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }}
                interval={4}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }}
                domain={[0, 30]}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  fontSize: '12px',
                }}
                labelFormatter={(value, payload) => {
                  if (payload && payload[0]) {
                    return payload[0].payload.fullDate;
                  }
                  return value;
                }}
                formatter={(value: number) => [`${value} points`, 'Earned']}
              />
              <Bar dataKey="earned" radius={[3, 3, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getBarColor(entry.earned, entry.total)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-3 md:gap-4 mt-3 text-[10px] md:text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 md:w-3 md:h-3 rounded bg-accent" />
            <span className="text-muted-foreground">≥80%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 md:w-3 md:h-3 rounded bg-primary" />
            <span className="text-muted-foreground">50-79%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 md:w-3 md:h-3 rounded" style={{ background: 'hsl(var(--chart-6))' }} />
            <span className="text-muted-foreground">&lt;50%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
