import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn, getMonthData, getDaysOfWeek, formatDate, isSameDay } from "@/lib/utils";
import dayjs from "dayjs";
import { MealPlan, TeethiDay } from "@shared/schema";

interface CalendarProps {
  onSelectDate?: (date: Date) => void;
  showMealIndicators?: boolean;
  showTeethiDays?: boolean;
  onToggleTeethiDay?: (date: Date, isActive: boolean) => void;
  selectedDate?: Date;
}

export function Calendar({
  onSelectDate,
  showMealIndicators = true,
  showTeethiDays = false,
  onToggleTeethiDay,
  selectedDate,
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Get meal plans for the current month
  const { data: mealPlans = [] } = useQuery<MealPlan[]>({
    queryKey: ['/api/meal-plans', { year: currentYear, month: currentMonth }],
    enabled: showMealIndicators,
  });

  // Get teethi days for the current month
  const { data: teethiDays = [] } = useQuery<TeethiDay[]>({
    queryKey: ['/api/teethi-days', { year: currentYear, month: currentMonth }],
    enabled: showTeethiDays,
  });

  const daysOfWeek = getDaysOfWeek();
  const calendarDays = getMonthData(currentYear, currentMonth);

  const goToPreviousMonth = () => {
    setCurrentDate(prev => {
      const date = new Date(prev);
      date.setMonth(date.getMonth() - 1);
      return date;
    });
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => {
      const date = new Date(prev);
      date.setMonth(date.getMonth() + 1);
      return date;
    });
  };

  const handleDateClick = (date: dayjs.Dayjs) => {
    if (onSelectDate) {
      onSelectDate(date.toDate());
    } else if (showTeethiDays && onToggleTeethiDay) {
      const dateStr = date.format('YYYY-MM-DD');
      const isTeethiDay = teethiDays.some(d => 
        isSameDay(new Date(d.date), date.toDate())
      );
      onToggleTeethiDay(date.toDate(), !isTeethiDay);
    }
  };

  const hasMealPlan = (date: dayjs.Dayjs) => {
    return mealPlans.some(plan => 
      isSameDay(new Date(plan.date), date.toDate())
    );
  };

  const isTeethiDay = (date: dayjs.Dayjs) => {
    return teethiDays.some(day => 
      isSameDay(new Date(day.date), date.toDate())
    );
  };

  return (
    <div>
      {/* Month Selector */}
      <div className="flex justify-between items-center mb-4">
        <button 
          className="p-2 rounded-full hover:bg-gray-100"
          onClick={goToPreviousMonth}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-semibold">
          {dayjs(currentDate).format('MMMM YYYY')}
        </h2>
        <button 
          className="p-2 rounded-full hover:bg-gray-100"
          onClick={goToNextMonth}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 text-center mb-2">
        {daysOfWeek.map((day, index) => (
          <div key={index} className="text-sm text-gray-500">{day}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-6">
        {calendarDays.map((day, index) => {
          const isSelected = selectedDate && isSameDay(selectedDate, day.date.toDate());
          const hasPlannedMeals = hasMealPlan(day.date);
          const isTeethi = isTeethiDay(day.date);
          
          return (
            <div
              key={index}
              className={cn(
                "calendar-day cursor-pointer",
                day.isPrevMonth || day.isNextMonth ? "opacity-40" : "",
                isSelected ? "selected" : "",
                showTeethiDays && isTeethi ? "teethi" : ""
              )}
              onClick={() => handleDateClick(day.date)}
            >
              <span className="text-sm">{day.date.date()}</span>
              {showMealIndicators && (
                <div className="meal-indicators">
                  <div className={cn("meal-indicator", hasPlannedMeals ? "" : "bg-gray-300")}></div>
                  <div className={cn("meal-indicator", hasPlannedMeals ? "" : "bg-gray-300")}></div>
                  <div className={cn("meal-indicator", hasPlannedMeals ? "" : "bg-gray-300")}></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
