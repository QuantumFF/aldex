"use client";

import {
  getAlbumCover,
  searchAlbums,
  type MusicBrainzReleaseGroup,
} from "@/lib/musicbrainz";
import { generateRymLink } from "@/lib/utils";
import { albumSchema, type AlbumFormValues } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { api } from "../../convex/_generated/api";

import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { FieldLabel } from "@/components/ui/field";
import { Loader2 } from "lucide-react";
import { AlbumFormSidebar, AlbumFormDetails } from "./shared-album-form-fields";
interface AddAlbumFormProps {
  initialData?: Partial<AlbumFormValues>;
  onSuccess?: () => void;
}

export function AddAlbumForm({ initialData, onSuccess }: AddAlbumFormProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<MusicBrainzReleaseGroup[]>(
    [],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const createAlbum = useMutation(api.albums.create);

  const form = useForm<AlbumFormValues>({
    resolver: zodResolver(albumSchema),
    defaultValues: {
      title: initialData?.title || "",
      artist: initialData?.artist || "",
      acquisition: initialData?.acquisition || "wishlist",
      isArchived: initialData?.isArchived || false,
      rating: initialData?.rating,
      rymLink: initialData?.rymLink || "",
      notes: initialData?.notes || "",
      musicBrainzId: initialData?.musicBrainzId || "",
      genres: initialData?.genres || [],
      coverUrl: initialData?.coverUrl || "",
      releaseYear: initialData?.releaseYear,
    },
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const results = await searchAlbums(searchQuery);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleSelectAlbum = async (album: MusicBrainzReleaseGroup) => {
    const artist = album["artist-credit"]?.[0]?.name || "";
    form.setValue("title", album.title);
    form.setValue("artist", artist);
    const year = album["first-release-date"]
      ? parseInt(album["first-release-date"].split("-")[0])
      : undefined;
    if (year) form.setValue("releaseYear", year);
    form.setValue("musicBrainzId", album.id);
    form.setValue("rymLink", generateRymLink(artist, album.title));

    // Try to get cover art
    const cover = await getAlbumCover(album.id);
    if (cover) {
      form.setValue("coverUrl", cover);
    }

    // Clear search
    setSearchQuery("");
  };

  const onSubmit = async (data: AlbumFormValues) => {
    setIsSubmitting(true);
    try {
      await createAlbum({
        title: data.title,
        artist: data.artist,
        releaseYear: data.releaseYear,
        acquisition: data.acquisition,
        progress: data.progress,
        isArchived: data.isArchived,
        rating: data.rating,
        rymLink: data.rymLink || undefined,
        notes: data.notes || undefined,
        musicBrainzId: data.musicBrainzId || undefined,
        genres: data.genres,
        coverUrl: data.coverUrl || undefined,
      });

      form.reset();
      if (onSuccess) {
        onSuccess();
      } else {
        alert("Album added!");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to add album");
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchCoverUrl = form.watch("coverUrl");

  if (!initialData) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <FieldLabel>Search MusicBrainz</FieldLabel>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Combobox>
                <ComboboxInput
                  placeholder="Search for album..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSearch();
                    }
                  }}
                />
                <ComboboxContent>
                  <ComboboxList>
                    {isSearching ? (
                      <div className="p-2 text-center text-sm text-muted-foreground">
                        Searching...
                      </div>
                    ) : searchResults.length === 0 ? (
                      <ComboboxEmpty>No results found.</ComboboxEmpty>
                    ) : (
                      searchResults.map((album) => (
                        <ComboboxItem
                          key={album.id}
                          onClick={() => handleSelectAlbum(album)}
                          className="cursor-pointer"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{album.title}</span>
                            <span className="text-xs text-muted-foreground">
                              {album["artist-credit"]?.[0]?.name} (
                              {album["first-release-date"]?.split("-")[0]})
                            </span>
                          </div>
                        </ComboboxItem>
                      ))
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>
            <Button onClick={handleSearch} disabled={isSearching} type="button">
              {isSearching ? <Loader2 className="animate-spin" /> : "Search"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col md:flex-row h-full"
    >
      {/* Left Column: Visuals */}
      <div className="w-full md:w-[320px] bg-muted/30 border-b md:border-b-0 md:border-r flex flex-col p-6 gap-6 shrink-0 md:overflow-y-auto">
        <AlbumFormSidebar form={form} coverPreviewUrl={watchCoverUrl} />
      </div>

      {/* Right Column: Form */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        <div className="px-6 py-4 border-b shrink-0 flex justify-between items-center">
          <h2 className="text-base font-medium text-muted-foreground">
            Edit & Add Album
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <AlbumFormDetails form={form} />
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t bg-muted/10 flex justify-end items-center shrink-0">
          <Button type="button" variant="ghost" onClick={onSuccess} className="mr-2">Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
            Add Album
          </Button>
        </div>
      </div>
    </form>
  );
}
