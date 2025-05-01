import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertFoodItemSchema, 
  insertMealPlanSchema, 
  updateMealPlanSchema,
  insertTeethiDaySchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Log important environment variables for debugging
  console.log('Database URL available:', !!process.env.DATABASE_URL);
  console.log('Current working directory:', process.cwd());
  const httpServer = createServer(app);

  // Food Items Routes
  app.get("/api/food-items", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const items = await storage.getFoodItems(category);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to get food items" });
    }
  });

  app.post("/api/food-items", async (req, res) => {
    try {
      const validatedData = insertFoodItemSchema.parse(req.body);
      const item = await storage.createFoodItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid food item data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create food item" });
      }
    }
  });

  app.put("/api/food-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertFoodItemSchema.partial().parse(req.body);
      const item = await storage.updateFoodItem(id, validatedData);
      
      if (!item) {
        return res.status(404).json({ message: "Food item not found" });
      }
      
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid food item data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update food item" });
      }
    }
  });

  app.delete("/api/food-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteFoodItem(id);
      
      if (!success) {
        return res.status(404).json({ message: "Food item not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete food item" });
    }
  });

  // Meal Plans Routes
  // Special route for today's date
  app.get("/api/meal-plans/date", async (req, res) => {
    try {
      console.log("GET /api/meal-plans/date requested");
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      console.log("Using today's date:", today);
      const plan = await storage.getMealPlanByDate(today);
      
      if (!plan) {
        console.log("No meal plan found for today");
        return res.json(null);
      }
      
      res.json(plan);
    } catch (error) {
      console.error("Error in /api/meal-plans/date:", error);
      res.status(500).json({ message: "Failed to get meal plan" });
    }
  });

  // Route for specific dates
  app.get("/api/meal-plans/:date", async (req, res) => {
    try {
      // Skip if the route is /api/meal-plans/date which is handled above
      if (req.params.date === 'date') {
        return;
      }
      
      const date = req.params.date;
      const plan = await storage.getMealPlanByDate(date);
      
      if (!plan) {
        return res.json(null);
      }
      
      res.json(plan);
    } catch (error) {
      res.status(500).json({ message: "Failed to get meal plan" });
    }
  });

  app.get("/api/meal-plans", async (req, res) => {
    try {
      const year = parseInt(req.query.year as string);
      const month = parseInt(req.query.month as string);
      
      if (isNaN(year) || isNaN(month)) {
        return res.status(400).json({ message: "Year and month are required" });
      }
      
      const plans = await storage.getMealPlansForMonth(year, month);
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Failed to get meal plans" });
    }
  });

  app.post("/api/meal-plans", async (req, res) => {
    try {
      const validatedData = insertMealPlanSchema.parse(req.body);
      const plan = await storage.createMealPlan(validatedData);
      res.status(201).json(plan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid meal plan data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create meal plan" });
      }
    }
  });

  app.put("/api/meal-plans/:date", async (req, res) => {
    try {
      const date = req.params.date;
      const validatedData = updateMealPlanSchema.partial().parse(req.body);
      const plan = await storage.updateMealPlan(date, validatedData);
      
      if (!plan) {
        return res.status(404).json({ message: "Meal plan not found" });
      }
      
      res.json(plan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid meal plan data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update meal plan" });
      }
    }
  });

  // Teethi Days Routes
  app.get("/api/teethi-days", async (req, res) => {
    try {
      const year = parseInt(req.query.year as string);
      const month = parseInt(req.query.month as string);
      
      if (isNaN(year) || isNaN(month)) {
        return res.status(400).json({ message: "Year and month are required" });
      }
      
      const days = await storage.getTeethiDays(year, month);
      res.json(days);
    } catch (error) {
      res.status(500).json({ message: "Failed to get teethi days" });
    }
  });

  app.post("/api/teethi-days", async (req, res) => {
    try {
      const validatedData = insertTeethiDaySchema.parse(req.body);
      const dateString = new Date(validatedData.date).toISOString().split('T')[0];
      const day = await storage.addTeethiDay(dateString);
      res.status(201).json(day);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid teethi day data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to add teethi day" });
      }
    }
  });

  app.delete("/api/teethi-days/:date", async (req, res) => {
    try {
      const date = req.params.date;
      const success = await storage.removeTeethiDay(date);
      
      if (!success) {
        return res.status(404).json({ message: "Teethi day not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove teethi day" });
    }
  });

  return httpServer;
}
