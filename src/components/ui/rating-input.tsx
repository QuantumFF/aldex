import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";
import React from "react";

interface RatingInputProps {
  value?: number | null;
  onChange: (value?: number | null) => void;
  className?: string;
}

export function RatingInput({ value, onChange, className }: RatingInputProps) {
  const handleDecrement = () => {
    if (value === undefined || value === null || Number.isNaN(value)) return;
    if (value <= 1) {
      onChange(null); // Clear rating if going below 1
    } else {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value === undefined || value === null || Number.isNaN(value)) {
      onChange(1);
    } else if (value < 10) {
      onChange(value + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue === "") {
      onChange(null);
      return;
    }

    const parsed = parseInt(newValue, 10);
    if (!isNaN(parsed)) {
      // Allow typing, but maybe clamp on blur?
      // For now, let's just pass it up. The form validation will catch invalid numbers if we don't clamp here.
      // But for a better UX with the buttons, let's clamp if it's a valid number,
      // but we need to allow typing "1" then "0" to get "10".
      // So we shouldn't clamp strictly while typing if it prevents "10".
      // Actually, if we just pass the number, the Zod schema will validate it.
      // But the user asked for "manual input".

      // Let's just pass the parsed number.
      onChange(parsed);
    }
  };

  const handleBlur = () => {
    if (value !== undefined && value !== null) {
      if (value < 1) onChange(1);
      if (value > 10) onChange(10);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center border rounded-md bg-background w-full max-w-[200px]",
        className
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-r-none shrink-0"
        onClick={handleDecrement}
        disabled={value === undefined}
      >
        <Minus className="h-4 w-4" />
        <span className="sr-only">Decrease rating</span>
      </Button>

      <div className="flex-1 min-w-0 border-x h-10 relative">
        <Input
          type="number"
          min={1}
          max={10}
          value={value ?? ""}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className="h-full w-full border-0 rounded-none text-center focus-visible:ring-0 focus-visible:ring-offset-0 px-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          placeholder="-"
        />
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-muted-foreground/20 text-xs font-bold uppercase tracking-widest opacity-0">
          Rating
        </div>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-l-none shrink-0"
        onClick={handleIncrement}
        disabled={value !== undefined && value !== null && value >= 10}
      >
        <Plus className="h-4 w-4" />
        <span className="sr-only">Increase rating</span>
      </Button>
    </div>
  );
}
