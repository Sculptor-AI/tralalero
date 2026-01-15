# Tralalero

A modern, Kanban-style task management application built with React and Vite. Organize your projects with boards, lists, and cards using a smooth drag-and-drop interface.

## Features

-   **Board Management**: Create, rename, delete, and switch between multiple project boards.
-   **Kanban Workflow**: flexible columns and cards system.
-   **Drag & Drop**: Powered by `@dnd-kit` for smooth rearranging of columns and cards.
-   **Card Details**: Add priorities, labels/tags, and descriptions to your cards.
-   **Horizontal Scrolling**: Use the mouse wheel to scroll horizontally through your board (vertical scrolling preserved for lists).
-   **Responsive Design**: Sidebar collapses for more screen real estate.

## Tech Stack

-   **Frontend Framework**: [React](https://react.dev/)
-   **Build Tool**: [Vite](https://vitejs.dev/)
-   **Drag & Drop**: [@dnd-kit/core](https://docs.dndkit.com/)

## Getting Started

### Prerequisites

-   Node.js (v16 or higher recommended)
-   npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/Sculptor-AI/tralalero.git
    cd tralalero
    ```

2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn
    ```

### Running the Application

Start the development server:

```bash
npm run dev
```

Open your browser to `http://localhost:5173` (or the port shown in your terminal).

### Building for Production

To create a production build:

```bash
npm run build
```

The output will be in the `dist` directory.

## Project Structure

-   `src/components`: UI components (Board, Column, Card, Sidebar, etc.)
-   `src/context`: React Context for state management (BoardContext, AuthContext)
-   `src/utils`: Helper functions and constants
-   `src/App.jsx`: Main application layout and routing logic

## License

[MIT](LICENSE)
