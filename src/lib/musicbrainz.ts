const BASE_URL = "https://musicbrainz.org/ws/2";
const USER_AGENT = "Aldex/0.1.0 ( https://github.com/qdes/aldex )"; // Replace with actual repo if different

export interface MusicBrainzReleaseGroup {
  id: string;
  title: string;
  "primary-type": string;
  "first-release-date": string;
  "artist-credit": {
    name: string;
    artist: {
      id: string;
      name: string;
    };
  }[];
  tags?: { count: number; name: string }[];
}

interface SearchResponse {
  "release-groups": MusicBrainzReleaseGroup[];
  count: number;
}

export async function searchAlbums(query: string): Promise<MusicBrainzReleaseGroup[]> {
  if (!query) return [];

  try {
    const response = await fetch(
      `${BASE_URL}/release-group?query=${encodeURIComponent(query)}&fmt=json`,
      {
        headers: {
          "User-Agent": USER_AGENT,
        },
      }
    );

    if (!response.ok) {
      console.error("MusicBrainz API error:", response.statusText);
      return [];
    }

    const data: SearchResponse = await response.json();
    return data["release-groups"] || [];
  } catch (error) {
    console.error("Failed to fetch from MusicBrainz:", error);
    return [];
  }
}

export async function getAlbumCover(mbid: string): Promise<string | null> {
    // Try Cover Art Archive
    // https://coverartarchive.org/release-group/{mbid}/front
    // Note: Release Group cover art is not always available, usually need specific release ID.
    // However, the Cover Art Archive API supports release-group lookups which redirect.
    try {
        const response = await fetch(`https://coverartarchive.org/release-group/${mbid}/front`, {
            method: 'HEAD'
        });
        if (response.ok) {
            return response.url;
        }
    } catch (e) {
        // ignore
    }
    return null;
}
