import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, addDays, subDays, isToday, isFuture } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

interface DateNavigatorProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export const DateNavigator = ({ currentDate, onDateChange }: DateNavigatorProps) => {
  const handlePrevDay = () => {
    onDateChange(subDays(currentDate, 1));
  };

  const handleNextDay = () => {
    const nextDay = addDays(currentDate, 1);
    if (!isFuture(nextDay)) {
      onDateChange(nextDay);
    }
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const canGoNext = !isToday(currentDate) && !isFuture(addDays(currentDate, 1));
  const isTodaySelected = isToday(currentDate);

  return (
    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
      <Button
        variant="outline"
        size="icon"
        onClick={handlePrevDay}
        className="h-7 w-7 sm:h-8 sm:w-8"
      >
        <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm font-medium">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            {format(currentDate, 'MMM d, yyyy')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <CalendarComponent
            mode="single"
            selected={currentDate}
            onSelect={(date) => date && onDateChange(date)}
            disabled={(date) => isFuture(date)}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <Button
        variant="outline"
        size="icon"
        onClick={handleNextDay}
        disabled={!canGoNext}
        className="h-7 w-7 sm:h-8 sm:w-8"
      >
        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
      </Button>

      {!isTodaySelected && (
        <Button
          variant="secondary"
          size="sm"
          onClick={handleToday}
          className="h-7 sm:h-8 text-[10px] sm:text-xs px-2"
        >
          Today
        </Button>
      )}
    </div>
  );
};
