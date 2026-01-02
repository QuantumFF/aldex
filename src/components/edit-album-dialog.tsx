"use client";

import { albumSchema, type AlbumFormValues } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { api } from "../../convex/_generated/api";
import type { Doc, Id } from "../../convex/_generated/dataModel";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Disc, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { RatingInput } from "./ui/rating-input";
import { YearInput } from "./ui/year-input";

export type AlbumWithCover = Doc<"albums">;

interface EditAlbumDialogProps {
  album: AlbumWithCover | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditAlbumDialog({
  album,
  isOpen,
  onOpenChange,
}: EditAlbumDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const updateAlbum = useMutation(api.albums.update);
  const deleteAlbum = useMutation(api.albums.remove);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const signedCoverUrl = useQuery(
    api.images.getUrl,
    album?.coverImageId ? { storageId: album.coverImageId } : "skip"
  );

  const form = useForm<AlbumFormValues>({
    resolver: zodResolver(albumSchema),
    defaultValues: {
      title: "",
      artist: "",
      acquisition: "wishlist",
      isArchived: false,
      rating: undefined,
      rymLink: "",
      notes: "",
      musicBrainzId: "",
      genres: [],
      coverUrl: "",
    },
  });

  useEffect(() => {
    if (album) {
      form.reset({
        title: album.title,
        artist: album.artist,
        releaseYear: album.releaseYear,
        acquisition: album.acquisition,
        progress: album.progress,
        isArchived: album.isArchived,
        rating: album.rating,
        rymLink: album.rymLink || "",
        notes: album.notes || "",
        musicBrainzId: album.musicBrainzId || "",
        genres: album.genres || [],
        coverUrl: album.coverUrl || "",
      });
    }
  }, [album, form]);

  const onSubmit = async (data: AlbumFormValues) => {
    if (!album) return;
    setIsSubmitting(true);
    try {
      let coverImageId = undefined;

      // Only upload if coverUrl is provided
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
          toast.error("Failed to upload cover image");
        }
      }

      const updateArgs: {
        id: Id<"albums">;
        title: string;
        artist: string;
        releaseYear?: number;
        acquisition: "wishlist" | "library";
        progress?: "backlog" | "active" | "completed";
        isArchived: boolean;
        rating?: number | null;
        rymLink?: string;
        notes?: string;
        musicBrainzId?: string;
        genres?: string[];
        coverImageId?: Id<"_storage">;
        coverUrl?: string;
      } = {
        id: album._id,
        title: data.title,
        artist: data.artist,
        releaseYear: data.releaseYear,
        acquisition: data.acquisition,
        progress: data.progress,
        isArchived: data.isArchived,
        rating: data.rating ?? null,
        rymLink: data.rymLink || undefined,
        notes: data.notes || undefined,
        musicBrainzId: data.musicBrainzId || undefined,
        genres: data.genres,
        coverUrl: data.coverUrl,
      };

      if (coverImageId) {
        updateArgs.coverImageId = coverImageId;
      }

      await updateAlbum(updateArgs);

      toast.success("Album updated successfully");
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update album");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!album) return;
    setIsDeleting(true);
    try {
      await deleteAlbum({ id: album._id as Id<"albums"> });
      toast.success("Album deleted successfully");
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete album");
    } finally {
      setIsDeleting(false);
    }
  };

  const watchAcquisition = form.watch("acquisition");
  const watchCoverUrl = form.watch("coverUrl");

  // Determine which image to show: new URL > existing signed URL > existing URL > placeholder
  const displayImage = watchCoverUrl || signedCoverUrl || album?.coverUrl;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[850px] p-0 gap-0 overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:h-[600px]">
        {/* Left Column: Visuals */}
        <div className="w-full md:w-[320px] bg-muted/30 border-b md:border-b-0 md:border-r flex flex-col p-6 gap-6 shrink-0">
          <div className="aspect-square w-full rounded-xl overflow-hidden border bg-background shadow-sm relative group">
            {displayImage ? (
              <img
                src={displayImage}
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

            {/* Overlay hint */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none" />
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
          <DialogHeader className="px-6 py-4 border-b shrink-0">
            <DialogTitle className="text-base font-medium text-muted-foreground">
              Edit Album Details
            </DialogTitle>
            <DialogDescription className="sr-only">
              Make changes to your album details below.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 flex flex-col min-h-0"
          >
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Primary Info */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    {...form.register("title")}
                    className="text-2xl font-bold border-0 px-0 h-auto rounded-none focus-visible:ring-0 placeholder:text-muted-foreground/50"
                    placeholder="Album Title"
                  />
                  <Input
                    {...form.register("artist")}
                    className="text-lg font-medium text-muted-foreground border-0 px-0 h-auto rounded-none focus-visible:ring-0 placeholder:text-muted-foreground/50"
                    placeholder="Artist Name"
                  />
                </div>
                <div className="h-px bg-border/50 w-full" />
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-6">
                <Field>
                  <FieldLabel>Release Year</FieldLabel>
                  <Controller
                    control={form.control}
                    name="releaseYear"
                    render={({ field }) => (
                      <YearInput
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  <FieldError errors={[form.formState.errors.releaseYear]} />
                </Field>

                <Field>
                  <FieldLabel>Rating</FieldLabel>
                  <Controller
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <RatingInput
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </Field>
              </div>

              {/* Status Section */}
              <div className="grid grid-cols-2 gap-6 p-4 bg-muted/30 rounded-lg border border-border/50">
                <Field>
                  <FieldLabel>Status</FieldLabel>
                  <Controller
                    control={form.control}
                    name="acquisition"
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="wishlist">Wishlist</SelectItem>
                          <SelectItem value="library">
                            Library (Owned)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </Field>

                {watchAcquisition === "library" && (
                  <Field>
                    <FieldLabel>Progress</FieldLabel>
                    <Controller
                      control={form.control}
                      name="progress"
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || "backlog"}
                        >
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Select progress" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="backlog">Backlog</SelectItem>
                            <SelectItem value="active">Listening</SelectItem>
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
                </Field>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t bg-muted/10 flex justify-between items-center shrink-0">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    disabled={isDeleting}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Album</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{album?.title}"? This
                      action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? (
                        <Loader2 className="animate-spin mr-2" />
                      ) : null}
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="animate-spin mr-2" />
                  ) : null}
                  Save Changes
                </Button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
