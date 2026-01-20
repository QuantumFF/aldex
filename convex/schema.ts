import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Global Album Catalog (Shared Data)
  albums: defineTable({
    title: v.string(),
    artist: v.string(),
    releaseYear: v.optional(v.number()),
    coverImageId: v.optional(v.id("_storage")),
    coverUrl: v.optional(v.string()),
    musicBrainzId: v.optional(v.string()),
    genres: v.optional(v.array(v.string())),
  })
    .index("by_musicBrainzId", ["musicBrainzId"])
    .index("by_artist", ["artist"])
    .index("by_title", ["title"]),

  // User Library Entries (User-Specific Data)
  user_albums: defineTable({
    userId: v.string(),
    albumId: v.id("albums"), // Reference to the global album

    // Lifecycle State
    acquisition: v.union(v.literal("wishlist"), v.literal("library")),
    progress: v.optional(
      v.union(
        v.literal("backlog"),
        v.literal("active"),
        v.literal("completed"),
      ),
    ),

    // Visibility
    isArchived: v.boolean(),

    // User Data
    rating: v.optional(v.union(v.number(), v.null())),
    rymLink: v.optional(v.string()),
    notes: v.optional(v.string()),

    // Timestamps
    addedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_acquisition", ["userId", "acquisition"])
    .index("by_userId_progress", ["userId", "progress"])
    .index("by_albumId", ["albumId"]) // Useful for finding who has a specific album
    .index("by_userId_albumId", ["userId", "albumId"]), // Ensure uniqueness per user
});
