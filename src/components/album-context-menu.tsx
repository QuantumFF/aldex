import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { DeleteAlbumDialog } from "@/components/delete-album-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UserAlbum } from "@/lib/types";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import {
  BookOpen,
  CheckSquare,
  Check,
  ChevronRight,
  Edit,
  ExternalLink,
  Heart,
  Library,
  ListChecks,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import * as React from "react";

interface AlbumContextMenuProps {
  children: React.ReactNode;
  album: UserAlbum;
  onEdit: (album: UserAlbum) => void;
  onDelete: (id: string) => void;
  onToggleSelection: (id: string) => void;
  onSelectFromMenu: (id: string) => void;
  isSelected: boolean;
}

interface AlbumMenuContentProps {
  album: UserAlbum;
  onEdit: (album: UserAlbum) => void;
  onRequestDelete: () => void;
  onSelectFromMenu: (id: string) => void;
  onToggleSelection: (id: string) => void;
  isSelected: boolean;
  type: "context" | "dropdown";
}

function AlbumMenuContent({
  album,
  onEdit,
  onRequestDelete,
  onSelectFromMenu,
  isSelected,
  type,
}: AlbumMenuContentProps) {
  const updateAlbum = useMutation(api.albums.update);

  const Item = type === "context" ? ContextMenuItem : DropdownMenuItem;
  const Separator = type === "context" ? ContextMenuSeparator : DropdownMenuSeparator;
  const Sub = type === "context" ? ContextMenuSub : DropdownMenuSub;
  const SubTrigger = type === "context" ? ContextMenuSubTrigger : DropdownMenuSubTrigger;
  const SubContent = type === "context" ? ContextMenuSubContent : DropdownMenuSubContent;

  const update = (patch: Omit<Parameters<typeof updateAlbum>[0], "id">) =>
    updateAlbum({ id: album._id as Id<"user_albums">, ...patch });

  return (
    <>
      <Item onClick={() => onEdit(album)}>
        <Edit className="mr-2 h-4 w-4" />
        Edit
      </Item>
      <Item onClick={() => onSelectFromMenu(album._id)}>
        <CheckSquare className="mr-2 h-4 w-4" />
        {isSelected ? "Deselect" : "Select"}
      </Item>

      <Separator />

      {/* Acquisition sub-menu */}
      <Sub>
        <SubTrigger>
          <Library className="mr-2 h-4 w-4" />
          Acquisition
        </SubTrigger>
        <SubContent>
          <Item onClick={() => update({ acquisition: "library" })}>
            <Library className="mr-2 h-4 w-4" />
            Library
            {album.acquisition === "library" && <Check className="ml-auto h-3.5 w-3.5" />}
          </Item>
          <Item onClick={() => update({ acquisition: "wishlist" })}>
            <Heart className="mr-2 h-4 w-4" />
            Wishlist
            {album.acquisition === "wishlist" && <Check className="ml-auto h-3.5 w-3.5" />}
          </Item>
        </SubContent>
      </Sub>

      {/* Progress sub-menu — only meaningful for library albums */}
      {album.acquisition === "library" && (
        <Sub>
          <SubTrigger>
            <ListChecks className="mr-2 h-4 w-4" />
            Progress
          </SubTrigger>
          <SubContent>
            <Item onClick={() => update({ progress: "backlog" })}>
              <BookOpen className="mr-2 h-4 w-4" />
              Backlog
              {album.progress === "backlog" && <Check className="ml-auto h-3.5 w-3.5" />}
            </Item>
            <Item onClick={() => update({ progress: "active" })}>
              <ChevronRight className="mr-2 h-4 w-4" />
              Active
              {album.progress === "active" && <Check className="ml-auto h-3.5 w-3.5" />}
            </Item>
            <Item onClick={() => update({ progress: "completed" })}>
              <Check className="mr-2 h-4 w-4" />
              Completed
              {album.progress === "completed" && <Check className="ml-auto h-3.5 w-3.5" />}
            </Item>
          </SubContent>
        </Sub>
      )}

      {album.rymLink && (
        <>
          <Separator />
          <Item onClick={() => window.open(album.rymLink, "_blank")}>
            <ExternalLink className="mr-2 h-4 w-4" />
            View on RYM
          </Item>
        </>
      )}

      <Separator />
      <Item className="text-destructive focus:text-destructive" onClick={onRequestDelete}>
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </Item>
    </>
  );
}


export function AlbumContextMenu({
  children,
  album,
  onEdit,
  onDelete,
  onToggleSelection,
  onSelectFromMenu,
  isSelected,
}: AlbumContextMenuProps) {
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
        <ContextMenuContent className="w-56">
          <AlbumMenuContent
            album={album}
            onEdit={onEdit}
            onRequestDelete={() => setDeleteOpen(true)}
            onSelectFromMenu={onSelectFromMenu}
            onToggleSelection={onToggleSelection}
            isSelected={isSelected}
            type="context"
          />
        </ContextMenuContent>
      </ContextMenu>

      {/* Rendered outside the menu portal so it survives menu close */}
      <DeleteAlbumDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        albumTitle={album.title}
        onConfirm={() => {
          onDelete(album._id);
          setDeleteOpen(false);
        }}
      />
    </>
  );
}

interface AlbumDropdownMenuProps {
  album: UserAlbum;
  onEdit: (album: UserAlbum) => void;
  onDelete: (id: string) => void;
  onToggleSelection: (id: string) => void;
  onSelectFromMenu: (id: string) => void;
  isSelected: boolean;
  className?: string;
}

export function AlbumDropdownMenu({
  album,
  onEdit,
  onDelete,
  onToggleSelection,
  onSelectFromMenu,
  isSelected,
  className,
}: AlbumDropdownMenuProps) {
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={className}
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <AlbumMenuContent
            album={album}
            onEdit={onEdit}
            onRequestDelete={() => setDeleteOpen(true)}
            onSelectFromMenu={onSelectFromMenu}
            onToggleSelection={onToggleSelection}
            isSelected={isSelected}
            type="dropdown"
          />
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Rendered outside the menu portal so it survives menu close */}
      <DeleteAlbumDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        albumTitle={album.title}
        onConfirm={() => {
          onDelete(album._id);
          setDeleteOpen(false);
        }}
      />
    </>
  );
}

