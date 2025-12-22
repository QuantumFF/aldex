import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Archive, ChevronDown, Trash2, X } from "lucide-react";

interface BatchActionsProps {
  selectedCount: number;
  onSelectAll: () => void;
  isAllSelected: boolean;
  onStatusChange: (status: "library" | "wishlist") => void;
  onProgressChange: (progress: "backlog" | "active" | "completed") => void;
  onArchive: () => void;
  onDelete: () => void;
  onCancel: () => void;
}

export function BatchActions({
  selectedCount,
  onSelectAll,
  isAllSelected,
  onStatusChange,
  onProgressChange,
  onArchive,
  onDelete,
  onCancel,
}: BatchActionsProps) {
  return (
    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-5">
      <div className="flex items-center gap-2 mr-2">
        <Checkbox
          checked={isAllSelected}
          onCheckedChange={onSelectAll}
          aria-label="Select all"
        />
        <span className="text-sm text-muted-foreground">Select All</span>
      </div>
      <Badge variant="secondary" className="h-7 px-3">
        {selectedCount} Selected
      </Badge>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={selectedCount === 0}>
            Set Status <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => onStatusChange("library")}>
            Library
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onStatusChange("wishlist")}>
            Wishlist
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={selectedCount === 0}>
            Set Progress <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => onProgressChange("backlog")}>
            Backlog
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onProgressChange("active")}>
            Active
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onProgressChange("completed")}>
            Completed
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="secondary"
        onClick={onArchive}
        disabled={selectedCount === 0}
        title="Archive Selected"
      >
        <Archive className="h-4 w-4" />
      </Button>

      <Button
        variant="destructive"
        onClick={onDelete}
        disabled={selectedCount === 0}
        title="Delete Selected"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <Button variant="ghost" onClick={onCancel}>
        <X className="mr-2 h-4 w-4" />
        Cancel
      </Button>
    </div>
  );
}
