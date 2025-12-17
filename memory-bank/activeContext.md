# Active Context

## Current Focus

**Sprint 1: Core Functionality & Initialization**
We are setting up the project foundation and the ability to add albums.

## Recent Decisions

1. **Tech Stack:** Convex (Backend/DB/Auth) + Vite (Frontend) + TanStack Router (Routing) + shadcn/ui.
2. **Image Strategy:** **Convex File Storage**. We will download covers and store them, rather than hotlinking.
3. **Data Source:** **MusicBrainz** for metadata search (open data, no complex auth).
4. **Schema Logic:** Split state into `acquisition` (Wishlist/Library) and `progress` (Backlog/Active/Completed) to enforce mutually exclusive logic while allowing flexible tagging.

## Next Steps

1. User to run project initialization commands (Vite, Tailwind, Convex).
2. Implement `convex/schema.ts`.
3. Generate `AddAlbumForm` component with Zod validation and MusicBrainz integration.
