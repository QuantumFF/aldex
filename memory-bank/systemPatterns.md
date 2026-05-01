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
- **Custom Inputs:** Specialized UI components (like `RatingInput`) are created to match specific design requirements rather than relying solely on standard HTML inputs.
- **Images:**
  - **Ingestion:** Images are handled via a **client-orchestrated background processing pattern**. The client creates the album immediately (for instant UI feedback) and then triggers a Convex Action (`storeCoverArt`) to fetch and store the image.
    - **Redundancy Check:** The `storeCoverArt` action first checks the album's cover status via an internal query (`getAlbumCoverStatus`). If a cover exists, the download is skipped.
  - **Display:** We use a **lazy loading pattern** for display. The main album query returns only the `storageId`. The frontend `AlbumCover` component then fetches the signed URL for each image individually using a dedicated query (`images.getUrl`).
- **Search:** Search is hybrid—MusicBrainz for initial metadata (via Command Palette), internal Convex search for library browsing. **MusicBrainz search results are sorted by popularity (release count) and type (Album > EP) to improve relevance.**
- **External Link Generation:** We automatically generate external links (like RateYourMusic) using slugification logic on artist/album names, favoring automation with manual override.
- **Action Overlays:** Secondary actions (like visiting an external link) are presented as hover-only overlays on the primary album art to maintain a clean aesthetic.
- **Notifications:** We use `sonner` for toast notifications.
- **Batch Operations:** We use a **client-side selection state** (`Set<string>`) combined with **batch mutations** (`batchDelete`, `batchUpdate`) to perform bulk actions. The UI toggles between a standard view and a "Batch Mode" view, where interactions (click) change from "Edit" to "Select". Shift-Select is supported for range selection using `lastSelectedId` tracking.

## Context Menus & Overlays

- **Separated Triggers:** To prevent conflicts between nested interactive elements (card-wide context menu vs. 3-dot button), the 3-dot button is a DOM sibling of the `ContextMenuTrigger` — not nested inside it.
- **Unified Menu Content:** A shared `AlbumMenuContent` component ensures consistency between the right-click context menu and the 3-dot dropdown menu. It is polymorphic — it selects `ContextMenuItem` vs `DropdownMenuItem` (and Sub variants) based on a `type` prop.
- **Delete confirmation outside portal:** The `DeleteAlbumDialog` (controlled mode) is rendered as a sibling outside `ContextMenuContent`/`DropdownMenuContent` using local `deleteOpen` state. This prevents it from being unmounted when the menu closes.
- **Direct mutation in menu content:** `useMutation(api.albums.update)` is called directly inside `AlbumMenuContent` for quick Acquisition/Progress changes, avoiding prop-drilling through grid → context menu layers.
- **Batch mode entry from menu:** "Select" in the context/dropdown menu calls `onSelectFromMenu`, which is provided by `AlbumLibrary` as: `if (!isBatchMode) toggleBatchMode(); toggleSelection(id);` This automatically activates batch mode when selecting from the menu.

## Dialog Patterns

- **No `DialogFooter` for custom multi-row button layouts:** `DialogFooter` injects `sm:flex-row sm:justify-end` which collapses column layouts at >=640px. Use a plain `div` with `flex flex-col` instead.
- **`svh` for dialog heights:** Use `max-h-[90svh]` (small viewport height) so dialogs don't hide behind mobile browser chrome.
- **Mobile margin:** All `DialogContent` uses `w-[calc(100%-2rem)]` to maintain 1rem gutters on narrow screens.
- **Responsive dialog bodies:** Mobile-first single-column layouts, desktop (md+) two-column sidebars via `hidden md:flex`.

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
