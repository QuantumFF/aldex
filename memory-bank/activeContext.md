# Active Context

## Current Focus

- Mobile UI/UX polishing across all dialogs and menus.
- Context menu enrichment (sub-menus, batch mode integration).
- Component reuse/extraction (DeleteAlbumDialog).

## Recent Changes

### Mobile UI/UX Overhaul
- **`dialog.tsx`:** Changed `sm:rounded-lg` → always `rounded-lg`; added `w-[calc(100%-2rem)]` to ensure 1rem side margins on all dialogs regardless of viewport width.
- **`command.tsx`:** Added `rounded-xl mx-3 sm:mx-auto w-[calc(100%-1.5rem)] sm:w-full` to command palette dialog to prevent edge clipping.
- **`add-album-command.tsx` (confirm dialog):**
  - Mobile (<sm): compact card layout — 80×80 thumbnail + title/artist/year in a row.
  - Desktop (sm+): dramatic full-bleed hero with gradient overlay.
  - Footer replaced `DialogFooter` (which injects `sm:flex-row`) with a plain `div` using `flex flex-col gap-2` to keep 2×2 button grid stable at all viewport widths.
- **`edit-album-dialog.tsx`:**
  - `max-h-[90svh]` to prevent overflow on small screens.
  - Mobile: compact `h-36` banner + URL/Archived toggle row.
  - Desktop (md+): retains full two-column sidebar.
  - Footer: 2-col grid (Cancel + Save) on mobile; justify-between with Delete on left on desktop.
- **`bulk-add-albums-dialog.tsx`:** Added `w-[calc(100%-2rem)]` mobile width.

### DeleteAlbumDialog Component (`src/components/delete-album-dialog.tsx`)
- Reusable confirmation dialog with two modes:
  - **Trigger mode** (`children` prop): wraps any button in `AlertDialogTrigger` automatically.
  - **Controlled mode** (`open` + `onOpenChange`): for context/dropdown menus where the dialog must live outside the menu portal to survive menu close.
- Replaces inline AlertDialog trees in `edit-album-dialog.tsx` (trigger mode) and `batch-actions.tsx` (trigger mode).
- Used in `album-context-menu.tsx` (controlled mode) via local `deleteOpen` state in both `AlbumContextMenu` and `AlbumDropdownMenu`.

### Context Menu Enhancements (`src/components/album-context-menu.tsx`)
- **"Select" → Batch Mode:** Added `onSelectFromMenu` prop (distinct from `onToggleSelection`). When called, parent checks `isBatchMode` and enables it first, then selects the album. Threaded through `AlbumGrid`, `AlbumList`, and `AlbumLibrary`.
  - `handleSelectFromMenu` in `album-library.tsx`: `if (!isBatchMode) toggleBatchMode(); toggleSelection(id);`
- **Acquisition sub-menu:** Library / Wishlist with current-value checkmark (✓).
- **Progress sub-menu:** Backlog / Active / Completed with checkmark; only shown when `acquisition === "library"`.
- Both sub-menus fire `useMutation(api.albums.update)` directly inside `AlbumMenuContent` — no extra prop drilling.
- Sub-menu components are polymorphic: `ContextMenuSub`/`DropdownMenuSub` selected by `type` prop.
- View on RYM item moved below the sub-menus with a separator.

### Filter Label Fix
- `album-status-filters.tsx`: progress filter "Done" label renamed to "Completed" for consistency with the data model.

## Active Decisions

- **No `DialogFooter` for custom layouts:** `DialogFooter` injects `sm:flex-row sm:justify-end` which overrides column layouts at >=640px. Custom multi-row button groups use plain `div` with explicit `flex flex-col`.
- **`svh` units for dialog height:** Uses `max-h-[90svh]` (small viewport height) to avoid content being hidden behind mobile browser chrome.
- **Controlled delete dialog outside menu portal:** When the delete confirmation is triggered from a context/dropdown menu, the `AlertDialog` must be a sibling outside the menu (not inside `ContextMenuContent`), otherwise it gets unmounted when the menu closes.
- **`useMutation` in `AlbumMenuContent`:** Direct mutation call avoids threading acquisition/progress update callbacks through 3+ layers of props.
- **Persisting Source URLs:** Keep original `coverUrl` in the database even after image upload to Convex Storage.
- **Separated Menu Triggers:** 3-dot button is a DOM sibling of the context menu trigger (not nested inside it) to prevent event conflicts in the Grid view.
- **Staged Batch Updates:** Pending changes model — users set multiple properties then hit Apply.
- **Smart Defaults:** Batch edit controls initialize based on the selected items' common state.

## Current State

- All dialogs are mobile-responsive with consistent rounded corners and viewport-safe heights.
- Context/dropdown menus support: Edit, Select (+ enter batch), Acquisition, Progress, View on RYM, Delete (with confirmation).
- Batch mode is fully functional with confirmation on destructive delete.
- `DeleteAlbumDialog` is the canonical delete confirmation component used across all delete surfaces.
- Build is clean (no TypeScript errors); only known warning is chunk size >500 kB.
