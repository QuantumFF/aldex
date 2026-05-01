"use client";

import { AddAlbumForm } from "@/components/add-album-form";
import { Badge } from "@/components/ui/badge";
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
import { useAction, useMutation } from "convex/react";
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
  const storeCoverArt = useAction(api.images.storeCoverArt);

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

    // Fetch cover art in background for preview
    // We don't await this so the UI is responsive immediately
    getAlbumCover(album.id)
      .then((cover) => {
        if (cover) setCoverUrl(cover);
      })
      .finally(() => {
        setLoadingCover(false);
      });
  };

  const handleAdd = async (acquisition: "library" | "wishlist") => {
    if (!selectedAlbum) return;
    setAdding(true);

    try {
      const artist = selectedAlbum["artist-credit"]?.[0]?.name || "";
      const albumId = await createAlbum({
        title: selectedAlbum.title,
        artist,
        releaseYear: selectedAlbum["first-release-date"]
          ? parseInt(selectedAlbum["first-release-date"].split("-")[0])
          : undefined,
        acquisition,
        progress: acquisition === "library" ? "backlog" : undefined,
        isArchived: false,
        musicBrainzId: selectedAlbum.id,
        // We don't pass coverUrl here to avoid the server-side auto-fetch
        // We will handle it manually below to show progress
        rymLink: generateRymLink(artist, selectedAlbum.title),
      });

      setConfirmOpen(false);
      setSelectedAlbum(null);
      setCoverUrl(null);

      // Start background fetch with toast
      toast.promise(
        async () => {
          // 1. Try to get URL from client-side cache/fetch if we have it
          let url = coverUrl;
          if (!url) {
            url = await getAlbumCover(selectedAlbum.id);
          }

          // 2. Call the action to store it
          await storeCoverArt({
            albumId,
            coverUrl: url || undefined,
            musicBrainzId: selectedAlbum.id,
          });
        },
        {
          loading: "Album added! Fetching high-res cover art... Please keep this window open.",
          success: "Cover art fetched and saved successfully!",
          error: "Album added, but we couldn't find high-res cover art.",
        },
      );
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
          "text-sm text-muted-foreground",
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
        <DialogContent className="sm:max-w-[425px] overflow-hidden p-0 border-border/50 shadow-2xl bg-background rounded-xl">
          {selectedAlbum && (
            <div className="relative flex flex-col">
              {/* Dramatic Header with Cover Art */}
              <div className="relative h-56 w-full bg-muted/30">
                {loadingCover ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-md z-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : coverUrl ? (
                  <img
                    src={coverUrl}
                    alt={selectedAlbum.title}
                    className="h-full w-full object-cover scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted/20">
                    <Disc className="h-16 w-16 text-muted-foreground/30" />
                  </div>
                )}
                {/* Gradient overlay to seamlessly blend into background */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
              </div>

              {/* Text Content pulled up over the gradient */}
              <div className="relative z-20 px-6 pb-6 pt-0 text-center -mt-16 space-y-2">
                <Badge variant="secondary" className="mb-2 shadow-sm uppercase tracking-widest text-[10px] font-sans">
                  {selectedAlbum["first-release-date"]?.split("-")[0] || "Unknown Year"}
                </Badge>
                <h3 className="text-3xl font-serif font-bold tracking-tight leading-none drop-shadow-sm">
                  {selectedAlbum.title}
                </h3>
                <p className="text-sm font-sans font-medium text-muted-foreground uppercase tracking-wider">
                  {selectedAlbum["artist-credit"]?.[0]?.name}
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="px-6 pb-6 pt-2 flex-col gap-3 sm:flex-col border-t border-border/10">
            <div className="grid grid-cols-2 gap-3 w-full">
              <Button
                ref={addToLibraryButtonRef}
                size="lg"
                className="w-full font-semibold shadow-md"
                onClick={() => handleAdd("library")}
                disabled={adding}
              >
                {adding ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Add to Library
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="w-full font-medium shadow-sm"
                onClick={() => handleAdd("wishlist")}
                disabled={adding}
              >
                Add to Wishlist
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setConfirmOpen(false);
                  setEditOpen(true);
                }}
              >
                Edit Details First
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setConfirmOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[850px] p-0 gap-0 overflow-hidden flex flex-col max-h-[90vh] md:h-[600px]">
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
                  selectedAlbum.title,
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
