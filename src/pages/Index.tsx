import { useTaskDataSupabase } from '@/hooks/useTaskDataSupabase';
import { useAuth } from '@/hooks/useAuth';
import { TaskList } from '@/components/TaskList';
import { MonthlyBarChart } from '@/components/MonthlyBarChart';
import { TaskPieChart } from '@/components/TaskPieChart';
import { MonthSelector } from '@/components/MonthSelector';
import { StatsCards } from '@/components/StatsCards';
import { MonthlyProgress } from '@/components/MonthlyProgress';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Sparkles, LogOut, User } from 'lucide-react';

const Index = () => {
  const { user, signOut } = useAuth();
  const {
    currentDate,
    setCurrentDate,
    todaysTasks,
    toggleTask,
    editTask,
    earnedPoints,
    totalPoints,
    getMonthlyData,
    getTaskStats,
    loading,
  } = useTaskDataSupabase();

  const monthlyData = getMonthlyData(currentDate);
  const taskStats = getTaskStats(currentDate);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl py-4 md:py-8 px-3 md:px-4 mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </div>
              <h1 className="text-2xl md:text-4xl font-bold gradient-text">
                Daily Task Tracker
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-lg">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline truncate max-w-[150px]">{user?.email}</span>
              </div>
              <ThemeToggle />
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground text-sm md:text-base">
            Track your daily habits and build consistency
          </p>
        </div>

        {/* Month Selector */}
        <div className="mb-4 md:mb-6">
          <MonthSelector currentDate={currentDate} onDateChange={setCurrentDate} />
        </div>

        {/* Stats Cards */}
        <div className="mb-4 md:mb-6">
          <StatsCards monthlyData={monthlyData} />
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-12 gap-4 md:gap-6">
          {/* Task List - Left Column */}
          <div className="lg:col-span-5">
            <TaskList
              tasks={todaysTasks}
              onToggle={toggleTask}
              onEditTask={editTask}
              earnedPoints={earnedPoints}
              totalPoints={totalPoints}
              currentDate={currentDate}
              onDateChange={setCurrentDate}
            />
          </div>

          {/* Charts - Right Column */}
          <div className="lg:col-span-7 space-y-4 md:space-y-6">
            <MonthlyBarChart data={monthlyData} />
            <TaskPieChart data={taskStats} />
          </div>
        </div>

        {/* Monthly Progress Section */}
        <div className="mt-4 md:mt-6">
          <MonthlyProgress getMonthlyData={getMonthlyData} />
        </div>
      </div>
    </div>
  );
};

export default Index;
