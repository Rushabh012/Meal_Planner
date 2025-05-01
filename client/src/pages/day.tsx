import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel 
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MealSelectionCircles } from "@/components/mealSelectionCircles";
import { MealGuestCount } from "@/components/mealGuestCount";
import { BottomNavigation } from "@/components/bottomNavigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import dayjs from "dayjs";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils";
import { FoodItem, MealPlan } from "@shared/schema";

export default function Day({ params }: { params: { date: string } }) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const dateString = params.date;
  const formattedDate = dayjs(dateString).format('MMMM D, YYYY');

  // Form Schema
  const formSchema = z.object({
    breakfastId: z.number().optional().nullable(),
    breakfastStatus: z.number().default(0),
    breakfastGuests: z.number().default(0),
    breakfastRemarks: z.string().optional(),
    
    sabziId: z.number().optional().nullable(),
    dalId: z.number().optional().nullable(),
    riceEnabled: z.boolean().default(false),
    rotiId: z.number().optional().nullable(),
    rotiCount: z.number().default(0),
    lunchStatus: z.number().default(0),
    lunchGuests: z.number().default(0),
    lunchRemarks: z.string().optional(),
    
    dinnerId: z.number().optional().nullable(),
    dinnerStatus: z.number().default(0),
    dinnerGuests: z.number().default(0),
    dinnerRemarks: z.string().optional(),
  });

  type FormValues = z.infer<typeof formSchema>;

  // Get meal plan for this date
  const { data: mealPlan, isLoading } = useQuery<MealPlan | null>({
    queryKey: [`/api/meal-plans/${dateString}`],
  });

  // Get food items for dropdowns
  const { data: breakfastItems = [] } = useQuery<FoodItem[]>({
    queryKey: ['/api/food-items', { category: 'breakfast' }],
  });

  const { data: sabziItems = [] } = useQuery<FoodItem[]>({
    queryKey: ['/api/food-items', { category: 'sabzi' }],
  });

  const { data: dalItems = [] } = useQuery<FoodItem[]>({
    queryKey: ['/api/food-items', { category: 'dal' }],
  });

  const { data: dinnerItems = [] } = useQuery<FoodItem[]>({
    queryKey: ['/api/food-items', { category: 'dinner' }],
  });

  const { data: rotiItems = [] } = useQuery<FoodItem[]>({
    queryKey: ['/api/food-items', { category: 'roti' }],
  });

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      breakfastId: null,
      breakfastStatus: 0,
      breakfastGuests: 0,
      breakfastRemarks: "",
      
      sabziId: null,
      dalId: null,
      riceEnabled: false,
      rotiId: null,
      rotiCount: 0,
      lunchStatus: 0,
      lunchGuests: 0,
      lunchRemarks: "",
      
      dinnerId: null,
      dinnerStatus: 0,
      dinnerGuests: 0,
      dinnerRemarks: "",
    },
  });

  // Update form with meal plan data when it loads
  useEffect(() => {
    if (mealPlan) {
      form.reset({
        breakfastId: mealPlan.breakfastId || null,
        breakfastStatus: mealPlan.breakfastStatus || 0,
        breakfastGuests: mealPlan.breakfastGuests || 0,
        breakfastRemarks: mealPlan.breakfastRemarks || "",
        
        sabziId: mealPlan.sabziId || null,
        dalId: mealPlan.dalId || null,
        riceEnabled: mealPlan.riceEnabled || false,
        rotiId: mealPlan.rotiId || null,
        rotiCount: mealPlan.rotiCount || 0,
        lunchStatus: mealPlan.lunchStatus || 0,
        lunchGuests: mealPlan.lunchGuests || 0,
        lunchRemarks: mealPlan.lunchRemarks || "",
        
        dinnerId: mealPlan.dinnerId || null,
        dinnerStatus: mealPlan.dinnerStatus || 0,
        dinnerGuests: mealPlan.dinnerGuests || 0,
        dinnerRemarks: mealPlan.dinnerRemarks || "",
      });
    }
  }, [mealPlan, form]);

  // Create or update meal plan
  const saveMealPlan = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload = {
        ...values,
        date: new Date(dateString),
      };
      
      if (mealPlan) {
        // Update existing meal plan
        return apiRequest('PUT', `/api/meal-plans/${dateString}`, payload);
      } else {
        // Create new meal plan
        return apiRequest('POST', '/api/meal-plans', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/meal-plans/${dateString}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/meal-plans'] });
      toast({
        title: "Success",
        description: "Meal plan saved successfully",
      });
      navigate("/");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save meal plan",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    saveMealPlan.mutate(values);
  };
  
  const goBack = () => {
    navigate("/");
  };

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="p-4">
        <div className="flex items-center mb-6">
          <button className="mr-4" onClick={goBack}>
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">{formattedDate}</h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* Breakfast Section */}
            <Card className="ios-card mb-4">
              <CardContent className="p-4">
                <h2 className="text-lg font-medium text-primary mb-4">Breakfast</h2>
                
                <FormField
                  control={form.control}
                  name="breakfastId"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel className="block text-sm text-gray-600 mb-1">Select Food</FormLabel>
                      <Select
                        value={field.value?.toString() || ""}
                        onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                      >
                        <FormControl>
                          <SelectTrigger className="ios-input w-full">
                            <SelectValue placeholder="Select breakfast item" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {breakfastItems.map((item) => (
                            <SelectItem key={item.id} value={item.id.toString()}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-between items-center mb-4">
                  <FormField
                    control={form.control}
                    name="breakfastStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block text-sm text-gray-600 mb-1">No. of people</FormLabel>
                        <FormControl>
                          <MealSelectionCircles 
                            value={field.value} 
                            onChange={field.onChange} 
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="breakfastGuests"
                    render={({ field }) => (
                      <FormItem>
                        <MealGuestCount
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="breakfastRemarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-sm text-gray-600 mb-1">Remarks</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add any notes here..."
                          className="ios-input h-20 resize-none"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Lunch Section */}
            <Card className="ios-card mb-4">
              <CardContent className="p-4">
                <h2 className="text-lg font-medium text-primary mb-4">Lunch</h2>
                
                <FormField
                  control={form.control}
                  name="sabziId"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel className="block text-sm text-gray-600 mb-1">Select Sabzi</FormLabel>
                      <Select
                        value={field.value?.toString() || ""}
                        onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                      >
                        <FormControl>
                          <SelectTrigger className="ios-input w-full">
                            <SelectValue placeholder="Select sabzi item" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sabziItems.map((item) => (
                            <SelectItem key={item.id} value={item.id.toString()}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dalId"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel className="block text-sm text-gray-600 mb-1">Select Dal</FormLabel>
                      <Select
                        value={field.value?.toString() || ""}
                        onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                      >
                        <FormControl>
                          <SelectTrigger className="ios-input w-full">
                            <SelectValue placeholder="Select dal item" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {dalItems.map((item) => (
                            <SelectItem key={item.id} value={item.id.toString()}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="riceEnabled"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-sm text-gray-600">Rice</FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="mb-4 flex items-center gap-3">
                  <div className="flex-1">
                    <FormField
                      control={form.control}
                      name="rotiId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="block text-sm text-gray-600 mb-1">Select Roti</FormLabel>
                          <Select
                            value={field.value?.toString() || ""}
                            onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                          >
                            <FormControl>
                              <SelectTrigger className="ios-input w-full">
                                <SelectValue placeholder="Select roti type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {rotiItems.map((item) => (
                                <SelectItem key={item.id} value={item.id.toString()}>
                                  {item.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="rotiCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block text-sm text-gray-600 mb-1">Count</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            className="w-20 py-2 px-3 text-center"
                            min="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex justify-between items-center mb-4">
                  <FormField
                    control={form.control}
                    name="lunchStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block text-sm text-gray-600 mb-1">No. of people</FormLabel>
                        <FormControl>
                          <MealSelectionCircles 
                            value={field.value} 
                            onChange={field.onChange} 
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="lunchGuests"
                    render={({ field }) => (
                      <FormItem>
                        <MealGuestCount
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="lunchRemarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-sm text-gray-600 mb-1">Remarks</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add any notes here..."
                          className="ios-input h-20 resize-none"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Dinner Section */}
            <Card className="ios-card mb-4">
              <CardContent className="p-4">
                <h2 className="text-lg font-medium text-primary mb-4">Dinner</h2>
                
                <FormField
                  control={form.control}
                  name="dinnerId"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel className="block text-sm text-gray-600 mb-1">Select Food</FormLabel>
                      <Select
                        value={field.value?.toString() || ""}
                        onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                      >
                        <FormControl>
                          <SelectTrigger className="ios-input w-full">
                            <SelectValue placeholder="Select dinner item" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {dinnerItems.map((item) => (
                            <SelectItem key={item.id} value={item.id.toString()}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-between items-center mb-4">
                  <FormField
                    control={form.control}
                    name="dinnerStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block text-sm text-gray-600 mb-1">No. of people</FormLabel>
                        <FormControl>
                          <MealSelectionCircles 
                            value={field.value} 
                            onChange={field.onChange} 
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="dinnerGuests"
                    render={({ field }) => (
                      <FormItem>
                        <MealGuestCount
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="dinnerRemarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-sm text-gray-600 mb-1">Remarks</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add any notes here..."
                          className="ios-input h-20 resize-none"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Button 
              type="submit"
              className="w-full bg-primary text-white py-6 rounded-lg font-medium mb-4"
              disabled={saveMealPlan.isPending}
            >
              {saveMealPlan.isPending ? "Saving..." : "Save Day Plan"}
            </Button>
          </form>
        </Form>
      </div>
      
      <BottomNavigation />
    </div>
  );
}
