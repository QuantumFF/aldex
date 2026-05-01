import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckSquare, Search } from "lucide-react";
import { AddAlbumCommand } from "./add-album-command";
import { BulkAddAlbumsDialog } from "./bulk-add-albums-dialog";
import { AlbumSortControls } from "./filters/album-sort-controls";
import { AlbumStatusFilters } from "./filters/album-status-filters";
import { AlbumViewControls } from "./filters/album-view-controls";

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
  return (
    <div className="flex flex-1 flex-wrap items-center gap-2 justify-end">
      {/* Search Input */}
      <div className="relative min-w-[140px] max-w-[200px] flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Status Filters */}
      <AlbumStatusFilters
        acquisitionFilter={acquisitionFilter}
        setAcquisitionFilter={setAcquisitionFilter}
        progressFilter={progressFilter}
        setProgressFilter={setProgressFilter}
      />

      {/* Sort Controls */}
      <AlbumSortControls
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />

      {/* View + Actions */}
      <div className="flex items-center gap-2">
        <AlbumViewControls
          view={view}
          setView={setView}
          columnCount={columnCount}
          setColumnCount={setColumnCount}
        />

        <Button
          variant={isBatchMode ? "secondary" : "outline"}
          size="icon"
          onClick={toggleBatchMode}
          title="Batch Edit"
        >
          <CheckSquare className="h-4 w-4" />
        </Button>

        <AddAlbumCommand />
        <BulkAddAlbumsDialog />
      </div>
    </div>
  );
}
