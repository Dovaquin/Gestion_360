# AI Studio Application Rules

This document outlines the technical stack and specific library usage guidelines for developing and modifying this application.

## Tech Stack Overview

*   **Frontend Framework:** React (version 19.2.1)
*   **Language:** TypeScript (version ~5.8.2)
*   **Routing:** React Router DOM (version ^7.10.1), specifically using `HashRouter`.
*   **Styling:** Tailwind CSS, configured directly in `index.html` for utility-first styling.
*   **Charting/Data Visualization:** Recharts (version ^3.5.1) for interactive charts.
*   **UI Components:** Shadcn/ui and Radix UI are available and preferred for pre-built, accessible components.
*   **Icons:** Lucide-React is available for vector icons. Material Symbols Outlined are also used.
*   **State Management:** Custom context API (`StoreProvider` with `useContext` and `useState`) for global state.
*   **Data Persistence:** Client-side data persistence is handled via `localStorage`.
*   **Build Tool:** Vite (version ^6.2.0) for fast development and optimized builds.

## Library Usage Rules

To maintain consistency and best practices, please adhere to the following guidelines when implementing new features or modifying existing ones:

*   **UI Components:**
    *   **Prioritize Shadcn/ui and Radix UI:** For common UI elements (buttons, inputs, dialogs, etc.), always check if a suitable component exists within the Shadcn/ui or Radix UI libraries first.
    *   **Custom Components:** If a required component is not available in Shadcn/ui/Radix UI or needs significant custom styling/logic, create a new, small, and focused custom React component.
*   **Styling:**
    *   **Tailwind CSS Only:** All styling must be done using Tailwind CSS utility classes. Avoid inline styles or creating new `.css` files.
    *   **Responsive Design:** Always ensure new components and layouts are responsive and mobile-first.
*   **Routing:**
    *   **React Router DOM:** Use `react-router-dom` for all navigation within the application. Maintain existing `HashRouter` usage.
    *   **Route Definitions:** Keep route definitions centralized in `App.tsx`.
*   **State Management:**
    *   **Context API:** Continue to use the existing `StoreProvider` and `useStore` context for global application state. For local component state, use `React.useState`.
*   **Charting:**
    *   **Recharts:** Any new charts or data visualizations should be implemented using the Recharts library.
*   **Icons:**
    *   **Lucide-React:** Prefer icons from `lucide-react`. If a specific icon is not available, `material-symbols-outlined` can be used as a fallback.
*   **Data Persistence:**
    *   **Local Storage:** For client-side data persistence, utilize `localStorage` as demonstrated in `context/Store.tsx`.
*   **File Structure:**
    *   **Components:** New reusable UI components should be placed in `src/components/`.
    *   **Pages:** New views or screens should be placed in `src/pages/`.
    *   **Utilities/Context:** Place context providers in `src/context/` and utility functions in `src/utils/`.
    *   **New Files:** Always create a new file for every new component or hook, no matter how small. Avoid adding new components to existing files.