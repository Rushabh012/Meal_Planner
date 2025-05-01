import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, format: string = "YYYY-MM-DD"): string {
  return dayjs(date).format(format);
}

export function getMonthData(year: number, month: number) {
  // Use direct dayjs date creation to avoid timezone issues
  const firstDay = dayjs(new Date(year, month, 1));
  
  // Day of week for first day (0 = Sunday, 6 = Saturday)
  const firstDayOfWeek = firstDay.day();
  
  // Number of days in the month
  const daysInMonth = firstDay.daysInMonth();
  
  // Previous month days to show
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = dayjs(new Date(prevYear, prevMonth, 1)).daysInMonth();
  
  // Calculate days from previous month to display
  const prevMonthDays = Array.from({ length: firstDayOfWeek }, (_, i) => ({
    date: dayjs(new Date(prevYear, prevMonth, daysInPrevMonth - firstDayOfWeek + i + 1)),
    isPrevMonth: true,
    isCurrentMonth: false,
    isNextMonth: false,
  }));
  
  // Current month days
  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => ({
    date: dayjs(new Date(year, month, i + 1)),
    isPrevMonth: false,
    isCurrentMonth: true,
    isNextMonth: false,
  }));
  
  // Next month days to fill the remainder of the grid (6 rows of 7 days = 42 cells)
  const totalDaysToShow = 42; // 6 rows x 7 days
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  const remainingDays = totalDaysToShow - prevMonthDays.length - currentMonthDays.length;
  
  const nextMonthDays = Array.from({ length: remainingDays }, (_, i) => ({
    date: dayjs(new Date(nextYear, nextMonth, i + 1)),
    isPrevMonth: false,
    isCurrentMonth: false,
    isNextMonth: true,
  }));
  
  // Combine all days
  return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
}

export function getDaysOfWeek(): string[] {
  return ["S", "M", "T", "W", "T", "F", "S"];
}

export function isSameDay(date1: Date | string, date2: Date | string): boolean {
  return dayjs(date1).format("YYYY-MM-DD") === dayjs(date2).format("YYYY-MM-DD");
}
