"use client";

import { Button } from "@/components/ui/button";
import { useAlbumLibrary } from "@/hooks/use-album-library";
import { AlbumFilters } from "./album-filters";
import { AlbumGrid } from "./album-grid";
import { AlbumList } from "./album-list";
import { BatchActions } from "./batch-actions";
import { EditAlbumDialog } from "./edit-album-dialog";

export function AlbumLibrary({ children }: { children?: React.ReactNode }) {
  const {
    filteredAlbums,
    view,
    setView,
    columnCount,
    setColumnCount,
    editingAlbum,
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
    toggleBatchMode,
    handleBatchApply,
    handleSelectAll,
    deleteAlbum,
  } = useAlbumLibrary();

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

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold tracking-tight">{getTitle()}</h2>
        </div>

        {isBatchMode ? (
          <BatchActions
            selectedCount={selectedAlbumIds.size}
            selectedAlbums={filteredAlbums.filter((a) =>
              selectedAlbumIds.has(a._id),
            )}
            onSelectAll={handleSelectAll}
            isAllSelected={
              filteredAlbums.length > 0 &&
              selectedAlbumIds.size === filteredAlbums.length
            }
            onApply={handleBatchApply}
            onDelete={handleBatchDelete}
            onCancel={toggleBatchMode}
          />
        ) : (
          <AlbumFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            acquisitionFilter={acquisitionFilter}
            setAcquisitionFilter={setAcquisitionFilter}
            progressFilter={progressFilter}
            setProgressFilter={setProgressFilter}
            view={view}
            setView={setView}
            columnCount={columnCount}
            setColumnCount={setColumnCount}
            isBatchMode={isBatchMode}
            toggleBatchMode={toggleBatchMode}
          >
            {children}
          </AlbumFilters>
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
        <AlbumGrid
          albums={filteredAlbums}
          columnCount={columnCount}
          isBatchMode={isBatchMode}
          selectedAlbumIds={selectedAlbumIds}
          onAlbumClick={handleEditAlbum}
          onToggleSelection={toggleSelection}
          onDelete={deleteAlbum}
        />
      ) : (
        <AlbumList
          albums={filteredAlbums}
          isBatchMode={isBatchMode}
          selectedAlbumIds={selectedAlbumIds}
          onAlbumClick={handleEditAlbum}
          onToggleSelection={toggleSelection}
          onSelectAll={handleSelectAll}
          onDelete={deleteAlbum}
        />
      )}

      <EditAlbumDialog
        album={editingAlbum}
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </div>
  );
}
