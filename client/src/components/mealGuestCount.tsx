import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MealGuestCountProps {
  value: number;
  onChange: (value: number) => void;
}

export function MealGuestCount({ value = 0, onChange }: MealGuestCountProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || 0;
    onChange(Math.max(0, newValue));
  };

  return (
    <div>
      <Label className="block text-sm text-gray-600 mb-1">Guests</Label>
      <Input
        type="number"
        className="w-20 py-2 px-3 text-center"
        min="0"
        value={value}
        onChange={handleChange}
      />
    </div>
  );
}
