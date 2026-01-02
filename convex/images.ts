import { v } from "convex/values";
import { internal } from "./_generated/api";
import { action, query } from "./_generated/server";

export const getUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const storeCoverArt = action({
  args: {
    albumId: v.id("albums"),
    coverUrl: v.optional(v.string()),
    musicBrainzId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { albumId, musicBrainzId } = args;
    let coverUrl = args.coverUrl;

    if (!coverUrl && musicBrainzId) {
      // Try to fetch from Cover Art Archive using MBID
      // This redirects to the actual image if it exists
      coverUrl = `https://coverartarchive.org/release-group/${musicBrainzId}/front`;
    }

    if (!coverUrl) {
      console.error("No cover URL or MusicBrainz ID provided");
      return;
    }

    try {
      const response = await fetch(coverUrl);
      if (!response.ok) {
        console.error(
          `Failed to fetch cover art: ${response.status} ${response.statusText}`
        );
        return;
      }

      const blob = await response.blob();
      const storageId = await ctx.storage.store(blob);

      await ctx.runMutation(internal.albums.updateCoverImageId, {
        albumId,
        storageId,
        coverUrl,
      });
    } catch (error) {
      console.error("Failed to store cover art", error);
    }
  },
});
