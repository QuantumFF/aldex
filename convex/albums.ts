import { v } from "convex/values";
import { api } from "./_generated/api";
import { internalMutation, mutation, query } from "./_generated/server";

// Get all albums, optionally filtered by acquisition status or progress
export const get = query({
  args: {
    acquisition: v.optional(
      v.union(v.literal("wishlist"), v.literal("library")),
    ),
    progress: v.optional(
      v.union(
        v.literal("backlog"),
        v.literal("active"),
        v.literal("completed"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }
    const userId = identity.subject;

    const { acquisition, progress } = args;
    const albums = await (async () => {
      if (progress) {
        return await ctx.db
          .query("albums")
          .withIndex("by_progress", (q) =>
            q.eq("userId", userId).eq("progress", progress),
          )
          .collect();
      }
      if (acquisition) {
        return await ctx.db
          .query("albums")
          .withIndex("by_acquisition", (q) =>
            q.eq("userId", userId).eq("acquisition", acquisition),
          )
          .collect();
      }
      return await ctx.db
        .query("albums")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .collect();
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
      v.union(
        v.literal("backlog"),
        v.literal("active"),
        v.literal("completed"),
      ),
    ),
    isArchived: v.boolean(),
    rating: v.optional(v.union(v.number(), v.null())),
    rymLink: v.optional(v.string()),
    notes: v.optional(v.string()),
    musicBrainzId: v.optional(v.string()),
    genres: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called create without authentication");
    }
    const userId = identity.subject;

    if (args.musicBrainzId) {
      const existing = await ctx.db
        .query("albums")
        .withIndex("by_musicBrainzId", (q) =>
          q.eq("userId", userId).eq("musicBrainzId", args.musicBrainzId),
        )
        .first();

      if (existing) {
        throw new Error("Album already exists in your library");
      }
    }

    const newAlbumId = await ctx.db.insert("albums", {
      ...args,
      userId,
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
      v.union(v.literal("wishlist"), v.literal("library")),
    ),
    progress: v.optional(
      v.union(
        v.literal("backlog"),
        v.literal("active"),
        v.literal("completed"),
      ),
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called update without authentication");
    }
    const userId = identity.subject;

    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing || existing.userId !== userId) {
      throw new Error("Album not found or unauthorized");
    }

    await ctx.db.patch(id, updates);
  },
});

// Delete an album
export const remove = mutation({
  args: { id: v.id("albums") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called remove without authentication");
    }
    const userId = identity.subject;

    const existing = await ctx.db.get(args.id);
    if (!existing || existing.userId !== userId) {
      throw new Error("Album not found or unauthorized");
    }

    await ctx.db.delete(args.id);
  },
});

// Batch delete albums
export const batchDelete = mutation({
  args: { ids: v.array(v.id("albums")) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called batchDelete without authentication");
    }
    const userId = identity.subject;

    const albums = await Promise.all(args.ids.map((id) => ctx.db.get(id)));
    const unauthorized = albums.some((a) => !a || a.userId !== userId);
    if (unauthorized) {
      throw new Error("Some albums not found or unauthorized");
    }

    await Promise.all(args.ids.map((id) => ctx.db.delete(id)));
  },
});

// Batch update albums
export const batchUpdate = mutation({
  args: {
    ids: v.array(v.id("albums")),
    updates: v.object({
      acquisition: v.optional(
        v.union(v.literal("wishlist"), v.literal("library")),
      ),
      progress: v.optional(
        v.union(
          v.literal("backlog"),
          v.literal("active"),
          v.literal("completed"),
        ),
      ),
      isArchived: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called batchUpdate without authentication");
    }
    const userId = identity.subject;

    const albums = await Promise.all(args.ids.map((id) => ctx.db.get(id)));
    const unauthorized = albums.some((a) => !a || a.userId !== userId);
    if (unauthorized) {
      throw new Error("Some albums not found or unauthorized");
    }

    await Promise.all(args.ids.map((id) => ctx.db.patch(id, args.updates)));
  },
});
