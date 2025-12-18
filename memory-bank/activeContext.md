# Active Context

## Current Focus

**Sprint 1: Core Functionality & Initialization**
We are setting up the project foundation and the ability to add albums.

## Recent Decisions

1. **Tech Stack:** Convex (Backend/DB/Auth) + Vite (Frontend) + TanStack Router (Routing) + shadcn/ui.
2. **Image Strategy:** **Convex File Storage**. We will download covers and store them, rather than hotlinking.
3. **Data Source:** **MusicBrainz** for metadata search (open data, no complex auth).
4. **Schema Logic:** Split state into `acquisition` (Wishlist/Library) and `progress` (Backlog/Active/Completed) to enforce mutually exclusive logic while allowing flexible tagging.
5. **UI Refactoring:** Modified shadcn `sidebar-06` template to fit Aldex structure (Collection/Progress/Manage sections). Removed unused components.

## Next Steps

1. Create the Albums List View (Grid/Table with filters).
2. Implement routing for different sections (Library, Wishlist, etc.).
3. Implement Edit/Delete functionality.
4. Polish UI and UX.
