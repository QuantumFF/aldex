import type { Doc, Id } from "../../convex/_generated/dataModel";

export type UserAlbum = Omit<Doc<"albums">, "_id" | "_creationTime"> &
  Doc<"user_albums"> & {
    globalAlbumId: Id<"albums">;
  };
