# System Patterns

## Architecture

- **Monorepo-like Structure:** Frontend and Backend logic coexist (Convex pattern).
- **Client-Side Routing:** TanStack Router for type-safe routing.
- **Data Fetching:** Convex React hooks (`useQuery`, `useMutation`) provide real-time reactivity without manual state management.

## Key Design Patterns

- **Single-View Dashboard:** The application revolves around a central "Album Library" view. Navigation between different states (Wishlist, Backlog, etc.) is handled via client-side filtering rather than separate pages.
- **Dynamic Grid:** The album list uses a responsive grid with both automatic (window-size based) and manual column density controls, allowing for flexible viewing experiences on different screen sizes.
- **Forms:** React Hook Form + Zod. Validation logic is shared or mirrored between UI and Backend where possible.
- **Command Palette:** The "Add Album" workflow uses a `cmdk`-based command palette for quick, keyboard-first interactions. It integrates live search (MusicBrainz) and confirmation dialogs into a seamless flow.
- **Modals:** Critical actions like "Edit Album" are handled in modal dialogs to maintain context within the library view.
- **Custom Inputs:** Specialized UI components (like `RatingInput`) are created to match specific design requirements (e.g., column width control style) rather than relying solely on standard HTML inputs.
- **Images:**
  - **Ingestion:** Images are handled via a **client-orchestrated background processing pattern**. The client creates the album immediately (for instant UI feedback) and then triggers a Convex Action (`storeCoverArt`) to fetch and store the image.
    - **Redundancy Check:** To prevent redundant downloads (e.g., if the album already exists or multiple users add it simultaneously), the `storeCoverArt` action first checks the album's cover status via an internal query (`getAlbumCoverStatus`). If a cover exists, the download is skipped.
  - **Display:** We use a **lazy loading pattern** for display. The main album query returns only the `storageId`. The frontend `AlbumCover` component then fetches the signed URL for each image individually using a dedicated query (`images.getUrl`). This prevents N+1 query bottlenecks on the backend and ensures fast initial page loads.
- **Search:** Search is hybrid—MusicBrainz for initial metadata (via Command Palette), internal Convex search for library browsing. **MusicBrainz search results are sorted by popularity (release count) and type (Album > EP) to improve relevance.**
- **External Link Generation:** We automatically generate external links (like RateYourMusic) using slugification logic on artist/album names, favoring automation with manual override.
- **Action Overlays:** Secondary actions (like visiting an external link) are presented as hover-only overlays on the primary album art to maintain a clean aesthetic.
- **Notifications:** We use `sonner` for toast notifications to provide non-intrusive feedback for actions like adding, editing, or deleting albums.
- **Batch Operations:** We use a **client-side selection state** (`Set<string>`) combined with **batch mutations** (`batchDelete`, `batchUpdate`) to perform bulk actions. The UI toggles between a standard view and a "Batch Mode" view, where interactions (click) change from "Edit" to "Select". Shift-Select is supported for range selection using `lastSelectedId` tracking.
- **Context Menus & Overlays:**
  - **Separated Triggers:** To prevent conflicts between nested interactive elements (like a card-wide context menu and a specific menu button), we separate their triggers in the DOM. The 3-dot menu button is positioned absolutely over the card but is a sibling to the card's context menu trigger, ensuring clean event handling.
  - **Unified Menu Content:** We use a shared `AlbumMenuContent` component to ensure consistency between the right-click context menu and the 3-dot dropdown menu.

## Data Model Boundaries

- **Albums:** The central collection. **Uniqueness is enforced on `musicBrainzId` to prevent duplicates.**
  - **Matching Strategy:** To prevent duplicate global albums when `musicBrainzId` is missing or unavailable, we use a robust matching strategy:
    1.  Exact match on `musicBrainzId`.
    2.  Exact match on `artist` + Case-insensitive match on `title`.
    3.  Exact match on `title` + Case-insensitive match on `artist`.
- **State Machine:**
  - `Wishlist` -> `Library` (Implicitly `Backlog` if progress is unset)
  - `Backlog` -> `Active`
  - `Active` -> `Completed`
  - Any State + `Archived = true` -> Hidden from default views, visible in "Archived" view.
  - `Rating` -> Optional (1-10) or Null (Unrated)
