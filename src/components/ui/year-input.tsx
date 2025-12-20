import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";
import React from "react";

interface YearInputProps {
  value?: number | null;
  onChange: (value?: number | null) => void;
  className?: string;
}

export function YearInput({ value, onChange, className }: YearInputProps) {
  const currentYear = new Date().getFullYear();

  const handleDecrement = () => {
    if (value === undefined || value === null || Number.isNaN(value)) {
      onChange(currentYear);
      return;
    }
    onChange(value - 1);
  };

  const handleIncrement = () => {
    if (value === undefined || value === null || Number.isNaN(value)) {
      onChange(currentYear);
      return;
    }
    onChange(value + 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue === "") {
      onChange(null);
      return;
    }

    const parsed = parseInt(newValue, 10);
    if (!isNaN(parsed)) {
      onChange(parsed);
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
      >
        <Minus className="h-4 w-4" />
        <span className="sr-only">Decrease year</span>
      </Button>

      <div className="flex-1 min-w-0 border-x h-10 relative">
        <Input
          type="number"
          value={value ?? ""}
          onChange={handleInputChange}
          className="h-full w-full border-0 rounded-none text-center focus-visible:ring-0 focus-visible:ring-offset-0 px-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          placeholder="Year"
        />
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-l-none shrink-0"
        onClick={handleIncrement}
      >
        <Plus className="h-4 w-4" />
        <span className="sr-only">Increase year</span>
      </Button>
    </div>
  );
}
