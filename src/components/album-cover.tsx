import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

interface AlbumCoverProps {
  storageId?: Id<"_storage">;
  title: string;
  className?: string;
}

export function AlbumCover({ storageId, title, className }: AlbumCoverProps) {
  const url = useQuery(api.images.getUrl, storageId ? { storageId } : "skip");

  if (!storageId) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center text-muted-foreground bg-muted ${className}`}
      >
        No Cover
      </div>
    );
  }

  if (url === undefined) {
    return (
      <div className={`bg-muted animate-pulse h-full w-full ${className}`} />
    );
  }

  if (url === null) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center text-muted-foreground bg-muted ${className}`}
      >
        Error
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={title}
      className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${className}`}
    />
  );
}
