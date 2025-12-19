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
- **Images:** Images are fetched server-side (via Convex actions if needed) or uploaded directly to Convex Storage, returning a storage ID stored on the Album document.
- **Search:** Search is hybrid—MusicBrainz for initial metadata (via Command Palette), internal Convex search for library browsing.

## Data Model Boundaries

- **Albums:** The central collection.
- **State Machine:**
  - `Wishlist` -> `Library` (Implicitly `Backlog` if progress is unset)
  - `Backlog` -> `Active`
  - `Active` -> `Completed`
  - Any State + `Archived = true` -> Hidden
