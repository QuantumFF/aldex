import { AnimatePresence, motion } from "framer-motion";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface AlbumStatusFiltersProps {
  acquisitionFilter: string;
  setAcquisitionFilter: (value: string) => void;
  progressFilter: string;
  setProgressFilter: (value: string) => void;
}

export function AlbumStatusFilters({
  acquisitionFilter,
  setAcquisitionFilter,
  progressFilter,
  setProgressFilter,
}: AlbumStatusFiltersProps) {
  const showProgress = acquisitionFilter === "library";

  return (
    <>
      <ToggleGroup
        type="single"
        value={acquisitionFilter}
        onValueChange={(value) => {
          const next = value || "all";
          setAcquisitionFilter(next);
          if (next !== "library") setProgressFilter("all");
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

      <AnimatePresence>
        {showProgress && (
          <motion.div
            key="progress-filter"
            initial={{ opacity: 0, width: 0, marginLeft: 0 }}
            animate={{ opacity: 1, width: "auto", marginLeft: 0 }}
            exit={{ opacity: 0, width: 0, marginLeft: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <ToggleGroup
              type="single"
              value={progressFilter}
              onValueChange={(value) => {
                setProgressFilter(value || "all");
              }}
              className="border rounded-md p-1 bg-background whitespace-nowrap"
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
                Done
              </ToggleGroupItem>
            </ToggleGroup>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
