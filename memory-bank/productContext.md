# Product Context

## Problem Statement

Existing tools (RYM, Spotify, Last.fm) are either too social, too automated, or lack the specific "ownership vs. listening" workflow desired by the user. This app solves the need for a private, curated digital shelf.

## User Experience

- **Single-View Dashboard:** A unified "Album Library" view that acts as the central hub. No complex navigation menus.
- **Dynamic Grid:** Users can adjust the density of the album grid (2-10 columns) to suit their screen size and preference.
- **Fast Browsing:** Optimized for quick filtering and visual scanning.
- **Keyboard Friendly:** Desktop-first interactions.
- **Intentionality:** Adding an album is a deliberate action, not a background sync.

## The Album Lifecycle (Mental Model)

We separate **Acquisition** (owning) from **Progress** (listening) and **Visibility** (archiving).

1. **Acquisition:**
   - `Wishlist`: Do not own yet.
   - `Library`: Owned/Downloaded.
2. **Progress** (Only applicable if in Library):
   - `Backlog`: Owned but not started.
   - `Active`: Currently listening (rotation).
   - `Completed`: Finished listening.
3. **Visibility:**
   - `Archived`: Hidden from default views (Boolean toggle).
