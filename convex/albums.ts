import { v } from "convex/values";
import { api } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";

// Get all albums for the current user, with global album data joined
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

    // 1. Fetch User's Library Entries
    let userAlbumsQuery = ctx.db
      .query("user_albums")
      .withIndex("by_userId", (q) => q.eq("userId", userId));

    if (acquisition) {
      userAlbumsQuery = ctx.db
        .query("user_albums")
        .withIndex("by_userId_acquisition", (q) =>
          q.eq("userId", userId).eq("acquisition", acquisition),
        );
    } else if (progress) {
      userAlbumsQuery = ctx.db
        .query("user_albums")
        .withIndex("by_userId_progress", (q) =>
          q.eq("userId", userId).eq("progress", progress),
        );
    }

    const userAlbums = await userAlbumsQuery.collect();

    // 2. Fetch Global Album Data and Merge
    const albumsWithDetails = await Promise.all(
      userAlbums.map(async (userAlbum) => {
        const albumDetails = await ctx.db.get(userAlbum.albumId);
        if (!albumDetails) {
          // Should not happen if referential integrity is maintained,
          // but handle gracefully
          return null;
        }

        return {
          ...albumDetails, // Global data (title, artist, cover, etc.)
          ...userAlbum, // User data (rating, progress, etc.) overrides any conflicts
          _id: userAlbum._id, // The ID used for updates/deletes is the user_album ID
          globalAlbumId: userAlbum.albumId, // Keep reference to global ID
        };
      }),
    );

    return albumsWithDetails.filter((a) => a !== null);
  },
});

// Get a single album by ID (User Album ID)
export const getById = query({
  args: { id: v.id("user_albums") },
  handler: async (ctx, args) => {
    const userAlbum = await ctx.db.get(args.id);
    if (!userAlbum) return null;

    const albumDetails = await ctx.db.get(userAlbum.albumId);
    if (!albumDetails) return null;

    return {
      ...albumDetails,
      ...userAlbum,
      _id: userAlbum._id,
      globalAlbumId: userAlbum.albumId,
    };
  },
});

// Create a new album (or link to existing)
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

    // 1. Find or Create Global Album
    let globalAlbumId: Id<"albums"> | null = null;
    let globalAlbum: Doc<"albums"> | null = null;

    const cleanTitle = args.title.trim();
    const cleanArtist = args.artist.trim();

    // Try finding by MusicBrainz ID first
    if (args.musicBrainzId) {
      const existingByMbid = await ctx.db
        .query("albums")
        .withIndex("by_musicBrainzId", (q) =>
          q.eq("musicBrainzId", args.musicBrainzId!),
        )
        .first();
      if (existingByMbid) {
        globalAlbumId = existingByMbid._id;
        globalAlbum = existingByMbid;
      }
    }

    // Fallback: Try finding by Title + Artist
    if (!globalAlbumId) {
      // Strategy 1: Query by Artist (Exact), Match Title (Case-Insensitive)
      // This handles cases where Artist is correct but Title casing differs.
      const artistAlbums = await ctx.db
        .query("albums")
        .withIndex("by_artist", (q) => q.eq("artist", cleanArtist))
        .collect();

      let match = artistAlbums.find(
        (a) => a.title.toLowerCase() === cleanTitle.toLowerCase(),
      );

      // Strategy 2: Query by Title (Exact), Match Artist (Case-Insensitive)
      // This handles cases where Title is correct but Artist casing differs.
      if (!match) {
        const titleAlbums = await ctx.db
          .query("albums")
          .withIndex("by_title", (q) => q.eq("title", cleanTitle))
          .collect();

        match = titleAlbums.find(
          (a) => a.artist.toLowerCase() === cleanArtist.toLowerCase(),
        );
      }

      if (match) {
        globalAlbumId = match._id;
        globalAlbum = match;
      }
    }

    // If still not found, create new global album
    if (!globalAlbumId) {
      globalAlbumId = await ctx.db.insert("albums", {
        title: cleanTitle,
        artist: cleanArtist,
        releaseYear: args.releaseYear,
        coverImageId: args.coverImageId,
        coverUrl: args.coverUrl,
        musicBrainzId: args.musicBrainzId,
        genres: args.genres,
      });
    }

    // 2. Check for existing User Link
    const existingLink = await ctx.db
      .query("user_albums")
      .withIndex("by_userId_albumId", (q) =>
        q.eq("userId", userId).eq("albumId", globalAlbumId!),
      )
      .first();

    if (existingLink) {
      throw new Error("Album already exists in your library");
    }

    // 3. Create User Link
    const newUserAlbumId = await ctx.db.insert("user_albums", {
      userId,
      albumId: globalAlbumId,
      acquisition: args.acquisition,
      progress: args.progress,
      isArchived: args.isArchived,
      rating: args.rating,
      rymLink: args.rymLink,
      notes: args.notes,
      addedAt: Date.now(),
    });

    // Handle Cover Image Storage (if needed)
    // Only download if we have a URL, no direct image ID provided, AND it's a NEW global album.
    // If the global album already existed (!globalAlbum is false), we use whatever cover it has (or doesn't have)
    // to prevent redundant downloads and race conditions.
    if (args.coverUrl && !args.coverImageId && !globalAlbum) {
      // Re-fetch the user album to ensure we have the correct global album ID
      // and to verify what was actually inserted.
      const insertedUserAlbum = await ctx.db.get(newUserAlbumId);
      if (!insertedUserAlbum) {
        console.error("Failed to fetch inserted user album");
        return newUserAlbumId;
      }

      console.log("New User Album ID:", newUserAlbumId);
      console.log("Global Album ID from DB:", insertedUserAlbum.albumId);
      console.log("Global Album ID variable:", globalAlbumId);

      await ctx.scheduler.runAfter(0, api.images.storeCoverArt, {
        albumId: insertedUserAlbum.albumId,
        coverUrl: args.coverUrl,
      });
    }

    return newUserAlbumId;
  },
});

