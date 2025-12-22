import { v } from "convex/values";
import { internal } from "./_generated/api";
import { action } from "./_generated/server";

export const storeCoverArt = action({
  args: {
    albumId: v.id("albums"),
    coverUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const { albumId, coverUrl } = args;
    try {
      const response = await fetch(coverUrl);
      const blob = await response.blob();
      const storageId = await ctx.storage.store(blob);

      await ctx.runMutation(internal.albums.updateCoverImageId, {
        albumId,
        storageId,
      });
    } catch (error) {
      console.error("Failed to store cover art", error);
    }
  },
});
