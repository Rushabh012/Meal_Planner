import { cn } from "@/lib/utils";
import { useState } from "react";

interface MealSelectionCirclesProps {
  value: number;
  onChange: (value: number) => void;
}

export function MealSelectionCircles({ value = 0, onChange }: MealSelectionCirclesProps) {
  const handleCircleClick = (clickedValue: number) => {
    // If already active and clicked again, deactivate
    if (value === clickedValue) {
      onChange(clickedValue - 1);
    } else {
      onChange(clickedValue);
    }
  };

  return (
    <div className="flex">
      {[1, 2, 3, 4].map((circleValue) => (
        <div
          key={circleValue}
          className={cn(
            "meal-circle cursor-pointer",
            value >= circleValue ? "active" : ""
          )}
          onClick={() => handleCircleClick(circleValue)}
        />
      ))}
    </div>
  );
}
