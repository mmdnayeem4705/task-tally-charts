import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PieChartIcon } from 'lucide-react';

interface TaskStat {
  name: string;
  completions: number;
  percentage: number;
}

interface TaskPieChartProps {
  data: TaskStat[];
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-6))',
  'hsl(38, 70%, 60%)',
  'hsl(160, 40%, 55%)',
  'hsl(220, 50%, 65%)',
  'hsl(280, 45%, 65%)',
  'hsl(340, 55%, 60%)',
  'hsl(25, 75%, 58%)',
  'hsl(180, 50%, 50%)',
];

export const TaskPieChart = ({ data }: TaskPieChartProps) => {
  const filteredData = data.filter(d => d.completions > 0);

  if (filteredData.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            <CardTitle className="text-base md:text-lg">Task Completion Rate</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px] md:h-[300px]">
          <p className="text-muted-foreground text-sm">No data yet this month</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <PieChartIcon className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          <CardTitle className="text-base md:text-lg">Task Completion Rate</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-3 md:p-6 pt-0">
        <div className="h-[220px] md:h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={filteredData}
                cx="50%"
                cy="45%"
                innerRadius={35}
                outerRadius={65}
                paddingAngle={2}
                dataKey="completions"
              >
                {filteredData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  fontSize: '12px',
                }}
                formatter={(value: number, name: string) => [
                  `${value} days (${filteredData.find(d => d.name === name)?.percentage}%)`,
                  name,
                ]}
              />
              <Legend
                layout="horizontal"
                align="center"
                verticalAlign="bottom"
                wrapperStyle={{ fontSize: '9px', paddingTop: '8px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
