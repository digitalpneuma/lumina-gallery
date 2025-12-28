# Lumina Gallery

A minimalist, high-performance photo gallery website built with React and Node.js.

## Features

- **Public Gallery**: Masonry-style layout, lightbox viewer, responsive design.
- **Admin Dashboard**: Secure login, drag-and-drop uploads, album management.
- **Organization**: Create albums, organize photos, set cover images.
- **Performance**: Optimized rendering with React and Tailwind CSS.

## Getting Started

### Prerequisites

- Node.js 18+
- NPM or Yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/lumina-gallery.git
    cd lumina-gallery
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure environment:
    ```bash
    cp .env.example .env
    # Edit .env with your desired settings
    ```

4.  Start the development server:
    ```bash
    npm run dev
    ```

## Project Structure

-   `/client`: React frontend application
    -   `/src/components`: Reusable UI components
    -   `/src/pages`: Application views
    -   `/src/lib`: Context and utilities
-   `/server`: Node.js Express backend (mocked in this prototype)
-   `/uploads`: User uploaded content (gitignored)

## Tech Stack

-   **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion, Wouter
-   **Backend**: Node.js, Express (Architecture ready)
-   **Database**: SQLite (Schema ready)

## License

MIT
