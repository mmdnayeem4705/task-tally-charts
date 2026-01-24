import { useTaskData } from '@/hooks/useTaskData';
import { TaskList } from '@/components/TaskList';
import { MonthlyBarChart } from '@/components/MonthlyBarChart';
import { TaskPieChart } from '@/components/TaskPieChart';
import { MonthSelector } from '@/components/MonthSelector';
import { StatsCards } from '@/components/StatsCards';
import { MonthlyProgress } from '@/components/MonthlyProgress';
import { Sparkles } from 'lucide-react';

const Index = () => {
  const {
    currentDate,
    setCurrentDate,
    todaysTasks,
    toggleTask,
    earnedPoints,
    totalPoints,
    getMonthlyData,
    getTaskStats,
  } = useTaskData();

  const monthlyData = getMonthlyData(currentDate);
  const taskStats = getTaskStats(currentDate);

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl py-8 px-4 mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-primary/10">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold gradient-text">
              Daily Task Tracker
            </h1>
          </div>
          <p className="text-muted-foreground">
            Track your daily habits and build consistency
          </p>
        </div>

        {/* Month Selector */}
        <div className="mb-6">
          <MonthSelector currentDate={currentDate} onDateChange={setCurrentDate} />
        </div>

        {/* Stats Cards */}
        <div className="mb-6">
          <StatsCards monthlyData={monthlyData} />
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Task List - Left Column */}
          <div className="lg:col-span-5">
            <TaskList
              tasks={todaysTasks}
              onToggle={toggleTask}
              earnedPoints={earnedPoints}
              totalPoints={totalPoints}
              currentDate={currentDate}
            />
          </div>

          {/* Charts - Right Column */}
          <div className="lg:col-span-7 space-y-6">
            <MonthlyBarChart data={monthlyData} />
            <TaskPieChart data={taskStats} />
          </div>
        </div>

        {/* Monthly Progress Section */}
        <div className="mt-6">
          <MonthlyProgress getMonthlyData={getMonthlyData} />
        </div>
      </div>
    </div>
  );
};

export default Index;
