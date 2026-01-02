import type { AlbumWithCover } from "@/components/edit-album-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, X } from "lucide-react";
import { useState } from "react";

interface BatchActionsProps {
  selectedCount: number;
  selectedAlbums: AlbumWithCover[];
  onSelectAll: () => void;
  isAllSelected: boolean;
  onApply: (updates: {
    acquisition?: "library" | "wishlist";
    progress?: "backlog" | "active" | "completed";
    isArchived?: boolean;
  }) => void;
  onDelete: () => void;
  onCancel: () => void;
}

export function BatchActions({
  selectedCount,
  selectedAlbums,
  onSelectAll,
  isAllSelected,
  onApply,
  onDelete,
  onCancel,
}: BatchActionsProps) {
  // User overrides (undefined means "no change from default/current")
  const [userStatus, setUserStatus] = useState<
    "library" | "wishlist" | undefined
  >();
  const [userProgress, setUserProgress] = useState<
    "backlog" | "active" | "completed" | undefined
  >();
  const [userArchived, setUserArchived] = useState<boolean | undefined>(
    undefined
  );

  // Calculate defaults based on selection
  const defaultStatus =
    selectedAlbums.length > 0 &&
    selectedAlbums.every((a) => a.acquisition === selectedAlbums[0].acquisition)
      ? selectedAlbums[0].acquisition
      : undefined;

  const defaultProgress =
    selectedAlbums.length > 0 &&
    selectedAlbums.every((a) => a.progress === selectedAlbums[0].progress)
      ? selectedAlbums[0].progress
      : undefined;

  const allArchived =
    selectedAlbums.length > 0 && selectedAlbums.every((a) => a.isArchived);
  const allUnarchived =
    selectedAlbums.length > 0 && selectedAlbums.every((a) => !a.isArchived);
  const defaultArchived = allArchived
    ? true
    : allUnarchived
      ? false
      : undefined;

  // Effective values for display
  const effectiveStatus = userStatus ?? defaultStatus;
  const effectiveProgress = userProgress ?? defaultProgress;
  const effectiveArchived = userArchived ?? defaultArchived;

  const handleApply = () => {
    onApply({
      acquisition: userStatus,
      progress: userProgress,
      isArchived: userArchived,
    });
  };

  const hasChanges =
    userStatus !== undefined ||
    userProgress !== undefined ||
    userArchived !== undefined;

  return (
    <div className="flex flex-wrap items-center justify-end gap-4 animate-in fade-in slide-in-from-right-5 min-h-[38px]">
      <div
        className="flex items-center gap-2 mr-2 cursor-pointer"
        onClick={onSelectAll}
      >
        <Checkbox
          checked={isAllSelected}
          onCheckedChange={onSelectAll}
          aria-label="Select all"
        />
        <span className="text-sm text-muted-foreground select-none">
          Select All
        </span>
      </div>

      <Badge
        variant="secondary"
        className="h-9 px-3 flex items-center justify-center"
      >
        {selectedCount} Selected
      </Badge>

      <Select
        value={effectiveStatus}
        onValueChange={(val) => setUserStatus(val as "library" | "wishlist")}
      >
        <SelectTrigger className="w-[130px] h-9">
          <SelectValue placeholder="Set Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="library">Library</SelectItem>
          <SelectItem value="wishlist">Wishlist</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={effectiveProgress}
        onValueChange={(val) =>
          setUserProgress(val as "backlog" | "active" | "completed")
        }
      >
        <SelectTrigger className="w-[140px] h-9">
          <SelectValue placeholder="Set Progress" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="backlog">Backlog</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2">
        <Checkbox
          id="archived-checkbox"
          checked={effectiveArchived === true}
          onCheckedChange={() => {
            // Toggle logic:
            // If currently checked (true), user wants to uncheck (false).
            // If currently unchecked (false/undefined), user wants to check (true).
            if (effectiveArchived === true) {
              setUserArchived(false);
            } else {
              setUserArchived(true);
            }
          }}
        />
        <Label htmlFor="archived-checkbox" className="cursor-pointer">
          Archived
        </Label>
      </div>

      <Button
        onClick={handleApply}
        disabled={selectedCount === 0 || !hasChanges}
        size="sm"
        className="h-9"
      >
        Apply
      </Button>

      <div className="h-6 w-px bg-border mx-2" />

      <Button
        variant="destructive"
        size="icon"
        className="h-9 w-9"
        onClick={onDelete}
        disabled={selectedCount === 0}
        title="Delete Selected"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <Button variant="ghost" size="sm" className="h-9" onClick={onCancel}>
        <X className="mr-2 h-4 w-4" />
        Cancel
      </Button>
    </div>
  );
}
