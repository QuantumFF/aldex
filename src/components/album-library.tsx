"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DashboardView } from "@/app/dashboard/page";

interface AlbumLibraryProps {
  type: DashboardView;
}

export function AlbumLibrary({ type }: AlbumLibraryProps) {
  const getArgs = () => {
    switch (type) {
      case "library":
        return { acquisition: "library" as const };
      case "wishlist":
        return { acquisition: "wishlist" as const };
      case "backlog":
        return { progress: "backlog" as const };
      case "active":
        return { progress: "active" as const };
      case "completed":
        return { progress: "completed" as const };
      default:
        return {};
    }
  };

  const albums = useQuery(api.albums.get, getArgs());
  const [view, setView] = useState<"grid" | "list">("grid");

  const getTitle = () => {
    switch (type) {
      case "library": return "Library";
      case "wishlist": return "Wishlist";
      case "backlog": return "Backlog";
      case "active": return "Active";
      case "completed": return "Completed";
      default: return "Albums";
    }
  };

  if (albums === undefined) {
    return <div className="flex h-40 items-center justify-center">Loading albums...</div>;
  }

  if (albums.length === 0) {
    return (
      <div className="flex h-40 flex-col items-center justify-center gap-2">
        <p className="text-muted-foreground text-lg">No albums found in {getTitle().toLowerCase()}.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">{getTitle()}</h2>
        <ToggleGroup
          type="single"
          value={view}
          onValueChange={(v) => v && setView(v as "grid" | "list")}
        >
          <ToggleGroupItem value="grid" aria-label="Grid view">
            <LayoutGrid className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="List view">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {albums.map((album) => (
            <Card key={album._id} className="overflow-hidden border-none bg-transparent shadow-none">
              <CardContent className="p-0">
                <div className="group relative aspect-square overflow-hidden rounded-md bg-muted">
                  {album.coverImageUrl ? (
                    <img
                      src={album.coverImageUrl}
                      alt={album.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      No Cover
                    </div>
                  )}
                  {album.rating && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="font-bold">
                        {album.rating}/10
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="mt-2 space-y-1">
                  <h3 className="line-clamp-1 text-sm font-medium leading-none">{album.title}</h3>
                  <p className="line-clamp-1 text-muted-foreground text-xs">{album.artist}</p>
                  {album.releaseYear && (
                    <p className="text-muted-foreground text-[10px]">{album.releaseYear}</p>
                  )}
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
                <TableHead className="w-[80px]">Cover</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Artist</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {albums.map((album) => (
                <TableRow key={album._id}>
                  <TableCell>
                    <div className="h-12 w-12 overflow-hidden rounded bg-muted">
                      {album.coverImageUrl ? (
                        <img
                          src={album.coverImageUrl}
                          alt={album.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                          N/A
                        </div>
                      )}
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
                    {album.progress ? (
                      <Badge variant="secondary" className="capitalize">
                        {album.progress}
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
    </div>
  );
}
