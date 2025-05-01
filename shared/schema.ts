import { pgTable, text, serial, integer, boolean, date, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Food item lists
export const foodItems = pgTable("food_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // "breakfast", "sabzi", "dal", "dinner", "roti"
});

export const insertFoodItemSchema = createInsertSchema(foodItems).pick({
  name: true,
  category: true,
});

// Meal plans for each day
export const mealPlans = pgTable("meal_plans", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  
  // Breakfast
  breakfastId: integer("breakfast_id").references(() => foodItems.id),
  breakfastStatus: integer("breakfast_status"), // 0-4 circles filled
  breakfastGuests: integer("breakfast_guests").default(0),
  breakfastRemarks: text("breakfast_remarks"),
  
  // Lunch
  sabziId: integer("sabzi_id").references(() => foodItems.id),
  dalId: integer("dal_id").references(() => foodItems.id),
  riceEnabled: boolean("rice_enabled").default(false),
  rotiId: integer("roti_id").references(() => foodItems.id),
  rotiCount: integer("roti_count").default(0),
  lunchStatus: integer("lunch_status"), // 0-4 circles filled
  lunchGuests: integer("lunch_guests").default(0),
  lunchRemarks: text("lunch_remarks"),
  
  // Dinner
  dinnerId: integer("dinner_id").references(() => foodItems.id),
  dinnerStatus: integer("dinner_status"), // 0-4 circles filled
  dinnerGuests: integer("dinner_guests").default(0),
  dinnerRemarks: text("dinner_remarks"),
});

export const insertMealPlanSchema = createInsertSchema(mealPlans).omit({
  id: true,
});

export const updateMealPlanSchema = createInsertSchema(mealPlans).omit({
  id: true,
  date: true,
});

// Teethi Days
export const teethiDays = pgTable("teethi_days", {
  id: serial("id").primaryKey(),
  date: date("date").notNull().unique(),
});

export const insertTeethiDaySchema = createInsertSchema(teethiDays).pick({
  date: true,
});

// Types
export type FoodItem = typeof foodItems.$inferSelect;
export type InsertFoodItem = z.infer<typeof insertFoodItemSchema>;

export type MealPlan = typeof mealPlans.$inferSelect;
export type InsertMealPlan = z.infer<typeof insertMealPlanSchema>;
export type UpdateMealPlan = z.infer<typeof updateMealPlanSchema>;

export type TeethiDay = typeof teethiDays.$inferSelect;
export type InsertTeethiDay = z.infer<typeof insertTeethiDaySchema>;
