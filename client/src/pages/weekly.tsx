import { useState, useEffect } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { BottomNavigation } from "@/components/bottomNavigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import dayjs from "dayjs";
import { MealPlan } from "@shared/schema";

export default function Weekly() {
  // Set to the current week's Sunday
  const [startDate, setStartDate] = useState(() => {
    // Create a date object for today
    const today = new Date();
    const day = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    // Go back to the start of the week (Sunday)
    return new Date(today.setDate(today.getDate() - day));
  });

  useEffect(() => {
    console.log("Current date:", formatDate(new Date()));
    console.log("Week start date (Sunday):", formatDate(startDate));
    console.log("Week end date (Saturday):", formatDate(new Date(new Date(startDate).setDate(startDate.getDate() + 6))));
  }, [startDate]);

  // Calculate the dates for the week (7 days)
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    return dayjs(date);
  });

  // Generate array of date strings for the week
  const dateStrings = weekDates.map(date => formatDate(date.toDate()));

  // Use useQueries hook to fetch meal plans for all days in the week simultaneously
  const mealPlanQueries = useQueries({
    queries: dateStrings.map(dateStr => ({
      queryKey: ['/api/meal-plans/date', { date: dateStr }],
      queryFn: async () => {
        const res = await fetch(`/api/meal-plans/date?date=${dateStr}`);
        if (!res.ok) {
          throw new Error('Failed to fetch meal plan');
        }
        return res.json() as Promise<MealPlan | null>;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000 // 10 minutes
    }))
  });
  
  // Check if any of the queries are still loading
  const isLoading = mealPlanQueries.some(query => query.isLoading);

  // Combine weekDates with their corresponding meal plans
  const weeklyMealPlans = weekDates.map((date, index) => ({
    date,
    mealPlan: mealPlanQueries[index].data
  }));

  const goToPreviousWeek = () => {
    setStartDate(prev => dayjs(prev).subtract(7, 'day').toDate());
  };

  const goToNextWeek = () => {
    setStartDate(prev => dayjs(prev).add(7, 'day').toDate());
  };

  // Format day abbreviations
  const formatDay = (date: dayjs.Dayjs) => {
    return date.format('ddd');
  };

  // Format date to display
  const formatDateNumber = (date: dayjs.Dayjs) => {
    return date.format('D');
  };

  // Check if a date is today
  const isToday = (date: dayjs.Dayjs) => {
    return date.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD');
  };

  // Helper to format food item display
  const formatFoodItem = (id: number | null | undefined, prefix: string = '') => {
    if (!id) return 'None';
    return `${prefix}#${id}`;
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">Shah's Meal Planner - Weekly View</h1>
          <div className="flex items-center">
            <button 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              onClick={goToPreviousWeek}
              disabled={isLoading}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-sm mx-2">
              {dayjs(startDate).format('MMM D')} - {dayjs(startDate).add(6, 'day').format('MMM D, YYYY')}
            </span>
            <button 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              onClick={goToNextWeek}
              disabled={isLoading}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {isLoading && (
          <div className="flex justify-center items-center my-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Weekly calendar */}
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Day headers */}
            <div className="grid grid-cols-8 text-center mb-2 border-b pb-2">
              <div className="text-sm font-medium">Meal</div>
              {weekDates.map((date, index) => (
                <div key={index} className={`text-sm font-medium ${isToday(date) ? 'text-primary font-bold' : ''}`}>
                  <div>{formatDay(date)}</div>
                  <div className={`${isToday(date) ? 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center mx-auto' : ''}`}>
                    {formatDateNumber(date)}
                  </div>
                </div>
              ))}
            </div>

            {/* Breakfast Row */}
            <div className="grid grid-cols-8 text-center py-3 border-b">
              <div className="text-sm font-medium flex items-center justify-center">Breakfast</div>
              {weeklyMealPlans.map((day, index) => (
                <div key={index} className={`text-xs p-1 ${isToday(day.date) ? 'bg-primary bg-opacity-25 rounded shadow-sm' : ''}`}>
                  {day.mealPlan?.breakfastId ? (
                    <div>
                      <div className="font-medium">{formatFoodItem(day.mealPlan?.breakfastId)}</div>
                      {day.mealPlan?.breakfastGuests && day.mealPlan?.breakfastGuests > 0 && (
                        <div className={`mt-1 ${isToday(day.date) ? 'text-primary-foreground font-medium' : 'text-gray-500'}`}>
                          {day.mealPlan.breakfastGuests} guests
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={`${isToday(day.date) ? 'text-primary-foreground opacity-70' : 'text-gray-400'}`}>
                      No meal
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Lunch Row */}
            <div className="grid grid-cols-8 text-center py-3 border-b">
              <div className="text-sm font-medium flex items-center justify-center">Lunch</div>
              {weeklyMealPlans.map((day, index) => (
                <div key={index} className={`text-xs p-1 ${isToday(day.date) ? 'bg-primary bg-opacity-25 rounded shadow-sm' : ''}`}>
                  {day.mealPlan?.sabziId ? (
                    <div>
                      <div className="font-medium">{formatFoodItem(day.mealPlan?.sabziId, 'Sabzi ')}</div>
                      <div className={`mt-0.5 ${isToday(day.date) ? 'text-primary-foreground font-medium' : 'text-gray-500'}`}>
                        {day.mealPlan?.dalId && formatFoodItem(day.mealPlan?.dalId, 'Dal ')}
                        {day.mealPlan?.riceEnabled && ' • Rice'}
                        {day.mealPlan?.rotiId && ` • Roti #${day.mealPlan?.rotiId}`}
                      </div>
                      {day.mealPlan?.lunchGuests && day.mealPlan?.lunchGuests > 0 && (
                        <div className={`mt-1 ${isToday(day.date) ? 'text-primary-foreground font-medium' : 'text-gray-500'}`}>
                          {day.mealPlan.lunchGuests} guests
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={`${isToday(day.date) ? 'text-primary-foreground opacity-70' : 'text-gray-400'}`}>
                      No meal
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Dinner Row */}
            <div className="grid grid-cols-8 text-center py-3">
              <div className="text-sm font-medium flex items-center justify-center">Dinner</div>
              {weeklyMealPlans.map((day, index) => (
                <div key={index} className={`text-xs p-1 ${isToday(day.date) ? 'bg-primary bg-opacity-25 rounded shadow-sm' : ''}`}>
                  {day.mealPlan?.dinnerId ? (
                    <div>
                      <div className="font-medium">{formatFoodItem(day.mealPlan?.dinnerId)}</div>
                      {day.mealPlan?.dinnerGuests && day.mealPlan?.dinnerGuests > 0 && (
                        <div className={`mt-1 ${isToday(day.date) ? 'text-primary-foreground font-medium' : 'text-gray-500'}`}>
                          {day.mealPlan.dinnerGuests} guests
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={`${isToday(day.date) ? 'text-primary-foreground opacity-70' : 'text-gray-400'}`}>
                      No meal
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <Card className="mt-6 ios-card">
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">This Week's Overview</h3>
            <p className="text-sm text-gray-600">
              This view shows your meal plan for the entire week. Swipe left or right to navigate between weeks.
            </p>
          </CardContent>
        </Card>
      </div>
      
      <BottomNavigation />
    </div>
  );
}