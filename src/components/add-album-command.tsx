"use client";

import { AddAlbumForm } from "@/components/add-album-form";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getAlbumCover,
  searchAlbums,
  type MusicBrainzReleaseGroup,
} from "@/lib/musicbrainz";
import { cn, generateRymLink } from "@/lib/utils";
import { useMutation } from "convex/react";
import { Disc, Loader2, Search } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";

export function AddAlbumCommand() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<MusicBrainzReleaseGroup[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedAlbum, setSelectedAlbum] =
    React.useState<MusicBrainzReleaseGroup | null>(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [coverUrl, setCoverUrl] = React.useState<string | null>(null);
  const [loadingCover, setLoadingCover] = React.useState(false);
  const [adding, setAdding] = React.useState(false);
  const addToLibraryButtonRef = React.useRef<HTMLButtonElement>(null);

  const createAlbum = useMutation(api.albums.create);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  React.useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchAlbums(query);
        setResults(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  React.useEffect(() => {
    if (!loadingCover && confirmOpen && addToLibraryButtonRef.current) {
      addToLibraryButtonRef.current.focus();
    }
  }, [loadingCover, confirmOpen]);

  const handleSelect = async (album: MusicBrainzReleaseGroup) => {
    setSelectedAlbum(album);
    setOpen(false);
    setConfirmOpen(true);
    setLoadingCover(true);
    setCoverUrl(null);

    try {
      // Fetch cover art
      const cover = await getAlbumCover(album.id);
      setCoverUrl(cover);
    } finally {
      setLoadingCover(false);
    }
  };

  const handleAdd = async (acquisition: "library" | "wishlist") => {
    if (!selectedAlbum) return;
    setAdding(true);

    try {
      const artist = selectedAlbum["artist-credit"]?.[0]?.name || "";
      await createAlbum({
        title: selectedAlbum.title,
        artist,
        releaseYear: selectedAlbum["first-release-date"]
          ? parseInt(selectedAlbum["first-release-date"].split("-")[0])
          : undefined,
        acquisition,
        progress: acquisition === "library" ? "backlog" : undefined,
        isArchived: false,
        musicBrainzId: selectedAlbum.id,
        coverUrl: coverUrl || undefined,
        rymLink: generateRymLink(artist, selectedAlbum.title),
      });

      toast.success("Album added successfully");
      setConfirmOpen(false);
      setSelectedAlbum(null);
      setCoverUrl(null);
    } catch (error) {
      console.error("Failed to add album", error);
      const message =
        error instanceof Error && error.message.includes("Album already exists")
          ? "This album is already in your library."
          : "Failed to add album";
      toast.error(message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          "relative h-9 w-9 p-0 md:h-9 md:w-40 md:justify-start md:px-3 md:py-2 lg:w-64",
          "text-sm text-muted-foreground"
        )}
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 md:mr-2" />
        <span className="hidden md:inline-flex">Search albums...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 md:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        commandProps={{ shouldFilter: false }}
      >
        <CommandInput
          placeholder="Search albums..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {loading && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          )}
          {!loading && results.length > 0 && (
            <CommandGroup heading="Suggestions">
              {results.map((album) => (
                <CommandItem
                  key={album.id}
                  value={album.id}
                  onSelect={() => handleSelect(album)}
                >
                  <Disc className="mr-2 h-4 w-4" />
                  <div className="flex flex-col">
                    <span>{album.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {album["artist-credit"]?.[0]?.name} (
                      {album["first-release-date"]?.split("-")[0]})
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Album</DialogTitle>
          </DialogHeader>
          {selectedAlbum && (
            <div className="grid gap-4 py-4">
              <div className="flex items-start gap-4">
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border bg-muted">
                  {loadingCover ? (
                    <div className="flex h-full w-full items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : coverUrl ? (
                    <img
                      src={coverUrl}
                      alt={selectedAlbum.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Disc className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="grid gap-1">
                  <h3 className="font-semibold leading-none tracking-tight">
                    {selectedAlbum.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedAlbum["artist-credit"]?.[0]?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedAlbum["first-release-date"]?.split("-")[0]}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <div className="flex gap-2 w-full">
              <Button
                ref={addToLibraryButtonRef}
                className="flex-1"
                onClick={() => handleAdd("library")}
                disabled={adding || loadingCover}
              >
                {adding ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Add to Library
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => handleAdd("wishlist")}
                disabled={adding || loadingCover}
              >
                Add to Wishlist
              </Button>
            </div>
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setConfirmOpen(false);
                  setEditOpen(true);
                }}
              >
                Edit Details
              </Button>
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setConfirmOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit & Add Album</DialogTitle>
          </DialogHeader>
          {selectedAlbum && (
            <AddAlbumForm
              initialData={{
                title: selectedAlbum.title,
                artist: selectedAlbum["artist-credit"]?.[0]?.name || "",
                releaseYear: selectedAlbum["first-release-date"]
                  ? parseInt(selectedAlbum["first-release-date"].split("-")[0])
                  : undefined,
                musicBrainzId: selectedAlbum.id,
                coverUrl: coverUrl || "",
                rymLink: generateRymLink(
                  selectedAlbum["artist-credit"]?.[0]?.name || "",
                  selectedAlbum.title
                ),
              }}
              onSuccess={() => {
                setEditOpen(false);
                setSelectedAlbum(null);
                setCoverUrl(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
