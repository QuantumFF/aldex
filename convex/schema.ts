import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  albums: defineTable({
    // Core Metadata
    title: v.string(),
    artist: v.string(),
    releaseYear: v.optional(v.number()),

    // Image stored in Convex Storage
    coverImageId: v.optional(v.id("_storage")),

    // Lifecycle State
    // "acquisition" determines if we own it or want it.
    acquisition: v.union(v.literal("wishlist"), v.literal("library")),
    // "progress" tracks listening status. Only relevant if acquisition is "library".
    progress: v.optional(
      v.union(v.literal("backlog"), v.literal("active"), v.literal("completed"))
    ),

    // Visibility: specific toggle to hide from default views without deleting
    isArchived: v.boolean(),

    // User Data
    rating: v.optional(v.union(v.number(), v.null())), // 1-10 or 1-5 scale
    rymLink: v.optional(v.string()),
    notes: v.optional(v.string()),

    // External Metadata
    musicBrainzId: v.optional(v.string()),
    genres: v.optional(v.array(v.string())),

    // Timestamps
    addedAt: v.number(), // Date.now() when created
    completedAt: v.optional(v.number()), // Date.now() when marked completed
  })
    .index("by_acquisition", ["acquisition"])
    .index("by_progress", ["progress"])
    .index("by_artist", ["artist"])
    .index("by_addedAt", ["addedAt"])
    .index("by_musicBrainzId", ["musicBrainzId"]),
});
