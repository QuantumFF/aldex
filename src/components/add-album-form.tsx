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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Disc, ImagePlus, Loader2 } from "lucide-react";

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

  const watchAcquisition = form.watch("acquisition");
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
      <div className="w-full md:w-[320px] bg-muted/30 border-b md:border-b-0 md:border-r flex flex-col p-6 gap-6 shrink-0">
        <div className="aspect-square w-full rounded-xl overflow-hidden border bg-background shadow-sm relative group">
          {watchCoverUrl ? (
            <img
              src={watchCoverUrl}
              alt="Album cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/50">
              <Disc className="w-16 h-16 opacity-20" />
              <span className="text-xs mt-2 font-medium opacity-50">
                No Cover
              </span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Field>
            <FieldLabel className="text-xs uppercase tracking-wider text-muted-foreground">
              Cover Image URL
            </FieldLabel>
            <div className="relative">
              <ImagePlus className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                {...form.register("coverUrl")}
                placeholder="Paste image URL..."
                className="pl-9 bg-background"
              />
            </div>
            <FieldError errors={[form.formState.errors.coverUrl]} />
          </Field>

          <div className="p-4 rounded-lg bg-background border space-y-3">
            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel className="text-xs font-medium">
                  Archived
                </FieldLabel>
                <Controller
                  control={form.control}
                  name="isArchived"
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Hidden from default library views
              </p>
            </Field>
          </div>
        </div>
      </div>

      {/* Right Column: Form */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        <div className="px-6 py-4 border-b shrink-0">
          <h2 className="text-base font-medium text-muted-foreground">
            Edit & Add Album
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Primary Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                {...form.register("title")}
                className="text-2xl font-bold border-0 px-3 py-2 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/50"
                placeholder="Album Title"
              />
              <Input
                {...form.register("artist")}
                className="text-lg font-medium text-muted-foreground border-0 px-3 py-2 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/50"
                placeholder="Artist Name"
              />
            </div>
            <div className="h-px bg-border/50 w-full" />
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-6">
            <Field>
              <FieldLabel>Release Year</FieldLabel>
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
                        <SelectItem value="active">
                          Active (Listening)
                        </SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            )}
          </div>

          {/* Additional Details */}
          <div className="space-y-4">
            <Field>
              <FieldLabel>Notes</FieldLabel>
              <Textarea
                {...form.register("notes")}
                className="min-h-[100px] resize-none bg-muted/10"
                placeholder="Add personal notes, review, or thoughts..."
              />
            </Field>

            <Field>
              <FieldLabel>RYM Link</FieldLabel>
              <Input
                {...form.register("rymLink")}
                placeholder="https://rateyourmusic.com/..."
                className="font-mono text-xs"
              />
              <FieldError errors={[form.formState.errors.rymLink]} />
            </Field>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t bg-muted/10 flex justify-end items-center shrink-0">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
            Add Album
          </Button>
        </div>
      </div>
    </form>
  );
}
