"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useWindowSize } from "@/hooks/use-window-size";
import { useMutation, useQuery } from "convex/react";
import {
  Archive,
  CheckSquare,
  ChevronDown,
  LayoutGrid,
  List,
  Minus,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { AddAlbumCommand } from "./add-album-command";
import { AlbumCover } from "./album-cover";
import { EditAlbumDialog, type AlbumWithCover } from "./edit-album-dialog";

export function AlbumLibrary() {
  // Fetch ALL albums
  const allAlbums = useQuery(api.albums.get, {});
  const batchDelete = useMutation(api.albums.batchDelete);
  const batchUpdate = useMutation(api.albums.batchUpdate);

  const [view, setView] = useState<"grid" | "list">("grid");
  const [columnCount, setColumnCount] = useState(5);
  const { width } = useWindowSize();

  // Auto-adjust columns based on width
  useEffect(() => {
    if (!width) return;
    let newCount = 5;
    if (width < 640)
      newCount = 2; // Mobile
    else if (width < 768)
      newCount = 3; // Tablet
    else if (width < 1024)
      newCount = 4; // Small Desktop
    else if (width < 1280)
      newCount = 5; // Desktop
    else newCount = 6; // Large Desktop

    // eslint-disable-next-line
    setColumnCount(newCount);
  }, [width]);

  const [editingAlbum, setEditingAlbum] = useState<AlbumWithCover | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Batch Mode State
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [selectedAlbumIds, setSelectedAlbumIds] = useState<Set<string>>(
    new Set()
  );
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [acquisitionFilter, setAcquisitionFilter] = useState<string>("all");
  const [progressFilter, setProgressFilter] = useState<string>("all");

  // Client-side filtering logic
  const filteredAlbums = useMemo(() => {
    if (!allAlbums) return [];

    console.log("Filtering with:", {
      acquisitionFilter,
      progressFilter,
      searchQuery,
    });

    return allAlbums.filter((album) => {
      // 1. Text Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = album.title.toLowerCase().includes(query);
        const matchesArtist = album.artist.toLowerCase().includes(query);
        if (!matchesTitle && !matchesArtist) return false;
      }

      // 2. Acquisition Filter
      if (acquisitionFilter === "archived") {
        if (!album.isArchived) return false;
      } else {
        // Hide archived albums from other views
        if (album.isArchived) return false;

        if (
          acquisitionFilter !== "all" &&
          album.acquisition !== acquisitionFilter
        ) {
          return false;
        }
      }

      // 3. Progress Filter
      if (progressFilter !== "all") {
        // If filtering by progress, we implicitly require acquisition to be 'library' usually,
        // but the schema says 'progress' is optional.
        // If album doesn't have progress, it shouldn't match a specific progress filter.
        const effectiveProgress =
          album.progress ||
          (album.acquisition === "library" ? "backlog" : undefined);
        if (!effectiveProgress || effectiveProgress !== progressFilter)
          return false;
      }

      return true;
    });
  }, [allAlbums, searchQuery, acquisitionFilter, progressFilter]);

  const clearFilters = () => {
    setSearchQuery("");
    setAcquisitionFilter("all");
    setProgressFilter("all");
  };

  const getTitle = () => {
    if (
      searchQuery ||
      acquisitionFilter !== "all" ||
      progressFilter !== "all"
    ) {
      return `Albums (${filteredAlbums.length})`;
    }
    return "All Albums";
  };

  const handleEditAlbum = (
    album: AlbumWithCover,
    e?: React.MouseEvent | React.KeyboardEvent
  ) => {
    if (isBatchMode) {
      const isShiftPressed = e && "shiftKey" in e && e.shiftKey;
      toggleSelection(album._id, isShiftPressed);
    } else {
      setEditingAlbum(album);
      setIsEditOpen(true);
    }
  };

  const toggleSelection = (id: string, isShiftPressed: boolean = false) => {
    const newSelection = new Set(selectedAlbumIds);

    if (isShiftPressed && lastSelectedId && lastSelectedId !== id) {
      const lastIndex = filteredAlbums.findIndex(
        (a) => a._id === lastSelectedId
      );
      const currentIndex = filteredAlbums.findIndex((a) => a._id === id);

      if (lastIndex !== -1 && currentIndex !== -1) {
        const start = Math.min(lastIndex, currentIndex);
        const end = Math.max(lastIndex, currentIndex);

        const range = filteredAlbums.slice(start, end + 1);
        range.forEach((a) => newSelection.add(a._id));
      }
    } else {
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
      setLastSelectedId(id);
    }

    setSelectedAlbumIds(newSelection);
  };

  const handleBatchDelete = async () => {
    if (selectedAlbumIds.size === 0) return;
    if (
      !confirm(
        `Are you sure you want to delete ${selectedAlbumIds.size} albums? This cannot be undone.`
      )
    )
      return;

    try {
      await batchDelete({
        ids: Array.from(selectedAlbumIds) as Id<"albums">[],
      });
      toast.success(`Deleted ${selectedAlbumIds.size} albums`);
      setIsBatchMode(false);
      setSelectedAlbumIds(new Set());
    } catch (error) {
      toast.error("Failed to delete albums");
      console.error(error);
    }
  };

  const handleBatchArchive = async () => {
    if (selectedAlbumIds.size === 0) return;

    try {
      await batchUpdate({
        ids: Array.from(selectedAlbumIds) as Id<"albums">[],
        updates: { isArchived: true },
      });
      toast.success(`Archived ${selectedAlbumIds.size} albums`);
      setIsBatchMode(false);
      setSelectedAlbumIds(new Set());
    } catch (error) {
      toast.error("Failed to archive albums");
      console.error(error);
    }
  };

  const handleBatchStatusChange = async (status: "library" | "wishlist") => {
    if (selectedAlbumIds.size === 0) return;

    try {
      await batchUpdate({
        ids: Array.from(selectedAlbumIds) as Id<"albums">[],
        updates: { acquisition: status },
      });
      toast.success(`Updated status for ${selectedAlbumIds.size} albums`);
      setIsBatchMode(false);
      setSelectedAlbumIds(new Set());
    } catch (error) {
      toast.error("Failed to update albums");
      console.error(error);
    }
  };

  const handleBatchProgressChange = async (
    progress: "backlog" | "active" | "completed"
  ) => {
    if (selectedAlbumIds.size === 0) return;

    try {
      await batchUpdate({
        ids: Array.from(selectedAlbumIds) as Id<"albums">[],
        updates: { progress },
      });
      toast.success(`Updated progress for ${selectedAlbumIds.size} albums`);
      setIsBatchMode(false);
      setSelectedAlbumIds(new Set());
    } catch (error) {
      toast.error("Failed to update albums");
      console.error(error);
    }
  };

  const toggleBatchMode = () => {
    setIsBatchMode(!isBatchMode);
    setSelectedAlbumIds(new Set());
    setLastSelectedId(null);
  };

  const handleSelectAll = () => {
    if (selectedAlbumIds.size === filteredAlbums.length) {
      setSelectedAlbumIds(new Set());
    } else {
      setSelectedAlbumIds(new Set(filteredAlbums.map((a) => a._id)));
    }
  };

  if (allAlbums === undefined) {
    return (
      <div className="flex h-40 items-center justify-center">
        Loading albums...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold tracking-tight">{getTitle()}</h2>
          {isBatchMode && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-5">
              <div className="flex items-center gap-2 mr-2">
                <Checkbox
                  checked={
                    filteredAlbums.length > 0 &&
                    selectedAlbumIds.size === filteredAlbums.length
                  }
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                />
                <span className="text-sm text-muted-foreground">
                  Select All
                </span>
              </div>
              <Badge variant="secondary" className="h-7 px-3">
                {selectedAlbumIds.size} Selected
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={selectedAlbumIds.size === 0}
                  >
                    Set Status <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => handleBatchStatusChange("library")}
                  >
                    Library
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleBatchStatusChange("wishlist")}
                  >
                    Wishlist
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={selectedAlbumIds.size === 0}
                  >
                    Set Progress <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => handleBatchProgressChange("backlog")}
                  >
                    Backlog
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleBatchProgressChange("active")}
                  >
                    Active
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleBatchProgressChange("completed")}
                  >
                    Completed
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="secondary"
                onClick={handleBatchArchive}
                disabled={selectedAlbumIds.size === 0}
                title="Archive Selected"
              >
                <Archive className="h-4 w-4" />
              </Button>

              <Button
                variant="destructive"
                onClick={handleBatchDelete}
                disabled={selectedAlbumIds.size === 0}
                title="Delete Selected"
              >
                <Trash2 className="h-4 w-4" />
              </Button>

              <Button variant="ghost" onClick={toggleBatchMode}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          )}
        </div>

        {!isBatchMode && (
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
                  Active
                </ToggleGroupItem>
                <ToggleGroupItem value="completed" className="h-7 px-3 text-xs">
                  Completed
                </ToggleGroupItem>
              </ToggleGroup>
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
                    onClick={() =>
                      setColumnCount(Math.min(10, columnCount + 1))
                    }
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
            </div>
          </div>
        )}
      </div>

      {filteredAlbums.length === 0 ? (
        <div className="flex h-60 flex-col items-center justify-center gap-2 rounded-md border border-dashed">
          <p className="text-muted-foreground text-lg">
            No albums match your filters.
          </p>
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      ) : view === "grid" ? (
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
          }}
        >
          {filteredAlbums.map((album) => (
            <Card
              key={album._id}
              className={`overflow-hidden p-0 cursor-pointer transition-all ${
                isBatchMode && selectedAlbumIds.has(album._id)
                  ? "ring-2 ring-primary"
                  : "hover:ring-2 hover:ring-primary/50"
              } ${isBatchMode ? "select-none" : ""}`}
              onClick={(e) => handleEditAlbum(album, e)}
            >
              <CardContent className="p-0">
                <div className="group relative aspect-square overflow-hidden bg-muted">
                  <AlbumCover
                    storageId={album.coverImageId}
                    title={album.title}
                  />
                  {isBatchMode && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Checkbox
                        checked={selectedAlbumIds.has(album._id)}
                        onCheckedChange={() => toggleSelection(album._id)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-8 w-8 border-2 border-white data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                    </div>
                  )}
                  {!isBatchMode && album.rating && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="font-bold">
                        {album.rating}/10
                      </Badge>
                    </div>
                  )}
                  {!isBatchMode && (
                    <div className="absolute bottom-2 left-2 flex gap-1">
                      <Badge
                        variant="secondary"
                        className="text-[10px] h-5 capitalize opacity-90 shadow-sm"
                      >
                        {album.acquisition}
                      </Badge>
                      {(album.progress || album.acquisition === "library") && (
                        <Badge
                          variant="default"
                          className="text-[10px] h-5 capitalize opacity-90 shadow-sm"
                        >
                          {album.progress || "backlog"}
                        </Badge>
                      )}
                    </div>
                  )}
                  {!isBatchMode && album.rymLink && (
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 rounded-full shadow-sm hover:bg-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(album.rymLink, "_blank");
                        }}
                        title="View on RateYourMusic"
                      >
                        <img src="/rym.svg" alt="RYM" className="h-5 w-5" />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="p-3 space-y-1">
                  <h3 className="line-clamp-1 text-sm font-semibold leading-tight">
                    {album.title}
                  </h3>
                  <p className="line-clamp-1 text-muted-foreground text-xs">
                    {album.artist}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {isBatchMode && (
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={
                        filteredAlbums.length > 0 &&
                        selectedAlbumIds.size === filteredAlbums.length
                      }
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                )}
                <TableHead className="w-[60px]"></TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Artist</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAlbums.map((album) => (
                <TableRow
                  key={album._id}
                  className={`cursor-pointer hover:bg-muted/50 ${
                    isBatchMode && selectedAlbumIds.has(album._id)
                      ? "bg-muted"
                      : ""
                  } ${isBatchMode ? "select-none" : ""}`}
                  onClick={(e) => handleEditAlbum(album, e)}
                >
                  {isBatchMode && (
                    <TableCell>
                      <Checkbox
                        checked={selectedAlbumIds.has(album._id)}
                        onCheckedChange={() => toggleSelection(album._id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="h-10 w-10 overflow-hidden rounded bg-muted">
                      <AlbumCover
                        storageId={album.coverImageId}
                        title={album.title}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{album.title}</TableCell>
                  <TableCell>{album.artist}</TableCell>
                  <TableCell>{album.releaseYear || "-"}</TableCell>
                  <TableCell>
                    {album.rating ? (
                      <Badge variant="outline">{album.rating}/10</Badge>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {album.acquisition}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {album.progress || album.acquisition === "library" ? (
                      <Badge variant="outline" className="capitalize">
                        {album.progress || "backlog"}
                      </Badge>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <EditAlbumDialog
        album={editingAlbum}
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </div>
  );
}
