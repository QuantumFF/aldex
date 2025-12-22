import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Doc } from "../../convex/_generated/dataModel";
import { AlbumCover } from "./album-cover";

type Album = Doc<"albums"> & { rymLink?: string };

interface AlbumListProps {
  albums: Album[];
  isBatchMode: boolean;
  selectedAlbumIds: Set<string>;
  onAlbumClick: (album: Album, e: React.MouseEvent) => void;
  onToggleSelection: (id: string) => void;
  onSelectAll: () => void;
}

export function AlbumList({
  albums,
  isBatchMode,
  selectedAlbumIds,
  onAlbumClick,
  onToggleSelection,
  onSelectAll,
}: AlbumListProps) {
  const isAllSelected =
    albums.length > 0 && selectedAlbumIds.size === albums.length;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {isBatchMode && (
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={onSelectAll}
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
          {albums.map((album) => (
            <TableRow
              key={album._id}
              className={`cursor-pointer hover:bg-muted/50 ${
                isBatchMode && selectedAlbumIds.has(album._id) ? "bg-muted" : ""
              } ${isBatchMode ? "select-none" : ""}`}
              onClick={(e) => onAlbumClick(album, e)}
            >
              {isBatchMode && (
                <TableCell>
                  <Checkbox
                    checked={selectedAlbumIds.has(album._id)}
                    onCheckedChange={() => onToggleSelection(album._id)}
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
  );
}
