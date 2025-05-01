import { 
  FoodItem, InsertFoodItem, 
  MealPlan, InsertMealPlan, UpdateMealPlan,
  TeethiDay, InsertTeethiDay,
  foodItems, mealPlans, teethiDays
} from "@shared/schema";
import { db } from './db';
import { eq, and, sql } from 'drizzle-orm';

export interface IStorage {
  // Food Items
  getFoodItems(category?: string): Promise<FoodItem[]>;
  getFoodItem(id: number): Promise<FoodItem | undefined>;
  createFoodItem(item: InsertFoodItem): Promise<FoodItem>;
  updateFoodItem(id: number, item: Partial<InsertFoodItem>): Promise<FoodItem | undefined>;
  deleteFoodItem(id: number): Promise<boolean>;
  
  // Meal Plans
  getMealPlanByDate(date: string): Promise<MealPlan | undefined>;
  getMealPlansForMonth(year: number, month: number): Promise<MealPlan[]>;
  createMealPlan(plan: InsertMealPlan): Promise<MealPlan>;
  updateMealPlan(date: string, plan: Partial<UpdateMealPlan>): Promise<MealPlan | undefined>;
  
  // Teethi Days
  getTeethiDays(year: number, month: number): Promise<TeethiDay[]>;
  addTeethiDay(date: string): Promise<TeethiDay>;
  removeTeethiDay(date: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Food Items
  async getFoodItems(category?: string): Promise<FoodItem[]> {
    if (category) {
      return db.select().from(foodItems).where(eq(foodItems.category, category));
    }
    return db.select().from(foodItems);
  }

  async getFoodItem(id: number): Promise<FoodItem | undefined> {
    const result = await db.select().from(foodItems).where(eq(foodItems.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async createFoodItem(item: InsertFoodItem): Promise<FoodItem> {
    const [newItem] = await db.insert(foodItems).values(item).returning();
    return newItem;
  }

  async updateFoodItem(id: number, item: Partial<InsertFoodItem>): Promise<FoodItem | undefined> {
    const [updatedItem] = await db
      .update(foodItems)
      .set(item)
      .where(eq(foodItems.id, id))
      .returning();
    return updatedItem;
  }

  async deleteFoodItem(id: number): Promise<boolean> {
    const result = await db.delete(foodItems).where(eq(foodItems.id, id)).returning();
    return result.length > 0;
  }

  // Meal Plans
  async getMealPlanByDate(date: string): Promise<MealPlan | undefined> {
    const dateObj = new Date(date);
    const dateStr = dateObj.toISOString().split('T')[0];
    
    const result = await db
      .select()
      .from(mealPlans)
      .where(sql`${mealPlans.date}::text = ${dateStr}`);
    
    return result.length > 0 ? result[0] : undefined;
  }

  async getMealPlansForMonth(year: number, month: number): Promise<MealPlan[]> {
    // Create date range for the month
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0); // Last day of month
    
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];
    
    return db
      .select()
      .from(mealPlans)
      .where(
        and(
          sql`${mealPlans.date}::text >= ${startStr}`,
          sql`${mealPlans.date}::text <= ${endStr}`
        )
      );
  }

  async createMealPlan(plan: InsertMealPlan): Promise<MealPlan> {
    // Make sure we have a date string in ISO format
    let dateStr: string;
    if (typeof plan.date === 'string') {
      dateStr = new Date(plan.date).toISOString().split('T')[0];
    } else {
      // Handle unexpected or non-string case
      dateStr = new Date().toISOString().split('T')[0];
    }
    
    const planToInsert = {
      ...plan,
      date: dateStr
    };
    
    const [newPlan] = await db.insert(mealPlans).values(planToInsert).returning();
    return newPlan;
  }

  async updateMealPlan(date: string, plan: Partial<UpdateMealPlan>): Promise<MealPlan | undefined> {
    const dateObj = new Date(date);
    const dateStr = dateObj.toISOString().split('T')[0];
    
    const [updatedPlan] = await db
      .update(mealPlans)
      .set(plan)
      .where(sql`${mealPlans.date}::text = ${dateStr}`)
      .returning();
    
    return updatedPlan;
  }

  // Teethi Days
  async getTeethiDays(year: number, month: number): Promise<TeethiDay[]> {
    // Create date range for the month
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0); // Last day of month
    
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];
    
    return db
      .select()
      .from(teethiDays)
      .where(
        and(
          sql`${teethiDays.date}::text >= ${startStr}`,
          sql`${teethiDays.date}::text <= ${endStr}`
        )
      );
  }

  async addTeethiDay(date: string): Promise<TeethiDay> {
    const dateObj = new Date(date);
    const dateStr = dateObj.toISOString().split('T')[0];
    
    const [newDay] = await db
      .insert(teethiDays)
      .values({ date: dateStr })
      .returning();
    
    return newDay;
  }

  async removeTeethiDay(date: string): Promise<boolean> {
    const dateObj = new Date(date);
    const dateStr = dateObj.toISOString().split('T')[0];
    
    const result = await db
      .delete(teethiDays)
      .where(sql`${teethiDays.date}::text = ${dateStr}`)
      .returning();
    
    return result.length > 0;
  }
}

// Initialize with sample data
async function initializeDatabase() {
  try {
    // Check if food items already exist
    const existingItems = await db.select().from(foodItems);
    
    // If no items exist, add sample data
    if (existingItems.length === 0) {
      console.log('Initializing database with sample data...');
      
      const initialItems: InsertFoodItem[] = [
        { name: "Avocado Toast", category: "breakfast" },
        { name: "Poha", category: "breakfast" },
        { name: "Idli Sambar", category: "breakfast" },
        { name: "Paneer Butter Masala", category: "sabzi" },
        { name: "Aloo Gobi", category: "sabzi" },
        { name: "Bhindi Masala", category: "sabzi" },
        { name: "Dal Tadka", category: "dal" },
        { name: "Dal Makhani", category: "dal" },
        { name: "Moong Dal", category: "dal" },
        { name: "Vegetable Khichdi", category: "dinner" },
        { name: "Pulao", category: "dinner" },
        { name: "Pav Bhaji", category: "dinner" },
        { name: "Plain Roti", category: "roti" },
        { name: "Butter Roti", category: "roti" },
        { name: "Naan", category: "roti" },
      ];
      
      await db.insert(foodItems).values(initialItems);
      console.log('Sample data initialized successfully');
    }
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

// Initialize the database
initializeDatabase();

// Export the database storage instance
export const storage = new DatabaseStorage();
