import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import type { UserAlbum } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import { AlbumContextMenu, AlbumDropdownMenu } from "./album-context-menu";
import { AlbumCover } from "./album-cover";

const EASE: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];
const STAGGER_CAP = 20;

const containerVariants = {
  show: { transition: { staggerChildren: 0.045 } },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 12 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.28, ease: EASE },
  },
  exit: { opacity: 0, scale: 0.93, transition: { duration: 0.15 } },
};

interface AlbumGridProps {
  albums: UserAlbum[];
  columnCount: number;
  isBatchMode: boolean;
  selectedAlbumIds: Set<string>;
  onAlbumClick: (album: UserAlbum, e: React.MouseEvent) => void;
  onToggleSelection: (id: string) => void;
  onSelectFromMenu: (id: string) => void;
  onDelete: (id: string) => void;
}

export function AlbumGrid({
  albums,
  columnCount,
  isBatchMode,
  selectedAlbumIds,
  onAlbumClick,
  onToggleSelection,
  onSelectFromMenu,
  onDelete,
}: AlbumGridProps) {
  return (
    <motion.div
      className="grid gap-4"
      style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <AnimatePresence mode="popLayout">
        {albums.map((album, index) => (
          <motion.div
            key={album._id}
            className="relative group"
            variants={index < STAGGER_CAP ? itemVariants : undefined}
            initial={index < STAGGER_CAP ? "hidden" : { opacity: 0 }}
            animate={index < STAGGER_CAP ? "show" : { opacity: 1 }}
            exit="exit"
            layout
          >
          <AlbumContextMenu
            album={album}
            onEdit={(a) => onAlbumClick(a, {} as React.MouseEvent)}
            onDelete={onDelete}
            onToggleSelection={onToggleSelection}
            onSelectFromMenu={onSelectFromMenu}
            isSelected={selectedAlbumIds.has(album._id)}
          >
            <Card
              className={`overflow-hidden p-0 cursor-pointer transition-all duration-300 ${
                isBatchMode && selectedAlbumIds.has(album._id)
                  ? "ring-2 ring-primary scale-[0.98] shadow-inner"
                  : "hover:shadow-lg hover:-translate-y-1 hover:ring-1 hover:ring-border"
              } ${isBatchMode ? "select-none" : "border-transparent bg-transparent hover:bg-card"}`}
              onClick={(e) => onAlbumClick(album, e)}
            >
              <CardContent className="p-0">
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <AlbumCover
                    storageId={album.coverImageId}
                    title={album.title}
                  />
                  {isBatchMode && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Checkbox
                        checked={selectedAlbumIds.has(album._id)}
                        onCheckedChange={() => onToggleSelection(album._id)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-8 w-8 border-2 border-white data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                    </div>
                  )}
                  {!isBatchMode && album.rating && (
                    <div className="absolute top-2 left-2 z-10">
                      <Badge variant="secondary" className="font-serif font-bold text-sm bg-background/80 backdrop-blur-sm border-none shadow-sm">
                        {album.rating}
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
                    <div className="absolute bottom-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 rounded-full shadow-sm hover:bg-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(album.rymLink, "_blank");
                        }}
                        onContextMenu={(e) => e.stopPropagation()}
                        title="View on RateYourMusic"
                      >
                        <img src="/rym.svg" alt="RYM" className="h-5 w-5" />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="p-3 space-y-1">
                  <h3 className="line-clamp-1 text-base font-semibold tracking-tight leading-tight">
                    {album.title}
                  </h3>
                  <p className="line-clamp-1 text-muted-foreground text-xs font-sans font-light tracking-wide uppercase">
                    {album.artist}
                  </p>
                </div>
              </CardContent>
            </Card>
          </AlbumContextMenu>

          {!isBatchMode && (
            <>
              <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <AlbumDropdownMenu
                  album={album}
                  onEdit={(a) => onAlbumClick(a, {} as React.MouseEvent)}
                  onDelete={onDelete}
                  onToggleSelection={onToggleSelection}
                  onSelectFromMenu={onSelectFromMenu}
                  isSelected={selectedAlbumIds.has(album._id)}
                  className="h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70 hover:text-white"
                />
              </div>
            </>
          )}
        </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
