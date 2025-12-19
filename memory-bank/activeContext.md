# Active Context

## Current Focus

**Sprint 1: Core Functionality & Initialization**
We are refining the core user interface to be more minimalist and album-centric.

## Recent Decisions

1. **Tech Stack:** Convex (Backend/DB/Auth) + Vite (Frontend) + TanStack Router (Routing) + shadcn/ui.
2. **Image Strategy:** **Convex File Storage**. We will download covers and store them, rather than hotlinking.
3. **Data Source:** **MusicBrainz** for metadata search (open data, no complex auth).
4. **Schema Logic:** Split state into `acquisition` (Wishlist/Library) and `progress` (Backlog/Active/Completed) to enforce mutually exclusive logic while allowing flexible tagging.
5. **UI Redesign:** Removed the sidebar navigation in favor of a single, filterable **Album Library** view. This aligns with the "minimalist" goal.
6. **Dashboard Layout:** The main dashboard now features a dynamic grid with user-selectable column count (2-10 columns) to optimize screen real estate.
7. **Add Album Workflow:** Moved "Add Album" from a separate page to a modal dialog (`AddAlbumDialog`) accessible directly from the library view.
8. **Filtering:** Navigation between "Library", "Wishlist", etc., is now handled entirely by client-side filters within the main view.
9. **UI Polish:** Switched to `NativeSelect` for library filters ("Status", "Progress") to prevent overflow and ensure better mobile/desktop compatibility.
10. **Column Control:** Replaced the dropdown selector for column count with `+` and `-` buttons. This makes the resizing action more intuitive and accessible.

## Development Preferences

- **Package Manager:** Always use **Bun** (`bun install`, `bun run`, `bunx`) instead of `npm` or `npx`.

## Next Steps

1. Set up TanStack Router for more robust URL-based routing (if needed for deep linking filters).
2. Polish UI and UX (animations, empty states).
