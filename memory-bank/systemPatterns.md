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
- **Images:** Images are handled via a **background processing pattern**. The client provides an external URL to the `create` mutation, which immediately saves the album. A scheduled Convex Action (`storeCoverArt`) then runs in the background to download the image, store it in Convex Storage, and update the album record. This ensures a non-blocking UI experience.
- **Search:** Search is hybrid—MusicBrainz for initial metadata (via Command Palette), internal Convex search for library browsing. **MusicBrainz search results are sorted by popularity (release count) and type (Album > EP) to improve relevance.**
- **External Link Generation:** We automatically generate external links (like RateYourMusic) using slugification logic on artist/album names, favoring automation with manual override.
- **Action Overlays:** Secondary actions (like visiting an external link) are presented as hover-only overlays on the primary album art to maintain a clean aesthetic.
- **Notifications:** We use `sonner` for toast notifications to provide non-intrusive feedback for actions like adding, editing, or deleting albums.

## Data Model Boundaries

- **Albums:** The central collection. **Uniqueness is enforced on `musicBrainzId` to prevent duplicates.**
- **State Machine:**
  - `Wishlist` -> `Library` (Implicitly `Backlog` if progress is unset)
  - `Backlog` -> `Active`
  - `Active` -> `Completed`
  - Any State + `Archived = true` -> Hidden from default views, visible in "Archived" view.
  - `Rating` -> Optional (1-10) or Null (Unrated)
