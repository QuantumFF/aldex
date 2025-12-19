# System Patterns

## Architecture

- **Monorepo-like Structure:** Frontend and Backend logic coexist (Convex pattern).
- **Client-Side Routing:** TanStack Router for type-safe routing.
- **Data Fetching:** Convex React hooks (`useQuery`, `useMutation`) provide real-time reactivity without manual state management.

## Key Design Patterns

- **Single-View Dashboard:** The application revolves around a central "Album Library" view. Navigation between different states (Wishlist, Backlog, etc.) is handled via client-side filtering rather than separate pages.
- **Dynamic Grid:** The album list uses a responsive grid with user-controlled column density, allowing for flexible viewing experiences on different screen sizes.
- **Forms:** React Hook Form + Zod. Validation logic is shared or mirrored between UI and Backend where possible.
- **Modals:** Critical actions like "Add Album" and "Edit Album" are handled in modal dialogs to maintain context within the library view.
- **Images:** Images are fetched server-side (via Convex actions if needed) or uploaded directly to Convex Storage, returning a storage ID stored on the Album document.
- **Search:** Search is hybrid—MusicBrainz for initial metadata, internal Convex search for library browsing.

## Data Model Boundaries

- **Albums:** The central collection.
- **State Machine:**
  - `Wishlist` -> `Library` (Implicitly `Backlog` if progress is unset)
  - `Backlog` -> `Active`
  - `Active` -> `Completed`
  - Any State + `Archived = true` -> Hidden
