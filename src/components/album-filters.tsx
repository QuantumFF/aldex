import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  Calendar,
  CheckSquare,
  Clock,
  Disc,
  LayoutGrid,
  List,
  Minus,
  Plus,
  Search,
  User,
} from "lucide-react";
import { AddAlbumCommand } from "./add-album-command";
import { BulkAddAlbumsDialog } from "./bulk-add-albums-dialog";

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
  children?: React.ReactNode;
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
  children,
}: AlbumFiltersProps) {
  return (
    <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center md:justify-end">
      {/* Search Input */}
      <div className="relative w-full md:max-w-xs">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search title or artist..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <ToggleGroup
          type="single"
          value={acquisitionFilter}
          onValueChange={(value) => {
            console.log("Acquisition filter changed to:", value);
            setAcquisitionFilter(value || "all");
          }}
          className="border rounded-md p-1 bg-background"
        >
          <ToggleGroupItem value="all" className="h-7 px-3 text-xs">
            All
          </ToggleGroupItem>
          <ToggleGroupItem value="library" className="h-7 px-3 text-xs">
            Library
          </ToggleGroupItem>
          <ToggleGroupItem value="wishlist" className="h-7 px-3 text-xs">
            Wishlist
          </ToggleGroupItem>
          <ToggleGroupItem value="archived" className="h-7 px-3 text-xs">
            Archived
          </ToggleGroupItem>
        </ToggleGroup>

        <ToggleGroup
          type="single"
          value={progressFilter}
          onValueChange={(value) => {
            console.log("Progress filter changed to:", value);
            setProgressFilter(value || "all");
          }}
          className="border rounded-md p-1 bg-background"
        >
          <ToggleGroupItem value="all" className="h-7 px-3 text-xs">
            All
          </ToggleGroupItem>
          <ToggleGroupItem value="backlog" className="h-7 px-3 text-xs">
            Backlog
          </ToggleGroupItem>
          <ToggleGroupItem value="active" className="h-7 px-3 text-xs">
            Completed
          </ToggleGroupItem>
          <ToggleGroupItem value="completed" className="h-7 px-3 text-xs">
            Completed
          </ToggleGroupItem>
        </ToggleGroup>

        <div className="flex items-center gap-1 bg-background border rounded-md p-1">
          <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
            <SelectTrigger className="h-7 w-[120px] border-none shadow-none text-xs focus:ring-0">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dateAdded">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" /> Date Added
                </div>
              </SelectItem>
              <SelectItem value="title">
                <div className="flex items-center gap-2">
                  <Disc className="h-3 w-3" /> Title
                </div>
              </SelectItem>
              <SelectItem value="artist">
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3" /> Artist
                </div>
              </SelectItem>
              <SelectItem value="year">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" /> Year
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-sm"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            title={sortOrder === "asc" ? "Ascending" : "Descending"}
          >
            {sortOrder === "asc" ? (
              <ArrowDownAZ className="h-4 w-4" />
            ) : (
              <ArrowUpAZ className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-2">
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
              <span className="text-sm font-bold leading-none">
                {columnCount}
              </span>
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
        {children}
      </div>
    </div>
  );
}
