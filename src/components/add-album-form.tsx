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
import { Controller, useForm } from "react-hook-form";
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
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface AddAlbumFormProps {
  initialData?: Partial<AlbumFormValues>;
  onSuccess?: () => void;
}

export function AddAlbumForm({ initialData, onSuccess }: AddAlbumFormProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<MusicBrainzReleaseGroup[]>(
    []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
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
      let coverImageId = undefined;

      // Handle Image Upload if URL exists
      if (data.coverUrl) {
        try {
          const response = await fetch(data.coverUrl);
          const blob = await response.blob();
          const uploadUrl = await generateUploadUrl();

          const result = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": blob.type },
            body: blob,
          });

          const { storageId } = await result.json();
          coverImageId = storageId;
        } catch (e) {
          console.error("Failed to upload image", e);
          // Continue without image or show error? For now continue.
        }
      }

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
        coverImageId: coverImageId,
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

  const watchAcquisition = form.watch("acquisition");

  return (
    <div className="space-y-6">
      {/* Search Section - Only show if no initial data provided */}
      {!initialData && (
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
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field>
            <FieldLabel>Title</FieldLabel>
            <Input {...form.register("title")} />
            <FieldError errors={[form.formState.errors.title]} />
          </Field>

          <Field>
            <FieldLabel>Artist</FieldLabel>
            <Input {...form.register("artist")} />
            <FieldError errors={[form.formState.errors.artist]} />
          </Field>

          <Field>
            <FieldLabel>Year</FieldLabel>
            <Input
              type="number"
              {...form.register("releaseYear", { valueAsNumber: true })}
            />
            <FieldError errors={[form.formState.errors.releaseYear]} />
          </Field>

          <Field>
            <FieldLabel>Acquisition Status</FieldLabel>
            <Controller
              control={form.control}
              name="acquisition"
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wishlist">Wishlist</SelectItem>
                    <SelectItem value="library">Library (Owned)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[form.formState.errors.acquisition]} />
          </Field>
        </div>

        {watchAcquisition === "library" && (
          <Field>
            <FieldLabel>Listening Progress</FieldLabel>
            <Controller
              control={form.control}
              name="progress"
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || "backlog"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select progress" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="backlog">
                      Backlog (Not Started)
                    </SelectItem>
                    <SelectItem value="active">Active (Listening)</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
        )}

        <Field>
          <FieldLabel>Cover Image URL</FieldLabel>
          <Input {...form.register("coverUrl")} placeholder="https://..." />
          <FieldDescription>
            Auto-filled from search or paste manually.
          </FieldDescription>
          <FieldError errors={[form.formState.errors.coverUrl]} />
        </Field>

        <Field>
          <FieldLabel>RYM Link</FieldLabel>
          <Input
            {...form.register("rymLink")}
            placeholder="https://rateyourmusic.com/..."
          />
          <FieldError errors={[form.formState.errors.rymLink]} />
        </Field>

        <Field>
          <FieldLabel>Notes</FieldLabel>
          <Textarea {...form.register("notes")} />
        </Field>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
          Add Album
        </Button>
      </form>
    </div>
  );
}
