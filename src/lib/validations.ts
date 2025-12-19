import { z } from "zod";

export const albumSchema = z.object({
  title: z.string().min(1, "Title is required"),
  artist: z.string().min(1, "Artist is required"),
  releaseYear: z
    .number()
    .min(1900)
    .max(new Date().getFullYear() + 1)
    .optional(),
  acquisition: z.enum(["wishlist", "library"]),
  progress: z.enum(["backlog", "active", "completed"]).optional(),
  isArchived: z.boolean(),
  rating: z.number().min(1).max(10).nullable().optional(),
  rymLink: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  notes: z.string().optional(),
  musicBrainzId: z.string().optional(),
  genres: z.array(z.string()).optional(),
  coverUrl: z.string().url().optional(), // Temporary field for the form, will be handled by backend/storage
});

export type AlbumFormValues = z.infer<typeof albumSchema>;
