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
7. **Add Album Workflow:** Replaced the standard modal with a **Command Palette** (`Cmd+K` style) interface. This allows for faster, keyboard-centric album addition with live MusicBrainz search, album art preview, and an optional edit step.
8. **Filtering:** Navigation between "Library", "Wishlist", etc., is now handled entirely by client-side filters within the main view.
9. **UI Polish:** Switched to `NativeSelect` for library filters ("Status", "Progress") to prevent overflow and ensure better mobile/desktop compatibility.
10. **Column Control:** Replaced the dropdown selector for column count with `+` and `-` buttons. This makes the resizing action more intuitive and accessible.
11. **Implicit Backlog Status:** Fixed logic to treat albums in `Library` with undefined `progress` as implicitly `Backlog` for filtering and display purposes.
12. **Responsive Columns:** Implemented automatic adjustment of grid column count based on window width for better responsiveness.
13. **Rating System Redesign:** Implemented a custom `RatingInput` component with `+` / `-` buttons and manual input, matching the column width control style. Updated schema to allow `null` ratings for explicit "unrating".
14. **RateYourMusic Integration:** Implemented automatic RYM link generation based on artist/album metadata during the add process. Added a quick-access RYM button overlay on the album art in the grid view.
15. **Search Optimization:** Enhanced MusicBrainz search to prioritize "popular" results by sorting based on relevance score, primary type (Album > EP > Single), and release count.
16. **UX Improvements:**
    - **Race Condition Fix:** Added loading states to the "Add Album" dialog to prevent adding an album before the cover art is fetched.
    - **Focus Management:** Implemented auto-focus on the "Add to Library" button after loading completes to ensure smooth keyboard navigation.
    - **Notifications:** Replaced browser alerts with `sonner` toast notifications for a more modern and non-intrusive feedback experience.
17. **Data Integrity:** Implemented duplicate prevention by enforcing uniqueness on `musicBrainzId` in the backend and handling the error gracefully in the frontend.
18. **Archived Feature:** Implemented a dedicated "Archived" view in the library filter. Archived albums are now strictly hidden from "Library" and "Wishlist" views and only appear in the "Archived" tab.
19. **UI Refinements:**
    - **Year Input:** Created a custom `YearInput` component with `+` / `-` buttons for consistent data entry.
    - **Checkbox:** Switched to `shadcn/ui` Checkbox for the "Archived" toggle in the edit dialog.
20. **Performance Optimization:**
    - **Non-Blocking Add Album:** Refactored the "Add Album" workflow to be non-blocking. The client now sends the external image URL directly to the backend, which then handles the download and storage in a background Convex Action. This eliminates the slow double-hop (External -> Client -> Convex) and makes the UI feel instant.
    - **Lazy Image Loading:** Refactored the main album query to return only `storageId` instead of resolving signed URLs for every album. Created a dedicated `AlbumCover` component that fetches image URLs individually on demand. This eliminates the N+1 query bottleneck on the backend and drastically improves initial page load and refresh performance.

## Development Preferences

- **Package Manager:** Always use **Bun** (`bun install`, `bun run`, `bunx`) instead of `npm` or `npx`.

## Next Steps

1. Set up TanStack Router for more robust URL-based routing (if needed for deep linking filters).
2. Polish UI and UX (animations, empty states).