// Internal query to check if an album already has a cover
export const getAlbumCoverStatus = internalQuery({
  args: {
    albumId: v.string(),
  },
  handler: async (ctx, args) => {
    const { albumId } = args;
    let targetId = albumId as Id<"albums">;

    // Resolve user_album ID to global album ID if needed
    const userAlbumId = ctx.db.normalizeId("user_albums", albumId);
    if (userAlbumId) {
      const userAlbum = await ctx.db.get(userAlbumId);
      if (userAlbum) {
        targetId = userAlbum.albumId;
      }
    }

    const globalAlbum = await ctx.db.get(targetId);
    if (!globalAlbum) {
      return { hasCover: false };
    }

    return {
      hasCover: !!(globalAlbum.coverImageId || globalAlbum.coverUrl),
    };
  },
});

// Internal mutation to update cover image on the GLOBAL album
export const updateCoverImageId = internalMutation({
  args: {
    albumId: v.string(), // Relaxed validation to debug ID issue
    storageId: v.id("_storage"),
    coverUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { albumId, storageId, coverUrl } = args;
    console.log("updateCoverImageId called with albumId:", albumId);

    let targetId = albumId as Id<"albums">;

    // Defensive check: If the ID passed is actually a user_albums ID,
    // fetch the user album to get the correct global album ID.
    const userAlbumId = ctx.db.normalizeId("user_albums", albumId);
    console.log("Is user_albums ID?", !!userAlbumId);

    if (userAlbumId) {
      const userAlbum = await ctx.db.get(userAlbumId);
      if (userAlbum) {
        console.log(
          "Resolved user_albums ID to global album ID:",
          userAlbum.albumId,
        );
        targetId = userAlbum.albumId;
      } else {
        console.log("User album not found for ID:", userAlbumId);
      }
    }

    // Double check if targetId is still a user_albums ID to prevent schema error
    const isStillUserAlbum = ctx.db.normalizeId("user_albums", targetId);
    if (isStillUserAlbum) {
      console.error(
        "Aborting patch: targetId is still a user_albums ID:",
        targetId,
      );
      return; // Stop here to avoid the schema error
    }

    await ctx.db.patch(targetId, {
      coverImageId: storageId,
      coverUrl,
    });
  },
});

// Update a user album (User Library Entry)
export const update = mutation({
  args: {
    id: v.id("user_albums"), // User Album ID
    // User-editable fields
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
    completedAt: v.optional(v.number()),

    // Global fields (ignored for now, or could trigger a fork/global update)
    title: v.optional(v.string()),
    artist: v.optional(v.string()),
    releaseYear: v.optional(v.number()),
    coverImageId: v.optional(v.id("_storage")),
    coverUrl: v.optional(v.string()),
    musicBrainzId: v.optional(v.string()),
    genres: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called update without authentication");
    }
    const userId = identity.subject;

    const { id, ...rest } = args;

    const existing = await ctx.db.get(id);
    if (!existing || existing.userId !== userId) {
      throw new Error("Album not found or unauthorized");
    }

    // Filter out global fields that shouldn't be updated on the user_album record
    // and only include fields that exist in the user_albums schema
    const updates: Partial<Doc<"user_albums">> = {};
    if (rest.acquisition !== undefined) updates.acquisition = rest.acquisition;
    if (rest.progress !== undefined) updates.progress = rest.progress;
    if (rest.isArchived !== undefined) updates.isArchived = rest.isArchived;
    if (rest.rating !== undefined) updates.rating = rest.rating;
    if (rest.rymLink !== undefined) updates.rymLink = rest.rymLink;
    if (rest.notes !== undefined) updates.notes = rest.notes;
    if (rest.completedAt !== undefined) updates.completedAt = rest.completedAt;

    await ctx.db.patch(id, updates);
  },
});

// Delete a user album
export const remove = mutation({
  args: { id: v.id("user_albums") },
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

// Batch delete
export const batchDelete = mutation({
  args: { ids: v.array(v.id("user_albums")) },
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

// Batch update
export const batchUpdate = mutation({
  args: {
    ids: v.array(v.id("user_albums")),
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
