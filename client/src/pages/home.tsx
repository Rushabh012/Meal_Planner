import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/calendar";
import { BottomNavigation } from "@/components/bottomNavigation";
import { MoonIcon, SunIcon, UserIcon } from "lucide-react";
import dayjs from "dayjs";
import { formatDate } from "@/lib/utils";
import { MealPlan } from "@shared/schema";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [, navigate] = useLocation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const dateStr = formatDate(selectedDate);
  
  // Get today's meal plan
  const { data: todaysMeal } = useQuery<MealPlan | null>({
    queryKey: ['/api/meal-plans/date', { date: dateStr }],
  });
  
  // Get teethi days to display in the calendar
  useQuery({
    queryKey: ['/api/teethi-days', { 
      year: selectedDate.getFullYear(), 
      month: selectedDate.getMonth() 
    }],
  });

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    navigate(`/day/${formatDate(date)}`);
  };

  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="min-h-screen pb-20 dark:bg-gray-900 dark:text-white transition-colors">
      <div className="p-4">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Shah's Meal Planner</h1>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={toggleTheme}
            className="rounded-full"
          >
            {theme === "dark" ? (
              <SunIcon className="h-[1.2rem] w-[1.2rem] text-yellow-400" />
            ) : (
              <MoonIcon className="h-[1.2rem] w-[1.2rem]" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>

        <Calendar 
          onSelectDate={handleDateSelect}
          selectedDate={selectedDate}
          showMealIndicators={true}
          showTeethiDays={true}
        />

        <h2 className="text-lg font-semibold mb-3">Today's Meals</h2>
        
        <div className="space-y-4">
          {/* Breakfast Card */}
          <Card className="ios-card">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Breakfast</h3>
                <span className="text-xs text-gray-500">7:30 AM</span>
              </div>
              
              {todaysMeal?.breakfastId ? (
                <div className="flex items-center">
                  <div className="flex flex-1">
                    <p className="text-sm">
                      {/* We'd ideally fetch the name from the foodItems, but for simplicity we'll display the ID */}
                      {todaysMeal.breakfastId ? `Food item #${todaysMeal.breakfastId}` : "No meal planned"}
                    </p>
                  </div>
                  {todaysMeal.breakfastGuests && todaysMeal.breakfastGuests > 0 && (
                    <div className="flex items-center">
                      <span className="text-xs bg-secondary text-white px-2 py-1 rounded-full">
                        {todaysMeal.breakfastGuests} guests
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-500">No breakfast planned</div>
              )}
            </CardContent>
          </Card>

          {/* Lunch Card */}
          <Card className="ios-card">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Lunch</h3>
                <span className="text-xs text-gray-500">1:00 PM</span>
              </div>
              
              {todaysMeal?.sabziId ? (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm">
                      {`Food item #${todaysMeal.sabziId}`}
                    </p>
                    {todaysMeal.lunchGuests && todaysMeal.lunchGuests > 0 && (
                      <span className="text-xs bg-secondary text-white px-2 py-1 rounded-full">
                        {todaysMeal.lunchGuests} guests
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {todaysMeal.dalId && (
                      <>
                        <span className="text-xs text-gray-500">{`Dal #${todaysMeal.dalId}`}</span>
                        <span className="text-xs text-gray-500">•</span>
                      </>
                    )}
                    {todaysMeal.riceEnabled && (
                      <>
                        <span className="text-xs text-gray-500">Rice</span>
                        <span className="text-xs text-gray-500">•</span>
                      </>
                    )}
                    {todaysMeal.rotiId && (
                      <span className="text-xs text-gray-500">
                        {`Roti #${todaysMeal.rotiId} (${todaysMeal.rotiCount})`}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">No lunch planned</div>
              )}
            </CardContent>
          </Card>

          {/* Dinner Card */}
          <Card className="ios-card">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Dinner</h3>
                <span className="text-xs text-gray-500">8:00 PM</span>
              </div>
              
              {todaysMeal?.dinnerId ? (
                <div className="flex items-center">
                  <div className="flex flex-1">
                    <p className="text-sm">
                      {`Food item #${todaysMeal.dinnerId}`}
                    </p>
                  </div>
                  {todaysMeal.dinnerGuests && todaysMeal.dinnerGuests > 0 && (
                    <div className="flex items-center">
                      <span className="text-xs bg-secondary text-white px-2 py-1 rounded-full">
                        {todaysMeal.dinnerGuests} guests
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-500">No dinner planned</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
}
