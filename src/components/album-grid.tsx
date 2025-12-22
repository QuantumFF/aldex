import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import type { Doc } from "../../convex/_generated/dataModel";
import { AlbumCover } from "./album-cover";

// Define a type that matches what we expect (Doc<"albums"> plus optional coverImageId if not in schema, but it is)
// Actually, let's just use Doc<"albums"> and extend if needed.
// In album-library.tsx, it uses `allAlbums` which is `Doc<"albums">[]`.
// But `AlbumWithCover` in edit-album-dialog is `Doc<"albums"> & { coverUrl?: string }`.
// The grid uses `album.coverImageId`.

type Album = Doc<"albums"> & { rymLink?: string }; // rymLink is in schema? Yes.

interface AlbumGridProps {
  albums: Album[];
  columnCount: number;
  isBatchMode: boolean;
  selectedAlbumIds: Set<string>;
  onAlbumClick: (album: Album, e: React.MouseEvent) => void;
  onToggleSelection: (id: string) => void;
}

export function AlbumGrid({
  albums,
  columnCount,
  isBatchMode,
  selectedAlbumIds,
  onAlbumClick,
  onToggleSelection,
}: AlbumGridProps) {
  return (
    <div
      className="grid gap-4"
      style={{
        gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
      }}
    >
      {albums.map((album) => (
        <Card
          key={album._id}
          className={`overflow-hidden p-0 cursor-pointer transition-all ${
            isBatchMode && selectedAlbumIds.has(album._id)
              ? "ring-2 ring-primary"
              : "hover:ring-2 hover:ring-primary/50"
          } ${isBatchMode ? "select-none" : ""}`}
          onClick={(e) => onAlbumClick(album, e)}
        >
          <CardContent className="p-0">
            <div className="group relative aspect-square overflow-hidden bg-muted">
              <AlbumCover storageId={album.coverImageId} title={album.title} />
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
  );
}
