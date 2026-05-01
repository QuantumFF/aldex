"use client";

import type { UserAlbum } from "@/lib/types";
import { albumSchema, type AlbumFormValues } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

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
import { Loader2, Trash2 } from "lucide-react";
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
      <DialogContent className="sm:max-w-[850px] p-0 gap-0 overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:h-[600px]">
        {/* Left Column: Visuals */}
        <div className="w-full md:w-[320px] bg-muted/30 border-b md:border-b-0 md:border-r flex flex-col p-6 gap-6 shrink-0 md:overflow-y-auto">
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
