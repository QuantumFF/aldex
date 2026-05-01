import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LayoutGrid, List, Minus, Plus } from "lucide-react";

interface AlbumViewControlsProps {
  view: "grid" | "list";
  setView: (view: "grid" | "list") => void;
  columnCount: number;
  setColumnCount: (count: number) => void;
}

export function AlbumViewControls({
  view,
  setView,
  columnCount,
  setColumnCount,
}: AlbumViewControlsProps) {
  return (
    <>
      {view === "grid" && (
        <div className="flex items-center border rounded-md bg-background mr-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-8 rounded-r-none"
            onClick={() => setColumnCount(Math.max(2, columnCount - 1))}
            disabled={columnCount <= 2}
          >
            <Minus className="h-4 w-4" />
            <span className="sr-only">Decrease columns</span>
          </Button>
          <div className="flex flex-col items-center justify-center w-16 px-1 select-none">
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
              Columns
            </span>
            <span className="text-sm font-bold leading-none">{columnCount}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-8 rounded-l-none"
            onClick={() => setColumnCount(Math.min(10, columnCount + 1))}
            disabled={columnCount >= 10}
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">Increase columns</span>
          </Button>
        </div>
      )}

      <ToggleGroup
        type="single"
        value={view}
        onValueChange={(v) => v && setView(v as "grid" | "list")}
        className="border rounded-md p-1"
      >
        <ToggleGroupItem
          value="grid"
          aria-label="Grid view"
          className="h-7 w-7 p-0"
        >
          <LayoutGrid className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="list"
          aria-label="List view"
          className="h-7 w-7 p-0"
        >
          <List className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    </>
  );
}
