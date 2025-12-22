import type { AlbumWithCover } from "@/components/edit-album-dialog";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useWindowSize } from "./use-window-size";

export function useAlbumLibrary() {
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

  return {
    allAlbums,
    filteredAlbums,
    view,
    setView,
    columnCount,
    setColumnCount,
    editingAlbum,
    setEditingAlbum,
    isEditOpen,
    setIsEditOpen,
    isBatchMode,
    selectedAlbumIds,
    searchQuery,
    setSearchQuery,
    acquisitionFilter,
    setAcquisitionFilter,
    progressFilter,
    setProgressFilter,
    clearFilters,
    handleEditAlbum,
    toggleSelection,
    handleBatchDelete,
    handleBatchArchive,
    handleBatchStatusChange,
    handleBatchProgressChange,
    toggleBatchMode,
    handleSelectAll,
  };
}
