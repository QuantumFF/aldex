import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateRymLink(artist: string, title: string): string {
  const slugify = (str: string) =>
    str
      .toLowerCase()
      .replace(/&/g, "and") // Replace & with and
      .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens

  const artistSlug = slugify(artist);
  const albumSlug = slugify(title);

  return `https://rateyourmusic.com/release/album/${artistSlug}/${albumSlug}/`;
}
