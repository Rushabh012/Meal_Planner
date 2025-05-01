import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BottomNavigation } from "@/components/bottomNavigation";
import { useToast } from "@/hooks/use-toast";
import { PlusIcon, Pencil } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { FoodItem } from "@shared/schema";

type FoodCategory = 'breakfast' | 'sabzi' | 'dal' | 'dinner' | 'roti';

export default function List() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory>('breakfast');
  const [newItemName, setNewItemName] = useState("");
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  
  // Get food items for the selected category
  const { data: foodItems = [] } = useQuery<FoodItem[]>({
    queryKey: ['/api/food-items', { category: selectedCategory }],
  });

  // Add a new food item
  const addFoodItem = useMutation({
    mutationFn: async (name: string) => {
      return apiRequest('POST', '/api/food-items', {
        name,
        category: selectedCategory,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/food-items', { category: selectedCategory }] });
      setNewItemName("");
      toast({
        title: "Success",
        description: "Food item added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add food item",
        variant: "destructive",
      });
    },
  });

  // Update a food item
  const updateFoodItem = useMutation({
    mutationFn: async (item: FoodItem) => {
      return apiRequest('PUT', `/api/food-items/${item.id}`, {
        name: item.name,
        category: item.category,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/food-items', { category: selectedCategory }] });
      setEditingItem(null);
      toast({
        title: "Success",
        description: "Food item updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update food item",
        variant: "destructive",
      });
    },
  });

  // Delete a food item
  const deleteFoodItem = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/food-items/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/food-items', { category: selectedCategory }] });
      toast({
        title: "Success",
        description: "Food item deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete food item",
        variant: "destructive",
      });
    },
  });

  const handleAddItem = () => {
    if (newItemName.trim()) {
      addFoodItem.mutate(newItemName.trim());
    }
  };

  const handleEditItem = (item: FoodItem) => {
    setEditingItem(item);
  };

  const handleSaveEdit = () => {
    if (editingItem && editingItem.name.trim()) {
      updateFoodItem.mutate(editingItem);
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  const handleDeleteItem = (id: number) => {
    if (confirm("Are you sure you want to delete this item?")) {
      deleteFoodItem.mutate(id);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">Shah's Meal Planner - Food Lists</h1>
        </div>

        {/* List Category Tabs */}
        <Tabs defaultValue={selectedCategory} onValueChange={(value) => setSelectedCategory(value as FoodCategory)}>
          <div className="flex overflow-x-auto pb-2 mb-4 -mx-4 px-4">
            <TabsList className="flex">
              <TabsTrigger 
                className="whitespace-nowrap px-4 py-2 mr-2 rounded-lg" 
                value="breakfast"
              >
                Breakfast
              </TabsTrigger>
              <TabsTrigger 
                className="whitespace-nowrap px-4 py-2 mr-2 rounded-lg" 
                value="sabzi"
              >
                Sabzi
              </TabsTrigger>
              <TabsTrigger 
                className="whitespace-nowrap px-4 py-2 mr-2 rounded-lg" 
                value="dal"
              >
                Dal
              </TabsTrigger>
              <TabsTrigger 
                className="whitespace-nowrap px-4 py-2 mr-2 rounded-lg" 
                value="dinner"
              >
                Dinner
              </TabsTrigger>
              <TabsTrigger 
                className="whitespace-nowrap px-4 py-2 mr-2 rounded-lg" 
                value="roti"
              >
                Roti
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content */}
          <TabsContent value={selectedCategory} className="mt-0">
            <Card className="ios-card">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium capitalize">{selectedCategory} Items</h2>
                  <p className="text-xs text-gray-500">{foodItems.length} items</p>
                </div>

                {/* Food Item List */}
                <div className="space-y-3">
                  {foodItems.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex justify-between items-center py-2 border-b border-gray-100"
                    >
                      {editingItem && editingItem.id === item.id ? (
                        <div className="flex-1 flex items-center gap-2">
                          <Input 
                            value={editingItem.name}
                            onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                            className="flex-1"
                          />
                          <Button 
                            size="sm" 
                            onClick={handleSaveEdit}
                            disabled={updateFoodItem.isPending}
                          >
                            Save
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                            <span>{item.name}</span>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              className="text-gray-500"
                              onClick={() => handleEditItem(item)}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button 
                              className="text-red-500"
                              onClick={() => handleDeleteItem(item.id)}
                            >
                              &times;
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}

                  {foodItems.length === 0 && (
                    <div className="py-4 text-center text-gray-500">
                      No items in this category yet
                    </div>
                  )}
                </div>

                {/* Add New Item */}
                <div className="flex items-center mt-4 pt-2">
                  <Input
                    className="flex-1 mr-2"
                    placeholder={`Add new ${selectedCategory} item`}
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
                  />
                  <Button 
                    className="bg-primary text-white rounded-lg"
                    onClick={handleAddItem}
                    disabled={!newItemName.trim() || addFoodItem.isPending}
                  >
                    <PlusIcon className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <BottomNavigation />
    </div>
  );
}
