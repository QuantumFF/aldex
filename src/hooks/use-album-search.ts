import { searchAlbums, type MusicBrainzReleaseGroup } from "@/lib/musicbrainz";
import { useEffect, useState } from "react";

export function useAlbumSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MusicBrainzReleaseGroup[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchAlbums(query);
        setResults(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  return { query, setQuery, results, setResults, loading };
}
