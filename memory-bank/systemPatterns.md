# System Patterns

## Architecture

- **Monorepo-like Structure:** Frontend and Backend logic coexist (Convex pattern).
- **Client-Side Routing:** TanStack Router for type-safe routing.
- **Data Fetching:** Convex React hooks (`useQuery`, `useMutation`) provide real-time reactivity without manual state management.

## Key Design Patterns

- **Forms:** React Hook Form + Zod. Validation logic is shared or mirrored between UI and Backend where possible.
- **Images:** Images are fetched server-side (via Convex actions if needed) or uploaded directly to Convex Storage, returning a storage ID stored on the Album document.
- **Search:** Search is hybrid—MusicBrainz for initial metadata, internal Convex search for library browsing.

## Data Model Boundaries

- **Albums:** The central collection.
- **State Machine:**
  - `Wishlist` -> `Library` (Backlog)
  - `Backlog` -> `Active`
  - `Active` -> `Completed`
  - Any State + `Archived = true` -> Hidden
