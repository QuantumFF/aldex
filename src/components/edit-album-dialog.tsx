"use client";

import { albumSchema, type AlbumFormValues } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { RatingInput } from "./ui/rating-input";

export type AlbumWithCover = Doc<"albums"> & { coverImageUrl: string | null };

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
        coverUrl: album.coverImageUrl || "",
      });
    }
  }, [album, form]);

  const onSubmit = async (data: AlbumFormValues) => {
    if (!album) return;
    setIsSubmitting(true);
    try {
      let coverImageId = undefined;

      // Only upload if coverUrl changed and is not empty
      // We assume if it matches the existing signed URL (or is empty), we don't need to upload.
      // Note: album.coverImageUrl is the signed URL.
      if (data.coverUrl && data.coverUrl !== album.coverImageUrl) {
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
          // If upload fails, we might want to stop or continue?
          // For now, we'll continue but maybe alert the user?
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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Album</DialogTitle>
          <DialogDescription>
            Make changes to your album here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
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
                  <Select onValueChange={field.onChange} value={field.value}>
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
                    value={field.value || "backlog"}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Rating (1-10)</FieldLabel>
              <Controller
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <RatingInput value={field.value} onChange={field.onChange} />
                )}
              />
              <FieldError errors={[form.formState.errors.rating]} />
            </Field>

            <Field>
              <FieldLabel>Archived</FieldLabel>
              <div className="flex items-center h-10">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    {...form.register("isArchived")}
                  />
                  <span className="text-sm">Hide from default views</span>
                </label>
              </div>
            </Field>
          </div>

          <Field>
            <FieldLabel>Cover Image URL</FieldLabel>
            <Input {...form.register("coverUrl")} placeholder="https://..." />
            <FieldDescription>
              Paste a new URL to update the cover.
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

          <div className="flex justify-between items-center pt-4 border-t">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  type="button"
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Album
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the album "{album?.title}" from your collection.
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

            <div className="flex gap-2">
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
      </DialogContent>
    </Dialog>
  );
}
