"use client";

import { AlbumFilters } from "@/components/album-filters";
import { AlbumGrid } from "@/components/album-grid";
import { AlbumList } from "@/components/album-list";
import { BatchActions } from "@/components/batch-actions";
import { EditAlbumDialog } from "@/components/edit-album-dialog";
import { Button } from "@/components/ui/button";
import { useAlbumLibrary } from "@/hooks/use-album-library";
import { AnimatePresence, motion } from "framer-motion";

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
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
  } = useAlbumLibrary();

  // Context/dropdown menu "Select" — enters batch mode first if not already in it
  const handleSelectFromMenu = (id: string) => {
    if (!isBatchMode) toggleBatchMode();
    toggleSelection(id);
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

  return (
    <div className="space-y-4">
      {/* Row 1: Title + User button — never wraps, always shares the same line */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight shrink-0">{getTitle()}</h2>
        {children && (
          <div className="shrink-0 flex items-center">
            {children}
          </div>
        )}
      </div>

      {/* Row 2: Filter controls / batch actions — can wrap independently */}
      <AnimatePresence mode="wait">
        {isBatchMode ? (
          <motion.div
            key="batch"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <BatchActions
              selectedCount={selectedAlbumIds.size}
              selectedAlbums={filteredAlbums.filter((a: any) =>
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
          </motion.div>
        ) : (
          <motion.div
            key="filters"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
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
              sortBy={sortBy}
              setSortBy={setSortBy}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {filteredAlbums.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex h-60 flex-col items-center justify-center gap-2 rounded-md border border-dashed"
          >
            <p className="text-muted-foreground text-lg">
              No albums match your filters.
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </motion.div>
        ) : view === "grid" ? (
          <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <AlbumGrid
              albums={filteredAlbums}
              columnCount={columnCount}
              isBatchMode={isBatchMode}
              selectedAlbumIds={selectedAlbumIds}
              onAlbumClick={handleEditAlbum}
              onToggleSelection={toggleSelection}
              onSelectFromMenu={handleSelectFromMenu}
              onDelete={deleteAlbum}
            />
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <AlbumList
              albums={filteredAlbums}
              isBatchMode={isBatchMode}
              selectedAlbumIds={selectedAlbumIds}
              onAlbumClick={handleEditAlbum}
              onToggleSelection={toggleSelection}
              onSelectFromMenu={handleSelectFromMenu}
              onSelectAll={handleSelectAll}
              onDelete={deleteAlbum}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <EditAlbumDialog
        album={editingAlbum}
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </div>
  );
}
