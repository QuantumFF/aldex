import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UserAlbum } from "@/lib/types";
import {
  CheckSquare,
  Edit,
  ExternalLink,
  MoreHorizontal,
  Trash2,
} from "lucide-react";

interface AlbumContextMenuProps {
  children: React.ReactNode;
  album: UserAlbum;
  onEdit: (album: UserAlbum) => void;
  onDelete: (id: string) => void;
  onToggleSelection: (id: string) => void;
  isSelected: boolean;
}

interface AlbumMenuContentProps {
  album: UserAlbum;
  onEdit: (album: UserAlbum) => void;
  onDelete: (id: string) => void;
  onToggleSelection: (id: string) => void;
  isSelected: boolean;
  type: "context" | "dropdown";
}

function AlbumMenuContent({
  album,
  onEdit,
  onDelete,
  onToggleSelection,
  isSelected,
  type,
}: AlbumMenuContentProps) {
  const Item = type === "context" ? ContextMenuItem : DropdownMenuItem;
  const Separator =
    type === "context" ? ContextMenuSeparator : DropdownMenuSeparator;

  return (
    <>
      <Item onClick={() => onEdit(album)}>
        <Edit className="mr-2 h-4 w-4" />
        Edit
      </Item>
      <Item onClick={() => onToggleSelection(album._id)}>
        <CheckSquare className="mr-2 h-4 w-4" />
        {isSelected ? "Deselect" : "Select"}
      </Item>
      {album.rymLink && (
        <Item onClick={() => window.open(album.rymLink, "_blank")}>
          <ExternalLink className="mr-2 h-4 w-4" />
          View on RYM
        </Item>
      )}
      <Separator />
      <Item
        className="text-destructive focus:text-destructive"
        onClick={() => onDelete(album._id)}
      >
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
  isSelected,
}: AlbumContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <AlbumMenuContent
          album={album}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleSelection={onToggleSelection}
          isSelected={isSelected}
          type="context"
        />
      </ContextMenuContent>
    </ContextMenu>
  );
}

interface AlbumDropdownMenuProps {
  album: UserAlbum;
  onEdit: (album: UserAlbum) => void;
  onDelete: (id: string) => void;
  onToggleSelection: (id: string) => void;
  isSelected: boolean;
  className?: string;
}

export function AlbumDropdownMenu({
  album,
  onEdit,
  onDelete,
  onToggleSelection,
  isSelected,
  className,
}: AlbumDropdownMenuProps) {
  return (
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
          onDelete={onDelete}
          onToggleSelection={onToggleSelection}
          isSelected={isSelected}
          type="dropdown"
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
