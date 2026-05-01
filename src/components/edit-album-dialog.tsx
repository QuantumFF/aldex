"use client";

import type { UserAlbum } from "@/lib/types";
import { albumSchema, type AlbumFormValues } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

import { DeleteAlbumDialog } from "@/components/delete-album-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Disc, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { Controller } from "react-hook-form";
import { toast } from "sonner";
import { AlbumFormDetails, AlbumFormSidebar } from "./shared-album-form-fields";

interface EditAlbumDialogProps {
  album: UserAlbum | null;
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
    album?.coverImageId ? { storageId: album.coverImageId } : "skip",
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
        id: Id<"user_albums">;
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
      await deleteAlbum({ id: album._id });
      toast.success("Album deleted successfully");
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete album");
    } finally {
      setIsDeleting(false);
    }
  };

  const watchCoverUrl = form.watch("coverUrl");

  // Determine which image to show:
  // 1. If user changed the URL input, show that (preview)
  // 2. If we have a stored image (signedCoverUrl), show that (backend source)
  // 3. Fallback to the form's current value (original URL)
  const isCoverUrlChanged = watchCoverUrl !== (album?.coverUrl || "");
  const displayImage = isCoverUrlChanged
    ? watchCoverUrl
    : signedCoverUrl || watchCoverUrl;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-[850px] p-0 gap-0 overflow-hidden flex flex-col md:flex-row max-h-[90svh] md:h-[600px]">
        {/* Mobile: full-width cover banner + URL/archived controls below */}
        <div className="flex md:hidden flex-col bg-muted/30 border-b shrink-0">
          {/* Cover art banner */}
          <div className="relative h-36 w-full overflow-hidden bg-muted/50">
            {displayImage ? (
              <img src={displayImage} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Disc className="w-10 h-10 opacity-20" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent" />
          </div>
          {/* Cover URL + Archived */}
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="relative flex-1 min-w-0">
              <ImagePlus className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                {...form.register("coverUrl")}
                placeholder="Paste image URL..."
                className="pl-8 text-xs h-8 bg-background"
              />
            </div>
            <label className="flex items-center gap-1.5 shrink-0 cursor-pointer">
              <Controller
                control={form.control}
                name="isArchived"
                render={({ field }) => (
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
              <span className="text-xs text-muted-foreground">Archived</span>
            </label>
          </div>
        </div>

        {/* Desktop: full sidebar column */}
        <div className="hidden md:flex md:w-[320px] bg-muted/30 border-r flex-col p-6 gap-6 shrink-0 overflow-y-auto">
          <AlbumFormSidebar form={form} coverPreviewUrl={displayImage} />
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
              <AlbumFormDetails form={form} />
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t bg-muted/10 shrink-0 flex flex-col gap-2 md:flex-row md:justify-between md:items-center md:gap-0">
              {/* Mobile: primary actions first */}
              <div className="grid grid-cols-2 gap-2 md:hidden">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
                  Save Changes
                </Button>
              </div>

              {/* Desktop: Delete on left */}
              <DeleteAlbumDialog
                albumTitle={album?.title}
                onConfirm={handleDelete}
                isDeleting={isDeleting}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  disabled={isDeleting}
                  className="text-muted-foreground hover:text-destructive w-full md:w-auto justify-center md:justify-start"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </DeleteAlbumDialog>

              {/* Desktop: Cancel + Save on right */}
              <div className="hidden md:flex gap-3">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
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
