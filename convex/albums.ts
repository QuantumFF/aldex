import { v } from "convex/values";
import { api } from "./_generated/api";
import { internalMutation, mutation, query } from "./_generated/server";

// Get all albums, optionally filtered by acquisition status or progress
export const get = query({
  args: {
    acquisition: v.optional(
      v.union(v.literal("wishlist"), v.literal("library"))
    ),
    progress: v.optional(
      v.union(v.literal("backlog"), v.literal("active"), v.literal("completed"))
    ),
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

    return albums;
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
    coverUrl: v.optional(v.string()),
    acquisition: v.union(v.literal("wishlist"), v.literal("library")),
    progress: v.optional(
      v.union(v.literal("backlog"), v.literal("active"), v.literal("completed"))
    ),
    isArchived: v.boolean(),
    rating: v.optional(v.union(v.number(), v.null())),
    rymLink: v.optional(v.string()),
    notes: v.optional(v.string()),
    musicBrainzId: v.optional(v.string()),
    genres: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    if (args.musicBrainzId) {
      const existing = await ctx.db
        .query("albums")
        .withIndex("by_musicBrainzId", (q) =>
          q.eq("musicBrainzId", args.musicBrainzId)
        )
        .first();

      if (existing) {
        throw new Error("Album already exists in your library");
      }
    }

    const newAlbumId = await ctx.db.insert("albums", {
      ...args,
      addedAt: Date.now(),
    });

    if (args.coverUrl) {
      await ctx.scheduler.runAfter(0, api.images.storeCoverArt, {
        albumId: newAlbumId,
        coverUrl: args.coverUrl,
      });
    }

    return newAlbumId;
  },
});

export const updateCoverImageId = internalMutation({
  args: {
    albumId: v.id("albums"),
    storageId: v.id("_storage"),
    coverUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { albumId, storageId, coverUrl } = args;
    await ctx.db.patch(albumId, {
      coverImageId: storageId,
      coverUrl,
    });
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
    coverUrl: v.optional(v.string()),
    acquisition: v.optional(
      v.union(v.literal("wishlist"), v.literal("library"))
    ),
    progress: v.optional(
      v.union(v.literal("backlog"), v.literal("active"), v.literal("completed"))
    ),
    isArchived: v.optional(v.boolean()),
    rating: v.optional(v.union(v.number(), v.null())),
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

// Batch delete albums
export const batchDelete = mutation({
  args: { ids: v.array(v.id("albums")) },
  handler: async (ctx, args) => {
    await Promise.all(args.ids.map((id) => ctx.db.delete(id)));
  },
});

// Batch update albums
export const batchUpdate = mutation({
  args: {
    ids: v.array(v.id("albums")),
    updates: v.object({
      acquisition: v.optional(
        v.union(v.literal("wishlist"), v.literal("library"))
      ),
      progress: v.optional(
        v.union(
          v.literal("backlog"),
          v.literal("active"),
          v.literal("completed")
        )
      ),
      isArchived: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    const { ids, updates } = args;
    await Promise.all(ids.map((id) => ctx.db.patch(id, updates)));
  },
});
