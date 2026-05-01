import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CheckSquare, LayoutGrid, List, Minus, Plus, Search } from "lucide-react";
import * as React from "react";
import { AddAlbumCommand } from "./add-album-command";
import { BulkAddAlbumsDialog } from "./bulk-add-albums-dialog";
import { AlbumSortControls } from "./filters/album-sort-controls";
import { AlbumStatusFilters } from "./filters/album-status-filters";

interface AlbumFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  acquisitionFilter: string;
  setAcquisitionFilter: (value: string) => void;
  progressFilter: string;
  setProgressFilter: (value: string) => void;
  view: "grid" | "list";
  setView: (view: "grid" | "list") => void;
  columnCount: number;
  setColumnCount: (count: number) => void;
  sortBy: "dateAdded" | "title" | "artist" | "year";
  setSortBy: (sortBy: "dateAdded" | "title" | "artist" | "year") => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (order: "asc" | "desc") => void;
  isBatchMode: boolean;
  toggleBatchMode: () => void;
}

export function AlbumFilters({
  searchQuery,
  setSearchQuery,
  acquisitionFilter,
  setAcquisitionFilter,
  progressFilter,
  setProgressFilter,
  view,
  setView,
  columnCount,
  setColumnCount,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  isBatchMode,
  toggleBatchMode,
}: AlbumFiltersProps) {
  const searchRef = React.useRef<HTMLInputElement>(null);

  // Ctrl+F focuses the search input
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="flex flex-1 flex-wrap items-center gap-2">

      {/* 1. Search */}
      <div className="relative min-w-[140px] max-w-[200px] flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          ref={searchRef}
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* 2. Sort */}
      <AlbumSortControls
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />

      {/* 3. Grid / List view toggle */}
      <ToggleGroup
        type="single"
        value={view}
        onValueChange={(v) => v && setView(v as "grid" | "list")}
        className="border rounded-md p-1 bg-background"
      >
        <ToggleGroupItem value="grid" aria-label="Grid view" className="h-7 w-7 p-0">
          <LayoutGrid className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="list" aria-label="List view" className="h-7 w-7 p-0">
          <List className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>

      {/* 4. Column size (grid only) */}
      {view === "grid" && (
        <div className="flex items-center border rounded-md bg-background overflow-hidden">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-8 rounded-none"
            onClick={() => setColumnCount(Math.max(2, columnCount - 1))}
            disabled={columnCount <= 2}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <div className="flex flex-col items-center justify-center w-10 select-none">
            <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-tighter">cols</span>
            <span className="text-sm font-bold leading-none">{columnCount}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-8 rounded-none"
            onClick={() => setColumnCount(Math.min(10, columnCount + 1))}
            disabled={columnCount >= 10}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* 5 & 6. Acquisition + Progress filters */}
      <AlbumStatusFilters
        acquisitionFilter={acquisitionFilter}
        setAcquisitionFilter={setAcquisitionFilter}
        progressFilter={progressFilter}
        setProgressFilter={setProgressFilter}
      />

      {/* 7. Batch edit */}
      <Button
        variant={isBatchMode ? "secondary" : "outline"}
        size="icon"
        onClick={toggleBatchMode}
        title="Batch Edit"
      >
        <CheckSquare className="h-4 w-4" />
      </Button>

      {/* 8. Add album (search) */}
      <AddAlbumCommand />

      {/* 9. Bulk add */}
      <BulkAddAlbumsDialog />
    </div>
  );
}

