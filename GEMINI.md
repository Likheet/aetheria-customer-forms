
# Project: Aetheria Forms

## Project Overview

This project is a web application for providing skin consultations. It features a detailed, multi-step form that gathers information about a user's skin, lifestyle, and concerns. A sophisticated decision engine then analyzes this information to provide personalized skincare recommendations.

The application is built with **React** and **TypeScript**, using **Vite** for the build tooling. It also integrates with **Supabase** for backend services.

## Building and Running

### Key Commands

*   **`npm run dev`**: Starts the development server.
*   **`npm run build`**: Builds the application for production. This includes a step to build a product index.
*   **`npm run lint`**: Lints the codebase using ESLint.

### Running the Application

1.  Install dependencies: `npm install`
2.  Start the development server: `npm run dev`
3.  Open the application in your browser at the address provided by Vite (usually `http://localhost:5173`).

## Development Conventions

*   **Styling**: The project uses **Tailwind CSS** for styling, with some custom components in `src/components/ui`.
*   **State Management**: Component-level state is managed with React hooks (`useState`, `useEffect`).
*   **Data Fetching**: The application likely uses `fetch` or a library like `axios` to interact with the Supabase backend.
*   **Decision Engine**: The core logic for the consultation is in `src/lib/decisionEngine.ts`. This engine uses a set of rules defined in `src/lib/decisionRules.ts` to process user input.
*   **Components**: The main application logic is in `src/App.tsx`, which manages the different flows of the application. The primary form component is `src/components/UpdatedConsultForm.tsx`.
