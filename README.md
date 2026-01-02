# Aldex

**Aldex** is a personal, desktop-first web application for tracking music albums. It is an opinionated tool designed for the user who values manual control, intentional logging, and a private digital shelf over automation or social features.

## Core Philosophy

- **Albums are the only first-class entity.**
- **Low Friction > Feature Completeness.**
- **Manual Control > Automation.**
- **Desktop-First UX.**

## Features

- **Single-View Dashboard:** A unified "Album Library" view acting as the central hub without complex navigation menus.
- **Dynamic Grid:** Adjustable album grid density (2-10 columns) to suit screen size and preference.
- **Lifecycle Management:** Distinct workflows for acquisition and listening progress:
  - **Acquisition:** Wishlist vs. Library (Owned).
  - **Progress:** Backlog, Active (listening), Completed.
  - **Visibility:** Archive toggle to hide albums from default views.
- **Fast Browsing:** Optimized for quick filtering and visual scanning.
- **External Integration:** Seamless links to MusicBrainz and RateYourMusic without compromising privacy.

## Tech Stack

- **Runtime:** [Bun](https://bun.sh/)
- **Frontend:** [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Backend/Database:** [Convex](https://www.convex.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Routing:** [TanStack Router](https://tanstack.com/router)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed on your machine.

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd aldex
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Start the development server:

   ```bash
   bun run dev
   ```

4. In a separate terminal, start the Convex backend:

   ```bash
   bun run convex
   ```

## Project Structure

- `src/components`: React components, including UI primitives and feature-specific components.
- `convex`: Backend functions and schema definitions.
- `memory-bank`: Project documentation and context files.
