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
import { Loader2 } from "lucide-react";
import * as React from "react";

interface DeleteAlbumDialogProps {
  /** Title of the album being deleted, shown in the confirmation message. */
  albumTitle?: string;
  /** Callback when the user confirms the delete. */
  onConfirm: () => void;
  /** Show a spinner on the confirm button while the mutation is in-flight. */
  isDeleting?: boolean;

  // ── Controlled mode (use when trigger lives outside this component, e.g. context menus) ──
  open?: boolean;
  onOpenChange?: (open: boolean) => void;

  // ── Trigger mode (wrap the trigger element automatically) ──
  children?: React.ReactNode;
}

export function DeleteAlbumDialog({
  albumTitle,
  onConfirm,
  isDeleting = false,
  open,
  onOpenChange,
  children,
}: DeleteAlbumDialogProps) {
  const isControlled = open !== undefined && onOpenChange !== undefined;

  const content = (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete Album</AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure you want to delete{albumTitle ? ` "${albumTitle}"` : " this album"}?{" "}
          This action cannot be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction
          onClick={onConfirm}
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        >
          {isDeleting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );

  if (isControlled) {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        {content}
      </AlertDialog>
    );
  }

  return (
    <AlertDialog>
      {children && <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>}
      {content}
    </AlertDialog>
  );
}
