import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowDownAZ, ArrowUpAZ, Calendar, Clock, Disc, User } from "lucide-react";

interface AlbumSortControlsProps {
  sortBy: "dateAdded" | "title" | "artist" | "year";
  setSortBy: (sortBy: "dateAdded" | "title" | "artist" | "year") => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (order: "asc" | "desc") => void;
}

export function AlbumSortControls({
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
}: AlbumSortControlsProps) {
  return (
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
  );
}
