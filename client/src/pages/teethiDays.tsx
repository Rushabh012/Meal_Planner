import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/calendar";
import { BottomNavigation } from "@/components/bottomNavigation";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils";
import dayjs from "dayjs";
import { TeethiDay } from "@shared/schema";

export default function TeethiDays() {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get all teethi days for the current month
  const { data: teethiDays = [] } = useQuery<TeethiDay[]>({
    queryKey: ['/api/teethi-days', { year, month }],
  });

  // Add a teethi day
  const addTeethiDay = useMutation({
    mutationFn: async (date: Date) => {
      return apiRequest('POST', '/api/teethi-days', {
        date,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teethi-days'] });
      toast({
        title: "Success",
        description: "Teethi day added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add teethi day",
        variant: "destructive",
      });
    },
  });

  // Remove a teethi day
  const removeTeethiDay = useMutation({
    mutationFn: async (date: string) => {
      return apiRequest('DELETE', `/api/teethi-days/${date}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teethi-days'] });
      toast({
        title: "Success",
        description: "Teethi day removed successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove teethi day",
        variant: "destructive",
      });
    },
  });

  const handleToggleTeethiDay = (date: Date, isActive: boolean) => {
    const dateStr = formatDate(date);
    
    if (isActive) {
      addTeethiDay.mutate(date);
    } else {
      removeTeethiDay.mutate(dateStr);
    }
  };

  // Sort teethi days by date
  const sortedTeethiDays = [...teethiDays].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  // Get upcoming teethi days (from today onwards)
  const today = new Date();
  const upcomingTeethiDays = sortedTeethiDays.filter(day => 
    new Date(day.date) >= today
  );

  return (
    <div className="min-h-screen pb-20">
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">Shah's Meal Planner - Teethi Days</h1>
          <div className="text-sm text-gray-500">
            {dayjs(currentDate).format('MMMM YYYY')}
          </div>
        </div>

        <Card className="ios-card mb-6">
          <CardContent className="p-4">
            <p className="text-sm text-gray-600 mb-4">
              Mark special Teethi days to highlight them in your calendar. These days will be shown with special indicators.
            </p>

            <Calendar 
              showMealIndicators={false}
              showTeethiDays={true}
              onToggleTeethiDay={handleToggleTeethiDay}
            />
          </CardContent>
        </Card>

        {/* Legend */}
        <Card className="ios-card mb-6">
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">Legend</h3>
            <div className="flex items-center mb-2">
              <div className="w-4 h-4 rounded bg-accent bg-opacity-20 mr-2"></div>
              <span className="text-sm">Teethi Day</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded bg-white border border-gray-200 mr-2"></div>
              <span className="text-sm">Regular Day</span>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Teethi Days */}
        <Card className="ios-card">
          <CardContent className="p-4">
            <h3 className="font-medium mb-3">Upcoming Teethi Days</h3>
            {upcomingTeethiDays.length > 0 ? (
              <div className="space-y-2">
                {upcomingTeethiDays.map((day) => (
                  <div 
                    key={day.id} 
                    className="flex justify-between items-center py-2 border-b border-gray-100"
                  >
                    <span>{dayjs(day.date).format('MMMM D, YYYY')}</span>
                    <Badge 
                      className="bg-accent bg-opacity-20 text-accent"
                    >
                      {dayjs(day.date).format('dddd')}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-gray-500">
                No upcoming teethi days
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <BottomNavigation />
    </div>
  );
}
