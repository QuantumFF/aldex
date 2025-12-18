"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect, useMemo } from "react";
import { LayoutGrid, List, Search, X } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { DashboardView } from "@/app/dashboard/page";

interface AlbumLibraryProps {
  type: DashboardView;
}

export function AlbumLibrary({ type }: AlbumLibraryProps) {
  // Fetch ALL albums
  const allAlbums = useQuery(api.albums.get, {});
  
  const [view, setView] = useState<"grid" | "list">("grid");
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [acquisitionFilter, setAcquisitionFilter] = useState<string>("all");
  const [progressFilter, setProgressFilter] = useState<string>("all");

  // Sync filters with the 'type' prop (sidebar navigation)
  useEffect(() => {
    setSearchQuery("");
    switch (type) {
      case "library":
        setAcquisitionFilter("library");
        setProgressFilter("all");
        break;
      case "wishlist":
        setAcquisitionFilter("wishlist");
        setProgressFilter("all");
        break;
      case "backlog":
        setAcquisitionFilter("library");
        setProgressFilter("backlog");
        break;
      case "active":
        setAcquisitionFilter("library");
        setProgressFilter("active");
        break;
      case "completed":
        setAcquisitionFilter("library");
        setProgressFilter("completed");
        break;
      default:
        setAcquisitionFilter("all");
        setProgressFilter("all");
    }
  }, [type]);

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
      if (acquisitionFilter !== "all" && album.acquisition !== acquisitionFilter) {
        return false;
      }

      // 3. Progress Filter
      if (progressFilter !== "all") {
        // If filtering by progress, we implicitly require acquisition to be 'library' usually,
        // but the schema says 'progress' is optional.
        // If album doesn't have progress, it shouldn't match a specific progress filter.
        if (album.progress !== progressFilter) return false;
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
    if (searchQuery || acquisitionFilter !== "all" || progressFilter !== "all") {
      return `Albums (${filteredAlbums.length})`;
    }
    return "All Albums";
  };

  if (allAlbums === undefined) {
    return <div className="flex h-40 items-center justify-center">Loading albums...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">{getTitle()}</h2>
        
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
          <div className="flex gap-2">
            <Select value={acquisitionFilter} onValueChange={setAcquisitionFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="library">Library</SelectItem>
                <SelectItem value="wishlist">Wishlist</SelectItem>
              </SelectContent>
            </Select>

            <Select value={progressFilter} onValueChange={setProgressFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Progress" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Progress</SelectItem>
                <SelectItem value="backlog">Backlog</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            {(searchQuery || acquisitionFilter !== "all" || progressFilter !== "all") && (
               <Button variant="ghost" size="icon" onClick={clearFilters} title="Clear Filters">
                 <X className="h-4 w-4" />
               </Button>
            )}
          </div>

          {/* View Toggle */}
          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(v) => v && setView(v as "grid" | "list")}
            className="border rounded-md p-1"
          >
            <ToggleGroupItem value="grid" aria-label="Grid view" className="h-7 w-7 p-0">
              <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view" className="h-7 w-7 p-0">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {filteredAlbums.length === 0 ? (
        <div className="flex h-60 flex-col items-center justify-center gap-2 rounded-md border border-dashed">
          <p className="text-muted-foreground text-lg">No albums match your filters.</p>
          <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filteredAlbums.map((album) => (
            <Card key={album._id} className="overflow-hidden p-0">
              <CardContent className="p-0">
                <div className="group relative aspect-square overflow-hidden bg-muted">
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
                  <div className="absolute bottom-2 left-2 flex gap-1">
                     {album.progress && (
                        <Badge variant="default" className="text-[10px] h-5 capitalize opacity-90 shadow-sm">
                          {album.progress}
                        </Badge>
                     )}
                  </div>
                </div>
                <div className="p-3 space-y-1">
                  <h3 className="line-clamp-1 text-sm font-semibold leading-tight">{album.title}</h3>
                  <p className="line-clamp-1 text-muted-foreground text-xs">{album.artist}</p>
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
                <TableRow key={album._id}>
                  <TableCell>
                    <div className="h-10 w-10 overflow-hidden rounded bg-muted">
                      {album.coverImageUrl ? (
                        <img
                          src={album.coverImageUrl}
                          alt={album.title}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
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
                    {album.progress ? (
                      <Badge variant="outline" className="capitalize">
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