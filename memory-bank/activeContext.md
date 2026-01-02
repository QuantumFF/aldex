# Active Context

## Current Focus

- Completed implementation of context menus and quick actions for albums.
- Ensuring robust event handling between different menu triggers (right-click vs. button click).

## Recent Changes

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

- **Separated Menu Triggers:** To avoid conflicts between the card-wide right-click context menu and the specific 3-dot menu button, we moved the 3-dot button outside the context menu trigger area in the Grid view. This ensures that interactions with the button (left or right click) do not inadvertently trigger the card's context menu or get swallowed by it.
- **Staged Batch Updates:** Moving from immediate actions to a "pending changes" model for batch editing allows users to set multiple properties (Status, Progress, Archived) at once and apply them in a single transaction, reducing API calls and improving control.
- **Smart Defaults:** Batch edit controls now initialize based on the selected items. If all selected items share a value (e.g., all archived), the control reflects that. If mixed, it shows a neutral state. This makes it easier to toggle states (e.g., unarchive a group of archived albums).

## Current State

- The application allows users to view, filter, and manage their album collection.
- Batch mode is fully functional with the new UI.
- Users can add albums, edit details, and manage their backlog.
- Albums have comprehensive context menu support for quick actions.
