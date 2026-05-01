"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  getAlbumCover,
  searchAlbums,
  type MusicBrainzReleaseGroup,
} from "@/lib/musicbrainz";
import { generateRymLink } from "@/lib/utils";
import { useAction, useMutation } from "convex/react";
import { Check, Disc, ListPlus, Loader2, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";

export function BulkAddAlbumsDialog() {
  const [open, setOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"text" | "search">("text");

  // Text Mode State
  const [text, setText] = React.useState("");

  // Search Mode State
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<
    MusicBrainzReleaseGroup[]
  >([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [stagedAlbums, setStagedAlbums] = React.useState<
    MusicBrainzReleaseGroup[]
  >([]);

  // Processing State
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [progress, setProgress] = React.useState({ current: 0, total: 0 });

  const createAlbum = useMutation(api.albums.create);
  const storeCoverArt = useAction(api.images.storeCoverArt);

  React.useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await searchAlbums(searchQuery);
        setSearchResults(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const toggleStagedAlbum = (album: MusicBrainzReleaseGroup) => {
    setStagedAlbums((prev) => {
      const isSelected = prev.some((a) => a.id === album.id);
      if (isSelected) {
        return prev.filter((a) => a.id !== album.id);
      } else {
        return [...prev, album];
      }
    });
  };

  const removeStagedAlbum = (id: string) => {
    setStagedAlbums((prev) => prev.filter((a) => a.id !== id));
  };

  const handleBulkAddText = async () => {
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) return;

    setIsProcessing(true);
    setProgress({ current: 0, total: lines.length });

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const query = lines[i];
      try {
        const results = await searchAlbums(query);
        const bestMatch = results[0];

        if (bestMatch) {
          await addSingleAlbum(bestMatch);
          successCount++;
        } else {
          failCount++;
          console.warn(`No results found for: ${query}`);
        }
      } catch (error) {
        console.error(`Failed to process: ${query}`, error);
        failCount++;
      }

      setProgress({ current: i + 1, total: lines.length });
    }

    finishProcessing(successCount, failCount);
    setText("");
  };

  const handleBulkAddSearch = async () => {
    if (stagedAlbums.length === 0) return;

    setIsProcessing(true);
    setProgress({ current: 0, total: stagedAlbums.length });

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < stagedAlbums.length; i++) {
      const album = stagedAlbums[i];
      try {
        await addSingleAlbum(album);
        successCount++;
      } catch (error) {
        console.error(`Failed to process: ${album.title}`, error);
        failCount++;
      }

      setProgress({ current: i + 1, total: stagedAlbums.length });
    }

    finishProcessing(successCount, failCount);
    setStagedAlbums([]);
    setSearchQuery("");
  };

  const addSingleAlbum = async (album: MusicBrainzReleaseGroup) => {
    const artist = album["artist-credit"]?.[0]?.name || "";
    const title = album.title;
    const releaseYear = album["first-release-date"]
      ? parseInt(album["first-release-date"].split("-")[0])
      : undefined;

    // Add to backlog by default for bulk import
    const albumId = await createAlbum({
      title,
      artist,
      releaseYear,
      acquisition: "library",
      progress: "backlog",
      isArchived: false,
      musicBrainzId: album.id,
      rymLink: generateRymLink(artist, title),
    });

    // Kick off cover art fetch asynchronously
    getAlbumCover(album.id).then((coverUrl) => {
      if (coverUrl || album.id) {
        storeCoverArt({
          albumId,
          coverUrl: coverUrl || undefined,
          musicBrainzId: album.id,
        }).catch((e) => console.error("Failed to store cover:", e));
      }
    });
  };

  const finishProcessing = (successCount: number, failCount: number) => {
    setIsProcessing(false);
    setOpen(false);

    if (failCount > 0) {
      toast.warning(
        `Bulk add complete: ${successCount} added, ${failCount} failed.`,
      );
    } else {
      toast.success(`Successfully added ${successCount} albums!`);
    }
  };

  const isAddDisabled =
    isProcessing ||
    (activeTab === "text" && text.trim().length === 0) ||
    (activeTab === "search" && stagedAlbums.length === 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" title="Bulk Add Albums">
          <ListPlus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Bulk Add Albums</DialogTitle>
          <DialogDescription>
            Import multiple albums at once using a text list or by searching.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "text" | "search")}
          className="w-full mt-2"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text" disabled={isProcessing}>
              Text List
            </TabsTrigger>
            <TabsTrigger value="search" disabled={isProcessing}>
              Search & Select
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="mt-4">
            <div className="flex flex-col gap-4">
              <Textarea
                placeholder={`The Beatles - Abbey Road\nPink Floyd - Dark Side of the Moon\n...`}
                className="min-h-[250px] resize-y font-mono text-sm"
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={isProcessing}
              />
            </div>
          </TabsContent>

          <TabsContent value="search" className="mt-4">
            <div className="flex flex-col gap-4">
              <Command
                className="border rounded-md overflow-hidden"
                shouldFilter={false}
              >
                <CommandInput
                  placeholder="Search albums to add..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  disabled={isProcessing}
                />
                <CommandList className="max-h-[200px]">
                  {isSearching ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Searching...
                    </div>
                  ) : searchResults.length === 0 && searchQuery ? (
                    <CommandEmpty>No results found.</CommandEmpty>
                  ) : (
                    <CommandGroup>
                      {searchResults.map((album) => {
                        const isSelected = stagedAlbums.some(
                          (a) => a.id === album.id,
                        );
                        return (
                          <CommandItem
                            key={album.id}
                            value={album.id}
                            onSelect={() => toggleStagedAlbum(album)}
                            disabled={isProcessing}
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <Disc className="h-4 w-4 text-muted-foreground" />
                              <div className="flex flex-col">
                                <span>{album.title}</span>
                                <span className="text-xs text-muted-foreground">
                                  {album["artist-credit"]?.[0]?.name} (
                                  {album["first-release-date"]?.split("-")[0]})
                                </span>
                              </div>
                            </div>
                            {isSelected && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>

              {stagedAlbums.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="text-sm font-medium">
                    Selected ({stagedAlbums.length})
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto p-1">
                    {stagedAlbums.map((album) => (
                      <Badge
                        key={album.id}
                        variant="secondary"
                        className="flex items-center gap-1 pr-1"
                      >
                        <span className="truncate max-w-[150px]">
                          {album.title}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1 hover:bg-transparent text-muted-foreground hover:text-foreground"
                          onClick={() => removeStagedAlbum(album.id)}
                          disabled={isProcessing}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {isProcessing && (
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Processing...</span>
              <span>
                {progress.current} / {progress.total}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-primary transition-all duration-300 ease-in-out"
                style={{
                  width: `${
                    progress.total > 0
                      ? (progress.current / progress.total) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-4">
          <Button
            variant="ghost"
            onClick={() => {
              setOpen(false);
              setStagedAlbums([]);
              setSearchQuery("");
            }}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={
              activeTab === "text" ? handleBulkAddText : handleBulkAddSearch
            }
            disabled={isAddDisabled}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Import ${
                activeTab === "search" && stagedAlbums.length > 0
                  ? stagedAlbums.length
                  : ""
              } Albums`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
