import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import type { MusicBrainzReleaseGroup } from "@/lib/musicbrainz";
import { Check, Disc } from "lucide-react";

interface AlbumSearchCommandProps {
  query: string;
  onQueryChange: (query: string) => void;
  loading: boolean;
  results: MusicBrainzReleaseGroup[];
  onSelect: (album: MusicBrainzReleaseGroup) => void;
  selectedIds?: string[];
  disabled?: boolean;
  placeholder?: string;
  listClassName?: string;
}

export function AlbumSearchCommand({
  query,
  onQueryChange,
  loading,
  results,
  onSelect,
  selectedIds = [],
  disabled = false,
  placeholder = "Search albums...",
  listClassName,
}: AlbumSearchCommandProps) {
  return (
    <>
      <CommandInput
        placeholder={placeholder}
        value={query}
        onValueChange={onQueryChange}
        disabled={disabled}
      />
      <CommandList className={listClassName}>
        {loading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Searching...
          </div>
        ) : results.length === 0 && query ? (
          <CommandEmpty>No results found.</CommandEmpty>
        ) : (
          <CommandGroup heading={selectedIds.length === 0 ? "Suggestions" : undefined}>
            {results.map((album) => {
              const isSelected = selectedIds.includes(album.id);
              return (
                <CommandItem
                  key={album.id}
                  value={album.id}
                  onSelect={() => onSelect(album)}
                  disabled={disabled}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <Disc className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="truncate">{album.title}</span>
                      <span className="text-xs text-muted-foreground truncate">
                        {album["artist-credit"]?.[0]?.name} (
                        {album["first-release-date"]?.split("-")[0] || "Unknown"}
                        )
                      </span>
                    </div>
                  </div>
                  {isSelected && <Check className="ml-2 h-4 w-4 text-primary shrink-0" />}
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}
      </CommandList>
    </>
  );
}
