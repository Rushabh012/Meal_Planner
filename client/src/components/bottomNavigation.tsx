import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { HomeIcon, ListChecks, CalendarDays, Calendar } from "lucide-react";
import { motion } from "framer-motion";

export function BottomNavigation() {
  const [location] = useLocation();
  
  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-700 py-2 flex justify-around bg-white dark:bg-gray-800 shadow-lg"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <Link href="/">
        <div className={cn(
          "bottom-nav-item cursor-pointer relative overflow-hidden",
          location === "/" ? "text-primary" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        )}>
          <HomeIcon className="w-6 h-6 mb-0.5" />
          <span className="text-xs">Home</span>
          {location === "/" && (
            <motion.div 
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              layoutId="bottomNavIndicator"
            />
          )}
        </div>
      </Link>
      
      <Link href="/weekly">
        <div className={cn(
          "bottom-nav-item cursor-pointer relative overflow-hidden",
          location === "/weekly" ? "text-primary" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        )}>
          <Calendar className="w-6 h-6 mb-0.5" />
          <span className="text-xs">Weekly</span>
          {location === "/weekly" && (
            <motion.div 
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              layoutId="bottomNavIndicator"
            />
          )}
        </div>
      </Link>
      
      <Link href="/list">
        <div className={cn(
          "bottom-nav-item cursor-pointer relative overflow-hidden",
          location === "/list" ? "text-primary" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        )}>
          <ListChecks className="w-6 h-6 mb-0.5" />
          <span className="text-xs">Lists</span>
          {location === "/list" && (
            <motion.div 
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              layoutId="bottomNavIndicator"
            />
          )}
        </div>
      </Link>
      
      <Link href="/teethi">
        <div className={cn(
          "bottom-nav-item cursor-pointer relative overflow-hidden",
          location === "/teethi" ? "text-primary" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        )}>
          <CalendarDays className="w-6 h-6 mb-0.5" />
          <span className="text-xs">Teethi Days</span>
          {location === "/teethi" && (
            <motion.div 
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              layoutId="bottomNavIndicator"
            />
          )}
        </div>
      </Link>
    </motion.div>
  );
}
