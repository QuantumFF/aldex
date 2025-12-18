import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all albums, optionally filtered by acquisition status or progress
export const get = query({
  args: {
    acquisition: v.optional(v.union(v.literal("wishlist"), v.literal("library"))),
    progress: v.optional(v.union(v.literal("backlog"), v.literal("active"), v.literal("completed"))),
  },
  handler: async (ctx, args) => {
    const { acquisition, progress } = args;
    const albums = await (async () => {
      if (progress) {
        return await ctx.db
          .query("albums")
          .withIndex("by_progress", (q) => q.eq("progress", progress))
          .collect();
      }
      if (acquisition) {
        return await ctx.db
          .query("albums")
          .withIndex("by_acquisition", (q) => q.eq("acquisition", acquisition))
          .collect();
      }
      return await ctx.db.query("albums").collect();
    })();

    return Promise.all(
      albums.map(async (album) => ({
        ...album,
        coverImageUrl: album.coverImageId
          ? await ctx.storage.getUrl(album.coverImageId)
          : null,
      }))
    );
  },
});

// Get a single album by ID
export const getById = query({
  args: { id: v.id("albums") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a new album
export const create = mutation({
  args: {
    title: v.string(),
    artist: v.string(),
    releaseYear: v.optional(v.number()),
    coverImageId: v.optional(v.id("_storage")),
    acquisition: v.union(v.literal("wishlist"), v.literal("library")),
    progress: v.optional(
      v.union(v.literal("backlog"), v.literal("active"), v.literal("completed"))
    ),
    isArchived: v.boolean(),
    rating: v.optional(v.number()),
    rymLink: v.optional(v.string()),
    notes: v.optional(v.string()),
    musicBrainzId: v.optional(v.string()),
    genres: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const newAlbumId = await ctx.db.insert("albums", {
      ...args,
      addedAt: Date.now(),
    });
    return newAlbumId;
  },
});

// Update an album
export const update = mutation({
  args: {
    id: v.id("albums"),
    title: v.optional(v.string()),
    artist: v.optional(v.string()),
    releaseYear: v.optional(v.number()),
    coverImageId: v.optional(v.id("_storage")),
    acquisition: v.optional(v.union(v.literal("wishlist"), v.literal("library"))),
    progress: v.optional(
      v.union(v.literal("backlog"), v.literal("active"), v.literal("completed"))
    ),
    isArchived: v.optional(v.boolean()),
    rating: v.optional(v.number()),
    rymLink: v.optional(v.string()),
    notes: v.optional(v.string()),
    musicBrainzId: v.optional(v.string()),
    genres: v.optional(v.array(v.string())),
    completedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

// Delete an album
export const remove = mutation({
  args: { id: v.id("albums") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
