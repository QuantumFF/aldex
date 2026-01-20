# Active Context

## Current Focus

- Completed redesign of the Edit Album Dialog for a modern minimalist aesthetic.
- Fixed issue where album cover URLs were not being persisted in the database.
- Fixed redundant album art downloads and duplicate global albums caused by case sensitivity.

## Recent Changes

- **Redundant Download Fix:**
  - **Global Album Matching:** Improved the search logic in `convex/albums.ts` to handle case-insensitive Artist names. It now falls back to searching by Title (exact) and matching Artist (case-insensitive) if the primary search fails. This prevents duplicate global albums (e.g., "The Beatles" vs "the beatles").
  - **Smart Downloads:** Updated `convex/albums.ts` to only trigger a backend download if a _new_ global album is created.
  - **Action Optimization:** Updated `convex/images.ts` (`storeCoverArt`) to check if the album already has a cover (via a new internal query `getAlbumCoverStatus`) before downloading. This prevents frontend-triggered redundant downloads.

- **Edit Album Dialog Redesign:**
  - Implemented a split-layout design with a prominent cover image preview on the left and a clean form on the right.
  - Improved typography and visual hierarchy for Title and Artist fields.
  - Grouped metadata fields (Year, Rating, Status) for better readability.
  - Moved "Delete" action to a subtle ghost button to prevent accidental clicks.
  - Added logic to preview the cover image from multiple sources (new input, stored image, source URL).

- **Cover URL Persistence:**
  - **Backend:** Updated `convex/albums.ts` and `convex/images.ts` to ensure the source `coverUrl` is saved to the database even when an image is uploaded to storage. Previously, this URL was being cleared, causing the input field to be blank on subsequent edits.
  - **Frontend:** Updated `EditAlbumDialog` to pre-fill the "Cover Image URL" field with the saved URL, allowing users to see and edit the source link.

- **Context Menu Implementation:**
  - Added a right-click context menu to albums in both Grid and List views.
  - Added a 3-dot menu button (top-right in Grid, separate column in List) for accessibility.
  - Menu options include: Edit, Select/Deselect, View on RYM, and Delete.
  - Restored the direct RYM link icon on the album card (bottom-right) for quick access.
  - **Refactoring:** Separated the 3-dot menu trigger from the main card context menu trigger in the Grid view to prevent event conflicts and ensure reliable interaction.

- **Batch Edit Redesign:**
  - Moved batch action controls to the right side of the header to minimize mouse movement and replace filters.
  - Fixed a 1-pixel layout shift by ensuring the batch actions container matches the height of the filters container.
  - Replaced immediate-action dropdowns with a staged "Apply" workflow.
  - Added an "Apply" button to commit changes.
  - Replaced the "Archive" button with a smart "Archived" checkbox that supports unarchiving and defaults to the common state of selected items.
  - Added clickable "Select All" label.
  - Standardized button heights and improved responsiveness.

## Active Decisions

- **Persisting Source URLs:** We decided to keep the original `coverUrl` in the database even after the image is uploaded to Convex Storage. This allows the UI to display the source link to the user for reference or editing, addressing user feedback about "missing" URLs.
- **Separated Menu Triggers:** To avoid conflicts between the card-wide right-click context menu and the specific 3-dot menu button, we moved the 3-dot button outside the context menu trigger area in the Grid view. This ensures that interactions with the button (left or right click) do not inadvertently trigger the card's context menu or get swallowed by it.
- **Staged Batch Updates:** Moving from immediate actions to a "pending changes" model for batch editing allows users to set multiple properties (Status, Progress, Archived) at once and apply them in a single transaction, reducing API calls and improving control.
- **Smart Defaults:** Batch edit controls now initialize based on the selected items. If all selected items share a value (e.g., all archived), the control reflects that. If mixed, it shows a neutral state. This makes it easier to toggle states (e.g., unarchive a group of archived albums).

## Current State

- The application allows users to view, filter, and manage their album collection.
- Batch mode is fully functional with the new UI.
- Users can add albums, edit details (with new minimalist UI), and manage their backlog.
- Albums have comprehensive context menu support for quick actions.
- Cover art handling is robust, preserving source URLs.
